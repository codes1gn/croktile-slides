import {makeScene2D, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, slideTransition, Direction, linear} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

function* countUp(node: Txt, target: number, duration: number = 1.2) {
  const steps = Math.ceil(duration * 30);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const eased = t * t * (3 - 2 * t);
    node.text(Math.round(eased * target).toLocaleString());
    yield* waitFor(1 / 30);
  }
}

const MODULES = [
  {name: 'Early Semantic Analysis', count: '189'},
  {name: 'Semantic Validation', count: '65'},
  {name: 'Type Inference', count: '38'},
  {name: 'Shape Inference', count: '33'},
  {name: 'Loop Vectorization', count: '16'},
  {name: 'Static Assessment', count: '4'},
  {name: 'Code Generation', count: '8'},
];

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  view.add(
    <Txt
      ref={heading}
      text="353 Compile-Time Checks · 1,319 Runtime Assertions"
      fill={Colors.fg}
      fontFamily={Fonts.main}
      fontSize={30}
      fontWeight={800}
      y={-310}
      opacity={0}
    />,
  );

  yield* heading().opacity(1, 0.5);

  // Counter stats
  const stat1 = createRef<Txt>();
  const stat2 = createRef<Txt>();
  const stat3 = createRef<Txt>();

  view.add(
    <Layout direction="row" gap={80} y={-180}>
      <Layout direction="column" alignItems="center" gap={6}>
        <Txt ref={stat1} text="0" fill={Colors.mint500} fontFamily={Fonts.mono} fontSize={64} fontWeight={900} />
        <Txt text="compile-time checks" fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={14} />
      </Layout>
      <Layout direction="column" alignItems="center" gap={6}>
        <Txt ref={stat2} text="0" fill={Colors.mint500} fontFamily={Fonts.mono} fontSize={64} fontWeight={900} />
        <Txt text="runtime assertions" fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={14} />
      </Layout>
      <Layout direction="column" alignItems="center" gap={6}>
        <Txt ref={stat3} text="0" fill={Colors.red} fontFamily={Fonts.mono} fontSize={64} fontWeight={900} />
        <Txt text="silent bugs possible" fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={14} />
      </Layout>
    </Layout>,
  );

  yield* countUp(stat1(), 353, 1.5);
  yield* countUp(stat2(), 1319, 1.5);
  yield* waitFor(0.5);

  // Module breakdown table
  const tableContainer = createRef<Layout>();
  view.add(
    <Layout ref={tableContainer} direction="column" y={80} gap={2} opacity={0} />,
  );

  // Header
  tableContainer().add(
    <Layout direction="row">
      <Rect width={260} height={32} fill={Colors.mint500 + '15'} justifyContent="center" alignItems="center" stroke={Colors.mint500 + '40'} lineWidth={1}>
        <Txt text="Compiler Module" fill={Colors.mint700} fontFamily={Fonts.main} fontSize={14} fontWeight={700} />
      </Rect>
      <Rect width={100} height={32} fill={Colors.mint500 + '15'} justifyContent="center" alignItems="center" stroke={Colors.mint500 + '40'} lineWidth={1}>
        <Txt text="Checks" fill={Colors.mint700} fontFamily={Fonts.main} fontSize={14} fontWeight={700} />
      </Rect>
    </Layout>,
  );

  const rowNodes: Layout[] = [];
  for (const mod of MODULES) {
    const row = (
      <Layout direction="row" opacity={0}>
        <Rect width={260} height={28} fill={Colors.surface} justifyContent="center" alignItems="center" stroke={Colors.border} lineWidth={0.5}>
          <Txt text={mod.name} fill={Colors.fg} fontFamily={Fonts.main} fontSize={13} fontWeight={600} />
        </Rect>
        <Rect width={100} height={28} fill={Colors.surface} justifyContent="center" alignItems="center" stroke={Colors.border} lineWidth={0.5}>
          <Txt text={mod.count} fill={Colors.mint500} fontFamily={Fonts.mono} fontSize={14} fontWeight={700} />
        </Rect>
      </Layout>
    ) as Layout;
    tableContainer().add(row);
    rowNodes.push(row);
  }

  yield* tableContainer().opacity(1, 0.3);
  yield* sequence(0.12, ...rowNodes.map(r => r.opacity(1, 0.3)));

  yield* waitUntil('safety-stats-end');
});
