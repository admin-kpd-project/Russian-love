import type { LinkingOptions } from "@react-navigation/native";
import type { RootStackParamList } from "./types";

/** Префиксы как на веб-маршрутах + кастомная схема для тестов. */
export const linkingPrefixes = ["forruss://", "https://forruss.ru", "https://www.forruss.ru"];

export const rootLinking: LinkingOptions<RootStackParamList> = {
  prefixes: linkingPrefixes,
  config: {
    screens: {
      Server: "server",
      Landing: "",
      Login: "login",
      Register: "register",
      Main: "app",
      ScanProfile: "scan/:userId",
      Invite: "invite/:inviterId",
      /** orderId чаще в query (?orderId=) — экран дополнительно читает URL через Linking */
      PaymentConfirm: "payment/confirm",
    },
  },
};
