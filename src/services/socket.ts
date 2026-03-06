import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/src/config/api";
import { Message } from "@/src/models/chat";
import { getAuthToken, getAuthUserId, getAuthUserName } from "@/src/services/api";

type BackendSocketMessage = {
  id: string;
  content: string;
  type: "TEXT" | "DICE" | "SYSTEM";
  diceData?: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string | number;
    name: string;
  };
  userId?: string | number;
  userName?: string;
};

let socket: Socket | null = null;

function getSocket() {
  if (socket) return socket;

  socket = io(API_BASE_URL, {
    transports: ["websocket"],
    auth: {
      token: getAuthToken(),
    },
  });

  return socket;
}

function isBackendSocketMessage(value: unknown): value is BackendSocketMessage {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<BackendSocketMessage>;

  return (
    typeof payload.id === "string" &&
    typeof payload.content === "string" &&
    typeof payload.type === "string" &&
    typeof payload.createdAt === "string"
  );
}

function toNullableString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "bigint") return String(value);
  if (value && typeof value === "object") {
    const asString = String(value);
    if (asString && asString !== "[object Object]") return asString;
  }
  return null;
}

function toRealtimeMessage(payload: BackendSocketMessage): Message | null {
  const fallbackAuthor = getAuthUserName() ?? "Voce";
  const fallbackAuthorId = getAuthUserId();
  const author = payload.user?.name ?? payload.userName ?? fallbackAuthor;
  const mappedAuthorId = toNullableString(payload.user?.id ?? payload.userId);
  const authorId = mappedAuthorId ?? (author === fallbackAuthor ? fallbackAuthorId : null);
  const rollData = payload.diceData as Message["rollData"] | null | undefined;
  const isRoll = payload.type === "DICE" && !!rollData;

  return {
    id: payload.id,
    authorId,
    author,
    type: isRoll ? "roll" : "text",
    content: isRoll ? undefined : payload.content,
    rollData: isRoll ? rollData : undefined,
    createdAt: new Date(payload.createdAt),
  };
}

export function useSessionSocket(
  sessionId: string,
  onNewMessage: (message: Message) => void
) {
  useEffect(() => {
    if (!sessionId) return;

    const currentSocket = getSocket();

    const joinCurrentSession = () => {
      currentSocket.emit("join-session", sessionId);
    };

    const handleNewMessage = (rawPayload: unknown) => {
      const payload =
        isBackendSocketMessage(rawPayload) ? rawPayload : (rawPayload as { message?: unknown })?.message;

      if (!isBackendSocketMessage(payload)) return;

      const message = toRealtimeMessage(payload);
      if (!message) return;
      onNewMessage(message);
    };

    currentSocket.on("connect", joinCurrentSession);
    currentSocket.on("new-message", handleNewMessage);

    if (currentSocket.connected) {
      joinCurrentSession();
    }

    return () => {
      currentSocket.emit("leave-session", sessionId);
      currentSocket.off("new-message", handleNewMessage);
      currentSocket.off("connect", joinCurrentSession);
    };
  }, [sessionId, onNewMessage]);
}
