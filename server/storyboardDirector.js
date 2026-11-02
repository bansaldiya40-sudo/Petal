// server/storyboardDirector.js
// Character-driven 3-Act Metaphor Storyboard Director for Petal

export function generateCharacterDirectorStoryboard(concept, subjectId) {
  const title = concept.title || 'Core Syllabus Concept';
  const summary = concept.oneSentenceSummary || concept.plainExplanation || 'Key foundational MBA principle.';
  const sourceSlide = concept.sourceSlide || 1;
  const lowerTitle = title.toLowerCase();

  // 1. Check for specific signature metaphors from user specifications
  // Metaphor A: Viral Loops / Network Effects / Growth (PM2)
  if (
    lowerTitle.includes('viral') ||
    lowerTitle.includes('network') ||
    lowerTitle.includes('referral') ||
    lowerTitle.includes('growth') ||
    lowerTitle.includes('loop')
  ) {
    return {
      conceptId: concept.id,
      conceptTitle: title,
      subjectId: 'pm2',
      sourceSlide,
      totalDuration: 24,
      generatedAt: new Date().toISOString(),
      inRealLifeBridge:
        'In real life: Each new customer invites more than one friend (K > 1), creating compounding viral adoption.',
      scenes: [
        {
          sceneNumber: 1,
          act: 'setup',
          duration: 7,
          background: 'market',
          camera: 'static',
          actors: [
            { id: 'bunny', position: 'counter', scale: 1 },
            { id: 'fox', enter: 'walk-in-right', position: 'center-right', scale: 0.95 },
          ],
          beats: [
            { t: 0.5, actor: 'bunny', action: 'wave', say: 'Crispy carrots today!' },
            { t: 2.0, actor: 'fox', action: 'hop', say: 'These taste delicious!' },
            { t: 4.2, actor: 'bunny', action: 'hand-over-item', item: 'scroll', say: 'Here is a golden pass for 2 friends!' },
          ],
          caption: 'Pip opens his carrot stall and gifts Fox a golden invite ticket for two friends.',
          takeaway_prop: 'Invite Pass: i = 2',
        },
        {
          sceneNumber: 2,
          act: 'action',
          duration: 9,
          background: 'meadow',
          camera: 'pan-right',
          actors: [
            { id: 'fox', enter: 'walk-in-left', position: 'center-left', scale: 0.95 },
            { id: 'squirrel', enter: 'walk-in-right', position: 'center', scale: 0.9 },
            { id: 'crowd', enter: 'appear', position: 'right', scale: 0.85 },
          ],
          beats: [
            { t: 0.5, actor: 'fox', action: 'wave', item: 'scroll', say: 'Come try these carrots!' },
            { t: 2.5, actor: 'squirrel', action: 'happy-dance', say: 'We want some too!' },
            { t: 5.0, actor: 'crowd', action: 'multiply', say: 'We brought everyone!' },
          ],
          caption: 'Fox brings Squirrel and Hedgehog—then each of them invites two more friends, spawning a joyful crowd!',
          takeaway_prop: 'Conversion: c = 60%',
        },
        {
          sceneNumber: 3,
          act: 'result',
          duration: 8,
          background: 'market',
          camera: 'zoom-in',
          actors: [
            { id: 'bunny', position: 'center-left', scale: 1 },
            { id: 'crowd', position: 'right', scale: 0.95 },
          ],
          beats: [
            { t: 0.5, actor: 'crowd', action: 'celebrate', say: 'More carrots please!' },
            { t: 2.5, actor: 'bunny', action: 'celebrate', say: 'The garden has gone viral!' },
          ],
          caption: 'The carrot stand multiplies without paid ads because every guest brings more than one visitor.',
          takeaway_prop: `${concept.title.slice(0, 16)}: Active`,
          in_real_life:
            `In real life: ${concept.title} aligns customer actions with validated objectives.`,
        },
      ],
    };
  }

  // Metaphor B: Quantitative / Market Analysis
  if (
    lowerTitle.includes('metric') ||
    lowerTitle.includes('model') ||
    lowerTitle.includes('analysis') ||
    subjectId === 'microecon'
  ) {
    return {
      conceptId: concept.id,
      conceptTitle: title,
      subjectId: 'microecon',
      sourceSlide,
      totalDuration: 25,
      generatedAt: new Date().toISOString(),
      inRealLifeBridge:
        `In real life: ${concept.title} provides the framework to analyze operational trade-offs accurately.`,
      scenes: [
        {
          sceneNumber: 1,
          act: 'setup',
          duration: 8,
          background: 'market',
          camera: 'static',
          actors: [
            { id: 'bunny', position: 'counter', scale: 1 },
            { id: 'bee', enter: 'fly-in', position: 'center-right', scale: 1 },
            { id: 'crowd', position: 'right', scale: 0.8 },
          ],
          beats: [
            { t: 0.5, actor: 'bunny', action: 'point', item: 'honey-jar', say: 'Sweet clover honey: 5 coins!' },
            { t: 2.5, actor: 'bee', action: 'happy-dance', item: 'honey-coins', say: 'A fair price!' },
            { t: 4.5, actor: 'crowd', action: 'happy-dance', say: 'We want 10 jars!' },
          ],
          caption: 'Pip prices his sweet honey jars at 5 coins, and a joyful queue of forest bees gathers.',
          takeaway_prop: 'P = 5 coins • Q = 10',
        },
        {
          sceneNumber: 2,
          act: 'action',
          duration: 9,
          background: 'market',
          camera: 'zoom-on-bunny',
          actors: [
            { id: 'bunny', position: 'counter', scale: 1 },
            { id: 'bee', position: 'center-right', scale: 1 },
            { id: 'crowd', position: 'right', scale: 0.8 },
          ],
          beats: [
            { t: 0.5, actor: 'bunny', action: 'point', say: 'Now honey is 10 coins!' },
            { t: 2.2, actor: 'crowd', action: 'sad-slump', say: 'Too expensive for us...' },
            { t: 4.5, actor: 'bee', action: 'shake-head', say: 'Only one bee can afford it now.' },
          ],
          caption: 'Pip doubles the price to 10 coins. Nine bees fly away sad, and sales plummet to one lonely jar.',
          takeaway_prop: 'P = 10 • Q Drops to 1',
        },
        {
          sceneNumber: 3,
          act: 'result',
          duration: 8,
          background: 'market',
          camera: 'zoom-in',
          actors: [
            { id: 'bunny', position: 'counter', scale: 1 },
            { id: 'crowd', enter: 'appear', position: 'center-right', scale: 0.9 },
            { id: 'bee', position: 'right', scale: 1 },
          ],
          beats: [
            { t: 0.5, actor: 'bunny', action: 'nod', say: 'Adjusting back to 4 coins!' },
            { t: 2.5, actor: 'crowd', action: 'multiply', say: 'Hooray! The swarm returns!' },
            { t: 4.8, actor: 'bunny', action: 'happy-dance', say: 'Quantity demand bounces back!' },
          ],
          caption: 'Lowering the price slightly brings back the whole swarm. Forest buyers are highly sensitive to price.',
          takeaway_prop: 'High Price = Low Demand',
          in_real_life:
            'In real life: When demand is elastic, small price increases sharply reduce quantity sold.',
        },
      ],
    };
  }

  // Metaphor C: Sampling Bias / Research Methods / Surveys / Conjoint (MRM)
  if (
    lowerTitle.includes('sample') ||
    lowerTitle.includes('bias') ||
    lowerTitle.includes('survey') ||
    lowerTitle.includes('research') ||
    lowerTitle.includes('conjoint') ||
    lowerTitle.includes('qualitative') ||
    subjectId === 'mrm'
  ) {
    return {
      conceptId: concept.id,
      conceptTitle: title,
      subjectId: 'mrm',
      sourceSlide,
      totalDuration: 26,
      generatedAt: new Date().toISOString(),
      inRealLifeBridge:
        'In real life: Interviewing only one convenient group distorts findings; your sample must mirror the target population.',
      scenes: [
        {
          sceneNumber: 1,
          act: 'setup',
          duration: 8,
          background: 'treehouse_interior',
          camera: 'static',
          actors: [
            { id: 'owl', position: 'center', scale: 1 },
            { id: 'fox', enter: 'walk-in-right', position: 'right', scale: 0.9 },
          ],
          beats: [
            { t: 0.5, actor: 'owl', action: 'point', item: 'magnifying-glass', say: 'What do all forest animals eat?' },
            { t: 3.0, actor: 'owl', action: 'think', say: 'I only surveyed night owls at 2 AM!' },
            { t: 5.2, actor: 'owl', action: 'nod', say: '"100% of the woods loves beetles!"' },
          ],
          caption: 'Barnaby the Owl surveys only midnight creatures and boldly concludes all forest animals eat beetles.',
          takeaway_prop: 'Sample: Only Night Owls',
        },
        {
          sceneNumber: 2,
          act: 'action',
          duration: 9,
          background: 'meadow',
          camera: 'pan-left',
          actors: [
            { id: 'owl', position: 'left', scale: 1 },
            { id: 'fox', position: 'center', scale: 0.95 },
            { id: 'squirrel', position: 'right', scale: 0.9 },
          ],
          beats: [
            { t: 0.5, actor: 'fox', action: 'surprised', item: 'carrot', say: 'Beetles? I only eat sweet berries!' },
            { t: 3.0, actor: 'squirrel', action: 'shake-head', say: 'And I only eat crunchy acorns!' },
            { t: 5.5, actor: 'owl', action: 'surprised', say: 'Oh my feathers! My sample was biased!' },
          ],
          caption: 'Fox walks past with juicy berries and Squirrel with acorns, revealing Barnaby’s conclusion was completely skewed.',
          takeaway_prop: 'Actual Diet ≠ Beetles',
        },
        {
          sceneNumber: 3,
          act: 'result',
          duration: 9,
          background: 'treehouse_interior',
          camera: 'zoom-in',
          actors: [
            { id: 'owl', position: 'center', scale: 1 },
            { id: 'crowd', enter: 'appear', position: 'right', scale: 0.85 },
          ],
          beats: [
            { t: 0.5, actor: 'owl', action: 'nod', item: 'scroll', say: 'Now sampling day AND night animals!' },
            { t: 3.0, actor: 'crowd', action: 'celebrate', say: 'Now our true voices are heard!' },
          ],
          caption: 'Barnaby updates his methodology to represent the whole forest, producing accurate, actionable insights.',
          takeaway_prop: 'Sample Must Match Population',
          in_real_life:
            'In real life: Sampling only one group leads to wrong conclusions. Valid research requires representative samples.',
        },
      ],
    };
  }

  // Metaphor D: Product Management 2 / Product Strategy / Features / Retention
  return {
    conceptId: concept.id,
    conceptTitle: title,
    subjectId: 'pm2',
    sourceSlide,
    totalDuration: 24,
    generatedAt: new Date().toISOString(),
    inRealLifeBridge: `In real life: ${summary}`,
    scenes: [
      {
        sceneNumber: 1,
        act: 'setup',
        duration: 7,
        background: 'tower_room',
        camera: 'static',
        actors: [
          { id: 'fairy', position: 'center-left', scale: 1 },
          { id: 'fox', enter: 'walk-in-right', position: 'right', scale: 0.9 },
        ],
        beats: [
          { t: 0.5, actor: 'fairy', action: 'wave', item: 'wand', say: `Let us test ${title}!` },
          { t: 2.8, actor: 'fox', action: 'point', say: 'How does it help us in the garden?' },
          { t: 4.8, actor: 'fairy', action: 'think', say: 'Let us build a small prototype first.' },
        ],
        caption: `Faye the Fairy Builder formulates a working model for ${title} to solve a key forest dilemma.`,
        takeaway_prop: `Hypothesis: ${title.slice(0, 20)}`,
      },
      {
        sceneNumber: 2,
        act: 'action',
        duration: 9,
        background: 'meadow',
        camera: 'pan-right',
        actors: [
          { id: 'fairy', position: 'left', scale: 0.95 },
          { id: 'fox', position: 'center-left', scale: 0.95 },
          { id: 'squirrel', enter: 'walk-in-right', position: 'center-right', scale: 0.9 },
        ],
        beats: [
          { t: 0.5, actor: 'fairy', action: 'point', item: 'wand', say: 'Try out this simplified version!' },
          { t: 2.8, actor: 'fox', action: 'happy-dance', say: 'It saves us half the journey time!' },
          { t: 5.2, actor: 'squirrel', action: 'celebrate', say: 'The solution is immediate!' },
        ],
        caption: `The forest creatures test the core mechanism, observing rapid cause-and-effect improvements.`,
        takeaway_prop: 'Value > Effort',
      },
      {
        sceneNumber: 3,
        act: 'result',
        duration: 8,
        background: 'tower_room',
        camera: 'zoom-in',
        actors: [
          { id: 'fairy', position: 'center', scale: 1 },
          { id: 'crowd', enter: 'appear', position: 'right', scale: 0.85 },
        ],
        beats: [
          { t: 0.5, actor: 'fairy', action: 'celebrate', item: 'wand', say: 'Grounded in our syllabus lesson!' },
          { t: 3.0, actor: 'crowd', action: 'happy-dance', say: 'Clear and delightful!' },
        ],
        caption: `With the principle proven in the garden, Diya can apply this directly to MBA case studies.`,
        takeaway_prop: 'Validated Learning',
        in_real_life: `In real life: ${summary}`,
      },
    ],
  };
}
