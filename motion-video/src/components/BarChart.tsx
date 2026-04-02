import {Layout, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, sequence, Reference, makeRef} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

export interface BarItem {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  displayValue: string;
}

export function* animateBarChart(
  container: Reference<Layout>,
  bars: BarItem[],
  barHeight: number = 36,
  maxWidth: number = 700,
  duration: number = 0.8,
) {
  const barRefs: Rect[] = [];

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const barRef = createRef<Rect>();

    container().add(
      <Layout direction="row" alignItems="center" gap={12} width="100%">
        <Txt
          text={bar.label}
          fill={Colors.fgSecondary}
          fontFamily={Fonts.main}
          fontSize={18}
          fontWeight={600}
          width={140}
          textAlign="right"
        />
        <Rect
          ref={barRef}
          height={barHeight}
          width={0}
          radius={6}
          fill={bar.color}
          justifyContent="center"
          alignItems="center"
          paddingLeft={12}
          paddingRight={12}
        >
          <Txt
            text={bar.displayValue}
            fill="#ffffff"
            fontFamily={Fonts.mono}
            fontSize={14}
            fontWeight={700}
          />
        </Rect>
      </Layout>,
    );
    barRefs.push(barRef());
  }

  yield* sequence(
    0.15,
    ...barRefs.map((bar, i) =>
      bar.width((bars[i].value / bars[i].maxValue) * maxWidth, duration),
    ),
  );
}
