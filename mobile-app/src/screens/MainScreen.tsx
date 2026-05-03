import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform, StatusBar, Alert, Linking } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Heart, User as UserIcon, MessageCircle, Flame, QrCode, Bookmark, Bell, Shield } from "lucide-react-native";

import { getFeed } from "../api/feedApi";
import { createConversation, listConversations } from "../api/conversationsApi";
import { getNotifications } from "../api/notificationsApi";
import { logoutApi } from "../api/authApi";
import { getCurrentUser } from "../api/usersApi";
import { getApiBaseUrl } from "../api/apiBase";
import { sendLike, sendSuperLike, getMatches } from "../api/socialApi";
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
import { SuperLikeBurstLayer } from "../components/main/SuperLikeBurstLayer";
import { SuperLikeComposeModal } from "../components/main/SuperLikeComposeModal";
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
import { guessWebAdminUrl } from "../utils/adminWebUrl";
import { formatApiNetworkError } from "../utils/formatNetworkError";

type Nav = NativeStackNavigationProp<RootStackParamList, "Main">;

function profileIdStr(p: UserProfile): string {
  return String(p.id);
}

type LikedEntry = { profile: UserProfile; isSuperLike: boolean; superMessage?: string };

function raceTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`${label} (>${Math.round(ms / 1000)} с)`)), ms);
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    );
  });
}

function mergeLikedEntry(prev: LikedEntry[], p: UserProfile, isSuper: boolean, superMessage?: string): LikedEntry[] {
  const id = profileIdStr(p);
  const idx = prev.findIndex((e) => profileIdStr(e.profile) === id);
  const msg = (superMessage || "").trim() || undefined;
  if (idx === -1) {
    return [...prev, { profile: p, isSuperLike: isSuper, superMessage: isSuper ? msg : undefined }];
  }
  const cur = prev[idx];
  return [
    ...prev.slice(0, idx),
    {
      profile: cur.profile,
      isSuperLike: cur.isSuperLike || isSuper,
      superMessage: isSuper ? msg ?? cur.superMessage : cur.superMessage,
    },
    ...prev.slice(idx + 1),
  ];
}

