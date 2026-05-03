import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Heart, User, MessageCircle, Flame, QrCode, Bookmark, Shield, Bell } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import matreshkaLogo from "../../imports/1775050275_(1)_3_(1)-1.png";
import { SwipeableCard } from "../components/SwipeableCard";
import { ProfileCard } from "../components/ProfileCard";
import { MatchModal } from "../components/MatchModal";
import { NotificationsModal } from "../components/NotificationsModal";
import { ChatModal } from "../components/ChatModal";
import { ChatsList } from "../components/ChatsList";
import { QRShareModal } from "../components/QRShareModal";
import { ActionButtons } from "../components/ActionButtons";
import { LikesModal } from "../components/LikesModal";
import { SuperLikeBurstOverlay } from "../components/SuperLikeBurstOverlay";
import { SuperLikeComposeModal } from "../components/SuperLikeComposeModal";
import { Favorites } from "../components/Favorites";
import { SubscriptionModal } from "../components/SubscriptionModal";
import { SettingsModal } from "../components/SettingsModal";
import { ProfileSettingsModal } from "../components/ProfileSettingsModal";
import { RecommendModal } from "../components/RecommendModal";
import { SuperLikeShopModal } from "../components/SuperLikeShopModal";
import { DetailedAnalysisModal } from "../components/DetailedAnalysisModal";
import { DetailedAnalysisPurchaseModal } from "../components/DetailedAnalysisPurchaseModal";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";
import { ScanNotificationCard } from "../components/ScanNotificationCard";
import { useFavorites } from "../contexts/FavoritesContext";
import { useAuth } from "../contexts/AuthContext";
import { calculateCompatibility, type UserProfile } from "../utils/compatibilityAI";
import { getFeed } from "../services/feedService";
import { createConversation, getConversations } from "../services/conversationsService";
import { mapApiProfileToUserProfile } from "../utils/mapApiProfile";
import type { OpenChatParams } from "../types/chat";
import { tokenStorage } from "../services/api";
import { sendLike, sendSuperLike, getMatches } from "../services/socialService";
import { getNotifications } from "../services/notificationsService";

function profileId(p: UserProfile): string {
  return String(p.id);
}

type LikedEntry = { profile: UserProfile; isSuperLike: boolean; superMessage?: string };

/** Один профиль в списке лайков; суперлайк помечает особый интерес и не дублирует строку. */
function mergeLikedEntry(
  prev: LikedEntry[],
  p: UserProfile,
  isSuper: boolean,
  superMessage?: string
): LikedEntry[] {
  const id = profileId(p);
  const idx = prev.findIndex((e) => profileId(e.profile) === id);
  const msg = (superMessage || "").trim() || undefined;
  if (idx === -1) {
    return [...prev, { profile: p, isSuperLike: isSuper, superMessage: isSuper ? msg : undefined }];
  }
  const cur = prev[idx];
  const next: LikedEntry = {
    profile: cur.profile,
    isSuperLike: cur.isSuperLike || isSuper,
    superMessage: isSuper ? msg ?? cur.superMessage : cur.superMessage,
  };
  return [...prev.slice(0, idx), next, ...prev.slice(idx + 1)];
}

