// src/components/animator/characters/types.ts

export type CharacterId =
  | 'bunny'
  | 'fairy'
  | 'owl'
  | 'fox'
  | 'bee'
  | 'squirrel'
  | 'crowd';

export type CharacterAction =
  | 'idle'
  | 'breathe'
  | 'blink'
  | 'walk-in'
  | 'walk-out'
  | 'run'
  | 'hop'
  | 'jump'
  | 'wave'
  | 'point'
  | 'nod'
  | 'shake-head'
  | 'think'
  | 'surprised'
  | 'happy-dance'
  | 'sad-slump'
  | 'carry-item'
  | 'hand-over-item'
  | 'pour'
  | 'stack-items'
  | 'count-on-fingers'
  | 'shout'
  | 'fly-across'
  | 'grow'
  | 'multiply'
  | 'shrink'
  | 'sleep'
  | 'celebrate';

export type PropItem =
  | 'carrot'
  | 'carrot-basket'
  | 'honey-jar'
  | 'honey-coins'
  | 'wand'
  | 'magnifying-glass'
  | 'scroll'
  | 'seed'
  | 'sprout'
  | 'balance-scale'
  | 'signboard'
  | 'counter'
  | 'lantern';

export interface SceneActor {
  id: CharacterId;
  enter?: 'walk-in-left' | 'walk-in-right' | 'fly-in' | 'appear' | 'none';
  position: 'left' | 'center-left' | 'center' | 'center-right' | 'right' | 'counter';
  scale?: number;
}

export interface StoryBeat {
  t: number; // seconds into scene
  actor: CharacterId;
  action: CharacterAction;
  say?: string; // speech bubble
  item?: PropItem;
  from?: 'left' | 'right';
  target?: string;
}

export interface DirectorScene {
  sceneNumber: number;
  duration: number; // seconds
  act?: 'setup' | 'action' | 'result';
  background: 'market' | 'meadow' | 'treehouse_interior' | 'tower_room';
  camera: 'static' | 'pan-left' | 'pan-right' | 'zoom-in' | 'zoom-on-bunny' | 'zoom-on-actor';
  actors: SceneActor[];
  beats: StoryBeat[];
  caption: string;
  takeaway_prop?: string; // optional small signboard text, max 6 words
  in_real_life?: string; // bridge back to the MBA concept
}

export interface DirectorStoryboard {
  conceptId: string;
  conceptTitle: string;
  subjectId: 'pm2' | 'mrm' | 'microecon';
  sourceSlide: number;
  totalDuration: number;
  scenes: DirectorScene[];
  inRealLifeBridge: string;
  generatedAt: string;
}
