import { SubjectId, SubjectMeta } from '../types';

export const SUBJECTS: Record<SubjectId, SubjectMeta> = {
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

export const SUBJECT_LIST = Object.values(SUBJECTS);
