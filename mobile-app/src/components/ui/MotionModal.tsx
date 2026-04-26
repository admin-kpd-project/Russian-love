import React, { useEffect } from "react";
import { Modal, Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sheetStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
};

export function MotionModal({ visible, onClose, children, sheetStyle, backdropStyle }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 180 });
    scale.value = visible ? withSpring(1, { damping: 18, stiffness: 180 }) : withTiming(0.9, { duration: 150 });
  }, [opacity, scale, visible]);

  const backAnim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, backdropStyle, backAnim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheet, sheetStyle, sheetAnim]}>{children}</Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
});
