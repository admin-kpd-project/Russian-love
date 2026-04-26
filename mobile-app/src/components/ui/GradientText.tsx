import React from "react";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from "react-native-svg";

import { brandGradients } from "../../theme/designTokens";

type Props = {
  text: string;
  width: number;
  height: number;
  fontSize: number;
  fontWeight?: string;
  center?: boolean;
};

export function GradientText({ text, width, height, fontSize, fontWeight = "800", center = false }: Props) {
  return (
    <Svg width={width} height={height} accessibilityRole="text">
      <Defs>
        <SvgLinearGradient id="brandTextGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={brandGradients.primaryDark[0]} />
          <Stop offset="1" stopColor={brandGradients.primaryDark[1]} />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        x={center ? width / 2 : 0}
        y={Math.round(fontSize * 1.08)}
        fill="url(#brandTextGradient)"
        fontSize={fontSize}
        fontWeight={fontWeight}
        textAnchor={center ? "middle" : "start"}
      >
        {text}
      </SvgText>
    </Svg>
  );
}
