import {makeScene2D, Code, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

const MEM_CODE = `\
// chunkat — regular tiling
tma.copy lhs.chunkat(block_m, iv_k) => lhs_s;

// subspan/at — TMA copy
tma.copy lhs.subspan(WARP_M, TILE_K)
    .at(bm, iv_k) => lhs_s;

// view/from — MoE irregular access
dma.copy.zfill lhs.view(WARP_M, TILE_K)
    .from(seg_start, iv_k) => sA;

// # — hierarchical index
output.at(block_b, block_m # m, block_n # n);`;

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  const code = createRef<Code>();

  view.add(
    <Txt
      ref={heading}
      text="Flexible Memory Access Primitives"
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
      code={''}
      fontSize={15}
      fontFamily={Fonts.mono}
      x={-250}
      y={-10}
      opacity={0}
    />,
  );

  yield* heading().opacity(1, 0.5);
  yield* code().opacity(1, 0.3);

  // Show code in stages
  const sections = MEM_CODE.split('\n\n');
  let accumulated = '';
  for (let i = 0; i < sections.length; i++) {
    accumulated += (i > 0 ? '\n\n' : '') + sections[i];
    yield* code().code(accumulated, 0.5);
    yield* waitFor(1.2);
  }

  // Highlight each primitive in sequence
  yield* code().selection(code().findFirstRange('chunkat'), 0.4);
  yield* waitFor(0.8);
  yield* code().selection(code().findFirstRange('subspan'), 0.4);
  yield* waitFor(0.8);
  yield* code().selection(code().findFirstRange('view'), 0.4);
  yield* waitFor(0.8);
  yield* code().selection(code().findFirstRange('block_m # m'), 0.4);
  yield* waitFor(0.8);
  yield* code().selection([], 0.3);

  // Labels on the right
  const primitives = [
    {name: 'chunkat', desc: 'Tile by index, regular grids'},
    {name: 'subspan/at', desc: 'Explicit sub-view, TMA-friendly'},
    {name: 'view/from', desc: 'Dynamic window, MoE segments'},
    {name: 'span_as', desc: 'Reshape without copy'},
    {name: '#', desc: 'Hierarchical index composition'},
  ];

  for (let i = 0; i < primitives.length; i++) {
    const p = primitives[i];
    view.add(
      <Layout direction="row" alignItems="start" gap={10} x={270} y={-130 + i * 55} opacity={0}>
        <Rect width={8} height={8} radius={4} fill={Colors.mint500} marginTop={7} />
        <Layout direction="column" gap={2}>
          <Txt text={p.name} fill={Colors.mint500} fontFamily={Fonts.mono} fontSize={16} fontWeight={700} />
          <Txt text={p.desc} fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={14} />
        </Layout>
      </Layout>,
    );
  }

  yield* waitUntil('memory-end');
});