export function MainApp() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  // Use Favorites Context
  const { toggleFavorite, isFavorite, favorites } = useFavorites();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compatibility, setCompatibility] = useState<number[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<{ profile: UserProfile; liked: boolean; superLike?: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChats, setShowChats] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatSession, setChatSession] = useState<OpenChatParams | null>(null);
  const [showLikes, setShowLikes] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [likedEntries, setLikedEntries] = useState<LikedEntry[]>([]);
  const [superLikeBurst, setSuperLikeBurst] = useState(false);
  const superLikeInFlightRef = useRef(false);
  const [superLikeComposeOpen, setSuperLikeComposeOpen] = useState(false);
  const [superLikeComposeProfile, setSuperLikeComposeProfile] = useState<UserProfile | null>(null);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(5);
  const [showSubscription, setShowSubscription] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRecommend, setShowRecommend] = useState(false);
  const [profileToRecommend, setProfileToRecommend] = useState<UserProfile | null>(null);
  const [showSuperLikeShop, setShowSuperLikeShop] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showDetailedAnalysisPurchase, setShowDetailedAnalysisPurchase] = useState(false);
  const [analysisProfile, setAnalysisProfile] = useState<UserProfile | null>(null);
  const [purchasedAnalyses, setPurchasedAnalyses] = useState<string[]>([]);
  const [hasUnlimitedAnalysis, setHasUnlimitedAnalysis] = useState(false);
  const [scanEvents, setScanEvents] = useState<any[]>([]);
  const [selectedLikedProfile, setSelectedLikedProfile] = useState<UserProfile | null>(null);
  const [headerUnreadNotifications, setHeaderUnreadNotifications] = useState(0);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  const knownMatchIdsRef = useRef<Set<string> | null>(null);
  const showMatchRef = useRef(false);
  const showChatRef = useRef(false);
  const selectedLikedProfileRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    showMatchRef.current = showMatch;
  }, [showMatch]);
  useEffect(() => {
    showChatRef.current = showChat;
  }, [showChat]);
  useEffect(() => {
    selectedLikedProfileRef.current = selectedLikedProfile;
  }, [selectedLikedProfile]);

  const matchModalCompatibility = useMemo(() => {
    if (!matchedProfile || !authUser) return 0;
    const idx = profiles.findIndex((p) => String(p.id) === String(matchedProfile.id));
    if (idx >= 0) return compatibility[idx] ?? 0;
    return calculateCompatibility(mapApiProfileToUserProfile(authUser), matchedProfile);
  }, [matchedProfile, authUser, profiles, compatibility]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getFeed();
      if (cancelled) return;
      if (res.data?.length) {
        setProfiles(res.data.map(mapApiProfileToUserProfile));
      } else {
        if (res.error) console.warn("Feed:", res.error);
        setProfiles([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authUser) return;
    const self = mapApiProfileToUserProfile(authUser);
    const compatibilityScores = profiles.map((profile) =>
      calculateCompatibility(self, profile)
    );
    setCompatibility(compatibilityScores);
  }, [profiles, authUser]);

  const handleSwipe = (liked: boolean) => {
    if (currentIndex >= profiles.length) return;
    if (superLikeBurst || superLikeInFlightRef.current) return;

    const currentProfile = profiles[currentIndex];
    
    // Add to history for undo
    setHistory(prev => [...prev, { profile: currentProfile, liked }]);

    if (liked) {
      setLikedEntries((prev) => mergeLikedEntry(prev, currentProfile, false));
      void (async () => {
        const res = await sendLike(String(currentProfile.id));
        if (res.error) {
          console.warn("Like failed:", res.error);
          return;
        }
        if (res.data?.matched) {
          if (res.data.matchId) {
            if (!knownMatchIdsRef.current) knownMatchIdsRef.current = new Set();
            knownMatchIdsRef.current.add(res.data.matchId);
          }
          setMatchedProfile(currentProfile);
          setShowMatch(true);
        }
      })();
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    if (superLikeBurst || superLikeInFlightRef.current) return;

    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => prev - 1);
    if (lastAction.liked) {
      const pid = profileId(lastAction.profile);
      setLikedEntries((prev) => prev.filter((e) => profileId(e.profile) !== pid));
    }
  };

  const handleSuperLike = () => {
    if (currentIndex >= profiles.length) return;
    if (superLikeBurst || superLikeInFlightRef.current) return;
    if (!isPremium && superLikesRemaining <= 0) {
      setShowSuperLikeShop(true);
      return;
    }
    setSuperLikeComposeProfile(profiles[currentIndex]);
    setSuperLikeComposeOpen(true);
  };

  const confirmSuperLikeWithMessage = (note?: string) => {
    const currentProfile = superLikeComposeProfile;
    setSuperLikeComposeOpen(false);
    setSuperLikeComposeProfile(null);
    if (!currentProfile) return;
    if (currentIndex >= profiles.length) return;
    if (superLikeBurst || superLikeInFlightRef.current) return;

    superLikeInFlightRef.current = true;
    setSuperLikeBurst(true);

    const t0 = Date.now();
    void (async () => {
      const res = await sendSuperLike(String(currentProfile.id), { message: note });
      const wait = Math.max(0, 720 - (Date.now() - t0));
      await new Promise((r) => setTimeout(r, wait));

      if (res.error) {
        setSuperLikeBurst(false);
        superLikeInFlightRef.current = false;
        const msg = (res.error || "").toLowerCase();
        if (msg.includes("нет суперлайков") || msg.includes("купите") || msg.includes("подписк")) {
          setShowSuperLikeShop(true);
        } else {
          window.alert(res.error);
        }
        return;
      }

      const bal = res.data?.superLikesBalance;
      if (typeof bal === "number") setSuperLikesRemaining(bal);

      setLikedEntries((prev) => mergeLikedEntry(prev, currentProfile, true, note));
      setHistory((h) => [...h, { profile: currentProfile, liked: true, superLike: true }]);
      setCurrentIndex((i) => i + 1);
      setSuperLikeBurst(false);
      superLikeInFlightRef.current = false;
    })();
  };

  const handlePurchaseSuperLikes = (amount: number) => {
    setSuperLikesRemaining(prev => prev + amount);
  };

  const handleOpenChat = (params: OpenChatParams) => {
    setShowMatch(false);
    setMatchedProfile(null);
    setSelectedLikedProfile(null);

    if (!params.conversationId && !params.peerUserId) {
      alert(
        "Откройте чат из списка сообщений или из карточки в ленте — для переписки с сервером нужен контекст беседы."
      );
      return;
    }
    if (params.conversationId) {
      setChatSession({ ...params, conversationId: params.conversationId });
      setShowChat(true);
      return;
    }
    void (async () => {
      const r = await createConversation(params.peerUserId!);
      if (!r.data?.id) {
        alert(r.error || "Не удалось открыть чат");
        return;
      }
      setChatSession({ ...params, conversationId: r.data.id });
      setShowChat(true);
    })();
  };

  const handleOpenProfileFromLikes = (profile: UserProfile) => {
    setSelectedLikedProfile(profile);
    setShowLikes(false);
  };

  const refreshUnreadChats = useCallback(async () => {
    const convRes = await getConversations();
    if (convRes.data && !convRes.error) {
      setUnreadChatsCount(convRes.data.filter((c) => c.unread).length);
    }
  }, []);

  const handleLogout = () => {
    // Clear all authentication tokens and data
    tokenStorage.clearTokens();

    // Navigate to landing page
    navigate("/");
  };

  const currentProfile = profiles[currentIndex];
  const hasMoreProfiles = currentIndex < profiles.length;

  useEffect(() => {
    setScanEvents([]);
  }, []);

  /** Периодическая синхронизация мэтчей и уведомлений (взаимный лайк без перезагрузки). */
  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const POLL_MS = 4000;

    const runPoll = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      const [matchesRes, notifRes, convRes] = await Promise.all([
        getMatches(),
        getNotifications(),
        getConversations(),
      ]);
      if (cancelled) return;

      if (notifRes.data && !notifRes.error) {
        setHeaderUnreadNotifications(notifRes.data.filter((n) => !n.read).length);
      }
      if (convRes.data && !convRes.error) {
        setUnreadChatsCount(convRes.data.filter((c) => c.unread).length);
      }

      const list = matchesRes.error ? [] : (matchesRes.data ?? []);
      if (knownMatchIdsRef.current === null) {
        knownMatchIdsRef.current = new Set(list.map((m) => m.id));
        return;
      }

      const known = knownMatchIdsRef.current;
      let openedMatchModalThisPoll = false;
      for (const item of list) {
        if (known.has(item.id)) continue;
        known.add(item.id);
        const peer = mapApiProfileToUserProfile(item.peer);
        setLikedEntries((prev) => mergeLikedEntry(prev, peer, false));
        const canShowMatchModal =
          !openedMatchModalThisPoll &&
          !showMatchRef.current &&
          !showChatRef.current &&
          selectedLikedProfileRef.current === null;
        if (canShowMatchModal) {
          openedMatchModalThisPoll = true;
          setMatchedProfile(peer);
          setShowMatch(true);
        }
      }
    };

    void (async () => {
      const seed = await getMatches();
      if (cancelled) return;
      knownMatchIdsRef.current = new Set((seed.data ?? []).map((m) => m.id));
      const [n, convs] = await Promise.all([getNotifications(), getConversations()]);
      if (!cancelled && n.data) {
        setHeaderUnreadNotifications(n.data.filter((x) => !x.read).length);
      }
      if (!cancelled && convs.data) {
        setUnreadChatsCount(convs.data.filter((c) => c.unread).length);
      }
      intervalId = setInterval(() => void runPoll(), POLL_MS);
      void runPoll();
    })();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [authUser?.id]);

  return (
    <div className="size-full bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg safe-top">
        <div className="max-w-md mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-end justify-between">
          <div className="flex items-end gap-2 sm:gap-3 min-w-0">
            <img 
              src={matreshkaLogo} 
              alt="Матрешка" 
              className="size-9 sm:size-10 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
                Любить по-russки
              </h1>
            </div>
          </div>
          <div className="flex items-end gap-2 sm:gap-3 flex-shrink-0">
            {authUser &&
              ["admin", "moderator", "support"].includes(authUser.role ?? "") && (
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95 flex items-center justify-center"
                  onClick={() => navigate("/admin")}
                  title="Админ-панель"
                >
                  <Shield className="size-5 sm:size-6 text-amber-700" />
                </button>
              )}
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95 flex items-center justify-center"
              onClick={() => setShowProfile(true)}
            >
              <User className="size-5 sm:size-6 text-gray-600" />
            </button>
            <button
              type="button"
              title="Уведомления"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative active:scale-95 flex items-center justify-center"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="size-5 sm:size-6 text-gray-600" />
              {headerUnreadNotifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[8px] size-2 sm:min-w-[10px] sm:size-2.5 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-stretch justify-center p-2 sm:p-3 overflow-hidden min-h-0">
        <div className="w-full max-w-md flex flex-col gap-2 sm:gap-3">
          {hasMoreProfiles ? (
            <>
              {/* QR Share Button */}
              <div className="flex justify-end px-2">
                <button
                  onClick={() => setShowQR(true)}
                  className="px-4 py-2 bg-white shadow-lg rounded-full hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
                >
                  <QrCode className="size-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">QR</span>
                </button>
              </div>

              {/* Stack of cards */}
              <div className="relative w-full flex-1 min-h-0">
                {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => {
                  const absoluteIndex = currentIndex + index;
                  return (
                    <SwipeableCard
                      key={profile.id}
                      index={index}
                      dragEnabled={!superLikeBurst}
                      onSwipeLeft={() => index === 0 && handleSwipe(false)}
                      onSwipeRight={() => index === 0 && handleSwipe(true)}
                    >
                      <ProfileCard
                        profile={profile}
                        compatibility={compatibility[absoluteIndex] || 0}
                        superLikesRemaining={superLikesRemaining}
                        likesCount={likedEntries.length}
                        onOpenDetailedAnalysis={index === 0 ? () => {
                          setAnalysisProfile(profile);
                          if (isPremium || purchasedAnalyses.includes(profile.id) || hasUnlimitedAnalysis) {
                            setShowDetailedAnalysis(true);
                          } else {
                            setShowDetailedAnalysisPurchase(true);
                          }
                        } : undefined}
                      />
                    </SwipeableCard>
                  );
                })}
                <AnimatePresence>{superLikeBurst ? <SuperLikeBurstOverlay key="superlike-fx" /> : null}</AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 pb-1">
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
              </div>
            </>
          ) : (
            // No more profiles
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center px-4">
                <div className="bg-gradient-to-br from-red-500 to-amber-500 rounded-full p-6 sm:p-8 mx-auto w-fit mb-4 sm:mb-6">
                  <Heart className="size-12 sm:size-16 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Нет новых профилей
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Попробуйте вернуться позже
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProfiles((prev) => {
                      const likedIds = new Set(likedEntries.map((e) => profileId(e.profile)));
                      return prev.filter((p) => !likedIds.has(profileId(p)));
                    });
                    setCurrentIndex(0);
                    setHistory([]);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-full font-medium hover:shadow-lg transition-shadow active:scale-95"
                >
                  Начать заново
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatch && matchedProfile && (
          <MatchModal
            key="match-modal"
            profile={matchedProfile}
            compatibility={matchModalCompatibility}
            onClose={() => {
              setShowMatch(false);
              setMatchedProfile(null);
            }}
            onOpenChat={handleOpenChat}
            onRecommend={() => {
              setProfileToRecommend(matchedProfile);
              setShowRecommend(true);
            }}
            onDetailedAnalysisClick={() => {
              setAnalysisProfile(matchedProfile);
              
              // Check if analysis is already purchased for this profile or user has unlimited
              if (hasUnlimitedAnalysis || purchasedAnalyses.includes(matchedProfile.id)) {
                setShowDetailedAnalysis(true);
              } else {
                setShowDetailedAnalysisPurchase(true);
              }
            }}
          />
        )}
        
        {showNotifications && (
          <NotificationsModal 
            key="notifications-modal"
            onClose={() => setShowNotifications(false)} 
            onOpenChat={handleOpenChat}
            onMarkedAllRead={() => setHeaderUnreadNotifications(0)}
          />
        )}
        
        {showChats && (
          <ChatsList 
            key="chats-list-modal"
            onClose={() => {
              setShowChats(false);
              void refreshUnreadChats();
            }} 
            onOpenChat={handleOpenChat}
          />
        )}
        
        {showChat && chatSession && (
          <ChatModal 
            key="chat-modal"
            conversationId={chatSession.conversationId}
            onClose={() => {
              setShowChat(false);
              setChatSession(null);
              void refreshUnreadChats();
            }}
            userName={chatSession.userName}
            userAvatar={chatSession.userAvatar}
            prefilledMessage={chatSession.prefilledMessage}
            peerUserId={chatSession.peerUserId}
            peerLastSeenAt={chatSession.peerLastSeenAt}
          />
        )}
        
        {showQR && (
          <QRShareModal 
            key="qr-modal"
            onClose={() => setShowQR(false)}
          />
        )}
        
        {showLikes && (
          <LikesModal 
            key="likes-modal"
            onClose={() => setShowLikes(false)}
            likedEntries={likedEntries}
            onOpenProfile={handleOpenProfileFromLikes}
          />
        )}
        
        {selectedLikedProfile && (
          <MatchModal
            key="liked-profile-modal"
            profile={selectedLikedProfile}
            compatibility={compatibility[profiles.indexOf(selectedLikedProfile)] || 0}
            onClose={() => setSelectedLikedProfile(null)}
            onOpenChat={handleOpenChat}
            isMatch={false}
            onRecommend={() => {
              setProfileToRecommend(selectedLikedProfile);
              setShowRecommend(true);
              setSelectedLikedProfile(null);
            }}
            onDetailedAnalysisClick={() => {
              setAnalysisProfile(selectedLikedProfile);
              
              if (hasUnlimitedAnalysis || purchasedAnalyses.includes(selectedLikedProfile.id)) {
                setShowDetailedAnalysis(true);
              } else {
                setShowDetailedAnalysisPurchase(true);
              }
              setSelectedLikedProfile(null);
            }}
          />
        )}
        
        {showFavorites && (
          <Favorites 
            key="favorites-modal"
            onClose={() => setShowFavorites(false)}
          />
        )}
        
        {showSubscription && (
          <SubscriptionModal 
            key="subscription-modal"
            onClose={() => setShowSubscription(false)}
            remainingSuperLikes={superLikesRemaining}
          />
        )}
        
        {showSettings && (
          <SettingsModal 
            key="settings-modal"
            onClose={() => setShowSettings(false)}
          />
        )}

        {showProfile && (
          <ProfileSettingsModal
            key="profile-settings-modal"
            onClose={() => setShowProfile(false)}
            onOpenQR={() => {
              setShowProfile(false);
              setShowQR(true);
            }}
            onOpenSettings={() => {
              setShowProfile(false);
              setShowSettings(true);
            }}
            onLogout={handleLogout}
          />
        )}
        
        {showRecommend && profileToRecommend && (
          <RecommendModal
            key="recommend-modal"
            profileToRecommend={profileToRecommend}
            availableFriends={likedEntries.map((e) => e.profile)}
            onClose={() => {
              setShowRecommend(false);
              setProfileToRecommend(null);
            }}
          />
        )}

        {superLikeComposeOpen && superLikeComposeProfile ? (
          <SuperLikeComposeModal
            key="superlike-compose"
            open
            peerName={superLikeComposeProfile.name}
            peerPhoto={superLikeComposeProfile.photo}
            onClose={() => {
              setSuperLikeComposeOpen(false);
              setSuperLikeComposeProfile(null);
            }}
            onSend={confirmSuperLikeWithMessage}
          />
        ) : null}
        
        {showSuperLikeShop && (
          <SuperLikeShopModal 
            key="superlike-shop-modal"
            onClose={() => setShowSuperLikeShop(false)}
            currentAmount={superLikesRemaining}
            onPurchase={handlePurchaseSuperLikes}
          />
        )}
        
        {showDetailedAnalysis && analysisProfile && (
          <DetailedAnalysisModal 
            key="detailed-analysis-modal"
            onClose={() => {
              setShowDetailedAnalysis(false);
              setAnalysisProfile(null);
            }}
            profileName={analysisProfile.name}
            profileAge={analysisProfile.age}
            compatibility={compatibility[profiles.indexOf(analysisProfile)] || 0}
          />
        )}
        
        {showDetailedAnalysisPurchase && analysisProfile && (
          <DetailedAnalysisPurchaseModal 
            key="detailed-analysis-purchase-modal"
            onClose={() => {
              setShowDetailedAnalysisPurchase(false);
              setAnalysisProfile(null);
            }}
            onPurchase={(type) => {
              if (type === "unlimited") {
                setHasUnlimitedAnalysis(true);
              } else {
                setPurchasedAnalyses(prev => [...prev, analysisProfile.id]);
              }
              setShowDetailedAnalysisPurchase(false);
              setShowDetailedAnalysis(true);
            }}
            profileName={analysisProfile.name}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg safe-bottom">
        <div className="max-w-md mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-around">
          <button 
            className="relative p-2.5 sm:p-3 text-red-500 hover:text-red-600 transition-colors active:scale-95 flex items-center justify-center"
            onClick={() => setShowSuperLikeShop(true)}
          >
            <Flame className="size-7 sm:size-[34px]" />
            {!isPremium && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px] text-center flex items-center justify-center">
                {superLikesRemaining}
              </span>
            )}
          </button>
          <button 
            className="relative p-2.5 sm:p-3 text-gray-400 hover:text-amber-600 transition-colors active:scale-95 flex items-center justify-center"
            onClick={() => setShowFavorites(true)}
          >
            <Bookmark className="size-7 sm:size-[34px]" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px] text-center flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
          <button 
            className="p-2.5 sm:p-3 text-gray-400 hover:text-gray-600 transition-colors active:scale-95 flex items-center justify-center"
            onClick={() => setShowLikes(true)}
          >
            <Heart className="size-7 sm:size-[34px]" />
          </button>
          <button
            type="button"
            title="Сообщения"
            className="p-2.5 sm:p-3 text-gray-400 hover:text-gray-600 transition-colors relative active:scale-95 flex items-center justify-center"
            onClick={() => setShowChats(true)}
          >
            <MessageCircle className="size-7 sm:size-[34px]" />
            {unreadChatsCount > 0 && (
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>
          <button 
            className="p-2.5 sm:p-3 text-gray-400 hover:text-gray-600 transition-colors active:scale-95 flex items-center justify-center"
            onClick={() => setShowProfile(true)}
          >
            <User className="size-7 sm:size-[34px]" />
          </button>
        </div>
      </nav>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Scan Notifications */}
      <AnimatePresence mode="wait">
        {scanEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md">
              <ScanNotificationCard
                key={scanEvents[0].id}
                scanEvent={scanEvents[0]}
                onClose={() => {
                  setScanEvents(prev => prev.slice(1));
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}