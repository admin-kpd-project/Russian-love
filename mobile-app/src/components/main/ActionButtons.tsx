import React from "react";
import { View, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { X, Heart, RotateCcw, Star, Bookmark } from "lucide-react-native";

import { ScalePressable } from "../ui/Motion";
import { brandGradients } from "../../theme/designTokens";

type Props = {
  onReject: () => void;
  onLike: () => void;
  onUndo: () => void;
  onSuperLike: () => void;
  onFavorite: () => void;
  hasUndo: boolean;
  isFavorite: boolean;
};

export function ActionButtons({ onReject, onLike, onUndo, onSuperLike, onFavorite, hasUndo, isFavorite }: Props) {
  return (
    <View style={styles.row}>
      <ScalePressable
        onPress={onUndo}
        disabled={!hasUndo}
        style={[styles.small, !hasUndo ? styles.disUndo : styles.okUndo]}
      >
        <RotateCcw size={22} color={hasUndo ? "#ca8a04" : "#d6d3d1"} />
      </ScalePressable>
      <ScalePressable onPress={onReject} style={styles.reject}>
        <X size={40} color="#ef4444" />
      </ScalePressable>
      <ScalePressable onPress={onSuperLike}>
        <LinearGradient colors={[...brandGradients.superLike]} style={styles.big}>
          <Star size={40} color="#fff" fill="#fff" />
        </LinearGradient>
      </ScalePressable>
      <ScalePressable onPress={onLike}>
        <LinearGradient colors={[...brandGradients.primary]} style={styles.big}>
          <Heart size={40} color="#fff" fill="#fff" />
        </LinearGradient>
      </ScalePressable>
      <ScalePressable onPress={onFavorite} style={styles.small}>
        {isFavorite ? (
          <LinearGradient colors={[...brandGradients.favorite]} style={styles.smallGrad}>
            <Bookmark size={22} color="#fff" fill="#fff" />
          </LinearGradient>
        ) : (
          <View style={styles.favOff}>
            <Bookmark size={22} color="#d97706" />
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
    paddingBottom: 6,
  },
  small: { width: 48, height: 48, borderRadius: 24, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  smallGrad: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  okUndo: { backgroundColor: "#fef9c3" },
  disUndo: { backgroundColor: "#f5f5f4" },
  favOff: { width: "100%", height: "100%", backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" },
  reject: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fecaca",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  big: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
});
