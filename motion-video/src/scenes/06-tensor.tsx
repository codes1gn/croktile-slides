import {makeScene2D, Code, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

const TENSOR_CODE = `\
__co__ void matmul(
    global f16 [M, K] lhs,
    global f16 [N, K] rhs,
    global f16 [M, N] output) {
  ...
  shared f16 [WARP_M, TILE_K] lhs_s;
  ...`;

const TRITON_TENSOR = `\
a_ptr, b_ptr, c_ptr,      # raw ptrs
stride_am, stride_ak,     # strides
offs_am = pid_m * BLOCK_M # offsets
    + tl.arange(0, BLOCK_M)
a_ptrs = a_ptr + offs_am[:, None]
    * stride_am + ...`;

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  const code = createRef<Code>();
  const tritonCode = createRef<Code>();

  view.add(
    <Txt
      ref={heading}
      text="Work on Tensors, Not Buffers"
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
      code={TENSOR_CODE}
      fontSize={16}
      fontFamily={Fonts.mono}
      x={-300}
      y={-60}
      opacity={0}
    />,
  );

  yield* heading().opacity(1, 0.5);
  yield* code().opacity(1, 0.5);

  // Highlight tensor declarations
  yield* waitFor(0.5);
  yield* code().selection(code().findAllRanges(/global f16 \[.*?\] \w+/g), 0.5);

  // Bullet points on right
  const bullets = [
    'memory-specifier + dtype + shape = complete declaration',
    'A tensor IS its shape — no strides, layouts, or offsets',
    'Triton needs pointer + shape + stride + offset',
    'CuTe needs pointer + Layout(Shape, Stride)',
  ];

  const bulletRefs: Txt[] = [];
  for (let i = 0; i < bullets.length; i++) {
    const t = createRef<Txt>();
    view.add(
      <Layout
        direction="row"
        alignItems="start"
        gap={10}
        x={250}
        y={-140 + i * 55}
        opacity={0}
        ref={makeRef => (bulletRefs[i] = makeRef as any)}
      >
        <Rect
          width={8}
          height={8}
          radius={4}
          fill={Colors.mint500}
          marginTop={7}
        />
        <Txt
          ref={t}
          text={bullets[i]}
          fill={Colors.fgSecondary}
          fontFamily={Fonts.main}
          fontSize={16}
          textWrap
          width={380}
          lineHeight={24}
        />
      </Layout>,
    );
  }

  yield* sequence(
    0.4,
    ...bulletRefs.map(b => (b as any).opacity(1, 0.4)),
  );

  yield* waitFor(0.8);

  // Show Triton code for contrast
  view.add(
    <Code
      ref={tritonCode}
      code={TRITON_TENSOR}
      fontSize={13}
      fontFamily={Fonts.mono}
      x={-300}
      y={170}
      opacity={0}
    />,
  );

  const tritonLabel = createRef<Txt>();
  view.add(
    <Txt
      ref={tritonLabel}
      text="TRITON"
      fill={Colors.blue}
      fontFamily={Fonts.mono}
      fontSize={12}
      fontWeight={700}
      x={-300}
      y={115}
      opacity={0}
    />,
  );

  yield* all(
    tritonCode().opacity(0.6, 0.5),
    tritonLabel().opacity(1, 0.5),
  );

  // Comparison table
  const tableContainer = createRef<Layout>();
  view.add(
    <Layout
      ref={tableContainer}
      direction="column"
      x={250}
      y={160}
      gap={2}
      opacity={0}
    />,
  );

  const headers = ['Exposed', 'CroqTile', 'Triton', 'CuTe', 'CUDA'];
  const rows = [
    ['Shape', '✓', '✓', '✓', '✓'],
    ['Stride', '—', '✓', '✓', '✓'],
    ['Offset', '—', '✓', '—', '✓'],
    ['Raw pointer', '—', '✓', '✓', '✓'],
  ];

  const colW = [90, 70, 60, 55, 55];

  // Header
  tableContainer().add(
    <Layout direction="row">
      {headers.map((h, i) => (
        <Rect width={colW[i]} height={28} fill={Colors.mint500 + '18'} justifyContent="center" alignItems="center">
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
              fill={c === '✓' ? Colors.mint500 : c === '—' ? Colors.fgDim : Colors.fg}
              fontFamily={i === 0 ? Fonts.main : Fonts.mono}
              fontSize={12}
              fontWeight={c === '✓' || i === 0 ? 700 : 400}
            />
          </Rect>
        ))}
      </Layout>,
    );
  }

  yield* tableContainer().opacity(1, 0.6);
  yield* waitUntil('tensor-end');
});
