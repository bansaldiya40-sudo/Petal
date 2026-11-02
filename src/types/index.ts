export type SubjectId = 'pm2' | 'mrm' | 'microecon';

export interface SubjectMeta {
  id: SubjectId;
  title: string;
  code: string;
  characterName: string;
  characterTitle: string;
  tagline: string;
  colorWorld: 'pm' | 'mr' | 'micro';
  accentHex: string;
  badgeHex: string;
  glowClass: string;
  description: string;
}

export interface SlideContent {
  slideNumber: number;
  title: string;
  content: string;
  bulletPoints?: string[];
  keyTerms?: string[];
  visualSummary?: string;
}

export interface MaterialFormula {
  formula: string;
  name: string;
  symbols: { symbol: string; meaning: string }[];
  workedExample: string;
}

export interface MaterialExample {
  tag: 'company' | 'india' | 'numeric' | 'extra';
  title: string;
  scenario: string;
  breakdown: string;
  working?: string;
  isExtra?: boolean;
}

export interface TopicKeyConcept {
  term: string;
  meaning: string;
}

export interface TopicComparisonTable {
  headers: string[];
  rows: string[][];
}

export interface LearnTopic {
  id?: string;
  title: string;
  slides: [number, number] | number[];
  summary: string;
  key_concepts: TopicKeyConcept[];
  comparison_table?: TopicComparisonTable | null;
  example: string;
  why_it_matters: string;
  common_confusion: string;
  analogy?: string;
  extra_detail?: string;
  edge_cases?: string[];
  pm_lens?: string;
  mode?: 'original' | 'simplify' | 'deeper';
}

export interface LearnGlossaryItem {
  term: string;
  meaning: string;
}

export interface LearnData {
  deck_title: string;
  big_idea: string;
  topics: LearnTopic[];
  key_takeaways: string[];
  glossary: LearnGlossaryItem[];
}

export interface MaterialSection {
  id: string;
  sectionOrder: number;
  title: string;
  slidesRange: string;
  startSlide: number;
  endSlide: number;
  inSimpleWords: string;
  analogy?: string;
  examples: MaterialExample[];
  extraExamples?: MaterialExample[];
  byTheNumbers?: {
    headline: string;
    figures: { label: string; value: string }[];
    scenario: string;
    working?: string;
  } | null;
  groundingAudit?: {
    verified: boolean;
    claimsCount: number;
    claims: { claim: string; status: 'in slides' | 'inferred from slides' | 'outside slides' }[];
  };
  keyTerms: { term: string; definition: string }[];
  commonMistakes: string[];
  examTip: string;
  pmTakeaway?: string;
  formulas?: MaterialFormula[];
  level?: 'standard' | 'simple' | 'deep';
  isThinSlideNotice?: string;
  status?: 'ready' | 'error' | 'generating' | 'needs_generation';
  errorReason?: string;
}

export interface DeckLearnOverview {
  bigPicture: string;
  roadmap: { sectionId: string; title: string; summary: string }[];
  quickRecap: string[];
  miniMemoryAids: { sectionTitle: string; aid: string }[];
}

export interface MaterialQuizQuestion {
  id: string;
  sectionId: string;
  sectionTitle: string;
  slideReference?: string;
  difficulty: 'medium' | 'hard' | 'very_hard';
  type: 'scenario_mcq' | 'numerical' | 'reasoning' | 'assertion_reason' | 'short_answer' | 'case_analysis';
  sourceChip: string;
  question: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswerText?: string;
  explanationSimple: string;
  wrongOptionsAnalysis?: { optionIndex: number; optionText: string; whyWrong: string }[];
}

export interface QuizAttempt {
  id: string;
  materialId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  attemptedAt: string;
  weakSections: { sectionId: string; sectionTitle: string; correct: number; total: number }[];
  missedQuestionIds: string[];
}

export interface MaterialVisualEpisode {
  id: string;
  episodeNumber: number;
  sectionId: string;
  sectionTitle: string;
  slidesRange: string;
  durationSeconds: number;
  directorScene: any;
  thumbnailType: 'market' | 'meadow' | 'treehouse_interior' | 'tower_room';
  takeawayProp: string;
  inRealLifeBridge: string;
  animationHtml?: string;
  title?: string;
  narration?: string;
  character?: string;
  scenes?: any[];
}

export type ProcessingStatus = 'queued' | 'processing' | 'ready' | 'failed' | 'empty' | 'not_started' | 'in_progress' | 'completed' | 'attempted' | 'mastered' | 'watching';

export interface TabProgress {
  phase?: string;
  current?: number;
  total?: number;
  message?: string;
  percentage?: number;
}

export interface Material {
  id: string;
  subjectId: SubjectId;
  title: string;
  fileName: string;
  filePath?: string;
  fileType: string;
  fileSize: number;
  totalPages: number;
  uploadedAt: string;
  lastOpenedAt?: string;
  learnStatus: ProcessingStatus;
  quizStatus: ProcessingStatus;
  visualStatus: ProcessingStatus;
  learnProgress?: TabProgress;
  quizProgress?: TabProgress;
  visualProgress?: TabProgress;
  errorReason?: string;
  lastQuizScore?: { score: number; total: number };
  learnOverview: DeckLearnOverview;
  learnData?: LearnData | null;
  sections: MaterialSection[];
  quizQuestions: MaterialQuizQuestion[];
  visualEpisodes: MaterialVisualEpisode[];
  quizAttempts: QuizAttempt[];
  rawSlides: SlideContent[];
  // Backward compatibility fields
  status?: string;
  masteryScore?: number;
  concepts?: any[];
  contentHash?: string;
}

