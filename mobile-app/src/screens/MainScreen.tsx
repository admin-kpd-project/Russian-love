import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform, StatusBar } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Heart, User as UserIcon, MessageCircle, Flame, QrCode, Bookmark } from "lucide-react-native";

import { getFeed } from "../api/feedApi";
import { createConversation } from "../api/conversationsApi";
import { logoutApi } from "../api/authApi";
import { getCurrentUser } from "../api/usersApi";
import { getApiBaseUrl } from "../api/apiBase";
import { sendLike, sendSuperLike } from "../api/socialApi";
import type { Profile } from "../api/authApi";
import type { RootStackParamList } from "../navigation/types";
import {
  calculateCompatibility,
  calculateDetailedCompatibility,
  currentUser as mockSelf,
  type UserProfile,
  type CompatibilityDetails,
} from "../utils/compatibilityAI";
import { mapApiProfileToUserProfile } from "../utils/mapApiProfile";
import { useFavorites } from "../context/FavoritesContext";
import { SwipeableCard } from "../components/main/SwipeableCard";
import { ProfileCard } from "../components/main/ProfileCard";
import { ActionButtons } from "../components/main/ActionButtons";
import { MatchModal } from "../components/main/MatchModal";
import { ChatsListModal } from "../components/main/ChatsListModal";
import { LikesModal } from "../components/main/LikesModal";
import { FavoritesModal } from "../components/main/FavoritesModal";
import { ProfileSettingsModal } from "../components/main/ProfileSettingsModal";
import { SettingsModal } from "../components/main/SettingsModal";
import { MatreshkaLogo } from "../components/MatreshkaLogo";
import { NotificationsModal } from "../components/main/NotificationsModal";
import { QRShareModal } from "../components/main/QRShareModal";
import { SuperLikeShopModal } from "../components/main/SuperLikeShopModal";
import { SubscriptionModal } from "../components/main/SubscriptionModal";
import { RecommendModal } from "../components/main/RecommendModal";
import { CompatibilityDetailsModal } from "../components/main/CompatibilityDetailsModal";
import { DetailedAnalysisModal } from "../components/main/DetailedAnalysisModal";
import { DetailedAnalysisPurchaseModal } from "../components/main/DetailedAnalysisPurchaseModal";
import type { ConversationListItem } from "../api/conversationsApi";
import { ScalePressable } from "../components/ui/Motion";
import { GradientText } from "../components/ui/GradientText";
import { brandGradients, tw } from "../theme/designTokens";

type Nav = NativeStackNavigationProp<RootStackParamList, "Main">;

