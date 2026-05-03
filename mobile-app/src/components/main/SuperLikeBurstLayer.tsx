import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";
import { Star, Sparkles } from "lucide-react-native";

type Props = {
  visible: boolean;
};

export function SuperLikeBurstLayer({ visible }: Props) {
  const opacity = useSharedValue(0);
  const starScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 160 });
      starScale.value = withSequence(
        withTiming(1.12, { duration: 260, easing: Easing.out(Easing.back(1.15)) }),
        withTiming(1, { duration: 180 })
      );
    } else {
      opacity.value = withTiming(0, { duration: 180 });
      starScale.value = withTiming(0, { duration: 120 });
    }
  }, [visible, opacity, starScale]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.wrap, overlayStyle]}>
      <LinearGradient
        colors={["rgba(56, 189, 248, 0.38)", "rgba(59, 130, 246, 0.28)", "rgba(67, 56, 202, 0.34)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.center}>
        <Animated.View style={[styles.starBlock, starStyle]}>
          <LinearGradient colors={["#38bdf8", "#2563eb", "#4338ca"]} style={styles.starCircle}>
            <Star size={48} color="#fff" fill="#fff" />
          </LinearGradient>
          <View style={styles.sparkle}>
            <Sparkles size={26} color="#fcd34d" fill="#fcd34d" />
          </View>
        </Animated.View>
        <Text style={styles.t1}>Суперлайк отправлен!</Text>
        <Text style={styles.t2}>Пользователь увидит особый интерес</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 24, borderRadius: 24, overflow: "hidden" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  starBlock: { alignItems: "center", justifyContent: "center", marginBottom: 14 },
  starCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  sparkle: { position: "absolute", top: -4, right: -4 },
  t1: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  t2: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    maxWidth: 260,
  },
});
