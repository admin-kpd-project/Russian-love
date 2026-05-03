import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Heart,
  Sparkles,
  Shield,
  MessageCircle,
  Zap,
  Globe,
  Download,
  ArrowRight,
  LogIn,
  UsersRound,
  Star,
  Smartphone,
  TrendingUp,
} from "lucide-react-native";
import type { RootStackParamList } from "../navigation/types";
import { MatreshkaLogo } from "../components/MatreshkaLogo";
import { FadeInView, LoopingView, ScalePressable } from "../components/ui/Motion";
import { GradientButton } from "../components/ui/GradientButton";
import { GradientText } from "../components/ui/GradientText";
import { brandGradients, tw } from "../theme/designTokens";
import { getApiBaseUrl } from "../api/apiBase";
import { getPublicMobileApk } from "../api/publicApi";

type Props = NativeStackScreenProps<RootStackParamList, "Landing">;

const features = [
  {
    Icon: Sparkles,
    title: "AI-алгоритм совместимости",
    description: "Умный искусственный интеллект анализирует интересы и характеры для расчета процента совместимости",
  },
  { Icon: Heart, title: "Взаимные симпатии", description: "Свайп-механика и уведомления о match только при взаимной симпатии" },
  { Icon: MessageCircle, title: "Безопасные чаты", description: "Общайтесь только с теми, с кем произошел match" },
  { Icon: Shield, title: "Проверенные профили", description: "Модерация и верификация для безопасного знакомства" },
  { Icon: Zap, title: "Супер-лайки", description: "Гарантированное совпадение с особенными людьми" },
  { Icon: Globe, title: "Русская душа", description: "Специально для тех, кто ценит русские традиции и культуру" },
];

const mvpHighlights = [
  { value: "MVP", label: "Сервис в развитии" },
  { value: "AI", label: "Совместимость и аналитика" },
  { value: "24/7", label: "Доступ к приложению" },
];

const howStepsWeb = [
  {
    n: "1",
    title: "Создайте профиль",
    description: "Расскажите о себе, своих интересах и предпочтениях",
    Icon: UsersRound,
  },
  {
    n: "2",
    title: "Смотрите профили",
    description: "Свайпайте карточки и находите совместимых людей",
    Icon: Heart,
  },
  {
    n: "3",
    title: "Общайтесь",
    description: "При взаимной симпатии начинайте общение",
    Icon: MessageCircle,
  },
];

