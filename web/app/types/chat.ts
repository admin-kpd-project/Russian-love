/** Payload when opening a chat from the UI (list, match, notifications). */
export interface OpenChatParams {
  userName: string;
  userAvatar: string;
  prefilledMessage?: string;
  /** Known conversation (e.g. from GET /api/conversations). */
  conversationId?: string;
  /** Other user's id when starting from feed/match — API will create or return conversation. */
  peerUserId?: string;
  /** ISO last activity of peer (from списка чатов или первого опроса). */
  peerLastSeenAt?: string | null;
}
