import {makeScene2D, Code, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

const PARALLEL_CODE = `\
parallel block_id by NUM_SMS : block {
  ...
  parallel p by 1 : group-4 {
    ma = mma.load ...
    mma.row.row mc, ma, mb;
  }
  ...
}`;

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  const code = createRef<Code>();

  view.add(
    <Txt
      ref={heading}
      text="Parallel Programs Made Simple"
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
      code={PARALLEL_CODE}
      fontSize={18}
      fontFamily={Fonts.mono}
      x={-250}
      y={-50}
      opacity={0}
    />,
  );

  yield* heading().opacity(1, 0.5);
  yield* code().opacity(1, 0.5);

  yield* code().selection(code().findAllRanges(/parallel [^\n]*/g), 0.5);
  yield* waitFor(0.5);

  const bullets = [
    'Unified parallel-by: one keyword for all levels',
    'Maps to NVIDIA, AMD, and custom DSA — hardware-agnostic',
    'mpi specifier for multi-device parallelism',
    'CUDA needs 8 primitives: blockIdx, threadIdx, syncthreads, ...',
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

  // Stats comparison
  const statContainer = createRef<Layout>();
  view.add(
    <Layout ref={statContainer} direction="row" gap={80} y={200} opacity={0}>
      <Layout direction="column" alignItems="center">
        <Txt text="2" fill={Colors.mint500} fontFamily={Fonts.mono} fontSize={56} fontWeight={900} />
        <Txt text="CroqTile primitives" fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={14} />
      </Layout>
      <Layout direction="column" alignItems="center">
        <Txt text="vs" fill={Colors.fgDim} fontFamily={Fonts.main} fontSize={24} />
      </Layout>
      <Layout direction="column" alignItems="center">
        <Txt text="8" fill={Colors.red} fontFamily={Fonts.mono} fontSize={56} fontWeight={900} />
        <Txt text="CUDA primitives" fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={14} />
      </Layout>
    </Layout>,
  );

  yield* waitFor(1);
  yield* statContainer().opacity(1, 0.6);

  yield* waitUntil('parallel-end');
});
