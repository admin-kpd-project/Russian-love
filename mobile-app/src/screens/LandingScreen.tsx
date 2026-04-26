import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Heart, Sparkles, Shield, MessageCircle, Zap, Globe, Download, ArrowRight, LogIn, UsersRound, Star } from "lucide-react-native";
import type { RootStackParamList } from "../navigation/types";
import { MatreshkaLogo } from "../components/MatreshkaLogo";
import { FadeInView, LoopingView, ScalePressable } from "../components/ui/Motion";
import { GradientButton } from "../components/ui/GradientButton";
import { GradientText } from "../components/ui/GradientText";
import { brandGradients } from "../theme/designTokens";

type Props = NativeStackScreenProps<RootStackParamList, "Landing">;

const features = [
  { Icon: Sparkles, title: "AI-алгоритм совместимости", description: "Умный искусственный интеллект анализирует интересы и характеры для расчета процента совместимости" },
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

const howSteps = [
  { title: "Создайте профиль", text: "Расскажите о себе и добавьте фото" },
  { title: "Смотрите совместимость", text: "AI подскажет, насколько вы подходите друг другу" },
  { title: "Начните общение", text: "Match открывает безопасный чат" },
];

export function LandingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={[...brandGradients.page]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
          <View style={styles.headerRow}>
            <MatreshkaLogo size={40} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.brand}>
                <Text style={{ color: "#dc2626" }}>Любить </Text>
                <Text style={{ color: "#d97706" }}>по-russки</Text>
              </Text>
              <Pressable onPress={() => Linking.openURL("https://forruss.ru")}>
                <Text style={styles.forruss}>forruss.ru</Text>
              </Pressable>
            </View>
            <View style={styles.headerBtns}>
              <ScalePressable style={styles.btnOutline} onPress={() => navigation.navigate("Register")}>
                <Text style={styles.btnOutlineT}>Регистрация</Text>
              </ScalePressable>
              <GradientButton
                title="Войти"
                onPress={() => navigation.navigate("Login")}
                left={<LogIn size={18} color="#fff" />}
                style={styles.headerLogin}
                textStyle={styles.headerLoginT}
              />
            </View>
          </View>
        </View>

        <FadeInView style={styles.hero}>
          <View style={styles.heroLogoWrap}>
            <LinearGradient colors={[...brandGradients.primary]} style={styles.heroGlow} />
            <MatreshkaLogo size={112} style={styles.heroLogoMat} variant="onGradient" />
          </View>
          <Text style={styles.heroTitle}>
            <Text style={{ color: "#dc2626" }}>Знакомства </Text>
            <Text style={{ color: "#b45309" }}>с русской душой</Text>
          </Text>
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
          />
          <GradientButton
            title="Войти"
            variant="light"
            onPress={() => navigation.navigate("Login")}
            left={<LogIn size={20} color="#44403c" />}
            style={styles.heroLogin}
            textStyle={styles.heroLoginT}
          />
          <ScalePressable style={styles.heroLink} onPress={() => Linking.openURL("https://forruss.ru")}>
            <Globe size={18} color="#57534e" />
            <Text style={styles.heroLinkT}>forruss.ru</Text>
          </ScalePressable>

          <View style={styles.mvpGrid}>
            {mvpHighlights.map((row, index) => (
              <FadeInView key={row.label} delay={180 + index * 90} style={styles.mvpCard}>
                <Text style={styles.mvpVal}>{row.value}</Text>
                <Text style={styles.mvpLab}>{row.label}</Text>
              </FadeInView>
            ))}
          </View>
        </FadeInView>

        <View style={styles.whiteSec}>
          <Text style={styles.secH}>Почему выбирают нас?</Text>
          <Text style={styles.secP}>Современные технологии встречаются с традиционными ценностями</Text>
          {features.map((f, index) => (
            <FadeInView key={f.title} delay={index * 70} style={styles.featCard}>
              <LinearGradient colors={[...brandGradients.primary]} style={styles.featIco}>
                <f.Icon size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.featTitle}>{f.title}</Text>
              <Text style={styles.featDesc}>{f.description}</Text>
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
            );})}
          </View>
        </LinearGradient>

        <View style={styles.simpleSec}>
          <Text style={styles.simpleH}>Просто, понятно, удобно</Text>
          <Text style={styles.simpleP}>Всё, что вам нужно для знакомств — в одном приложении</Text>
          {[
            { Icon: Sparkles, t: "Интуитивный интерфейс", d: "Не нужно читать инструкции — всё понятно с первого взгляда" },
            { Icon: Zap, t: "Быстрый старт", d: "Регистрация за пару минут — и вы уже смотрите профили" },
            { Icon: Heart, t: "Свайп-механика", d: "Знакомый жест влево или вправо — всё просто" },
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
          );})}
          <FadeInView delay={180} style={styles.phoneMock}>
            <LoopingView kind="pulse" style={styles.mockHeart}>
              <Heart size={38} color="#fff" fill="#fff" />
            </LoopingView>
            <Text style={styles.mockTitle}>95% совместимость</Text>
            <View style={styles.mockDots}>
              {[0, 1, 2].map((i) => (
                <FadeInView key={i} delay={220 + i * 90} style={styles.mockDot} />
              ))}
            </View>
          </FadeInView>
        </View>

        <View style={styles.howSec}>
          <Text style={styles.simpleH}>Как это работает?</Text>
          <Text style={styles.simpleP}>Три шага, как на веб-лендинге</Text>
          {[
            ["1", "Создайте профиль", "Добавьте фото, интересы и расскажите о себе"],
            ["2", "Получайте рекомендации", "AI подберёт людей с близкими ценностями"],
            ["3", "Общайтесь после match", "Пишите только тем, с кем есть взаимная симпатия"],
          ].map(([n, title, desc], index) => (
            <FadeInView key={n} delay={index * 90} style={styles.stepRow}>
              <LinearGradient colors={[...brandGradients.primary]} style={styles.stepNum}>
                <Text style={styles.stepNumT}>{n}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.simpleRowT}>{title}</Text>
                <Text style={styles.simpleRowD}>{desc}</Text>
              </View>
            </FadeInView>
          ))}
        </View>

        <LinearGradient colors={[...brandGradients.apk]} style={styles.apkSec}>
          <Text style={styles.simpleH}>Приложение для Android</Text>
          <Text style={styles.simpleP}>APK можно подключить через VITE_APP_DOWNLOAD_URL на вебе; в мобильной версии оставлен тот же промо-блок.</Text>
          <GradientButton
            title="Скачать APK"
            left={<Download size={20} color="#fff" />}
            right={<ArrowRight size={20} color="#fff" />}
            onPress={() => Linking.openURL("https://forruss.ru")}
            style={styles.heroCta}
          />
        </LinearGradient>

        <View style={styles.successSec}>
          <Text style={styles.simpleH}>Истории успеха</Text>
          <Text style={styles.simpleP}>MVP развивается: реальные истории появятся после первых стабильных матчей.</Text>
        </View>

        <LinearGradient colors={[...brandGradients.primary]} style={styles.ctaSec}>
          <Text style={styles.ctaH}>Готовы найти свою половинку?</Text>
          <Text style={styles.ctaP}>Начните знакомство с русской душой уже сейчас</Text>
          <GradientButton
            title="Начать знакомство"
            variant="light"
            onPress={() => navigation.navigate("Register")}
            right={<ArrowRight size={20} color="#292524" />}
            style={styles.heroLogin}
          />
        </LinearGradient>

        <View style={styles.footer}>
          <MatreshkaLogo size={42} variant="onGradient" />
          <Text style={styles.footerBrand}>Любить по-russки</Text>
          <Text style={styles.footerText}>forruss.ru · АО «КПД» · © 2025</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7ed" },
  header: {
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e7e5e4",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  brand: { fontSize: 17, fontWeight: "800" },
  forruss: { fontSize: 12, color: "#57534e", marginTop: 2 },
  headerBtns: { flexDirection: "row", gap: 8, marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" },
  btnOutline: {
    borderWidth: 2,
    borderColor: "#fecaca",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  btnOutlineT: { color: "#dc2626", fontWeight: "600", fontSize: 14 },
  btnGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  btnGradT: { color: "#fff", fontWeight: "700", fontSize: 14 },
  headerLogin: { minHeight: 42 },
  headerLoginT: { fontSize: 14 },
  hero: { paddingHorizontal: 16, paddingTop: 28, alignItems: "center" },
  heroLogoWrap: { width: 128, height: 128, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  heroGlow: { position: "absolute", width: 140, height: 140, borderRadius: 70, opacity: 0.25 },
  heroGlowSoft: { position: "absolute", width: 148, height: 148, borderRadius: 74, opacity: 0.2 },
  heroLogoMat: { borderWidth: 3, borderColor: "#fff" },
  heroTitle: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 12 },
  heroLead: { fontSize: 17, fontWeight: "600", color: "#292524", textAlign: "center", marginBottom: 8, maxWidth: 360 },
  heroSub: { fontSize: 15, color: "#57534e", textAlign: "center", marginBottom: 20, maxWidth: 340, lineHeight: 22 },
  heroCta: { width: "100%", maxWidth: 360, marginBottom: 10 },
  heroCtaIn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 999,
  },
  heroCtaT: { color: "#fff", fontWeight: "700", fontSize: 17 },
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
    borderColor: "#e7e5e4",
    marginBottom: 10,
  },
  heroLoginT: { color: "#292524", fontWeight: "600", fontSize: 17 },
  heroLink: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  heroLinkT: { color: "#57534e", fontWeight: "600", fontSize: 16 },
  mvpGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 24, width: "100%" },
  mvpCard: {
    width: "30%",
    minWidth: 100,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.35)",
    alignItems: "center",
  },
  mvpVal: { fontSize: 22, fontWeight: "800", marginBottom: 4, color: "#dc2626" },
  mvpLab: { fontSize: 11, color: "#57534e", textAlign: "center" },
  whiteSec: { backgroundColor: "#fff", paddingVertical: 36, paddingHorizontal: 16, marginTop: 8 },
  secH: { fontSize: 26, fontWeight: "800", color: "#171717", textAlign: "center", marginBottom: 10 },
  secP: { fontSize: 16, color: "#57534e", textAlign: "center", marginBottom: 24, maxWidth: 400, alignSelf: "center" },
  featCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  featIco: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  featTitle: { fontSize: 18, fontWeight: "800", color: "#171717", marginBottom: 6 },
  featDesc: { fontSize: 15, color: "#57534e", lineHeight: 22 },
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
  simpleP: { fontSize: 16, color: "#57534e", textAlign: "center", marginBottom: 22, maxWidth: 400, alignSelf: "center" },
  simpleRow: { flexDirection: "row", gap: 14, marginBottom: 18, alignItems: "flex-start" },
  simpleIco: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  simpleRowT: { fontSize: 17, fontWeight: "800", color: "#171717", marginBottom: 4 },
  simpleRowD: { fontSize: 15, color: "#57534e", lineHeight: 22 },
  phoneMock: {
    alignSelf: "center",
    width: "88%",
    maxWidth: 320,
    minHeight: 150,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 8,
  },
  mockHeart: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  mockTitle: { fontSize: 18, fontWeight: "900", color: "#dc2626" },
  mockDots: { flexDirection: "row", gap: 8, marginTop: 12 },
  mockDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#f59e0b" },
  howSec: { backgroundColor: "#fff", paddingVertical: 34, paddingHorizontal: 16, marginTop: 8 },
  stepRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  stepNum: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  stepNumT: { color: "#fff", fontSize: 18, fontWeight: "900" },
  apkSec: { paddingVertical: 34, paddingHorizontal: 16, marginTop: 8 },
  successSec: { backgroundColor: "#fff", paddingVertical: 34, paddingHorizontal: 16, marginTop: 8 },
  ctaSec: { margin: 16, borderRadius: 24, padding: 24, alignItems: "center" },
  ctaH: { color: "#fff", fontSize: 25, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  ctaP: { color: "rgba(255,255,255,0.92)", fontSize: 16, textAlign: "center", lineHeight: 23, marginBottom: 18 },
  footer: { backgroundColor: "#111827", alignItems: "center", paddingVertical: 30, paddingHorizontal: 16, gap: 8 },
  footerBrand: { color: "#fff", fontSize: 18, fontWeight: "900" },
  footerText: { color: "rgba(255,255,255,0.72)", fontSize: 12, textAlign: "center" },
});
