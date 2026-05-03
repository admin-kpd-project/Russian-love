import React from "react";
import { View, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Heart, RotateCcw, Star, Bookmark } from "lucide-react-native";

import { ScalePressable } from "../ui/Motion";
import { brandGradients, tw } from "../../theme/designTokens";

type Props = {
  onReject: () => void;
  onLike: () => void;
  onUndo: () => void;
  onSuperLike: () => void;
  onFavorite: () => void;
  hasUndo: boolean;
  isFavorite: boolean;
  disabled?: boolean;
};

export function ActionButtons({
  onReject,
  onLike,
  onUndo,
  onSuperLike,
  onFavorite,
  hasUndo,
  isFavorite,
  disabled = false,
}: Props) {
  return (
    <View style={[styles.row, disabled && styles.rowDis]}>
      <ScalePressable
        onPress={onUndo}
        disabled={!hasUndo || disabled}
        style={[styles.small, !hasUndo || disabled ? styles.disUndo : styles.okUndo]}
      >
        <RotateCcw size={26} color={hasUndo ? "#ca8a04" : tw.gray400} />
      </ScalePressable>
      <ScalePressable onPress={onReject} style={styles.reject} disabled={disabled}>
        <X size={36} color="#ef4444" />
      </ScalePressable>
      <ScalePressable onPress={onSuperLike} disabled={disabled}>
        <LinearGradient colors={[tw.blue400, tw.blue600]} style={styles.big}>
          <Star size={36} color="#fff" fill="#fff" />
        </LinearGradient>
      </ScalePressable>
      <ScalePressable onPress={onLike} disabled={disabled}>
        <LinearGradient colors={[...brandGradients.primary]} style={styles.big}>
          <Heart size={36} color="#fff" fill="#fff" />
        </LinearGradient>
      </ScalePressable>
      <ScalePressable onPress={onFavorite} style={styles.small} disabled={disabled}>
        {isFavorite ? (
          <LinearGradient colors={[...brandGradients.favorite]} style={styles.smallGrad}>
            <Bookmark size={24} color="#fff" fill="#fff" />
          </LinearGradient>
        ) : (
          <View style={styles.favOff}>
            <Bookmark size={24} color={tw.amber600} />
          </View>
        )}
      </ScalePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  rowDis: { opacity: 0.45 },
  /** Веб: `p-3` / `p-4` + иконка — компактные боковые */
  small: { width: 50, height: 50, borderRadius: 25, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  smallGrad: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  okUndo: { backgroundColor: "#fef9c3" },
  disUndo: { backgroundColor: "#f5f5f4" },
  favOff: { width: "100%", height: "100%", backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" },
  /** Веб: белая кнопка с `border-red-100`, крупный X */
  reject: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fecaca",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
  },
  /** Веб: `p-5`/`p-7` + `size-9` — основные круги чуть крупнее боковых */
  big: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 7,
  },
});
