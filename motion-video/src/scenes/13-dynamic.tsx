import {makeScene2D, Code, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, fadeTransition} from '@motion-canvas/core';
import {Colors, Fonts, Radius} from '../theme';

const SYMBOLIC_CODE = `\
__co__ void matmul(
    global f16 [M, K] lhs,
    global f16 [N, K] rhs,
    global f16 [M, N] output) {

  // M, N, K are first-class symbols
  // K shared across lhs & rhs

  parallel {block_m, block_n}
    by [cdiv(M, WARP_M),
        cdiv(N, WARP_N)] : block {
    ...
    foreach {iv_k} in [cdiv(K, TILE_K)]`;

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* fadeTransition(0.6);

  // Chapter header
  const chapterLabel = createRef<Txt>();
  const chapterTitle = createRef<Txt>();

  view.add(
    <Txt ref={chapterLabel} text="CHAPTER 3" fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={16} fontWeight={600} letterSpacing={3} y={-100} opacity={0} />,
  );
  view.add(
    <Txt ref={chapterTitle} text="Dynamic / Symbolic Shape Support" fill={Colors.fg} fontFamily={Fonts.main} fontSize={44} fontWeight={900} y={-40} opacity={0} />,
  );

  yield* all(chapterLabel().opacity(1, 0.5), chapterTitle().opacity(1, 0.5));
  yield* waitFor(2);

  yield* all(
    chapterLabel().opacity(0, 0.4),
    chapterTitle().y(-310, 0.6),
    chapterTitle().fontSize(32, 0.6),
  );

  const code = createRef<Code>();
  view.add(
    <Code
      ref={code}
      code={SYMBOLIC_CODE}
      fontSize={14}
      fontFamily={Fonts.mono}
      x={-300}
      y={-20}
      opacity={0}
    />,
  );

  yield* code().opacity(1, 0.5);

  // Highlight M symbols
  yield* code().selection(code().findAllRanges(/\bM\b/g), 0.5);
  yield* waitFor(1);
  yield* code().selection(code().findAllRanges(/\bK\b/g), 0.5);
  yield* waitFor(1);
  yield* code().selection(code().findAllRanges(/\bN\b/g), 0.5);
  yield* waitFor(1);
  yield* code().selection([], 0.3);

  // Bullets
  const bullets = [
    'Named symbols: M, K, N are first-class',
    'Same symbol = shared dimension, auto-verified',
    'Affine expressions: cdiv(M,64), K/2 work as symbolic values',
    'Shape inference: compiler propagates symbols automatically',
    'Auto tail handling: predicated copies with zero-fill',
  ];

  for (let i = 0; i < bullets.length; i++) {
    const b = createRef<Txt>();
    view.add(
      <Layout direction="row" alignItems="start" gap={10} x={250} y={-150 + i * 50} opacity={0}>
        <Rect width={8} height={8} radius={4} fill={Colors.mint500} marginTop={7} />
        <Txt ref={b} text={bullets[i]} fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={15} textWrap width={380} lineHeight={22} />
      </Layout>,
    );
  }

  yield* waitFor(0.5);

  // Comparison table
  const tableContainer = createRef<Layout>();
  view.add(
    <Layout ref={tableContainer} direction="column" x={250} y={170} gap={2} opacity={0} />,
  );

  const headers = ['Capability', 'CroqTile', 'Triton', 'TileLang', 'CuTe'];
  const rows = [
    ['Named symbols', '✓', '—', '—', '—'],
    ['Affine exprs', '✓', '—', '—', '—'],
    ['Cross-param constraints', '✓', '—', '—', '—'],
    ['Compile-time inference', '✓', '—', '—', '—'],
    ['Auto runtime checks', '✓', '—', '—', '—'],
  ];
  const colW = [130, 65, 55, 60, 50];

  tableContainer().add(
    <Layout direction="row">
      {headers.map((h, i) => (
        <Rect width={colW[i]} height={26} fill={Colors.mint500 + '15'} justifyContent="center" alignItems="center">
          <Txt text={h} fill={Colors.mint700} fontFamily={Fonts.main} fontSize={11} fontWeight={700} />
        </Rect>
      ))}
    </Layout>,
  );

  const rowNodes: Layout[] = [];
  for (const row of rows) {
    const rowNode = (
      <Layout direction="row" opacity={0}>
        {row.map((c, i) => (
          <Rect width={colW[i]} height={24} fill={Colors.surface} justifyContent="center" alignItems="center" stroke={Colors.border} lineWidth={0.5}>
            <Txt text={c} fill={c === '✓' ? Colors.mint500 : c === '—' ? Colors.fgDim : Colors.fg} fontFamily={i === 0 ? Fonts.main : Fonts.mono} fontSize={11} fontWeight={c === '✓' || i === 0 ? 700 : 400} />
          </Rect>
        ))}
      </Layout>
    ) as Layout;
    tableContainer().add(rowNode);
    rowNodes.push(rowNode);
  }

  yield* tableContainer().opacity(1, 0.3);
  yield* sequence(0.1, ...rowNodes.map(r => r.opacity(1, 0.3)));

  yield* waitUntil('dynamic-end');
});
