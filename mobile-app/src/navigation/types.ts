export type RootStackParamList = {
  /** Первичная настройка: navigate("Server"); смена: navigate("Server", { reconfigure: true }) */
  Server: { reconfigure?: boolean } | undefined;
  /** Лендинг как на веб «/» */
  Landing: undefined;
  Login: undefined;
  Register: { inviterId?: string } | undefined;
  Main: undefined;
  Chat: {
    conversationId: string;
    title: string;
    avatarUrl?: string;
    prefilledMessage?: string;
    peerUserId?: string;
    peerLastSeenAt?: string | null;
  };
  Support: undefined;
  /** Диплинк как /scan/:userId */
  ScanProfile: { userId: string };
  /** Диплинк как /invite/:inviterId */
  Invite: { inviterId: string };
  /** Диплинк как /payment/confirm?orderId= */
  PaymentConfirm: { orderId?: string } | undefined;
};
