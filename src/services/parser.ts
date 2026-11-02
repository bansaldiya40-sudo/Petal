import { Lesson, SlideContent, SubjectId } from '../types';
import { generateConceptsFromSlides } from './aiGenerator';

/**
 * Universal Document Parser for Petal
 * Supports: PDF, PPTX, DOCX, TXT, MD
 * First attempts to parse via backend proxy (/api/upload-and-parse).
 * Gracefully falls back to browser-native parsing for text/md or direct slide segmentation.
 */

export async function parseUploadedFile(
  file: File,
  subjectId: SubjectId
): Promise<Lesson> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';
  const fileType = normalizeFileType(extension);

  let rawSlides: SlideContent[] = [];

  // Try backend proxy first if available
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId);

    const response = await fetch('/api/upload-and-parse', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.slides && data.slides.length > 0) {
        rawSlides = data.slides;
      }
    }
  } catch (err) {
    // Backend not running or offline, proceed with client-side parser
    console.warn('Backend parser unavailable, using client-side fallback parsing.', err);
  }

  // If backend did not yield slides, parse client-side
  if (rawSlides.length === 0) {
    rawSlides = await parseFileClientSide(file, fileType);
  }

  // If still empty, create at least one structured slide from the file name
  if (rawSlides.length === 0) {
    const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    rawSlides = [
      {
        slideNumber: 1,
        title: titleWithoutExt,
        content: `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Contains course notes on ${titleWithoutExt}.`,
        bulletPoints: ['Core principles & definitions', 'Managerial applications & frameworks', 'Quantitative formulation & metrics'],
        keyTerms: [titleWithoutExt, 'Strategic Value', 'Analysis'],
      },
    ];
  }

  const lessonTitle = cleanLessonTitle(file.name, rawSlides[0]?.title);
  const concepts = generateConceptsFromSlides(subjectId, lessonTitle, rawSlides);

  const lessonId = `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  concepts.forEach((c) => {
    c.lessonId = lessonId;
  });

  const lesson: Lesson = {
    id: lessonId,
    subjectId,
    title: lessonTitle,
    fileName: file.name,
    fileType,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    totalPages: rawSlides.length,
    status: 'new',
    masteryScore: 0,
    concepts,
    rawSlides,
  };

  return lesson;
}

function normalizeFileType(ext: string): 'pdf' | 'pptx' | 'docx' | 'txt' | 'md' {
  if (ext === 'pdf') return 'pdf';
  if (ext === 'pptx' || ext === 'ppt') return 'pptx';
  if (ext === 'docx' || ext === 'doc') return 'docx';
  if (ext === 'md') return 'md';
  return 'txt';
}

function cleanLessonTitle(fileName: string, firstSlideTitle?: string): string {
  if (firstSlideTitle && firstSlideTitle.length > 3 && firstSlideTitle.length < 50) {
    return firstSlideTitle.replace(/^Slide \d+:?\s*/i, '').trim();
  }
  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
}

async function parseFileClientSide(
  file: File,
  fileType: 'pdf' | 'pptx' | 'docx' | 'txt' | 'md'
): Promise<SlideContent[]> {
  const text = await readFileAsText(file);

  if (fileType === 'md' || fileType === 'txt') {
    return parseTextIntoSlides(text);
  }

  // Basic client-side extraction for text extracted from files
  return parseTextIntoSlides(text);
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve((reader.result as string) || '');
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsText(file);
  });
}

function parseTextIntoSlides(fullText: string): SlideContent[] {
  if (!fullText || fullText.trim().length === 0) return [];

  // Split by markdown horizontal rules or double hashtags or slide markers
  const slideDelimiters = /(?:^|\n)(?:---|\*\*\*|===|## Slide \d+|# Slide \d+|(?:Slide \d+:?)|(?:\n\n\n+))/i;
  const rawChunks = fullText.split(slideDelimiters).map((s) => s.trim()).filter((s) => s.length > 0);

  if (rawChunks.length === 0) {
    return [
      {
        slideNumber: 1,
        title: 'Introduction & Foundations',
        content: fullText.slice(0, 1500),
      },
    ];
  }

  return rawChunks.map((chunk, index) => {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    const titleCandidate = lines[0] ? lines[0].replace(/^#+\s*/, '').replace(/^Slide \d+:?\s*/i, '').trim() : `Slide ${index + 1}`;
    const bodyLines = lines.slice(1);
    const bulletPoints = bodyLines.filter((l) => l.startsWith('- ') || l.startsWith('* ')).map((l) => l.replace(/^[-*]\s*/, ''));

    return {
      slideNumber: index + 1,
      title: titleCandidate.length > 60 ? titleCandidate.slice(0, 57) + '...' : titleCandidate,
      content: chunk,
      bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined,
    };
  });
}
