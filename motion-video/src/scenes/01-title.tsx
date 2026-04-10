import {makeScene2D, Img, Txt, Rect, Layout} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);

  const logo = createRef<Img>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const tagline = createRef<Txt>();

  view.add(
    <Layout direction="column" alignItems="center" gap={24}>
      <Img
        ref={logo}
        src="/images/logo-2.png"
        height={100}
        radius={12}
        opacity={0}
        scale={0.5}
      />
      <Txt
        ref={title}
        text=""
        fill={Colors.mint500}
        fontFamily={Fonts.main}
        fontSize={72}
        fontWeight={900}
        textAlign="center"
      />
      <Txt
        ref={subtitle}
        text="The Next-Gen GPU & DSA Kernel Language"
        fill={Colors.fg}
        fontFamily={Fonts.main}
        fontSize={32}
        fontWeight={400}
        opacity={0}
      />
      <Txt
        ref={tagline}
        text="5x Productivity · Zero Silent Bugs · AI-Ready"
        fill={Colors.fgSecondary}
        fontFamily={Fonts.main}
        fontSize={22}
        opacity={0}
      />
    </Layout>,
  );

  yield* waitFor(0.5);

  yield* all(
    logo().opacity(1, 0.8),
    logo().scale(1, 0.8),
  );

  yield* waitFor(0.4);

  const titleText = 'CroqTile';
  for (let i = 0; i <= titleText.length; i++) {
    title().text(titleText.slice(0, i));
    yield* waitFor(0.08);
  }

  yield* waitFor(0.3);
  yield* subtitle().opacity(1, 0.6);

  yield* waitFor(0.4);
  yield* tagline().opacity(1, 0.6);

  yield* waitUntil('title-end');
});
