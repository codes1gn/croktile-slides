import {makeScene2D, Code, Txt, Rect, Layout} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

const CROKTILE_SHORT = `\
__co__ void matmul(
    global f16 [M, K] lhs,
    global f16 [N, K] rhs,
    global f16 [M, N] output) {
  parallel block_id by NUM_SMS : block {
    shared f16 [WARP_M, TILE_K] lhs_s;
    tma.copy.swiz<128> ... => lhs_s;
    mma.row.row mc, ma, mb;
  }
}`;

const TRITON_CODE = `\
@triton.jit
def matmul_kernel(
    a_ptr, b_ptr, c_ptr,
    M, N, K,
    stride_am, stride_ak,
    stride_bk, stride_bn,
    stride_cm, stride_cn,
    BLOCK_M: tl.constexpr, ...):
    pid = tl.program_id(axis=0)
    num_pid_m = tl.cdiv(M, BLOCK_M)
    ...
    offs_am = (pid_m * BLOCK_M
        + tl.arange(0, BLOCK_M)) % M
    a_ptrs = a_ptr + (
        offs_am[:, None] * stride_am
        + offs_k[None, :] * stride_ak)
    ...
    # 64 lines of manual pointers,
    # strides, masks, and offsets`;

const CUDA_CODE = `\
__global__ void matmul(
    f16* lhs, f16* rhs, f16* output,
    unsigned K, unsigned M, unsigned N,
    const __grid_constant__
      CUtensorMap tma_map_0, ...) {
  __shared__ cuda::barrier<...> bar;
  if (threadIdx.x == 0) {
    init(&bar, blockDim.x);
    cde::fence_proxy_async_shared_cta();
  }
  __syncthreads();
  __shared__ alignas(1024) ...
  // TMA descriptor, barrier init,
  // WGMMA config, fence, commit...
  // 182 lines of error-prone code`;

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  const leftCode = createRef<Code>();
  const rightCode = createRef<Code>();
  const leftLabel = createRef<Txt>();
  const rightLabel = createRef<Txt>();

  view.add(
    <Txt
      ref={heading}
      text="Same Kernel — How Much Code?"
      fill={Colors.fg}
      fontFamily={Fonts.main}
      fontSize={36}
      fontWeight={800}
      y={-310}
    />,
  );

  view.add(
    <Txt
      ref={leftLabel}
      text="CROKTILE — 36 LOC"
      fill={Colors.mint500}
      fontFamily={Fonts.mono}
      fontSize={13}
      fontWeight={700}
      x={-380}
      y={-260}
    />,
  );

  view.add(
    <Code
      ref={leftCode}
      code={CROKTILE_SHORT}
      fontSize={11}
      fontFamily={Fonts.mono}
      x={-380}
      y={20}
      opacity={0.5}
    />,
  );

  view.add(
    <Txt
      ref={rightLabel}
      text=""
      fill={Colors.blue}
      fontFamily={Fonts.mono}
      fontSize={13}
      fontWeight={700}
      x={300}
      y={-260}
    />,
  );

  view.add(
    <Code
      ref={rightCode}
      code={''}
      fontSize={11}
      fontFamily={Fonts.mono}
      x={300}
      y={20}
    />,
  );

  // Show Triton comparison
  yield* waitFor(0.5);
  rightLabel().text('TRITON — 64 LOC');
  yield* heading().text('Same Kernel — Triton Needs 64 Lines', 0.4);
  yield* rightCode().code(TRITON_CODE, 0.8);

  yield* waitFor(3);

  // Cross-fade to CUDA
  yield* all(
    rightCode().code(CUDA_CODE, 0.8),
    heading().text('CUDA + CuTe: 182 Lines. CUTLASS: 280.', 0.5),
  );
  rightLabel().text('CUDA + CuTe — 182 LOC');
  yield* rightLabel().fill(Colors.slate, 0.3);

  yield* waitUntil('dsl-compare-end');
});
