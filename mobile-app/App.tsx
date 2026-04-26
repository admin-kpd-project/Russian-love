import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer, DefaultTheme, type Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { clearTokens, getAccessToken } from "./src/api/client";
import { isApiBaseConfigured } from "./src/api/apiBase";
import type { RootStackParamList } from "./src/navigation/types";
import { ServerConfigScreen } from "./src/screens/ServerConfigScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { MainScreen } from "./src/screens/MainScreen";
import { ChatScreen } from "./src/screens/ChatScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "#fff8f5", card: "#fff8f5", text: "#1c1917" },
};

function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);
  const [initial, setInitial] = useState<"Server" | "Login" | "Main">("Server");

  useEffect(() => {
    void (async () => {
      const ok = await isApiBaseConfigured();
      if (!ok) {
        await clearTokens();
        setInitial("Server");
        setReady(true);
        return;
      }
      const t = await getAccessToken();
      setInitial(t ? "Main" : "Login");
      setReady(true);
    })();
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
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName={initial}
          screenOptions={{
            headerStyle: { backgroundColor: "#fef2f2" },
            headerTintColor: "#1c1917",
          }}
        >
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
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Любить по-russки" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Регистрация" }} />
          <Stack.Screen name="Main" component={MainScreen} options={{ title: "Главная", headerBackVisible: false }} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ boot: { flex: 1, justifyContent: "center" } });

export default App;
