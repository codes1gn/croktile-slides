import {makeScene2D, Img, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, sequence, fadeTransition} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

function* countUp(node: Txt, targetText: string, target: number, duration: number = 1) {
  const steps = Math.ceil(duration * 30);
  const suffix = targetText.replace(/[\d.]+/, '');
  const isPercent = targetText.includes('%');
  const isPlus = targetText.includes('+');
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const eased = t * t * (3 - 2 * t);
    const val = eased * target;
    if (isPercent && target < 200) {
      node.text(val.toFixed(1) + '%');
    } else if (isPlus) {
      node.text(Math.round(val) + '+');
    } else {
      node.text(Math.round(val) + '%');
    }
    yield* waitFor(1 / 30);
  }
  node.text(targetText);
}

const STATS = [
  {value: '40%', target: 40, label: 'of equivalent CUDA code'},
  {value: '83%', target: 83, label: 'faster than baseline (AI-tuned)'},
  {value: '200+', target: 200, label: 'autonomous AI iterations'},
  {value: '100.5%', target: 100.5, label: 'cuBLAS perf on dense GEMM'},
];

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* fadeTransition(0.8);

  const logo = createRef<Img>();
  const title = createRef<Txt>();
  const tagline = createRef<Txt>();
  const url = createRef<Txt>();

  view.add(
    <Img
      ref={logo}
      src="/images/logo-2.png"
      height={80}
      radius={10}
      y={-220}
      opacity={0}
      scale={0.7}
    />,
  );

  view.add(
    <Txt
      ref={title}
      text="CroqTile — Fewer Lines. Safer Kernels. AI-Ready."
      fill={Colors.fg}
      fontFamily={Fonts.main}
      fontSize={36}
      fontWeight={900}
      y={-130}
      opacity={0}
      textAlign="center"
    />,
  );

  yield* all(
    logo().opacity(1, 0.6),
    logo().scale(1, 0.6),
  );
  yield* title().opacity(1, 0.5);

  // Stats grid
  const statRefs: {val: Txt; label: Txt}[] = [];
  const statPositions = [
    {x: -300, y: 0},
    {x: -100, y: 0},
    {x: 100, y: 0},
    {x: 300, y: 0},
  ];

  for (let i = 0; i < STATS.length; i++) {
    const s = STATS[i];
    const valRef = createRef<Txt>();
    const labelRef = createRef<Txt>();
    view.add(
      <Layout
        direction="column"
        alignItems="center"
        gap={6}
        x={statPositions[i].x}
        y={statPositions[i].y}
        opacity={0}
      >
        <Txt
          ref={valRef}
          text="0"
          fill={Colors.mint500}
          fontFamily={Fonts.mono}
          fontSize={48}
          fontWeight={900}
        />
        <Txt
          ref={labelRef}
          text={s.label}
          fill={Colors.fgSecondary}
          fontFamily={Fonts.main}
          fontSize={13}
          textAlign="center"
          textWrap
          width={160}
        />
      </Layout>,
    );
    statRefs.push({val: valRef(), label: labelRef()});
  }

  // Animate stats appearing
  for (let i = 0; i < statRefs.length; i++) {
    const parent = statRefs[i].val.parent();
    if (parent) {
      yield* (parent as Layout).opacity(1, 0.4);
    }
    yield* countUp(statRefs[i].val, STATS[i].value, STATS[i].target, 0.8);
    yield* waitFor(0.3);
  }

  // URL
  view.add(
    <Txt
      ref={url}
      text="github.com/croqtile"
      fill={Colors.fgDim}
      fontFamily={Fonts.mono}
      fontSize={18}
      y={120}
      opacity={0}
    />,
  );

  yield* waitFor(0.5);
  yield* url().opacity(1, 0.5);

  // Tagline
  view.add(
    <Txt
      ref={tagline}
      text="Thank you for watching!"
      fill={Colors.fgSecondary}
      fontFamily={Fonts.main}
      fontSize={20}
      y={200}
      opacity={0}
    />,
  );

  yield* tagline().opacity(1, 0.5);
  yield* waitUntil('closing-end');

  // Fade everything out
  yield* all(
    logo().opacity(0, 1),
    title().opacity(0, 1),
    url().opacity(0, 1),
    tagline().opacity(0, 1),
    ...statRefs.map(s => s.val.parent()
      ? (s.val.parent() as Layout).opacity(0, 1)
      : waitFor(0)),
  );
});
