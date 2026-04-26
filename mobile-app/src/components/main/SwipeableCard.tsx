import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";

type Props = {
  cardKey: string | number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: React.ReactNode;
};

export function SwipeableCard({ cardKey, onSwipeLeft, onSwipeRight, children }: Props) {
  const tx = useSharedValue(0);

  useEffect(() => {
    tx.value = 0;
  }, [cardKey, tx]);

  const pan = Gesture.Pan()
    // Горизонтальный свайп карточки не должен отбирать жест у вертикального скролла (если появится).
    .activeOffsetX([-18, 18])
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      tx.value = e.translationX;
    })
    .onEnd((e) => {
      const ox = e.translationX;
      if (ox > 100) {
        tx.value = withSpring(420, { damping: 18, stiffness: 120 }, (done) => {
          if (done) runOnJS(onSwipeRight)();
        });
      } else if (ox < -100) {
        tx.value = withSpring(-420, { damping: 18, stiffness: 120 }, (done) => {
          if (done) runOnJS(onSwipeLeft)();
        });
      } else {
        tx.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rot = interpolate(tx.value, [-200, 0, 200], [-22, 0, 22]);
    const opacity = interpolate(Math.abs(tx.value), [0, 220], [1, 0.35], Extrapolation.CLAMP);
    const scale = interpolate(Math.abs(tx.value), [0, 180], [0.98, 1.02], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY: 0 }, { translateX: tx.value }, { rotate: `${rot}deg` }, { scale }],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.abs, { zIndex: 3 }, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  abs: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
