import {makeScene2D, Code, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

const MMA_CODE = `\
mc = mma.fill.f16 0.0f;
  ...
ma = mma.load.swiz<128> lhs_s;
mb = mma.load.swiz<128> rhs_s;

mma.row.row mc, ma, mb;

mma.store mc, out_s;`;

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  const code = createRef<Code>();

  view.add(
    <Txt
      ref={heading}
      text="Tensor Core MMA — 5-Line Cycle"
      fill={Colors.fg}
      fontFamily={Fonts.main}
      fontSize={36}
      fontWeight={800}
      y={-310}
      opacity={0}
    />,
  );

  view.add(
    <Code
      ref={code}
      code={MMA_CODE}
      fontSize={20}
      fontFamily={Fonts.mono}
      x={-250}
      y={-50}
      opacity={0}
    />,
  );

  yield* heading().opacity(1, 0.5);
  yield* code().opacity(1, 0.5);

  yield* waitFor(0.5);

  // Highlight each step
  yield* code().selection(code().findFirstRange('mma.fill'), 0.4);
  yield* waitFor(0.8);
  yield* code().selection(code().findAllRanges(/mma\.load[^\n]*/g), 0.4);
  yield* waitFor(0.8);
  yield* code().selection(code().findFirstRange('mma.row.row'), 0.4);
  yield* waitFor(0.8);
  yield* code().selection(code().findFirstRange('mma.store'), 0.4);
  yield* waitFor(0.5);

  // Clear selection
  yield* code().selection([], 0.3);

  // Bullets
  const bullets = [
    'Complete MMA: fill → load ×2 → compute → store',
    'Compile-time dispatch: HMMA (SM70/80) vs WGMMA (SM90)',
    'Shape/dtype constraints checked at compile time',
    'Add .sp for structured sparsity — same semantics',
  ];

  for (let i = 0; i < bullets.length; i++) {
    const b = createRef<Txt>();
    view.add(
      <Layout direction="row" alignItems="start" gap={10} x={250} y={-120 + i * 55} opacity={0}>
        <Rect width={8} height={8} radius={4} fill={Colors.mint500} marginTop={7} />
        <Txt ref={b} text={bullets[i]} fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={16} textWrap width={380} lineHeight={24} />
      </Layout>,
    );
  }

  yield* waitUntil('mma-end');
});
