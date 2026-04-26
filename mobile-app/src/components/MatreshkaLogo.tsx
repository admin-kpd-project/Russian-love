import React from "react";
import { View, Image, type ViewStyle, StyleSheet } from "react-native";

const LOGO_PNG = require("../assets/brand/matreshka.png");

type Props = {
  size?: number;
  style?: ViewStyle;
  /** Тот же PNG; на градиенте — лёгкая обводка для читаемости, как на forruss.ru. */
  variant?: "default" | "onGradient";
};

/**
 * Логотип с [forruss.ru](https://forruss.ru/) — `assets/1775050275_(1)_3_(1)-1-B5Gq71x9.png`, в репозитории: `src/assets/brand/matreshka.png`.
 */
export function MatreshkaLogo({ size = 40, style, variant = "default" }: Props) {
  const s = size;
  const onGrad = variant === "onGradient";
  return (
    <View
      style={[
        { width: s, height: s },
        onGrad && styles.onGradFrame,
        style,
      ]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Матрёшка, логотип"
    >
      <Image
        source={LOGO_PNG}
        style={{ width: s, height: s, resizeMode: "contain" }}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  onGradFrame: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 12,
  },
});
