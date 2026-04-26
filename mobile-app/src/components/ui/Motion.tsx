import React, { useEffect } from "react";
import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, type PressableProps } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type FadeInViewProps = PropsWithChildren<{
  delay?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function FadeInView({ children, delay = 0, distance = 18, duration = 520, style }: FadeInViewProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(distance);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 130 }));
  }, [delay, duration, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

type ScalePressableProps = PressableProps & {
  pressedScale?: number;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ScalePressable({
  children,
  pressedScale = 0.96,
  onPressIn,
  onPressOut,
  style,
  disabled,
  ...rest
}: ScalePressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        scale.value = withSpring(pressedScale, { damping: 18, stiffness: 320 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, { damping: 16, stiffness: 260 });
        onPressOut?.(event);
      }}
      style={[style, animatedStyle, disabled ? { opacity: 0.65 } : null]}
    >
      {children}
    </AnimatedPressable>
  );
}

type LoopingViewProps = PropsWithChildren<{
  kind?: "pulse" | "rotate" | "float";
  style?: StyleProp<ViewStyle>;
  duration?: number;
}>;

export function LoopingView({ children, kind = "pulse", style, duration }: LoopingViewProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: duration ?? (kind === "rotate" ? 20000 : 1800),
        easing: kind === "rotate" ? Easing.linear : Easing.inOut(Easing.ease),
      }),
      -1,
      kind !== "rotate"
    );
  }, [duration, kind, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (kind === "rotate") {
      return { transform: [{ rotate: `${progress.value * 360}deg` }] };
    }
    if (kind === "float") {
      return { transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -8]) }] };
    }
    return { transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.08]) }] };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
