import {Layout, Rect, Txt} from '@motion-canvas/2d';
import {Colors, Fonts, Radius} from '../theme';

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  accentColor?: string;
  width?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  accentColor = Colors.mint500,
  width = 400,
}: FeatureCardProps) {
  return (
    <Rect
      width={width}
      padding={28}
      radius={Radius.lg}
      fill={Colors.surface}
      stroke={Colors.border}
      lineWidth={1.5}
      direction="column"
      gap={10}
      opacity={0}
    >
      <Layout direction="row" alignItems="center" gap={12}>
        <Rect
          width={36}
          height={36}
          radius={8}
          fill={accentColor + '22'}
          justifyContent="center"
          alignItems="center"
        >
          <Txt text={icon} fontSize={18} />
        </Rect>
        <Txt
          text={title}
          fill={Colors.fg}
          fontFamily={Fonts.main}
          fontSize={20}
          fontWeight={700}
        />
      </Layout>
      <Txt
        text={description}
        fill={Colors.fgSecondary}
        fontFamily={Fonts.main}
        fontSize={15}
        lineHeight={22}
        textWrap
        width={width - 56}
      />
    </Rect>
  );
}
