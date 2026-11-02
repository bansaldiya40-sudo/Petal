import AdmZip from 'adm-zip';

const zip = new AdmZip('data/uploads/1793529248885-1wllnf-PM2-Combined-Overview-v2 - Day 1.pptx');

for (const num of [1, 2, 3, 4, 9, 16]) {
  const slideEntry = zip.getEntry('ppt/slides/slide' + num + '.xml');
  const xml = slideEntry.getData().toString('utf8');
  
  // Find shapes
  const shapes = xml.match(/<p:sp[\s\S]*?<\/p:sp>/gi) || [];
  console.log(`\n=== SLIDE ${num} (shapes: ${shapes.length}) ===`);
  for (const s of shapes) {
    const isTitle = s.includes('type="title"') || s.includes('type="ctrTitle"') || s.includes('type="subTitle"') || s.includes('name="Title') || s.includes('name="title');
    if (isTitle) {
      const texts = (s.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || []).map(t => t.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' ');
      console.log(`   [TITLE SHAPE] ${texts}`);
    }
  }
}
