import {makeScene2D, Code, Txt, Layout, Rect} from '@motion-canvas/2d';
import {all, waitFor, waitUntil, createRef, slideTransition, Direction} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

const HOST_CODE = `\
#include "matmul.co"

int main() {
  auto lhs = choreo::make_spandata<f16>(M, K);
  auto rhs = choreo::make_spandata<f16>(N, K);

  // Call like any C++ function
  choreo_kernel(lhs_d, rhs_d, res_d);

  // Built-in profiling
  auto avg = choreo::timing(
    [&]() { choreo_kernel(...); }, topt);
}`;

export default makeScene2D(function* (view) {
  view.fill(Colors.bg);
  yield* slideTransition(Direction.Left, 0.5);

  const heading = createRef<Txt>();
  const code = createRef<Code>();

  view.add(
    <Txt
      ref={heading}
      text="Seamless C++ Integration"
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
      fontSize={16}
      fontFamily={Fonts.mono}
      x={-250}
      y={-20}
      opacity={0}
    />,
  );

  yield* heading().opacity(1, 0.5);
  yield* code().opacity(1, 0.3);

  // Type code in
  const lines = HOST_CODE.split('\n');
  for (let i = 0; i < lines.length; i += 3) {
    yield* code().code(lines.slice(0, i + 3).join('\n'), 0.3);
    yield* waitFor(0.2);
  }
  yield* code().code(HOST_CODE, 0.2);

  yield* waitFor(0.5);
  yield* code().selection(code().findFirstRange('#include "matmul.co"'), 0.4);
  yield* waitFor(0.8);
  yield* code().selection(code().findFirstRange('choreo_kernel'), 0.4);
  yield* waitFor(0.5);
  yield* code().selection([], 0.3);

  const bullets = [
    'Call __co__ kernels like ordinary C++ functions',
    'Auto-generated host wrapper: grid, shared memory, stream',
    'Built-in choreo::timing profiler with warmup',
    'All GPU patterns are first-class constructs',
  ];

  for (let i = 0; i < bullets.length; i++) {
    view.add(
      <Layout direction="row" alignItems="start" gap={10} x={250} y={-100 + i * 50} opacity={0}>
        <Rect width={8} height={8} radius={4} fill={Colors.mint500} marginTop={7} />
        <Txt text={bullets[i]} fill={Colors.fgSecondary} fontFamily={Fonts.main} fontSize={16} textWrap width={380} lineHeight={24} />
      </Layout>,
    );
  }

  yield* waitUntil('integration-end');
});
