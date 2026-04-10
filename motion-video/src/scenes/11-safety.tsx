import {makeScene2D, Txt, Layout, Rect, Code} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, fadeTransition} from '@motion-canvas/core';
import {Colors, Fonts, Radius} from '../theme';

const ERROR_MESSAGES = [
  {file: 'illegal_dma.co:5:3', keyword: 'error:', msg: 'DMA statement contains a type\nmismatch: element types of from(f32)\nand to(f16) are inconsistent.'},
  {file: 'chunkat-oob.co:8:5', keyword: 'error:', msg: 'index out of bounds for\ndimension 1 (7 >= 2).'},
  {file: 'mma_shape.co:12:9', keyword: 'error:', msg: 'MMA [f16: m32n32k32] is not\nsupported by current architecture\n(SM_86).'},
  {file: 'no_wait.co:7:5', keyword: 'error:', msg: 'some asyncs are not explicitly\nwaited: ::foo::f, ::foo::f2.'},
];

const CATEGORIES = [
  {title: 'Shape / Type Mismatch', desc: 'DMA copy between incompatible shapes or types', color: Colors.red},
  {title: 'Out-of-Bounds Access', desc: 'Static index analysis catches buffer overruns', color: Colors.yellow},
  {title: 'HW Constraint Validation', desc: 'MMA config vs architecture compatibility', color: Colors.blue},
  {title: 'Synchronization Analysis', desc: 'Async futures not waited → flagged at compile time', color: Colors.purple},
];

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* fadeTransition(0.6);

  // Chapter header
  const chapterLabel = createRef<Txt>();
  const chapterTitle = createRef<Txt>();

  view.add(
    <Txt ref={chapterLabel} text="CHAPTER 2" fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={16} fontWeight={600} letterSpacing={3} y={-100} opacity={0} />,
  );
  view.add(
    <Txt ref={chapterTitle} text="Compile-Time Code Safety" fill={Colors.fg} fontFamily={Fonts.main} fontSize={48} fontWeight={900} y={-40} opacity={0} />,
  );

  yield* all(chapterLabel().opacity(1, 0.5), chapterTitle().opacity(1, 0.5));
  yield* waitFor(2);

  // Transition to content
  yield* all(
    chapterLabel().opacity(0, 0.4),
    chapterTitle().y(-310, 0.6),
    chapterTitle().fontSize(36, 0.6),
  );

  // Error terminal on left
  const terminal = createRef<Rect>();
  view.add(
    <Rect
      ref={terminal}
      x={-300}
      y={10}
      width={480}
      height={340}
      radius={Radius.md}
      fill="#1a1a2e"
      padding={20}
      direction="column"
      gap={12}
      opacity={0}
    />,
  );

  yield* terminal().opacity(1, 0.5);

  // Type error messages one by one
  for (let i = 0; i < ERROR_MESSAGES.length; i++) {
    const err = ERROR_MESSAGES[i];
    const errBlock = createRef<Layout>();
    terminal().add(
      <Layout ref={errBlock} direction="column" gap={2} opacity={0}>
        <Txt text={err.file} fill="#6bcb77" fontFamily={Fonts.mono} fontSize={11} />
        <Layout direction="row" gap={6}>
          <Txt text={err.keyword} fill="#ff6b6b" fontFamily={Fonts.mono} fontSize={11} fontWeight={700} />
          <Txt text={err.msg} fill="#ffd93d" fontFamily={Fonts.mono} fontSize={11} textWrap width={380} />
        </Layout>
      </Layout>,
    );
    yield* errBlock().opacity(1, 0.4);
    yield* waitFor(0.6);
  }

  // Category cards on right
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const card = createRef<Rect>();
    view.add(
      <Rect
        ref={card}
        x={300}
        y={-130 + i * 80}
        width={360}
        height={65}
        radius={Radius.sm}
        fill={Colors.surface}
        stroke={Colors.border}
        lineWidth={1}
        padding={12}
        direction="column"
        gap={4}
        opacity={0}
      >
        <Layout direction="row" alignItems="center" gap={8}>
          <Rect width={4} height={20} radius={2} fill={cat.color} />
          <Txt text={cat.title} fill={Colors.fg} fontFamily={Fonts.main} fontSize={15} fontWeight={700} />
        </Layout>
        <Txt text={cat.desc} fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={12} marginLeft={12} />
      </Rect>,
    );
    yield* card().opacity(1, 0.4);
    yield* waitFor(0.3);
  }

  // Quote
  const quote = createRef<Txt>();
  view.add(
    <Txt
      ref={quote}
      text={'"The bug that takes 5 days to find in CUDA\nis a compile error in CroqTile."'}
      fill={Colors.fgSecondary}
      fontFamily={Fonts.main}
      fontStyle="italic"
      fontSize={16}
      y={310}
      textAlign="center"
      opacity={0}
    />,
  );
  yield* quote().opacity(1, 0.5);

  yield* waitUntil('safety-end');
});
