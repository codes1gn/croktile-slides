import {makeScene2D, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts, Radius} from '../theme';

const FEATURE_CARDS = [
  {icon: '📊', title: 'Highest Source Density', desc: '25-line kernels fit in ~500 tokens.\nEvery token carries optimization semantics, not boilerplate.', accent: '#dcfce9'},
  {icon: '⚙️', title: 'Unified Primitives', desc: 'One tma.copy / mma.row dispatches optimally.\nAI reasons about intent, not instruction selection.', accent: '#dbeafe'},
  {icon: '🧠', title: 'AI-Parsable Syntax', desc: 'Clean, regular syntax.\nAI understands structure, not just pattern-matches.', accent: '#fef3c7'},
  {icon: '🛡️', title: 'Safety-Accelerated Loop', desc: 'Invalid changes rejected immediately.\nNo wasted context on dead-end approaches.', accent: '#fee2e2'},
];

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  view.add(
    <Txt
      ref={heading}
      text="Superior Context & Harness Engineering"
      fill={Colors.fg}
      fontFamily={Fonts.main}
      fontSize={34}
      fontWeight={800}
      y={-310}
      opacity={0}
    />,
  );

  yield* heading().opacity(1, 0.5);

  // Feature cards in 2x2 grid
  const cardRefs: Rect[] = [];
  const positions = [
    {x: -240, y: -130},
    {x: 240, y: -130},
    {x: -240, y: 80},
    {x: 240, y: 80},
  ];

  for (let i = 0; i < FEATURE_CARDS.length; i++) {
    const fc = FEATURE_CARDS[i];
    const card = createRef<Rect>();
    view.add(
      <Rect
        ref={card}
        x={positions[i].x}
        y={positions[i].y}
        width={400}
        height={160}
        radius={Radius.lg}
        fill={Colors.surface}
        stroke={Colors.border}
        lineWidth={1}
        padding={24}
        direction="column"
        gap={8}
        opacity={0}
        scale={0.85}
      >
        <Layout direction="row" alignItems="center" gap={10}>
          <Rect width={32} height={32} radius={8} fill={fc.accent} justifyContent="center" alignItems="center">
            <Txt text={fc.icon} fontSize={16} />
          </Rect>
          <Txt text={fc.title} fill={Colors.fg} fontFamily={Fonts.main} fontSize={18} fontWeight={700} />
        </Layout>
        <Txt text={fc.desc} fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={13} lineHeight={20} textWrap width={340} />
      </Rect>,
    );
    cardRefs.push(card());
  }

  yield* sequence(0.3, ...cardRefs.map(c => all(c.opacity(1, 0.5), c.scale(1, 0.5))));

  yield* waitFor(1);

  // Comparison table
  const tableContainer = createRef<Layout>();
  view.add(
    <Layout ref={tableContainer} direction="column" y={260} gap={2} opacity={0} />,
  );

  const headers = ['Metric', 'CrokTile', 'CUDA'];
  const rows = [
    ['Invalid kernel', 'Compile error', 'Silent bug'],
    ['TMA config', '1 primitive', '5+ steps'],
    ['AI iterations w/o crash', '200+', 'Frequent hangs'],
    ['Debug cost', '~0 tokens', '~3000+ tokens'],
  ];
  const colW = [170, 140, 140];

  tableContainer().add(
    <Layout direction="row">
      {headers.map((h, i) => (
        <Rect width={colW[i]} height={28} fill={Colors.mint500 + '15'} justifyContent="center" alignItems="center">
          <Txt text={h} fill={Colors.mint700} fontFamily={Fonts.main} fontSize={12} fontWeight={700} />
        </Rect>
      ))}
    </Layout>,
  );

  for (const row of rows) {
    tableContainer().add(
      <Layout direction="row">
        {row.map((c, i) => (
          <Rect width={colW[i]} height={26} fill={Colors.surface} justifyContent="center" alignItems="center" stroke={Colors.border} lineWidth={0.5}>
            <Txt
              text={c}
              fill={i === 1 ? Colors.mint500 : i === 2 ? Colors.fgDim : Colors.fg}
              fontFamily={i === 0 ? Fonts.main : Fonts.mono}
              fontSize={12}
              fontWeight={i === 1 ? 700 : i === 0 ? 600 : 400}
            />
          </Rect>
        ))}
      </Layout>,
    );
  }

  yield* tableContainer().opacity(1, 0.6);

  yield* waitUntil('ai-context-end');
});
