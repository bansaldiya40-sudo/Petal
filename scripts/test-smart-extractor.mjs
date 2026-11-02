import AdmZip from 'adm-zip';

function extractPptx(filePath) {
  const zip = new AdmZip(filePath);
  const slideEntries = zip.getEntries()
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/i.test(e.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.entryName.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

  const parsedSlides = [];

  slideEntries.forEach((entry, idx) => {
    const slideNum = idx + 1;
    const xml = entry.getData().toString('utf8');

    // Check relationship for notes
    let notes = '';
    const relEntry = zip.getEntry(`ppt/slides/_rels/slide${slideNum}.xml.rels`);
    if (relEntry) {
      const relXml = relEntry.getData().toString('utf8');
      const noteTargetMatch = relXml.match(/Target="(\.\.\/notesSlides\/notesSlide\d+\.xml)"/i);
      if (noteTargetMatch) {
        const notePath = 'ppt/' + noteTargetMatch[1].replace('../', '');
        const noteEntry = zip.getEntry(notePath);
        if (noteEntry) {
          const noteXml = noteEntry.getData().toString('utf8');
          // Extract text from body placeholder
          const bodyMatch = noteXml.match(/<p:ph[^>]*type="body"[\s\S]*?<\/p:sp>/i) || noteXml.match(/<p:sp>[\s\S]*?type="body"[\s\S]*?<\/p:sp>/i);
          const targetXml = bodyMatch ? bodyMatch[0] : noteXml;
          const noteTexts = (targetXml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [])
            .map(t => t.replace(/<[^>]+>/g, '').trim())
            .filter(t => t.length > 0 && !/^\d+$/.test(t));
          notes = noteTexts.join('\n');
        }
      }
    }

    // Extract shapes & tables with coordinates
    // We match both shapes <p:sp> and graphicFrames <p:graphicFrame> (which contain <a:tbl>)
    const elements = [];

    // Helper to get text from paragraphs inside a txBody
    const getParagraphs = (containerXml) => {
      const paras = containerXml.match(/<a:p[\s\S]*?<\/a:p>/gi) || [];
      return paras.map(p => {
        const runs = (p.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [])
          .map(t => t.replace(/<[^>]+>/g, ''))
          .join('');
        return runs.trim();
      }).filter(Boolean);
    };

    // Helper to get coordinates
    const getOffset = (elXml) => {
      const offMatch = elXml.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/i);
      return offMatch ? { x: parseInt(offMatch[1], 10), y: parseInt(offMatch[2], 10) } : { x: 0, y: 0 };
    };

    // 1. Regular Shapes (<p:sp>)
    const shapes = xml.match(/<p:sp[\s\S]*?<\/p:sp>/gi) || [];
    for (const sp of shapes) {
      const off = getOffset(sp);
      const paras = getParagraphs(sp);
      if (paras.length > 0) {
        elements.push({
          type: 'text',
          y: off.y,
          x: off.x,
          text: paras.join('\n')
        });
      }
    }

    // 2. Tables (<a:tbl> inside <p:graphicFrame>)
    const graphicFrames = xml.match(/<p:graphicFrame[\s\S]*?<\/p:graphicFrame>/gi) || [];
    for (const gf of graphicFrames) {
      if (gf.includes('a:tbl')) {
        const off = getOffset(gf);
        const rows = gf.match(/<a:tr[\s\S]*?<\/a:tr>/gi) || [];
        const tableLines = [];
        rows.forEach((r, rIdx) => {
          const cells = r.match(/<a:tc[\s\S]*?<\/a:tc>/gi) || [];
          const cellTexts = cells.map(c => {
            const paras = getParagraphs(c);
            return paras.join(' ').replace(/\|/g, '-');
          });
          tableLines.push(cellTexts.join(' | '));
          // If first row, add markdown separator
          if (rIdx === 0) {
            tableLines.push(cellTexts.map(() => '---').join(' | '));
          }
        });

        if (tableLines.length > 0) {
          elements.push({
            type: 'table',
            y: off.y,
            x: off.x,
            text: tableLines.join('\n')
          });
        }
      }
    }

    // Sort elements from top to bottom (by y, then x)
    elements.sort((a, b) => a.y - b.y || a.x - b.x);

    // Identify title from topmost elements
    // The top 1 or 2 text elements with y < 2,000,000 (usually < 1.5M emu)
    let titleParts = [];
    const contentElements = [];

    elements.forEach((el, elIdx) => {
      // In PPTX, 1 inch = 914400 EMU. Header is typically within top 1.8 inches (approx < 1,600,000 EMU)
      if (el.type === 'text' && el.y < 1600000 && titleParts.length < 2 && el.text.length < 120 && !el.text.includes('\n')) {
        titleParts.push(el.text);
      } else {
        contentElements.push(el);
      }
    });

    let title = titleParts.join(' — ');
    if (!title && elements.length > 0) {
      title = elements[0].text.split('\n')[0].slice(0, 100);
    }

    const fullContent = elements.map(e => e.text).join('\n\n');

    parsedSlides.push({
      slideNumber: slideNum,
      title: title || `Slide ${slideNum}`,
      content: fullContent,
      notes: notes || undefined
    });
  });

  return parsedSlides;
}

const slides = extractPptx('data/uploads/1793529248885-1wllnf-PM2-Combined-Overview-v2 - Day 1.pptx');
console.log('Total extracted slides:', slides.length);
slides.forEach(s => {
  console.log(`\n[Slide ${s.slideNumber}] Title: "${s.title}"`);
  console.log(`Content length: ${s.content.length}`);
  console.log('Content preview:\n' + s.content.substring(0, 200).replace(/\n/g, ' ↵ '));
});
