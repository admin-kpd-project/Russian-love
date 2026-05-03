import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer, DefaultTheme, type Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { clearTokens, getAccessToken } from "./src/api/client";
import { isApiBaseConfigured } from "./src/api/apiBase";
import type { RootStackParamList } from "./src/navigation/types";
import { rootLinking } from "./src/navigation/linking";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { ServerConfigScreen } from "./src/screens/ServerConfigScreen";
import { LandingScreen } from "./src/screens/LandingScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { MainScreen } from "./src/screens/MainScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { ScanProfileScreen } from "./src/screens/ScanProfileScreen";
import { InviteScreen } from "./src/screens/InviteScreen";
import { PaymentConfirmScreen } from "./src/screens/PaymentConfirmScreen";
import { SupportScreen } from "./src/screens/SupportScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Не держать splash при зависании AsyncStorage на старых устройствах. */
const BOOTSTRAP_STORAGE_MS = 12_000;

const navTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "#fff8f5", card: "#fff8f5", text: "#1c1917" },
};

function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [initial, setInitial] = useState<"Server" | "Landing" | "Main">("Server");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ok = await Promise.race([
        isApiBaseConfigured(),
        new Promise<boolean | null>((resolve) => setTimeout(() => resolve(null), BOOTSTRAP_STORAGE_MS)),
      ]);
      if (cancelled) return;
      if (ok === null) {
        const t = await Promise.race([
          getAccessToken(),
          new Promise<string | null>((resolve) => setTimeout(() => resolve(null), 2_000)),
        ]);
        if (cancelled) return;
        setInitial(t ? "Main" : "Landing");
        setReady(true);
        return;
      }
      if (!ok) {
        await clearTokens();
        if (cancelled) return;
        setInitial("Server");
        setReady(true);
        return;
      }
      const t = await getAccessToken();
      if (cancelled) return;
      setInitial(t ? "Main" : "Landing");
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#b91c1c" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <NavigationContainer theme={navTheme} linking={rootLinking}>
          <Stack.Navigator
            initialRouteName={initial}
            screenOptions={{
              headerStyle: { backgroundColor: "#fef2f2" },
              headerTintColor: "#1c1917",
            }}
          >
            <Stack.Group>
              <Stack.Screen
                name="Server"
                component={ServerConfigScreen}
                options={({ route }) => {
                  const rec = Boolean((route.params as { reconfigure?: boolean } | undefined)?.reconfigure);
                  return {
                    title: "Адрес API",
                    headerBackVisible: rec,
                    gestureEnabled: rec,
                  };
                }}
              />
              <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            </Stack.Group>
            <Stack.Group
              screenOptions={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Любить по-russки" }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Регистрация" }} />
              <Stack.Screen name="ScanProfile" component={ScanProfileScreen} options={{ title: "Скан профиля" }} />
              <Stack.Screen name="Invite" component={InviteScreen} options={{ title: "Приглашение" }} />
              <Stack.Screen name="PaymentConfirm" component={PaymentConfirmScreen} options={{ title: "Оплата" }} />
              <Stack.Screen name="Support" component={SupportScreen} options={{ title: "Поддержка", headerShown: false }} />
            </Stack.Group>
          </Stack.Navigator>
        </NavigationContainer>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ boot: { flex: 1, justifyContent: "center" } });

export default App;
