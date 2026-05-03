import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { brandGradients, tw } from "../../theme/designTokens";
import { ScalePressable } from "./Motion";

type Props = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  variant?: "primary" | "light" | "outline";
  /** Соответствие веб `font-medium` / `font-semibold` (по умолчанию 700 как CTA). */
  textFontWeight?: "400" | "500" | "600" | "700";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function GradientButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  left,
  right,
  variant = "primary",
  textFontWeight = "700",
  style,
  textStyle,
}: Props) {
  const isPrimary = variant === "primary";
  const Wrapper = isPrimary ? ScalePressable : Pressable;
  const weightStyle: TextStyle = { fontWeight: textFontWeight };
  const content = (
    <>
      {left}
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : tw.stone700} />
      ) : (
        <Text style={[styles.text, weightStyle, !isPrimary && styles.darkText, textStyle]}>{title}</Text>
      )}
      {right}
    </>
  );

  if (!isPrimary) {
    return (
      <Wrapper
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.base, variant === "light" ? styles.light : styles.outline, (disabled || loading) && styles.disabled, style]}
      >
        {content}
      </Wrapper>
    );
  }

  return (
    <Wrapper onPress={onPress} disabled={disabled || loading} style={[styles.shadow, (disabled || loading) && styles.disabled, style]}>
      <LinearGradient colors={[...brandGradients.primary]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.base}>
        {content}
      </LinearGradient>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  base: {
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  light: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: tw.stone200,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: tw.red200,
  },
  text: { color: "#fff", fontSize: 16 },
  darkText: { color: tw.stone800 },
  disabled: { opacity: 0.62 },
});
