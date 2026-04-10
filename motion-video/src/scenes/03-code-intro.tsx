import {makeScene2D, Code, Txt, Rect, Layout} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

const GEMM_CODE = `\
__co__ void matmul(
    global f16 [M, K] lhs,
    global f16 [N, K] rhs,
    global f16 [M, N] output) {
  int total = cdiv(M, WARP_M) * cdiv(N, WARP_N);
  parallel block_id by NUM_SMS : block {
    shared f16 [WARP_M, TILE_K] lhs_s;
    shared f16 [WARP_N, TILE_K] rhs_s;
    shared f16 [WARP_M, WARP_N] out_s;
    foreach {tile} in [cdiv(total, NUM_SMS)] {
      tile_id = tile # block_id;
      if (tile_id < total) {
        int bm = schedule_m.at(tile_id);
        int bn = schedule_n.at(tile_id);
        mc = mma.fill.f16 0.0f;
        foreach {iv_k} in [cdiv(K, TILE_K)] {
          tma.copy.swiz<128>
            lhs.subspan(WARP_M, TILE_K)
              .at(bm, iv_k) => lhs_s;
          parallel p by 1 : group-4 {
            ma = mma.load.swiz<128> lhs_s;
            mb = mma.load.swiz<128> rhs_s;
            mma.row.row mc, ma, mb;
          }
        }
        mma.store mc, out_s;
        tma.copy out_s => output.subspan(
          WARP_M, WARP_N).at(bm, bn);
      }
    }
  }
}`;

const LINES = GEMM_CODE.split('\n');

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.6);

  const heading = createRef<Txt>();
  const label = createRef<Txt>();
  const code = createRef<Code>();

  view.add(
    <Txt
      ref={heading}
      text="Persistent Warp-Specialized GEMM"
      fill={Colors.fg}
      fontFamily={Fonts.main}
      fontSize={36}
      fontWeight={800}
      y={-300}
      opacity={0}
    />,
  );

  view.add(
    <Txt
      ref={label}
      text="CroqTile — 36 lines of code"
      fill={Colors.mint500}
      fontFamily={Fonts.mono}
      fontSize={16}
      fontWeight={600}
      y={-255}
      opacity={0}
    />,
  );

  view.add(
    <Code
      ref={code}
      fontSize={15}
      fontFamily={Fonts.mono}
      x={0}
      y={50}
      code={''}
      opacity={0}
    />,
  );

  yield* all(heading().opacity(1, 0.5), label().opacity(1, 0.5));
  yield* code().opacity(1, 0.3);

  yield* waitFor(0.3);

  // Type code in chunks (groups of ~4 lines at a time for pacing)
  const chunkSize = 4;
  for (let i = 0; i < LINES.length; i += chunkSize) {
    const chunk = LINES.slice(0, i + chunkSize).join('\n');
    yield* code().code(chunk, 0.4);
    yield* waitFor(0.3);
  }

  // Show full code
  yield* code().code(GEMM_CODE, 0.3);
  yield* waitUntil('code-intro-end');
});
