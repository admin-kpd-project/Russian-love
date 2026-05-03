import { Platform, type TextStyle, type ViewStyle } from "react-native";

import { pageBackgroundFlat, shadcnLight, tw } from "./designTokens";

/** Цвета как на лендинге (Tailwind) — `pageBg` = плоский фон, согласован с `brandGradients.page` / веб */
export const colors = {
  pageBg: pageBackgroundFlat,
  pageBgTop: tw.fromRed50,
  white: "#ffffff",
  heroRed: "#ef4444",
  heroAmber: "#f59e0b",
  red600: "#dc2626",
  red500: "#ef4444",
  red200: "#fecaca",
  amber500: "#f59e0b",
  amber600: "#d97706",
  amber100: "#fef3c7",
  stone900: "#1c1917",
  stone600: "#57534e",
  stone500: "#78716c",
  stone200: "#e7e5e4",
  stone100: "#f5f5f4",
  borderInput: "#fecaca",
  error: "#b91c1c",
  destructive: shadcnLight.destructive,
  mutedForeground: shadcnLight.mutedForeground,
  inputBgShadcn: shadcnLight.inputBackground,
  link: "#c2410c",
  greenSend: "#16a34a",
} as const;

export const radius = { sm: 10, md: 12, lg: 16, xl: 24, pill: 9999 } as const;

export function cardShadow(): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
    },
    android: { elevation: 4 },
    default: {},
  });
}

export function headerShadow(): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  });
}

/** Основная кнопка как `from-red-500 to-amber-500` (без нативного градиента) */
export const primaryButton: ViewStyle = {
  backgroundColor: "#ea580c",
  borderRadius: radius.pill,
  paddingVertical: 14,
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
};

export const primaryButtonText: TextStyle = {
  color: colors.white,
  fontWeight: "600",
  fontSize: 16,
};

export const outlineButton: ViewStyle = {
  borderWidth: 2,
  borderColor: colors.red200,
  borderRadius: radius.pill,
  paddingVertical: 12,
  paddingHorizontal: 18,
  alignItems: "center",
  backgroundColor: "transparent",
};

export const inputBase: ViewStyle = {
  borderWidth: 1,
  borderColor: colors.stone200,
  borderRadius: radius.md,
  paddingVertical: 12,
  paddingHorizontal: 14,
  backgroundColor: colors.white,
};

export const placeholderColor = colors.stone500;

export { tw } from "./designTokens";
