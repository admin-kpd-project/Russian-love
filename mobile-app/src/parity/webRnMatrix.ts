/**
 * Соответствие ключевых экранов/модалок веб → React Native (план паритета).
 * Веб-пути относительно web/app/.
 */
export const WEB_RN_PARITY: Record<string, string> = {
  "components/LandingPage.tsx": "screens/LandingScreen.tsx",
  "components/AuthModal.tsx": "screens/LoginScreen.tsx + RegisterScreen.tsx (+ shared validation)",
  "pages/MainApp.tsx": "screens/MainScreen.tsx",
  "components/SwipeableCard.tsx": "components/main/SwipeableCard.tsx",
  "components/ProfileCard.tsx": "components/main/ProfileCard.tsx",
  "components/ActionButtons.tsx": "components/main/ActionButtons.tsx",
  "components/MatchModal.tsx": "components/main/MatchModal.tsx",
  "components/NotificationsModal.tsx": "components/main/NotificationsModal.tsx",
  "components/ChatsList.tsx": "components/main/ChatsListModal.tsx",
  "components/ChatModal.tsx": "screens/ChatScreen.tsx",
  "components/QRShareModal.tsx": "components/main/QRShareModal.tsx",
  "components/LikesModal.tsx": "components/main/LikesModal.tsx",
  "components/Favorites.tsx": "components/main/FavoritesModal.tsx",
  "components/SubscriptionModal.tsx": "components/main/SubscriptionModal.tsx",
  "components/SuperLikeShopModal.tsx": "components/main/SuperLikeShopModal.tsx",
  "components/SettingsModal.tsx": "components/main/SettingsModal.tsx",
  "components/ProfileSettingsModal.tsx": "components/main/ProfileSettingsModal.tsx",
  "components/RecommendModal.tsx": "components/main/RecommendModal.tsx",
  "components/DetailedAnalysisModal.tsx": "components/main/DetailedAnalysisModal.tsx",
  "components/DetailedAnalysisPurchaseModal.tsx": "components/main/DetailedAnalysisPurchaseModal.tsx",
  "components/CompatibilityDetailsModal.tsx": "components/main/CompatibilityDetailsModal.tsx",
  "components/EventsModal.tsx": "components/main/EventsPickerModal.tsx + data/eventTemplates.ts",
  "services/paymentsService.ts": "api/paymentsApi.ts",
  "services/usersService.ts": "api/usersApi.ts",
  "services/uploadService.ts": "api/uploadApi.ts (+ utils/mediaUrl publicDisplayMediaUrl)",
  "components/InvitePage.tsx": "screens/InviteScreen.tsx",
  "pages/ScanProfile.tsx": "screens/ScanProfileScreen.tsx",
  "pages/PaymentConfirmPage.tsx": "screens/PaymentConfirmScreen.tsx",
  "pages/SupportPage.tsx": "screens/SupportScreen.tsx",
  "pages/AdminPage.tsx": "(web only — admin panel)",
  "routes.tsx /support + SettingsModal": "navigation/Support + SettingsModal → Support",
};

export { PARITY_SCREEN_CHECKLIST, PARITY_QA_NOTES } from "./parityChecklist";
