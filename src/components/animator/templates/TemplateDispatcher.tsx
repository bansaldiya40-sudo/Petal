import React from 'react';
import { StoryboardScene, SubjectId } from '../../../types';
import { CharacterExplainsTemplate } from './CharacterExplainsTemplate';
import { CurveSceneTemplate } from './CurveSceneTemplate';
import { FlowSceneTemplate } from './FlowSceneTemplate';
import { FormulaSceneTemplate } from './FormulaSceneTemplate';
import { CompareSceneTemplate } from './CompareSceneTemplate';
import { StorySceneTemplate } from './StorySceneTemplate';
import { RecapSceneTemplate } from './RecapSceneTemplate';

interface TemplateDispatcherProps {
  scene: StoryboardScene;
  subjectId: SubjectId;
  reducedMotion?: boolean;
}

export const TemplateDispatcher: React.FC<TemplateDispatcherProps> = ({
  scene,
  subjectId,
  reducedMotion = false,
}) => {
  switch (scene.templateType) {
    case 'character_explains':
      return <CharacterExplainsTemplate scene={scene} subjectId={subjectId} reducedMotion={reducedMotion} />;
    case 'curve_scene':
      return <CurveSceneTemplate scene={scene} subjectId={subjectId} reducedMotion={reducedMotion} />;
    case 'flow_scene':
      return <FlowSceneTemplate scene={scene} subjectId={subjectId} reducedMotion={reducedMotion} />;
    case 'formula_scene':
      return <FormulaSceneTemplate scene={scene} subjectId={subjectId} reducedMotion={reducedMotion} />;
    case 'compare_scene':
      return <CompareSceneTemplate scene={scene} subjectId={subjectId} reducedMotion={reducedMotion} />;
    case 'story_scene':
      return <StorySceneTemplate scene={scene} subjectId={subjectId} reducedMotion={reducedMotion} />;
    case 'recap_scene':
      return <RecapSceneTemplate scene={scene} subjectId={subjectId} reducedMotion={reducedMotion} />;
    default:
      return <CharacterExplainsTemplate scene={scene} subjectId={subjectId} reducedMotion={reducedMotion} />;
  }
};
