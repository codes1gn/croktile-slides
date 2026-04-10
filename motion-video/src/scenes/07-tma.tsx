import {makeScene2D, Code, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

const TMA_CODE = `\
  ...
  tma.copy.swiz<128>
    lhs.subspan(WARP_M, TILE_K)
      .at(bm, iv_k) => lhs_s;
  ...
  tma.copy out_s =>
    output.subspan(WARP_M, WARP_N)
      .at(bm, bn);`;

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  const code = createRef<Code>();

  view.add(
    <Txt
      ref={heading}
      text="No Manual TMA/DMA Management"
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
      code={TMA_CODE}
      fontSize={18}
      fontFamily={Fonts.mono}
      x={-280}
      y={-80}
      opacity={0}
    />,
  );

  yield* heading().opacity(1, 0.5);
  yield* code().opacity(1, 0.5);

  yield* code().selection(code().findAllRanges(/tma\.copy[^\n]*/g), 0.6);

  // Bullets
  const bullets = [
    'One-liner: tma.copy.swiz<128> src => dst',
    'Auto swizzle mode + barrier management',
    'No CUtensorMap descriptor (30+ LOC in CUDA)',
    'DMA fallback: dma.copy — identical syntax',
  ];

  for (let i = 0; i < bullets.length; i++) {
    const b = createRef<Txt>();
    view.add(
      <Layout direction="row" alignItems="start" gap={10} x={250} y={-140 + i * 50} opacity={0}>
        <Rect width={8} height={8} radius={4} fill={Colors.mint500} marginTop={7} />
        <Txt ref={b} text={bullets[i]} fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={16} textWrap width={380} lineHeight={24} />
      </Layout>,
    );
  }

  yield* waitFor(0.5);

  // Mini bar chart
  const barLabels = ['Croqtile', 'Triton', 'CUDA'];
  const barVals = [2, 12, 35];
  const barColors = [Colors.croqtile, Colors.triton, Colors.cuda];

  for (let i = 0; i < 3; i++) {
    const barRect = createRef<Rect>();
    view.add(
      <Layout direction="row" alignItems="center" gap={10} x={-300} y={130 + i * 45}>
        <Txt text={barLabels[i]} fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={14} fontWeight={600} width={80} textAlign="right" />
        <Rect ref={barRect} height={28} width={0} radius={6} fill={barColors[i]} paddingLeft={8} paddingRight={8} justifyContent="center" alignItems="center">
          <Txt text={`${barVals[i]} L`} fill="#fff" fontFamily={Fonts.mono} fontSize={12} fontWeight={700} />
        </Rect>
      </Layout>,
    );
    yield* barRect().width((barVals[i] / 35) * 300, 0.6);
    yield* waitFor(0.2);
  }

  yield* waitUntil('tma-end');
});
