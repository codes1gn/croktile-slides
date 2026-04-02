import {makeScene2D, Rect, Txt, Layout, Circle} from '@motion-canvas/2d';
import {
  all,
  waitFor,
  waitUntil,
  createRef,
  sequence,
  makeRef,
  fadeTransition,
} from '@motion-canvas/core';
import {Colors, Fonts, Radius} from '../theme';

const PANELS = [
  {icon: '⚡', title: 'Easy to Use', desc: 'Zero-cost abstractions, 40% of CUDA code', accent: '#dcfce9'},
  {icon: '🛡️', title: 'Compile-Time Safety', desc: '353 checks catch bugs before runtime', accent: '#fef3c7'},
  {icon: '🔷', title: 'Dynamic Shapes', desc: 'Named symbolic dimensions, affine expressions', accent: '#dbeafe'},
  {icon: '🤖', title: 'Born for AI', desc: 'AI agents auto-tune kernels autonomously', accent: '#ede9fe'},
];

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* fadeTransition(0.6);

  const heading = createRef<Txt>();
  const subhead = createRef<Txt>();

  view.add(
    <Txt
      ref={heading}
      text="What makes CrokTile special?"
      fill={Colors.mint500}
      fontFamily={Fonts.main}
      fontSize={44}
      fontWeight={800}
      y={-260}
      opacity={0}
    />,
  );
  view.add(
    <Txt
      ref={subhead}
      text="Best-in-class in every category"
      fill={Colors.fgSecondary}
      fontFamily={Fonts.main}
      fontSize={22}
      y={-210}
      opacity={0}
    />,
  );

  const cards: Rect[] = [];
  const positions = [
    {x: -240, y: -50},
    {x: 240, y: -50},
    {x: -240, y: 180},
    {x: 240, y: 180},
  ];

  for (let i = 0; i < 4; i++) {
    const p = PANELS[i];
    const card = createRef<Rect>();
    view.add(
      <Rect
        ref={card}
        x={positions[i].x}
        y={positions[i].y}
        width={420}
        height={180}
        radius={Radius.lg}
        fill={Colors.surface}
        stroke={Colors.border}
        lineWidth={1.5}
        direction="column"
        padding={28}
        gap={10}
        opacity={0}
        scale={0.8}
      >
        <Layout direction="row" alignItems="center" gap={12}>
          <Rect
            width={40}
            height={40}
            radius={10}
            fill={p.accent}
            justifyContent="center"
            alignItems="center"
          >
            <Txt text={p.icon} fontSize={20} />
          </Rect>
          <Txt
            text={p.title}
            fill={Colors.fg}
            fontFamily={Fonts.main}
            fontSize={24}
            fontWeight={700}
          />
        </Layout>
        <Txt
          text={p.desc}
          fill={Colors.fgSecondary}
          fontFamily={Fonts.main}
          fontSize={16}
          textWrap
          width={360}
        />
      </Rect>,
    );
    cards.push(card());
  }

  yield* all(heading().opacity(1, 0.5), subhead().opacity(1, 0.5));
  yield* waitFor(0.3);

  yield* sequence(
    0.25,
    ...cards.map(c =>
      all(c.opacity(1, 0.5), c.scale(1, 0.5)),
    ),
  );

  yield* waitFor(1);

  // Cursor animation to card 1
  const cursor = createRef<Circle>();
  view.add(
    <Circle
      ref={cursor}
      width={24}
      height={24}
      fill={Colors.mint500 + 'dd'}
      stroke="#ffffff"
      lineWidth={2}
      x={600}
      y={400}
      opacity={0}
      zIndex={100}
    />,
  );

  yield* cursor().opacity(1, 0.3);
  yield* all(
    cursor().x(positions[0].x, 1),
    cursor().y(positions[0].y, 1),
  );
  yield* waitFor(0.2);

  // Click ripple
  const ripple = createRef<Circle>();
  view.add(
    <Circle
      ref={ripple}
      width={20}
      height={20}
      stroke={Colors.mint500}
      lineWidth={3}
      x={positions[0].x}
      y={positions[0].y}
      opacity={0.8}
      zIndex={99}
    />,
  );
  yield* all(
    ripple().width(80, 0.5),
    ripple().height(80, 0.5),
    ripple().opacity(0, 0.5),
  );

  // Highlight card 1
  yield* cards[0].stroke(Colors.mint500, 0.3);

  yield* waitUntil('overview-end');
});
