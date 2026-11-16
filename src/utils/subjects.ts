import { SubjectId, SubjectMeta } from '../types';
import { supabase } from '../services/supabase';

export const DEFAULT_SUBJECTS: Record<string, SubjectMeta> = {
  pm2: {
    id: 'pm2',
    title: 'Product Management 2',
    code: 'PM-802',
    characterName: 'Faye',
    characterTitle: 'The Fairy Builder',
    tagline: 'Crafting delight, wireframes & growth flywheels',
    colorWorld: 'pm',
    accentHex: '#8B5CF6',
    badgeHex: '#DDD6FE',
    glowClass: 'shadow-glow-pm',
    description: 'Advanced product strategy, discovery, growth experiments, and platform economics.',
  },
  mrm: {
    id: 'mrm',
    title: 'Market Research Methods',
    code: 'MR-704',
    characterName: 'Barnaby',
    characterTitle: 'The Curious Fox',
    tagline: 'Uncovering consumer truths & empirical signals',
    colorWorld: 'mr',
    accentHex: '#059669',
    badgeHex: '#BBF7D0',
    glowClass: 'shadow-glow-mr',
    description: 'Qualitative field interviews, conjoint analysis, sample sizing, and survey architectures.',
  },
  microecon: {
    id: 'microecon',
    title: 'Microeconomics',
    code: 'EC-601',
    characterName: 'Pip',
    characterTitle: 'The Friendly Bunny',
    tagline: 'Balancing incentives, price elasticity & welfare',
    colorWorld: 'micro',
    accentHex: '#D97706',
    badgeHex: '#FDE68A',
    glowClass: 'shadow-glow-micro',
    description: 'Equilibrium dynamics, consumer surplus, game theory, price discrimination, and market structures.',
  },
};

const CUSTOM_SUBJECTS_KEY = 'petal_custom_subjects';

export function getCustomSubjects(): Record<string, SubjectMeta> {
  try {
    const raw = localStorage.getItem(CUSTOM_SUBJECTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[Subjects] Could not read custom subjects:', e);
  }
  return {};
}

export function getAllSubjects(): Record<string, SubjectMeta> {
  const custom = getCustomSubjects();
  return { ...DEFAULT_SUBJECTS, ...custom };
}

export async function saveCustomSubject(meta: SubjectMeta): Promise<void> {
  try {
    const current = getCustomSubjects();
    current[meta.id] = meta;
    localStorage.setItem(CUSTOM_SUBJECTS_KEY, JSON.stringify(current));

    // Also persist to Supabase PostgreSQL subjects table so it's globally visible
    if (supabase) {
      await supabase.from('subjects').upsert({
        id: meta.id,
        name: meta.title,
      }, { onConflict: 'id' });
    }
  } catch (e) {
    console.warn('[Subjects] Error saving custom subject:', e);
  }
}

export function getSubjectById(id: string): SubjectMeta {
  const all = getAllSubjects();
  if (all[id]) return all[id];

  const titleCase = id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id,
    title: titleCase,
    code: id.slice(0, 4).toUpperCase(),
    characterName: 'Flora',
    characterTitle: 'The Garden Scholar',
    tagline: `Exploring ${titleCase} fundamentals & key principles`,
    colorWorld: 'pm',
    accentHex: '#8B5CF6',
    badgeHex: '#DDD6FE',
    glowClass: 'shadow-glow-pm',
    description: `Comprehensive study sanctuary for ${titleCase}.`,
  };
}

export const SUBJECTS: Record<string, SubjectMeta> = new Proxy(DEFAULT_SUBJECTS, {
  get(target, prop: string) {
    if (prop in target) return target[prop];
    const custom = getCustomSubjects();
    if (prop in custom) return custom[prop];
    return getSubjectById(prop);
  },
});

export const SUBJECT_LIST = Object.values(DEFAULT_SUBJECTS);
