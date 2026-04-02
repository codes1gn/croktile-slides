import {makeScene2D, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, fadeTransition} from '@motion-canvas/core';
import {Colors, Fonts, Radius} from '../theme';

const ITERATIONS = [
  {iter: 'baseline', tflops: 671, opt: '1p1c, swizzle128, prepack'},
  {iter: 'iter001', tflops: 759, opt: 'TMA metadata staging'},
  {iter: 'iter023', tflops: 811, opt: 'SW pipelined consumer'},
  {iter: 'iter036', tflops: 897, opt: '1p2c warp specialization'},
  {iter: 'iter068', tflops: 1127, opt: '3-stage pipeline + persistent'},
];

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* fadeTransition(0.6);

  // Chapter header
  const chapterLabel = createRef<Txt>();
  const chapterTitle = createRef<Txt>();

  view.add(
    <Txt ref={chapterLabel} text="CHAPTER 4" fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={16} fontWeight={600} letterSpacing={3} y={-100} opacity={0} />,
  );
  view.add(
    <Txt ref={chapterTitle} text="Born for Agentic AI Programming" fill={Colors.fg} fontFamily={Fonts.main} fontSize={44} fontWeight={900} y={-40} opacity={0} />,
  );

  yield* all(chapterLabel().opacity(1, 0.5), chapterTitle().opacity(1, 0.5));
  yield* waitFor(2);

  yield* all(
    chapterLabel().opacity(0, 0.4),
    chapterTitle().y(-310, 0.6),
    chapterTitle().fontSize(32, 0.6),
  );

  // TFLOPS progress bar
  const progressLabel = createRef<Txt>();
  const barBg = createRef<Rect>();
  const barFill = createRef<Rect>();
  const barVal = createRef<Txt>();

  view.add(
    <Txt
      ref={progressLabel}
      text="E4M3 Sparse GEMM on H800 PCIe — 68 AI Iterations"
      fill={Colors.fgSecondary}
      fontFamily={Fonts.main}
      fontSize={18}
      y={-240}
      opacity={0}
    />,
  );

  view.add(
    <Rect
      ref={barBg}
      x={0}
      y={-195}
      width={700}
      height={44}
      radius={10}
      fill={Colors.bgLight}
      opacity={0}
    >
      <Rect
        ref={barFill}
        width={0}
        height={44}
        radius={10}
        fill={Colors.mint500}
        justifyContent="center"
        alignItems="center"
        paddingLeft={16}
        paddingRight={16}
      >
        <Txt ref={barVal} text="671" fill="#fff" fontFamily={Fonts.mono} fontSize={18} fontWeight={700} />
      </Rect>
    </Rect>,
  );

  yield* all(
    progressLabel().opacity(1, 0.5),
    barBg().opacity(1, 0.5),
  );

  // Animate TFLOPS growth
  for (const step of ITERATIONS) {
    const pct = (step.tflops / 1300) * 700;
    yield* barFill().width(pct, 0.8);
    barVal().text(String(step.tflops));
    yield* waitFor(0.8);
  }

  // Result stat
  const resultStat = createRef<Txt>();
  view.add(
    <Txt
      ref={resultStat}
      text="671 → 1127 TFLOPS (+67.9%)"
      fill={Colors.mint500}
      fontFamily={Fonts.mono}
      fontSize={28}
      fontWeight={900}
      y={-130}
      opacity={0}
    />,
  );
  yield* resultStat().opacity(1, 0.5);

  // Iteration table
  const tableContainer = createRef<Layout>();
  view.add(
    <Layout ref={tableContainer} direction="column" y={50} gap={2} opacity={0} />,
  );

  const headers = ['Iteration', 'TFLOPS', 'Key Optimization'];
  const colW = [100, 80, 320];

  tableContainer().add(
    <Layout direction="row">
      {headers.map((h, i) => (
        <Rect width={colW[i]} height={30} fill={Colors.mint500 + '15'} justifyContent="center" alignItems="center">
          <Txt text={h} fill={Colors.mint700} fontFamily={Fonts.main} fontSize={13} fontWeight={700} />
        </Rect>
      ))}
    </Layout>,
  );

  const rowNodes: Layout[] = [];
  for (const it of ITERATIONS) {
    const isFinal = it.iter === 'iter068';
    const row = (
      <Layout direction="row" opacity={0}>
        <Rect width={colW[0]} height={28} fill={isFinal ? Colors.mint500 + '15' : Colors.surface} justifyContent="center" alignItems="center" stroke={Colors.border} lineWidth={0.5}>
          <Txt text={it.iter} fill={isFinal ? Colors.mint500 : Colors.fg} fontFamily={Fonts.mono} fontSize={12} fontWeight={isFinal ? 700 : 400} />
        </Rect>
        <Rect width={colW[1]} height={28} fill={isFinal ? Colors.mint500 + '15' : Colors.surface} justifyContent="center" alignItems="center" stroke={Colors.border} lineWidth={0.5}>
          <Txt text={String(it.tflops)} fill={isFinal ? Colors.mint500 : Colors.fg} fontFamily={Fonts.mono} fontSize={12} fontWeight={700} />
        </Rect>
        <Rect width={colW[2]} height={28} fill={isFinal ? Colors.mint500 + '15' : Colors.surface} justifyContent="center" alignItems="center" stroke={Colors.border} lineWidth={0.5}>
          <Txt text={it.opt} fill={isFinal ? Colors.mint500 : Colors.fgSecondary} fontFamily={Fonts.main} fontSize={12} />
        </Rect>
      </Layout>
    ) as Layout;
    tableContainer().add(row);
    rowNodes.push(row);
  }

  yield* tableContainer().opacity(1, 0.3);
  yield* sequence(0.15, ...rowNodes.map(r => r.opacity(1, 0.3)));

  // Bullets
  const bullets = [
    'Language designed from scratch for AI-assisted optimization',
    '25-line kernel ≈ 500 tokens — fits entirely in AI context',
    '200+ autonomous iterations without failure',
    'Compiler = harness. Invalid programs cannot compile',
  ];

  for (let i = 0; i < bullets.length; i++) {
    view.add(
      <Layout direction="row" alignItems="start" gap={10} x={330} y={-60 + i * 45} opacity={0}>
        <Rect width={6} height={6} radius={3} fill={Colors.mint500} marginTop={7} />
        <Txt text={bullets[i]} fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={14} textWrap width={300} lineHeight={20} />
      </Layout>,
    );
  }

  yield* waitUntil('ai-tuning-end');
});