export function LandingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const [apkUrl, setApkUrl] = useState("");

  useEffect(() => {
    void (async () => {
      const base = await getApiBaseUrl();
      const defaultApkUrl = `${base}/api/public/mobile-apk/file`;
      try {
        const r = await getPublicMobileApk();
        const u = (r.data?.downloadUrl ?? "").trim();
        setApkUrl(u || defaultApkUrl);
      } catch {
        setApkUrl(defaultApkUrl);
      }
    })();
  }, []);

  const heroTitleW = Math.min(winW - 32, 340);
  const brandTitleW = Math.min(winW - 180, 200);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={[...brandGradients.page]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
          <View style={styles.headerRow}>
            <MatreshkaLogo size={40} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ alignSelf: "flex-start" }}>
                <GradientText text="Любить по-russки" width={brandTitleW} height={26} fontSize={17} fontWeight="800" />
              </View>
              <Pressable onPress={() => Linking.openURL("https://forruss.ru")}>
                <Text style={styles.forruss}>forruss.ru</Text>
              </Pressable>
            </View>
            <View style={styles.headerBtns}>
              {apkUrl ? (
                <Pressable
                  onPress={() => Linking.openURL(apkUrl)}
                  style={styles.apkHeaderBtn}
                  accessibilityLabel="Скачать приложение для Android (APK)"
                >
                  <Smartphone size={20} color="#dc2626" />
                  <Text style={styles.apkHeaderBtnT}>APK</Text>
                </Pressable>
              ) : null}
              <ScalePressable style={styles.btnOutline} onPress={() => navigation.navigate("Register")}>
                <Text style={styles.btnOutlineT}>Регистрация</Text>
              </ScalePressable>
              <GradientButton
                title="Войти"
                onPress={() => navigation.navigate("Login")}
                left={<LogIn size={18} color="#fff" />}
                style={styles.headerLogin}
                textStyle={styles.headerLoginT}
                textFontWeight="600"
              />
            </View>
          </View>
        </View>

        <FadeInView style={styles.hero}>
          <View style={styles.heroLogoWrap}>
            <LinearGradient colors={[...brandGradients.primary]} style={styles.heroGlow} />
            <MatreshkaLogo size={112} style={styles.heroLogoMat} variant="onGradient" />
          </View>
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <GradientText text="Знакомства" width={heroTitleW} height={34} fontSize={28} fontWeight="800" center />
            <GradientText text="с русской душой" width={heroTitleW} height={34} fontSize={28} fontWeight="800" center />
          </View>
          <Text style={styles.heroLead}>Уникальное приложение для знакомств с AI-алгоритмом расчёта совместимости</Text>
          <Text style={styles.heroSub}>
            Искусственный интеллект анализирует ваши интересы, характер и ценности, чтобы помочь найти подходящего партнёра
          </Text>
          <GradientButton
            title="Начать знакомство"
            onPress={() => navigation.navigate("Register")}
            left={<Download size={20} color="#fff" />}
            right={<ArrowRight size={20} color="#fff" />}
            style={styles.heroCta}
            textStyle={styles.heroCtaT}
            textFontWeight="600"
          />
          <GradientButton
            title="Войти"
            variant="light"
            onPress={() => navigation.navigate("Login")}
            left={<LogIn size={20} color="#44403c" />}
            style={styles.heroLogin}
            textStyle={styles.heroLoginT}
            textFontWeight="600"
          />
          <ScalePressable style={styles.heroLink} onPress={() => Linking.openURL("https://forruss.ru")}>
            <Globe size={18} color="#57534e" />
            <Text style={styles.heroLinkT}>forruss.ru</Text>
          </ScalePressable>

          <View style={styles.mvpGrid}>
            {mvpHighlights.map((row, index) => (
              <FadeInView key={row.label} delay={180 + index * 90} style={styles.mvpCard}>
                <GradientText
                  text={row.value}
                  width={Math.max(56, row.value.length * 14)}
                  height={30}
                  fontSize={22}
                  fontWeight="800"
                  center
                />
                <Text style={styles.mvpLab}>{row.label}</Text>
              </FadeInView>
            ))}
          </View>
        </FadeInView>

        <View style={styles.whiteSec}>
          <Text style={styles.secH}>Почему выбирают нас?</Text>
          <Text style={styles.secP}>Современные технологии встречаются с традиционными ценностями</Text>
          {features.map((f, index) => (
            <FadeInView key={f.title} delay={index * 70} style={styles.featCardWrap}>
              <LinearGradient colors={[...brandGradients.featureCard]} style={styles.featCard}>
                <LinearGradient colors={[...brandGradients.primary]} style={styles.featIco}>
                  <f.Icon size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.featTitle}>{f.title}</Text>
                <Text style={styles.featDesc}>{f.description}</Text>
              </LinearGradient>
            </FadeInView>
          ))}
        </View>

        <LinearGradient colors={[...brandGradients.primary]} style={styles.valuesSec}>
          <Text style={styles.valuesH}>Наши ценности</Text>
          <Text style={styles.valuesP}>Философия, на которой построено наше приложение</Text>
          <View style={styles.valCard}>
            <View style={styles.valIcoBg}>
              <UsersRound size={28} color="#dc2626" />
            </View>
            <Text style={styles.valTitle}>Люди — это наше богатство</Text>
            <Text style={styles.valTxt}>
              Мы верим, что каждый человек уникален и ценен. Наша миссия — помочь людям найти друг друга, создавая пространство для искренних знакомств и настоящих отношений.
            </Text>
            <Text style={[styles.valTxt, { marginTop: 12, opacity: 0.95 }]}>
              Мы не просто технологическая платформа. Мы создаём сообщество, где каждый может найти своё счастье, будучи самим собой.
            </Text>
          </View>
          <View style={styles.valCard}>
            <View style={styles.valIcoBg}>
              <Sparkles size={28} color="#d97706" />
            </View>
            <Text style={styles.valTitle}>Простота и понятность</Text>
            <Text style={styles.valTxt}>
              Технологии должны упрощать жизнь, а не усложнять её. Мы создали интуитивно понятное приложение, где каждая функция на своём месте.
            </Text>
            <Text style={[styles.valTxt, { marginTop: 12, opacity: 0.95 }]}>
              Никаких сложных настроек или запутанных меню. Просто скачайте приложение и начните знакомиться — всё остальное мы взяли на себя.
            </Text>
          </View>

          <View style={styles.valMiniRow}>
            {[
              { Icon: Shield, t: "Безопасность", d: "Защита данных и модерация контента — наш приоритет" },
              { Icon: Heart, t: "Искренность", d: "Мы за настоящие эмоции и честные отношения" },
              { Icon: Star, t: "Качество", d: "Внимание к деталям и забота о пользователях" },
            ].map((x) => {
              const Ico = x.Icon;
              return (
                <View key={x.t} style={styles.valMini}>
                  <View style={styles.valMiniIco}>
                    <Ico size={22} color="#dc2626" />
                  </View>
                  <Text style={styles.valMiniT}>{x.t}</Text>
                  <Text style={styles.valMiniD}>{x.d}</Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        <View style={styles.simpleSec}>
          <Text style={styles.simpleH}>Просто, понятно, удобно</Text>
          <Text style={styles.simpleP}>Всё, что вам нужно для знакомств — в одном приложении</Text>
          {[
            { Icon: Sparkles, t: "Интуитивный интерфейс", d: "Не нужно читать инструкции — всё понятно с первого взгляда" },
            { Icon: Zap, t: "Быстрый старт", d: "Регистрация за 2 минуты, и вы уже смотрите профили" },
            { Icon: Heart, t: "Свайп-механика", d: "Знакомый жест свайпа — влево или вправо, всё просто" },
            { Icon: MessageCircle, t: "Удобные чаты", d: "Общайтесь так же легко, как в любом мессенджере" },
          ].map((row) => {
            const RI = row.Icon;
            return (
              <View key={row.t} style={styles.simpleRow}>
                <LinearGradient colors={[...brandGradients.primary]} style={styles.simpleIco}>
                  <RI size={22} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.simpleRowT}>{row.t}</Text>
                  <Text style={styles.simpleRowD}>{row.d}</Text>
                </View>
              </View>
            );
          })}
          <FadeInView delay={180} style={styles.phoneMockOuter}>
            <LinearGradient colors={[...brandGradients.featureCard]} style={styles.phoneMockGrad}>
              <View style={styles.phoneMockInner}>
                <LoopingView kind="pulse" style={styles.mockHeartPulse}>
                  <LinearGradient colors={[...brandGradients.primary]} style={styles.mockHeart}>
                    <Heart size={32} color="#fff" fill="#fff" />
                  </LinearGradient>
                </LoopingView>
                <GradientText text="3" width={56} height={52} fontSize={44} fontWeight="800" center />
                <Text style={styles.mockSub}>Простых шага{"\n"}до знакомства</Text>
                <View style={styles.mockDots}>
                  {[0, 1, 2].map((i) => (
                    <LinearGradient
                      key={i}
                      colors={[...brandGradients.primary]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.mockDot}
                    />
                  ))}
                </View>
              </View>
            </LinearGradient>
          </FadeInView>
        </View>

        <View style={styles.howSec}>
          <Text style={styles.simpleH}>Как это работает?</Text>
          <Text style={styles.simpleP}>Три простых шага к счастью</Text>
          {howStepsWeb.map((step, index) => {
            const Ico = step.Icon;
            return (
              <FadeInView key={step.n} delay={index * 100} style={styles.howCard}>
                <View style={styles.howIconWrap}>
                  <LinearGradient colors={[...brandGradients.primary]} style={styles.howIconCircle}>
                    <Ico size={28} color="#fff" />
                  </LinearGradient>
                  <View style={styles.howNumBadge}>
                    <Text style={styles.howNumBadgeT}>{step.n}</Text>
                  </View>
                </View>
                <Text style={styles.howCardTitle}>{step.title}</Text>
                <Text style={styles.howCardDesc}>{step.description}</Text>
              </FadeInView>
            );
          })}
        </View>

        <LinearGradient colors={["rgba(255, 251, 235, 0.95)", "#ffffff"]} style={styles.apkSecOuter}>
          <View style={styles.apkCard}>
            <View style={styles.apkTitleRow}>
              <Download size={22} color="#dc2626" />
              <Text style={styles.apkTitle}>Приложение для Android</Text>
            </View>
            {apkUrl ? (
              <>
                <Text style={styles.apkBody}>
                  Скачайте APK-файл и установите приложение вручную (для теста и дистрибуции вне Google Play).
                </Text>
                <GradientButton
                  title="Скачать APK"
                  left={<Download size={20} color="#fff" />}
                  onPress={() => Linking.openURL(apkUrl)}
                  style={styles.heroCta}
                  textFontWeight="500"
                />
                <Text style={styles.apkFine}>
                  Установка из неизвестного источника: в настройках Android разрешите установку для браузера или проводника, с
                  которого открываете файл. Скачивайте APK только с доверенного адреса; при появлении публикации в магазине ссылка
                  может быть обновлена.
                </Text>
              </>
            ) : (
              <Text style={styles.apkSoon}>
                Скоро: прямая ссылка на APK и, при публикации, магазин Google Play. Следите за обновлениями на{" "}
                <Text style={styles.apkSoonLink} onPress={() => Linking.openURL("https://forruss.ru")}>
                  forruss.ru
                </Text>
                .
              </Text>
            )}
          </View>
        </LinearGradient>

        <View style={styles.successSec}>
          <Text style={styles.simpleH}>Истории успеха</Text>
          <Text style={styles.successBody}>
            Мы в режиме MVP: раздел с реальными отзывами и историями появится позже. Сейчас приоритет — стабильность, безопасность
            и честные знакомства.
          </Text>
        </View>

        <LinearGradient colors={[...brandGradients.primary]} style={styles.ctaSec}>
          <TrendingUp size={56} color="#fff" style={{ marginBottom: 16 }} />
          <Text style={styles.ctaH}>Готовы найти свою половинку?</Text>
          <Text style={styles.ctaP}>Создайте аккаунт или войдите — и пройдите настройку профиля, чтобы увидеть ленту</Text>
          <GradientButton
            title="Начать сейчас"
            variant="light"
            onPress={() => navigation.navigate("Register")}
            left={<Download size={20} color="#dc2626" />}
            style={styles.ctaWhiteBtn}
            textStyle={styles.ctaWhiteBtnT}
            textFontWeight="500"
          />
          <Pressable
            style={styles.ctaGhostBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <LogIn size={20} color="#fff" />
            <Text style={styles.ctaGhostBtnT}>Войти</Text>
          </Pressable>
          <Pressable style={styles.ctaGlobeBtn} onPress={() => Linking.openURL("https://forruss.ru")}>
            <Globe size={20} color="rgba(255,255,255,0.95)" />
            <Text style={styles.ctaGlobeBtnT}>forruss.ru</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.footer}>
          <View style={styles.footerBrandRow}>
            <MatreshkaLogo size={40} variant="onGradient" />
            <Text style={styles.footerBrand}>Любить по-russки</Text>
          </View>
          <Text style={styles.footerTag}>Знакомства с искусственным интеллектом и русской душой</Text>

          <Text style={styles.footerColH}>Продукт</Text>
          <FooterLink label="Регистрация" onPress={() => navigation.navigate("Register")} />
          <FooterLink label="Тарифы" href="https://forruss.ru" />
          <FooterLink label="Вход" onPress={() => navigation.navigate("Login")} />

          <Text style={[styles.footerColH, { marginTop: 16 }]}>Компания</Text>
          <FooterLink label="О нас" href="https://forruss.ru" />
          <FooterLink label="Блог" href="https://forruss.ru" />
          <FooterLink label="Контакты" href="https://forruss.ru" />

          <Text style={[styles.footerColH, { marginTop: 16 }]}>Документы</Text>
          <FooterLink label="Политика обработки персональных данных" href="https://forruss.ru" />
          <FooterLink label="Согласие на обработку персональных данных" href="https://forruss.ru" />
          <FooterLink label="Руководство пользователя" href="https://forruss.ru" />
          <FooterLink label="Описание функциональных характеристик" href="https://forruss.ru" />
          <FooterLink label="Материалы для инвестора" href="https://forruss.ru" />

          <View style={styles.footerRule} />
          <Text style={styles.footerLegal}>
            <Text style={styles.footerLegalStrong}>АО «КПД»</Text> • Основная деятельность: Разработка компьютерного программного
            обеспечения [62.01]
          </Text>
          <Text style={styles.footerLegal}>
            Юридический адрес: 107497, город Москва, Монтажная ул, д. 9 стр. 1, помещ. 6/2 • ОГРН: 1257700237453
          </Text>
          <View style={styles.footerRule} />
          <Text style={styles.footerCopy}>© 2025 г. АО «КПД». Все права защищены и охраняются законом.</Text>
          <Pressable style={styles.footerGlobeRow} onPress={() => Linking.openURL("https://forruss.ru")}>
            <Globe size={16} color="rgba(255,255,255,0.65)" />
            <Text style={styles.footerGlobeT}>forruss.ru</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function FooterLink({ label, href, onPress }: { label: string; href?: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={() => {
        if (onPress) onPress();
        else if (href) void Linking.openURL(href);
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={styles.footerLink}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tw.toYellow50 },
  header: {
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: tw.stone200,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  forruss: { fontSize: 12, color: tw.stone600, marginTop: 2 },
  headerBtns: { flexDirection: "row", gap: 8, marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" },
  apkHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#fde68a",
    backgroundColor: "#fff",
  },
  apkHeaderBtnT: { fontSize: 13, fontWeight: "700", color: "#dc2626" },
  btnOutline: {
    borderWidth: 2,
    borderColor: tw.red200,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  btnOutlineT: { color: "#dc2626", fontWeight: "600", fontSize: 14 },
  headerLogin: { minHeight: 42 },
  headerLoginT: { fontSize: 14 },
  hero: { paddingHorizontal: 16, paddingTop: 28, alignItems: "center" },
  heroLogoWrap: { width: 128, height: 128, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  heroGlow: { position: "absolute", width: 140, height: 140, borderRadius: 70, opacity: 0.25 },
  heroLogoMat: { borderWidth: 3, borderColor: "#fff" },
  heroLead: { fontSize: 17, fontWeight: "600", color: tw.stone800, textAlign: "center", marginBottom: 8, maxWidth: 360 },
  heroSub: { fontSize: 15, color: tw.stone600, textAlign: "center", marginBottom: 20, maxWidth: 340, lineHeight: 22 },
  heroCta: { width: "100%", maxWidth: 360, marginBottom: 10 },
  heroCtaT: { color: "#fff", fontSize: 17 },
  heroLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    maxWidth: 360,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: tw.stone200,
    marginBottom: 10,
  },
  heroLoginT: { color: tw.stone800, fontSize: 17 },
  heroLink: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  heroLinkT: { color: tw.stone600, fontWeight: "600", fontSize: 16 },
  mvpGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 24, width: "100%" },
  mvpCard: {
    width: "30%",
    minWidth: 100,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.8)",
    alignItems: "center",
  },
  mvpLab: { fontSize: 11, color: tw.gray600, textAlign: "center", marginTop: 4 },
  whiteSec: { backgroundColor: "#fff", paddingVertical: 36, paddingHorizontal: 16, marginTop: 8 },
  secH: { fontSize: 26, fontWeight: "800", color: "#171717", textAlign: "center", marginBottom: 10 },
  secP: { fontSize: 16, color: tw.stone600, textAlign: "center", marginBottom: 24, maxWidth: 400, alignSelf: "center" },
  featCardWrap: { marginBottom: 14, borderRadius: 16, overflow: "hidden" },
  featCard: { borderRadius: 16, padding: 18 },
  featIco: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  featTitle: { fontSize: 18, fontWeight: "800", color: "#171717", marginBottom: 6 },
  featDesc: { fontSize: 15, color: tw.stone600, lineHeight: 22 },
  valuesSec: { paddingVertical: 36, paddingHorizontal: 16, marginTop: 8 },
  valuesH: { fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8 },
  valuesP: { fontSize: 16, color: "rgba(255,255,255,0.92)", textAlign: "center", marginBottom: 24 },
  valCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.22)",
  },
  valIcoBg: { width: 56, height: 56, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  valTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 10 },
  valTxt: { fontSize: 16, color: "rgba(255,255,255,0.92)", lineHeight: 24 },
  valMiniRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 8 },
  valMini: {
    width: "30%",
    minWidth: 104,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
  },
  valMiniIco: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  valMiniT: { fontSize: 15, fontWeight: "800", color: "#fff", marginBottom: 4, textAlign: "center" },
  valMiniD: { fontSize: 11, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 15 },
  simpleSec: { backgroundColor: "#fff", paddingVertical: 32, paddingHorizontal: 16, marginTop: 8 },
  simpleH: { fontSize: 24, fontWeight: "800", color: "#171717", textAlign: "center", marginBottom: 8 },
  simpleP: { fontSize: 16, color: tw.stone600, textAlign: "center", marginBottom: 22, maxWidth: 400, alignSelf: "center" },
  simpleRow: { flexDirection: "row", gap: 14, marginBottom: 18, alignItems: "flex-start" },
  simpleIco: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  simpleRowT: { fontSize: 17, fontWeight: "800", color: "#171717", marginBottom: 4 },
  simpleRowD: { fontSize: 15, color: tw.stone600, lineHeight: 22 },
  phoneMockOuter: { alignSelf: "center", width: "100%", maxWidth: 360, marginTop: 16 },
  phoneMockGrad: { borderRadius: 24, padding: 20 },
  phoneMockInner: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  mockHeartPulse: { marginBottom: 10 },
  mockHeart: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  mockSub: { fontSize: 14, fontWeight: "600", color: tw.stone600, textAlign: "center", marginTop: 4, lineHeight: 20 },
  mockDots: { flexDirection: "row", gap: 8, marginTop: 14 },
  mockDot: { width: 10, height: 10, borderRadius: 5 },
  howSec: { backgroundColor: "#fff", paddingVertical: 34, paddingHorizontal: 16, marginTop: 8 },
  howCard: { alignItems: "center", marginBottom: 28 },
  howIconWrap: { width: 88, height: 88, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  howIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  howNumBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  howNumBadgeT: { fontSize: 18, fontWeight: "800", color: "#dc2626" },
  howCardTitle: { fontSize: 18, fontWeight: "800", color: "#171717", marginBottom: 6, textAlign: "center" },
  howCardDesc: { fontSize: 15, color: tw.stone600, textAlign: "center", lineHeight: 22, maxWidth: 320 },
  apkSecOuter: { paddingVertical: 36, paddingHorizontal: 16, marginTop: 8 },
  apkCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(253, 230, 138, 0.8)",
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: 22,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  apkTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  apkTitle: { fontSize: 22, fontWeight: "800", color: "#171717", textAlign: "center", flexShrink: 1 },
  apkBody: { fontSize: 15, color: tw.gray700, textAlign: "center", marginBottom: 16, lineHeight: 22 },
  apkFine: { fontSize: 11, color: tw.gray600, lineHeight: 16, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#fef3c7" },
  apkSoon: { fontSize: 15, color: tw.stone600, textAlign: "center", lineHeight: 22 },
  apkSoonLink: { color: "#dc2626", fontWeight: "600" },
  successSec: { backgroundColor: "#fff", paddingVertical: 34, paddingHorizontal: 16, marginTop: 8 },
  successBody: { fontSize: 16, color: tw.stone600, textAlign: "center", lineHeight: 24, maxWidth: 520, alignSelf: "center" },
  ctaSec: { margin: 16, borderRadius: 24, padding: 28, alignItems: "center", ...Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24 },
    android: { elevation: 12 },
  }) },
  ctaH: { color: "#fff", fontSize: 26, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  ctaP: { color: "rgba(255,255,255,0.92)", fontSize: 16, textAlign: "center", lineHeight: 23, marginBottom: 18 },
  ctaWhiteBtn: { width: "100%", maxWidth: 340, marginBottom: 10, borderWidth: 0 },
  ctaWhiteBtnT: { color: "#dc2626", fontSize: 17 },
  ctaGhostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    maxWidth: 340,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 10,
  },
  ctaGhostBtnT: { color: "#fff", fontSize: 17, fontWeight: "500" },
  ctaGlobeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    maxWidth: 340,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  ctaGlobeBtnT: { color: "rgba(255,255,255,0.95)", fontSize: 17, fontWeight: "500" },
  footer: { backgroundColor: tw.gray900, paddingVertical: 36, paddingHorizontal: 20 },
  footerBrandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  footerBrand: { color: "#fff", fontSize: 18, fontWeight: "800" },
  footerTag: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 20, marginBottom: 20 },
  footerColH: { color: "#fff", fontWeight: "800", fontSize: 15, marginBottom: 8 },
  footerLink: { color: "rgba(255,255,255,0.55)", fontSize: 14, paddingVertical: 6 },
  footerRule: { height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginVertical: 16 },
  footerLegal: { color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 18, marginBottom: 8 },
  footerLegalStrong: { fontWeight: "700", color: "#fff" },
  footerCopy: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 4 },
  footerGlobeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  footerGlobeT: { color: "rgba(255,255,255,0.55)", fontSize: 13 },
});
