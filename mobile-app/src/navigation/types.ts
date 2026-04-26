export type RootStackParamList = {
  /** Первичная настройка: navigate("Server"); смена: navigate("Server", { reconfigure: true }) */
  Server: { reconfigure?: boolean } | undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Chat: { conversationId: string; title: string };
};