export function MainScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { toggleFavorite, isFavorite, favorites } = useFavorites();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compatibility, setCompatibility] = useState<number[]>([]);
  const [self, setSelf] = useState<UserProfile>(mockSelf);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedLoadError, setFeedLoadError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ profile: UserProfile; liked: boolean; superLike?: boolean }[]>([]);
  const [likedEntries, setLikedEntries] = useState<LikedEntry[]>([]);
  const [superLikeBurst, setSuperLikeBurst] = useState(false);
  const superLikeInFlightRef = useRef(false);
  const [superLikeComposeOpen, setSuperLikeComposeOpen] = useState(false);
  const [superLikeComposeProfile, setSuperLikeComposeProfile] = useState<UserProfile | null>(null);
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
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  const knownMatchIdsRef = useRef<Set<string> | null>(null);
  const showMatchRef = useRef(false);
  const selectedLikedRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    showMatchRef.current = showMatch;
  }, [showMatch]);
  useEffect(() => {
    selectedLikedRef.current = selectedLiked;
  }, [selectedLiked]);

  const applyEconomyFromProfile = useCallback((u: Profile) => {
    if (typeof u.superLikesBalance === "number") setSuperLikesRemaining(u.superLikesBalance);
    if (typeof u.isPremium === "boolean") setIsPremium(u.isPremium);
    if (u.hasUnlimitedAnalysis) setHasUnlimitedAnalysis(true);
    if (Array.isArray(u.purchasedAnalysisUserIds) && u.purchasedAnalysisUserIds.length > 0) {
      setPurchasedAnalyses((prev) => [...new Set([...prev, ...u.purchasedAnalysisUserIds!.map(String)])]);
    }
  }, []);

  /** Как на веб MainApp: мэтчи + бейджи уведомлений и чатов. */
  const pollMatchesAndBadges = useCallback(async () => {
    const base = await getApiBaseUrl();
    const [matchesRes, n, c] = await Promise.all([getMatches(), getNotifications(), listConversations()]);
    if (n.data) setUnreadNotifCount(n.data.filter((x) => !x.read).length);
    if (c.data) setUnreadChatsCount(c.data.filter((x) => x.unread).length);

    const list = matchesRes.data && !matchesRes.error ? matchesRes.data : [];
    if (knownMatchIdsRef.current === null) {
      knownMatchIdsRef.current = new Set(list.map((m) => m.id));
      return;
    }
    const known = knownMatchIdsRef.current;
    let openedMatchModalThisPoll = false;
    for (const item of list) {
      if (known.has(item.id)) continue;
      known.add(item.id);
      const peer = mapApiProfileToUserProfile(item.peer, base);
      setLikedEntries((prev) => mergeLikedEntry(prev, peer, false));
      const canShowMatchModal =
        !openedMatchModalThisPoll && !showMatchRef.current && !selectedLikedRef.current;
      if (canShowMatchModal) {
        openedMatchModalThisPoll = true;
        setMatchedProfile(peer);
        setShowMatch(true);
      }
    }
  }, []);

  const reloadProfile = useCallback(async () => {
    const base = await getApiBaseUrl();
    const u = await getCurrentUser();
    if (u.data) {
      setMe(u.data);
      applyEconomyFromProfile(u.data);
      try {
        setSelf(mapApiProfileToUserProfile(u.data, base));
      } catch {
        /* keep self */
      }
    }
  }, [applyEconomyFromProfile]);

  const loadFeedAndMe = useCallback(async (signal: { cancelled: boolean }) => {
    setFeedLoadError(null);
    setLoadingFeed(true);
    try {
      const base = await getApiBaseUrl();
      if (signal.cancelled) return;
      if (!base) {
        setFeedLoadError("Не задан адрес API. Нажмите «Сервер» в шапке главного экрана.");
        setProfiles([]);
        return;
      }
      const [u, r] = await raceTimeout(Promise.all([getCurrentUser(), getFeed()]), 32000, "Сервер не отвечает");
      if (signal.cancelled) return;
      if (u.data) {
        setMe(u.data);
        applyEconomyFromProfile(u.data);
        try {
          setSelf(mapApiProfileToUserProfile(u.data, base));
        } catch {
          /* keep mockSelf */
        }
      }
      if (r.error) {
        const msg = r.error.trim();
        const low = msg.toLowerCase();
        if (low.includes("profile_incomplete")) {
          setFeedLoadError("Заполните профиль в настройках — без этого лента недоступна.");
        } else {
          setFeedLoadError(msg || "Не удалось загрузить ленту");
        }
        setProfiles([]);
        return;
      }
      if (r.data?.length) setProfiles(r.data.map((p) => mapApiProfileToUserProfile(p, base)));
      else setProfiles([]);
    } catch (e) {
      if (!signal.cancelled) {
        const m = e instanceof Error ? e.message : String(e);
        setFeedLoadError(formatApiNetworkError(m) || "Ошибка сети");
        setProfiles([]);
      }
    } finally {
      if (!signal.cancelled) setLoadingFeed(false);
    }
  }, [applyEconomyFromProfile]);

  useEffect(() => {
    const signal = { cancelled: false };
    void loadFeedAndMe(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadFeedAndMe]);

  const POLL_MS = 4000;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const seed = await getMatches();
        if (cancelled) return;
        knownMatchIdsRef.current = new Set((seed.data ?? []).map((m) => m.id));
        await pollMatchesAndBadges();
        if (cancelled) return;
        pollRef.current = setInterval(() => void pollMatchesAndBadges(), POLL_MS);
      })();
      return () => {
        cancelled = true;
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      };
    }, [pollMatchesAndBadges])
  );

  useEffect(() => {
    const scores = profiles.map((p) => calculateCompatibility(self, p));
    setCompatibility(scores);
  }, [profiles, self]);

  const handleSwipe = useCallback(
    (liked: boolean) => {
      if (currentIndex >= profiles.length) return;
      if (superLikeBurst || superLikeInFlightRef.current) return;
      const cur = profiles[currentIndex];
      setHistory((h) => [...h, { profile: cur, liked }]);
      if (liked) {
        setLikedEntries((lp) => mergeLikedEntry(lp, cur, false));
        void (async () => {
          const res = await sendLike(String(cur.id));
          if (res.error) {
            console.warn("Like failed:", res.error);
            return;
          }
          if (res.data?.matched) {
            if (res.data.matchId) {
              if (!knownMatchIdsRef.current) knownMatchIdsRef.current = new Set();
              knownMatchIdsRef.current.add(res.data.matchId);
            }
            setMatchedProfile(cur);
            setShowMatch(true);
          }
        })();
      }
      setCurrentIndex((i) => i + 1);
    },
    [currentIndex, profiles, superLikeBurst]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    if (superLikeBurst || superLikeInFlightRef.current) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentIndex((i) => Math.max(0, i - 1));
    if (last.liked) {
      const pid = profileIdStr(last.profile);
      setLikedEntries((lp) => lp.filter((e) => profileIdStr(e.profile) !== pid));
    }
  };

  const handleSuperLike = () => {
    if (currentIndex >= profiles.length) return;
    if (superLikeBurst || superLikeInFlightRef.current) return;
    if (!isPremium && superLikesRemaining <= 0) {
      setShowShop(true);
      return;
    }
    setSuperLikeComposeProfile(profiles[currentIndex]);
    setSuperLikeComposeOpen(true);
  };

  const confirmSuperLikeWithMessage = (note?: string) => {
    const cur = superLikeComposeProfile;
    setSuperLikeComposeOpen(false);
    setSuperLikeComposeProfile(null);
    if (!cur) return;
    if (currentIndex >= profiles.length) return;
    if (superLikeBurst || superLikeInFlightRef.current) return;

    superLikeInFlightRef.current = true;
    setSuperLikeBurst(true);
    const t0 = Date.now();
    void (async () => {
      const res = await sendSuperLike(String(cur.id), { message: note });
      const wait = Math.max(0, 720 - (Date.now() - t0));
      await new Promise((r) => setTimeout(r, wait));
      if (res.error) {
        setSuperLikeBurst(false);
        superLikeInFlightRef.current = false;
        const msg = (res.error || "").toLowerCase();
        if (msg.includes("нет суперлайков") || msg.includes("купите") || msg.includes("подписк")) {
          setShowShop(true);
        } else {
          Alert.alert("Ошибка", res.error);
        }
        return;
      }
      const bal = res.data?.superLikesBalance;
      if (typeof bal === "number") setSuperLikesRemaining(bal);
      setLikedEntries((lp) => mergeLikedEntry(lp, cur, true, note));
      setHistory((h) => [...h, { profile: cur, liked: true, superLike: true }]);
      setCurrentIndex((i) => i + 1);
      setSuperLikeBurst(false);
      superLikeInFlightRef.current = false;
    })();
  };

  const openChatWithProfile = async (p: UserProfile, prefilledMessage?: string) => {
    setShowMatch(false);
    setMatchedProfile(null);
    setSelectedLiked(null);
    const r = await createConversation(String(p.id));
    if (r.error || !r.data) {
      Alert.alert("Чат недоступен", r.error || "Писать можно только после взаимного мэтча");
      return;
    }
    navigation.navigate("Chat", {
      conversationId: r.data.id,
      title: p.name,
      avatarUrl: p.photo,
      prefilledMessage,
      peerUserId: String(p.id),
      peerLastSeenAt: undefined,
    });
  };

  const openChatFromNotification = async (params: {
    userName: string;
    userAvatar: string;
    conversationId?: string;
    peerUserId?: string;
    peerLastSeenAt?: string | null;
  }) => {
    if (params.conversationId) {
      navigation.navigate("Chat", {
        conversationId: params.conversationId,
        title: params.userName,
        avatarUrl: params.userAvatar,
        peerUserId: params.peerUserId,
        peerLastSeenAt: params.peerLastSeenAt,
      });
      return;
    }
    if (params.peerUserId) {
      const r = await createConversation(params.peerUserId);
      if (r.error || !r.data) {
        Alert.alert("Чат недоступен", r.error || "Писать можно только после взаимного мэтча");
        return;
      }
      navigation.navigate("Chat", {
        conversationId: r.data.id,
        title: params.userName,
        avatarUrl: params.userAvatar,
        peerUserId: params.peerUserId,
        peerLastSeenAt: params.peerLastSeenAt,
      });
    }
  };

  const openChatFromList = (item: ConversationListItem) => {
    setShowChats(false);
    navigation.navigate("Chat", {
      conversationId: item.id,
      title: item.name,
      avatarUrl: item.avatar,
      peerUserId: item.peerUserId,
      peerLastSeenAt: item.peerLastSeenAt,
    });
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

  const openAdminWeb = useCallback(async () => {
    const base = await getApiBaseUrl();
    const url = guessWebAdminUrl(base);
    if (!url) {
      Alert.alert(
        "Админ-панель",
        "Не удалось определить URL веб-приложения (часто API :8000 → веб :5173). Откройте /admin в браузере вручную."
      );
      return;
    }
    try {
      if (!(await Linking.canOpenURL(url))) {
        Alert.alert("Админ-панель", url);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Админ-панель", "Не удалось открыть ссылку.");
    }
  }, []);

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
            {me && ["admin", "moderator", "support"].includes(String(me.role || "user")) ? (
              <ScalePressable onPress={() => void openAdminWeb()} style={styles.iconHit} accessibilityLabel="Админ-панель">
                <Shield size={24} color="#b45309" />
              </ScalePressable>
            ) : null}
            <ScalePressable onPress={() => setShowProfile(true)} style={styles.iconHit}>
              <UserIcon size={24} color={tw.gray600} />
            </ScalePressable>
            <ScalePressable onPress={() => setShowNotif(true)} style={styles.iconHit}>
              <Bell size={24} color={tw.gray600} />
              {unreadNotifCount > 0 ? <View style={styles.dot} /> : null}
            </ScalePressable>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {loadingFeed ? (
          <ActivityIndicator size="large" color={tw.red500} style={{ marginTop: 40 }} />
        ) : feedLoadError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyH}>Лента не загрузилась</Text>
            <Text style={styles.emptyT}>{feedLoadError}</Text>
            <ScalePressable
              onPress={() => {
                const signal = { cancelled: false };
                void loadFeedAndMe(signal);
              }}
            >
              <LinearGradient colors={[...brandGradients.primary]} style={styles.restart}>
                <Text style={styles.restartT}>Повторить</Text>
              </LinearGradient>
            </ScalePressable>
          </View>
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
                    likesCount={likedEntries.length}
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
                    <SwipeableCard
                      key={p.id}
                      cardKey={p.id}
                      dragEnabled={!superLikeBurst}
                      onSwipeLeft={() => handleSwipe(false)}
                      onSwipeRight={() => handleSwipe(true)}
                    >
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
              <SuperLikeBurstLayer visible={superLikeBurst} />
            </View>
            <ActionButtons
              onReject={() => handleSwipe(false)}
              onLike={() => handleSwipe(true)}
              onUndo={handleUndo}
              onSuperLike={handleSuperLike}
              onFavorite={() => currentProfile && toggleFavorite(currentProfile)}
              hasUndo={history.length > 0}
              isFavorite={currentProfile ? isFavorite(currentProfile.id) : false}
              disabled={superLikeBurst}
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
                setProfiles((prev) => {
                  const likedIds = new Set(likedEntries.map((e) => profileIdStr(e.profile)));
                  return prev.filter((p) => !likedIds.has(profileIdStr(p)));
                });
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
        <ScalePressable style={styles.navHit} onPress={() => setShowShop(true)} accessibilityLabel="Магазин суперлайков">
          <Flame size={34} color="#ef4444" />
          {!isPremium ? (
            <LinearGradient colors={["#f97316", "#ef4444"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.badgeFlame}>
              <Text style={styles.badgeTxt}>{superLikesRemaining}</Text>
            </LinearGradient>
          ) : null}
        </ScalePressable>
        <ScalePressable style={styles.navHit} onPress={() => setShowFavorites(true)}>
          <Bookmark size={34} color={tw.gray400} />
          {favorites.length > 0 ? (
            <LinearGradient colors={[...brandGradients.favorite]} style={styles.badgeAm}>
              <Text style={styles.badgeTxt}>{favorites.length}</Text>
            </LinearGradient>
          ) : null}
        </ScalePressable>
        <ScalePressable style={styles.navHit} onPress={() => setShowLikes(true)}>
          <Heart size={34} color={tw.gray400} />
        </ScalePressable>
        <ScalePressable style={styles.navHit} onPress={() => setShowChats(true)}>
          <MessageCircle size={34} color={tw.gray400} />
          {unreadChatsCount > 0 ? <View style={styles.dotSm} /> : null}
        </ScalePressable>
        <ScalePressable style={styles.navHit} onPress={() => setShowProfile(true)}>
          <UserIcon size={34} color={tw.gray400} />
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

      <ChatsListModal
        visible={showChats}
        onClose={() => {
          setShowChats(false);
          void pollMatchesAndBadges();
        }}
        onPick={openChatFromList}
      />
      <LikesModal
        visible={showLikes}
        entries={likedEntries}
        onClose={() => setShowLikes(false)}
        onOpenProfile={(p) => {
          setShowLikes(false);
          setSelectedLiked(p);
        }}
      />
      <SuperLikeComposeModal
        visible={superLikeComposeOpen}
        profile={superLikeComposeProfile}
        onClose={() => {
          setSuperLikeComposeOpen(false);
          setSuperLikeComposeProfile(null);
        }}
        onSend={confirmSuperLikeWithMessage}
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
        onOpenSubscription={() => {
          setShowProfile(false);
          setShowSub(true);
        }}
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
        onSubscribed={() => {
          setIsPremium(true);
          void reloadProfile();
        }}
      />
      <NotificationsModal
        visible={showNotif}
        onClose={() => setShowNotif(false)}
        onOpenChat={(p) => void openChatFromNotification(p)}
        onMarkedAllRead={() => setUnreadNotifCount(0)}
      />
      <RecommendModal
        visible={showRecommend && recommendProfile != null}
        profileToRecommend={recommendProfile}
        availableFriends={likedEntries.map((e) => e.profile)}
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
