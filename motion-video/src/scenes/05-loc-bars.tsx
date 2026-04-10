import {makeScene2D, Rect, Txt, Layout} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts, Radius} from '../theme';

const BARS = [
  {label: 'TileLang', value: 22, color: Colors.tilelang},
  {label: 'CroqTile', value: 36, color: Colors.croqtile},
  {label: 'Triton', value: 64, color: Colors.triton},
  {label: 'CUDA + CuTe', value: 182, color: Colors.cuda},
  {label: 'CUTLASS', value: 280, color: Colors.cutlass},
];

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  const zeroText = createRef<Txt>();
  const explain = createRef<Txt>();

  view.add(
    <Txt
      ref={heading}
      text="Lines of Code — Persistent GEMM Kernel"
      fill={Colors.fg}
      fontFamily={Fonts.main}
      fontSize={36}
      fontWeight={800}
      y={-300}
      opacity={0}
    />,
  );

  yield* heading().opacity(1, 0.5);

  const barRefs: Rect[] = [];
  const maxVal = 280;
  const maxW = 700;

  for (let i = 0; i < BARS.length; i++) {
    const bar = BARS[i];
    const barRect = createRef<Rect>();
    view.add(
      <Layout
        direction="row"
        alignItems="center"
        gap={14}
        x={-100}
        y={-160 + i * 65}
      >
        <Txt
          text={bar.label}
          fill={Colors.fgSecondary}
          fontFamily={Fonts.main}
          fontSize={20}
          fontWeight={600}
          width={150}
          textAlign="right"
        />
        <Rect
          ref={barRect}
          height={40}
          width={0}
          radius={8}
          fill={bar.color}
          justifyContent="center"
          alignItems="center"
          paddingLeft={14}
          paddingRight={14}
        >
          <Txt
            text={`${bar.value} L`}
            fill="#ffffff"
            fontFamily={Fonts.mono}
            fontSize={16}
            fontWeight={700}
          />
        </Rect>
      </Layout>,
    );
    barRefs.push(barRect());
  }

  yield* sequence(
    0.2,
    ...barRefs.map((bar, i) =>
      bar.width((BARS[i].value / maxVal) * maxW, 0.8),
    ),
  );

  yield* waitFor(1);

  // Zero-Cost Abstraction text
  view.add(
    <Txt
      ref={zeroText}
      text="Zero-Cost Abstraction"
      fill={Colors.mint500}
      fontFamily={Fonts.main}
      fontSize={48}
      fontWeight={900}
      y={220}
      opacity={0}
      scale={0.7}
    />,
  );

  view.add(
    <Txt
      ref={explain}
      text="Higher abstraction → less code, simpler syntax.\nBut no performance loss — CroqTile compiles to the same optimal PTX."
      fill={Colors.fgSecondary}
      fontFamily={Fonts.main}
      fontSize={18}
      y={290}
      opacity={0}
      textAlign="center"
    />,
  );

  yield* all(
    zeroText().opacity(1, 0.6),
    zeroText().scale(1, 0.6),
  );
  yield* waitFor(0.3);
  yield* explain().opacity(1, 0.5);

  yield* waitUntil('loc-bars-end');
});
