import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";

type Props = { size?: number; style?: ViewStyle };

/** Плейсхолдер логотипа матрёшки (PNG из веб-импортов в репозитории нет). */
export function MatreshkaLogo({ size = 40, style }: Props) {
  const s = size;
  return (
    <LinearGradient colors={["#fecaca", "#fde68a"]} style={[styles.ring, { width: s, height: s, borderRadius: s * 0.22 }, style]}>
      <View style={[styles.in, { width: s * 0.78, height: s * 0.78, borderRadius: s * 0.18 }]}>
        <Text style={[styles.emoji, { fontSize: s * 0.45 }]} allowFontScaling={false}>
          🪆
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ring: { alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  in: { backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  emoji: { textAlign: "center" },
});