export interface KeyTermPetal {
  term: string;
  definition: string;
}

export interface StoryCardExample {
  type?: 'india_startup' | 'product_company' | 'numeric' | 'study_design' | 'general';
  tag: string;
  title: string;
  scenario: string;
  breakdown: string;
}

export type RealWorldExample = StoryCardExample;

export interface QuickCheckPlayful {
  question: string;
  options: string[];
  correctAnswer: number;
  sparkleFeedback: string;
}

export interface AnimationScene {
  sceneNumber: number;
  title: string;
  narration: string;
  durationSeconds: number;
  visualType: 'curve_shift' | 'fairy_diagram' | 'matrix_2x2' | 'distribution' | 'funnel';
  visualData?: any;
}

export interface AnimationStoryboard {
  title: string;
  durationSeconds?: number;
  totalDurationSeconds?: number;
  scenes: AnimationScene[];
  hasCurveAnimation?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  friendlyFeedback?: string;
  sourceSlide?: number;
}

export interface Concept {
  id: string;
  lessonId: string;
  subjectId: SubjectId;
  conceptOrder?: number;
  title: string;
  oneSentenceSummary?: string;
  sourceSlide: number;
  status: 'locked' | 'current' | 'bloomed' | 'new' | 'learning' | 'mastered';
  plainExplanation: string;
  analogy: string;
  deepExplanation: string;
  keyTerms: (KeyTermPetal | string)[];
  examples: StoryCardExample[];
  quickCheck?: QuickCheckPlayful;
  animation: AnimationStoryboard;
  quizQuestions: QuizQuestion[];
  notInMaterialNotice?: string;
  outsideMaterialInfo?: string;
}

export interface Lesson extends Partial<Material> {
  id: string;
  subjectId: SubjectId;
  title: string;
  fileName: string;
  filePath?: string;
  fileType: string;
  fileSize: number;
  totalPages: number;
  uploadedAt: string;
  lastOpenedAt?: string;
  status: 'new' | 'in_progress' | 'mastered';
  masteryScore: number;
  concepts: Concept[];
  rawSlides: SlideContent[];
}

export interface GardenPlant {
  id: string;
  conceptId: string;
  conceptTitle: string;
  subjectId: SubjectId;
  flowerType: string;
  bloomedAt: string;
  xPercent: number;
  yPercent: number;
  scale: number;
}

export interface UserLearningState {
  streak: number;
  lastActiveDate: string;
  plants: GardenPlant[];
  weakConceptIds: string[];
}

// ========================================================
// CONCEPT ANIMATOR (Track 1 & Track 2) TYPES
// ========================================================

export type TemplateType =
  | 'character_explains'
  | 'curve_scene'
  | 'flow_scene'
  | 'formula_scene'
  | 'compare_scene'
  | 'story_scene'
  | 'recap_scene';

export type CharacterPose = 'explaining' | 'pointing' | 'thinking' | 'celebrating' | 'waving';
export type CharacterEmotion = 'happy' | 'curious' | 'focused' | 'proud';

export interface StoryboardScene {
  sceneNumber: number;
  durationSeconds?: number;
  duration?: number;
  act?: 'setup' | 'action' | 'result';
  background?: 'market' | 'meadow' | 'treehouse_interior' | 'tower_room';
  camera?: string;
  actors?: Array<{
    id: any;
    enter?: string;
    position: any;
    scale?: number;
  }>;
  beats?: Array<{
    t: number;
    actor: any;
    action: any;
    say?: string;
    item?: any;
    from?: string;
  }>;
  takeaway_prop?: string;
  in_real_life?: string;
  templateType?: TemplateType;
  characterPose?: CharacterPose;
  characterEmotion?: CharacterEmotion;
  caption: string;
  narration?: string;
  data?: any;
}

export interface Storyboard {
  conceptId: string;
  subjectId: SubjectId;
  conceptTitle: string;
  sourceSlide: number;
  totalDurationSeconds?: number;
  totalDuration?: number;
  inRealLifeBridge?: string;
  character?: {
    name: string;
    title: string;
    role: string;
    color: string;
    badgeBg: string;
    accent: string;
    avatar: 'fairy' | 'owl' | 'bunny';
  };
  scenes: StoryboardScene[];
  generatedAt: string;
  provider?: string;
}

export interface ClipMeta {
  id: string;
  conceptId: string;
  subjectId: SubjectId;
  filePath: string;
  durationSeconds: number;
  costUsd: number;
  promptText?: string;
  createdAt: string;
  status: string;
}

export interface VideoSpendInfo {
  date: string;
  spentTodayUsd: number;
  dailySpendCapUsd: number;
  remainingBudgetUsd: number;
  pricePerSecondUsd: number;
  hasApiKey: boolean;
  videoModel: string;
}

export interface ExplainerSummary {
  conceptId: string;
  subjectId: SubjectId;
  conceptTitle: string;
  summary: string;
  sourceSlide: number;
  chapterTitle: string;
  generatedAt: string;
}