export function MainScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { toggleFavorite, isFavorite, favorites } = useFavorites();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compatibility, setCompatibility] = useState<number[]>([]);
  const [self, setSelf] = useState<UserProfile>(mockSelf);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [history, setHistory] = useState<{ profile: UserProfile; liked: boolean }[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<UserProfile[]>([]);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(5);
  const [isPremium, setIsPremium] = useState(false);

  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [showChats, setShowChats] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showRecommend, setShowRecommend] = useState(false);
  const [recommendProfile, setRecommendProfile] = useState<UserProfile | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [me, setMe] = useState<Profile | null>(null);
  const [selectedLiked, setSelectedLiked] = useState<UserProfile | null>(null);
  const [showCompatDetails, setShowCompatDetails] = useState(false);
  const [compatDetails, setCompatDetails] = useState<CompatibilityDetails | null>(null);
  const [compatSubject, setCompatSubject] = useState<UserProfile | null>(null);
  const [compatDisplayPct, setCompatDisplayPct] = useState(0);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showDetailedPurchase, setShowDetailedPurchase] = useState(false);
  const [analysisTarget, setAnalysisTarget] = useState<UserProfile | null>(null);
  const [hasUnlimitedAnalysis, setHasUnlimitedAnalysis] = useState(false);
  const [purchasedAnalyses, setPurchasedAnalyses] = useState<string[]>([]);

  const reloadProfile = useCallback(async () => {
    const base = await getApiBaseUrl();
    const u = await getCurrentUser();
    if (u.data) {
      setMe(u.data);
      try {
        setSelf(mapApiProfileToUserProfile(u.data, base));
      } catch {
        /* keep self */
      }
    }
  }, []);

  useEffect(() => {
    let c = false;
    void (async () => {
      const base = await getApiBaseUrl();
      const u = await getCurrentUser();
      if (!c && u.data) {
        setMe(u.data);
        try {
          setSelf(mapApiProfileToUserProfile(u.data, base));
        } catch {
          /* keep mockSelf */
        }
      }
      const r = await getFeed();
      if (c) return;
      setLoadingFeed(false);
      if (r.data?.length) setProfiles(r.data.map((p) => mapApiProfileToUserProfile(p, base)));
      else setProfiles([]);
    })();
    return () => {
      c = true;
    };
  }, []);

  useEffect(() => {
    const scores = profiles.map((p) => calculateCompatibility(self, p));
    setCompatibility(scores);
  }, [profiles, self]);

  const handleSwipe = useCallback(
    (liked: boolean) => {
      if (currentIndex >= profiles.length) return;
      const cur = profiles[currentIndex];
      setHistory((h) => [...h, { profile: cur, liked }]);
      if (liked) {
        setLikedProfiles((lp) => [...lp, cur]);
        void (async () => {
          const res = await sendLike(String(cur.id));
          if (res.data?.matched) {
            setMatchedProfile(cur);
            setShowMatch(true);
          }
        })();
      }
      setCurrentIndex((i) => i + 1);
    },
    [currentIndex, profiles]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    setHistory((h) => h.slice(0, -1));
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleSuperLike = () => {
    if (currentIndex >= profiles.length) return;
    const cur = profiles[currentIndex];
    setLikedProfiles((lp) => [...lp, cur]);
    void sendSuperLike(String(cur.id));
    setCurrentIndex((i) => i + 1);
    if (!isPremium && superLikesRemaining > 0) setSuperLikesRemaining((n) => n - 1);
  };

  const openChatWithProfile = async (p: UserProfile, prefilledMessage?: string) => {
    setShowMatch(false);
    setMatchedProfile(null);
    setSelectedLiked(null);
    const r = await createConversation(String(p.id));
    if (r.error || !r.data) return;
    navigation.navigate("Chat", {
      conversationId: r.data.id,
      title: p.name,
      avatarUrl: p.photo,
      prefilledMessage,
    });
  };

  const openChatFromNotification = async (params: {
    userName: string;
    userAvatar: string;
    conversationId?: string;
    peerUserId?: string;
  }) => {
    if (params.conversationId) {
      navigation.navigate("Chat", {
        conversationId: params.conversationId,
        title: params.userName,
        avatarUrl: params.userAvatar,
      });
      return;
    }
    if (params.peerUserId) {
      const r = await createConversation(params.peerUserId);
      if (r.error || !r.data) return;
      navigation.navigate("Chat", {
        conversationId: r.data.id,
        title: params.userName,
        avatarUrl: params.userAvatar,
      });
    }
  };

  const openChatFromList = (item: ConversationListItem) => {
    setShowChats(false);
    navigation.navigate("Chat", { conversationId: item.id, title: item.name, avatarUrl: item.avatar });
  };

  const compatForProfile = (p: UserProfile) => {
    const i = profiles.findIndex((x) => x.id === p.id);
    if (i >= 0) return compatibility[i] ?? calculateCompatibility(self, p);
    return calculateCompatibility(self, p);
  };

  const openCompatDetails = (subject: UserProfile) => {
    const d = calculateDetailedCompatibility(self, subject);
    setCompatDetails(d);
    setCompatSubject(subject);
    setCompatDisplayPct(compatForProfile(subject));
    setShowCompatDetails(true);
  };

  const openAnalysisFlow = (target: UserProfile) => {
    setAnalysisTarget(target);
    const idStr = String(target.id);
    if (isPremium || hasUnlimitedAnalysis || purchasedAnalyses.includes(idStr)) {
      setShowDetailedPurchase(false);
      setShowDetailedAnalysis(true);
    } else {
      setShowDetailedPurchase(true);
    }
  };

  const currentProfile = profiles[currentIndex];
  const hasMore = currentIndex < profiles.length;

  const stackOffsets = [2, 1, 0] as const;

  return (
    <LinearGradient colors={[...brandGradients.page]} style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(255,255,255,0.92)" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 6 }]}>
        <View style={styles.headerIn}>
          <View style={styles.brand}>
            <MatreshkaLogo size={40} />
            <GradientText text="Любить по-russки" width={172} height={28} fontSize={20} />
          </View>
          <View style={styles.headerActions}>
            <ScalePressable onPress={() => setShowProfile(true)} style={styles.iconHit}>
              <UserIcon size={24} color={tw.gray600} />
            </ScalePressable>
            <ScalePressable onPress={() => setShowNotif(true)} style={styles.iconHit}>
              <MessageCircle size={24} color={tw.gray600} />
              <View style={styles.dot} />
            </ScalePressable>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {loadingFeed ? (
          <ActivityIndicator size="large" color={tw.red500} style={{ marginTop: 40 }} />
        ) : hasMore ? (
          <>
            <View style={styles.qrRow}>
              <ScalePressable style={styles.qrBtn} onPress={() => setShowQR(true)}>
                <QrCode size={20} color={tw.gray700} />
                <Text style={styles.qrTxt}>QR</Text>
              </ScalePressable>
            </View>
            <View style={styles.stack}>
              {stackOffsets.map((off) => {
                const p = profiles[currentIndex + off];
                if (!p) return null;
                const idx = currentIndex + off;
                const compat = compatibility[idx] ?? 0;
                const card = (
                  <ProfileCard
                    profile={p}
                    compatibility={compat}
                    superLikesRemaining={superLikesRemaining}
                    likesCount={likedProfiles.length}
                    onOpenDetailedAnalysis={
                      off === 0 && currentProfile
                        ? () => {
                            openAnalysisFlow(currentProfile);
                          }
                        : undefined
                    }
                  />
                );
                if (off === 0) {
                  return (
                    <SwipeableCard key={p.id} cardKey={p.id} onSwipeLeft={() => handleSwipe(false)} onSwipeRight={() => handleSwipe(true)}>
                      {card}
                    </SwipeableCard>
                  );
                }
                return (
                  <View
                    key={p.id}
                    pointerEvents="none"
                    style={[
                      styles.stackAbs,
                      {
                        transform: [{ translateY: off * 16 }, { scale: 0.94 - (off - 1) * 0.04 }],
                        opacity: 0.68,
                        zIndex: off,
                      },
                    ]}
                  >
                    {card}
                  </View>
                );
              })}
            </View>
            <ActionButtons
              onReject={() => handleSwipe(false)}
              onLike={() => handleSwipe(true)}
              onUndo={handleUndo}
              onSuperLike={handleSuperLike}
              onFavorite={() => currentProfile && toggleFavorite(currentProfile)}
              hasUndo={history.length > 0}
              isFavorite={currentProfile ? isFavorite(currentProfile.id) : false}
            />
          </>
        ) : (
          <View style={styles.empty}>
            <LinearGradient colors={[...brandGradients.primary]} style={styles.emptyIco}>
              <Heart size={56} color="#fff" fill="#fff" />
            </LinearGradient>
            <Text style={styles.emptyH}>Нет новых профилей</Text>
            <Text style={styles.emptyT}>Попробуйте вернуться позже</Text>
            <ScalePressable
              onPress={() => {
                setCurrentIndex(0);
                setHistory([]);
              }}
            >
              <LinearGradient colors={[...brandGradients.primary]} style={styles.restart}>
                <Text style={styles.restartT}>Начать заново</Text>
              </LinearGradient>
            </ScalePressable>
          </View>
        )}
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <ScalePressable
          style={styles.navHit}
          onPress={() => setShowShop(true)}
          onLongPress={() => setShowSub(true)}
          delayLongPress={450}
        >
          <Flame size={30} color="#ef4444" />
          {!isPremium ? (
            <LinearGradient colors={[...brandGradients.primary]} style={styles.badgeFlame}>
              <Text style={styles.badgeTxt}>{superLikesRemaining}</Text>
            </LinearGradient>
          ) : null}
        </ScalePressable>
        <ScalePressable style={styles.navHit} onPress={() => setShowFavorites(true)}>
          <Bookmark size={30} color={tw.gray400} />
          {favorites.length > 0 ? (
            <LinearGradient colors={[...brandGradients.favorite]} style={styles.badgeAm}>
              <Text style={styles.badgeTxt}>{favorites.length}</Text>
            </LinearGradient>
          ) : null}
        </ScalePressable>
        <ScalePressable style={styles.navHit} onPress={() => setShowLikes(true)}>
          <Heart size={30} color={tw.gray400} />
        </ScalePressable>
        <ScalePressable style={styles.navHit} onPress={() => setShowChats(true)}>
          <MessageCircle size={30} color={tw.gray400} />
          <View style={styles.dotSm} />
        </ScalePressable>
        <ScalePressable style={styles.navHit} onPress={() => setShowProfile(true)}>
          <UserIcon size={30} color={tw.gray400} />
        </ScalePressable>
      </View>

      <MatchModal
        visible={showMatch}
        profile={matchedProfile}
        compatibility={matchedProfile ? compatForProfile(matchedProfile) : 0}
        onClose={() => {
          setShowMatch(false);
          setMatchedProfile(null);
        }}
        onWrite={() => {
          if (matchedProfile) void openChatWithProfile(matchedProfile);
        }}
        onRecommend={() => {
          if (matchedProfile) {
            setRecommendProfile(matchedProfile);
            setShowRecommend(true);
          }
        }}
        onCompatPress={() => matchedProfile && openCompatDetails(matchedProfile)}
        onEventInvite={(msg) => {
          if (matchedProfile) void openChatWithProfile(matchedProfile, msg);
        }}
      />
      <MatchModal
        visible={Boolean(selectedLiked)}
        profile={selectedLiked}
        compatibility={selectedLiked ? calculateCompatibility(self, selectedLiked) : 0}
        isMatch={false}
        onClose={() => setSelectedLiked(null)}
        onWrite={() => {
          if (selectedLiked) void openChatWithProfile(selectedLiked);
        }}
        onRecommend={() => {
          if (selectedLiked) {
            setRecommendProfile(selectedLiked);
            setShowRecommend(true);
          }
        }}
        onCompatPress={() => selectedLiked && openCompatDetails(selectedLiked)}
        onEventInvite={(msg) => {
          if (selectedLiked) void openChatWithProfile(selectedLiked, msg);
        }}
      />

      <ChatsListModal visible={showChats} onClose={() => setShowChats(false)} onPick={openChatFromList} />
      <LikesModal
        visible={showLikes}
        profiles={likedProfiles}
        onClose={() => setShowLikes(false)}
        onOpenProfile={(p) => {
          setShowLikes(false);
          setSelectedLiked(p);
        }}
      />
      <FavoritesModal visible={showFavorites} onClose={() => setShowFavorites(false)} />
      <ProfileSettingsModal
        visible={showProfile}
        user={me}
        onClose={() => setShowProfile(false)}
        onOpenQR={() => {
          setShowProfile(false);
          setShowQR(true);
        }}
        onOpenSettings={() => {
          setShowProfile(false);
          setShowSettings(true);
        }}
        onServer={() => navigation.navigate("Server", { reconfigure: true })}
        onLogout={async () => {
          await logoutApi();
          navigation.reset({ index: 0, routes: [{ name: "Landing" }] });
        }}
        onProfileSaved={reloadProfile}
      />
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
      <QRShareModal visible={showQR} userId={me?.id != null ? String(me.id) : undefined} onClose={() => setShowQR(false)} />
      <SuperLikeShopModal
        visible={showShop}
        currentAmount={superLikesRemaining}
        onClose={() => setShowShop(false)}
        onPurchase={(n) => setSuperLikesRemaining((x) => x + n)}
      />
      <SubscriptionModal
        visible={showSub}
        remainingSuperLikes={superLikesRemaining}
        onClose={() => setShowSub(false)}
        onSubscribed={() => setIsPremium(true)}
      />
      <NotificationsModal
        visible={showNotif}
        onClose={() => setShowNotif(false)}
        onOpenChat={(p) => void openChatFromNotification(p)}
      />
      <RecommendModal
        visible={showRecommend && recommendProfile != null}
        profileToRecommend={recommendProfile}
        availableFriends={likedProfiles}
        onClose={() => {
          setShowRecommend(false);
          setRecommendProfile(null);
        }}
      />
      {compatDetails ? (
        <CompatibilityDetailsModal
          visible={showCompatDetails}
          details={compatDetails}
          userName={compatSubject?.name ?? ""}
          compatibility={compatDisplayPct}
          onClose={() => setShowCompatDetails(false)}
          onOpenDetailedAnalysis={() => {
            setShowCompatDetails(false);
            if (compatSubject) openAnalysisFlow(compatSubject);
          }}
        />
      ) : null}
      <DetailedAnalysisPurchaseModal
        visible={showDetailedPurchase}
        profileName={analysisTarget?.name ?? "партнёра"}
        onClose={() => setShowDetailedPurchase(false)}
        onPurchase={(type) => {
          if (type === "unlimited") setHasUnlimitedAnalysis(true);
          else if (analysisTarget) {
            const id = String(analysisTarget.id);
            setPurchasedAnalyses((prev) => [...new Set([...prev, id])]);
          }
          setShowDetailedPurchase(false);
          setShowDetailedAnalysis(true);
        }}
      />
      <DetailedAnalysisModal
        visible={showDetailedAnalysis}
        profileName={analysisTarget?.name ?? ""}
        profileAge={analysisTarget?.age ?? 0}
        compatibility={analysisTarget ? compatForProfile(analysisTarget) : 0}
        onClose={() => setShowDetailedAnalysis(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: tw.gray200,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  headerIn: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 10 },
  brand: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  logoPh: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#fecaca" },
  brandLine1: { fontSize: 18, fontWeight: "800" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconHit: { padding: 8, position: "relative" },
  dot: { position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: tw.red500 },
  body: { flex: 1, paddingHorizontal: 8, paddingTop: 8, minHeight: 0 },
  qrRow: { alignItems: "flex-end", paddingRight: 8, marginBottom: 6 },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  qrTxt: { fontSize: 14, fontWeight: "500", color: tw.gray700 },
  stack: { flex: 1, position: "relative", marginBottom: 4 },
  stackAbs: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyIco: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyH: { fontSize: 22, fontWeight: "800", color: tw.gray800, marginBottom: 8 },
  emptyT: { color: tw.gray600, textAlign: "center", marginBottom: 20 },
  restart: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999 },
  restartT: { color: "#fff", fontWeight: "700", fontSize: 16 },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: tw.gray200,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  navHit: { padding: 10, position: "relative" },
  badgeFlame: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 999,
    alignItems: "center",
  },
  badgeAm: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 999,
    alignItems: "center",
  },
  badgeTxt: { color: "#fff", fontSize: 10, fontWeight: "800" },
  dotSm: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" },
});
