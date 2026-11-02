import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const lesson = db.prepare("SELECT raw_slides_json FROM lessons WHERE id = 'mat-1793548739808-dojlom'").get();
const slides = JSON.parse(lesson.raw_slides_json);

export function cleanHeading(title) {
  if (!title) return '';
  return title
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/^slide\s*\d+[:\-]?\s*/i, '')
    .trim();
}

export function groupSlidesIntoSections(slides) {
  if (!slides || slides.length === 0) return [];

  // Identify slide logical clusters based on lecture flow
  const sections = [];
  let i = 0;

  while (i < slides.length) {
    const s = slides[i];
    const sNext = slides[i + 1];
    const title = cleanHeading(s.title);

    // Natural pairings for lecture decks:
    // 1. Cover slide + Chapter 1
    if (i === 0 && sNext && /chapter\s+1\b/i.test(sNext.title)) {
      sections.push({
        title: 'CHAPTER 1: What Is a Tech Stack & The Four Layers',
        slides: [s, sNext],
      });
      i += 2;
      continue;
    }

    // 2. Backend Languages + Backend Decision Guide (Slides 4 & 5)
    if (title.includes('CHAPTERS 3–7 Backend Languages') && sNext && sNext.title.includes('BACKEND DECISION GUIDE')) {
      sections.push({
        title: 'CHAPTERS 3–7 & Backend Decision Guide: Languages, Selection & Hiring',
        slides: [s, sNext],
      });
      i += 2;
      continue;
    }

    // 3. Cloud Platforms + Cloud Architecture (Slides 8 & 9)
    if (title.includes('CHAPTER 10 Cloud Platforms') && sNext && sNext.title.includes('CLOUD ARCHITECTURE')) {
      sections.push({
        title: 'CHAPTER 10 & Cloud Architecture: Big Three Platforms & Monolith vs Microservices',
        slides: [s, sNext],
      });
      i += 2;
      continue;
    }

    // 4. How to Choose + Stack Evolution (Slides 15 & 16)
    if (title.includes('CHAPTER 17 How to Choose') && sNext && sNext.title.includes('STACK EVOLUTION')) {
      sections.push({
        title: 'CHAPTER 17 & Stack Evolution: 7 Dimensions of Selection & Avoiding Pitfalls',
        slides: [s, sNext],
      });
      i += 2;
      continue;
    }

    // 5. Appendix slides at end
    if (/appendix/i.test(title)) {
      const appendixSlides = [];
      while (i < slides.length) {
        appendixSlides.push(slides[i]);
        i++;
      }
      sections.push({
        title: 'APPENDIX & SUMMARY: Quick References, Cheatsheets & PM Decision Matrix',
        slides: appendixSlides,
      });
      break;
    }

    // Single slide chapters/topics with clean names
    let cleanTitle = title;
    if (title.includes('CHAPTER 2 Frontend')) {
      cleanTitle = 'CHAPTER 2: Frontend Technologies: HTML, CSS & Modern Frameworks';
    } else if (title.includes('CHAPTER 8 Mobile')) {
      cleanTitle = 'CHAPTER 8: Mobile Development Approaches: Native, Cross-Platform & PWA';
    } else if (title.includes('CHAPTER 9 Database')) {
      cleanTitle = 'CHAPTER 9: Database Technologies: Relational (SQL) vs NoSQL';
    } else if (title.includes('CHAPTER 11 The AI/ML')) {
      cleanTitle = 'CHAPTER 11: The AI/ML Ecosystem: Hardware, Models & AI Stack';
    } else if (title.includes('CHAPTERS 12–13 Enterprise')) {
      cleanTitle = 'CHAPTERS 12–13: Enterprise Systems & Legacy Technologies (ERP & CRM)';
    } else if (title.includes('CHAPTER 14 Popular Stack')) {
      cleanTitle = 'CHAPTER 14: Popular Stack Combinations (MERN, LAMP, T3, Jamstack)';
    } else if (title.includes('CHAPTER 15 DevOps')) {
      cleanTitle = 'CHAPTER 15: DevOps, CI/CD Pipeline & Infrastructure Automation';
    } else if (title.includes('CHAPTER 16 Cybersecurity')) {
      cleanTitle = 'CHAPTER 16: Cybersecurity & Compliance: OWASP Top 10 for PMs';
    } else if (title.includes('CHAPTER 18 Emerging')) {
      cleanTitle = 'CHAPTER 18: Emerging Technologies: WASM, Edge, Serverless & Low-Code';
    }

    sections.push({
      title: cleanTitle,
      slides: [s],
    });
    i++;
  }

  return sections.map((sec, idx) => {
    const startNum = sec.slides[0].slideNumber;
    const endNum = sec.slides[sec.slides.length - 1].slideNumber;
    const slidesRange = startNum === endNum ? `Slide ${startNum}` : `Slides ${startNum}–${endNum}`;

    return {
      id: `sec-${idx + 1}`,
      sectionOrder: idx + 1,
      title: sec.title,
      slidesRange,
      startSlide: startNum,
      endSlide: endNum,
      slides: sec.slides,
    };
  });
}

const res = groupSlidesIntoSections(slides);
console.log(`Structured Sections Count: ${res.length}`);
res.forEach(s => console.log(`[${s.id}] ${s.slidesRange}: "${s.title}" (${s.slides.length} slides)`));
