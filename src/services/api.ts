import { API_BASE_URL } from "@/src/config/api";
import { Message } from "@/src/models/chat";
import { Character } from "@/src/models/character";
import { DiceResult } from "@/src/utils/dice";

const AUTH_COOKIE_NAME = "auth_token";
const USER_NAME_COOKIE_NAME = "auth_user_name";
const USER_ID_COOKIE_NAME = "auth_user_id";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
};

type ErrorPayload = {
  message?: string;
};

type BackendSessionListItem = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
};

type BackendSession = {
  id: string;
  name: string;
  createdAt: string;
  createdById: string;
};

type BackendCharacterListItem = {
  id: string;
  name: string;
  template: string;
  data: Record<string, unknown>;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
};

type BackendCharacter = {
  id: string;
  name: string;
  template: string;
  data: Record<string, unknown>;
  createdAt: string;
  userId: string;
  sessionId: string;
};

type BackendMessage = {
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

export type SessionSummary = {
  id: string;
  name: string;
  gm: string;
  createdAt: Date;
};

export type SessionDetails = {
  id: string;
  name: string;
  createdAt: Date;
  createdById: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE_SECONDS) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function getAuthToken() {
  return getCookie(AUTH_COOKIE_NAME);
}

export function getAuthUserName() {
  return getCookie(USER_NAME_COOKIE_NAME);
}

export function getAuthUserId() {
  const userIdFromCookie = getCookie(USER_ID_COOKIE_NAME);
  if (userIdFromCookie) return userIdFromCookie;

  const token = getAuthToken();
  if (!token || typeof window === "undefined") return null;

  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return null;

    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(window.atob(padded)) as Record<string, unknown>;

    return toNullableString(payload.sub ?? payload.userId ?? payload.id);
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, userName?: string, userId?: string) {
  setCookie(AUTH_COOKIE_NAME, token);
  if (userName) {
    setCookie(USER_NAME_COOKIE_NAME, userName);
  }
  if (userId) {
    setCookie(USER_ID_COOKIE_NAME, userId);
  }
}

export function clearAuthSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${USER_NAME_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${USER_ID_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token ?? getAuthToken();
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (payload as ErrorPayload | null)?.message ??
      `Falha na requisição (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

function mapSessionSummary(session: BackendSessionListItem): SessionSummary {
  return {
    id: session.id,
    name: session.name,
    gm: session.createdBy.name,
    createdAt: new Date(session.createdAt),
  };
}

function mapSessionDetails(session: BackendSession): SessionDetails {
  return {
    id: session.id,
    name: session.name,
    createdAt: new Date(session.createdAt),
    createdById: session.createdById,
  };
}

function mapCharacter(
  character: BackendCharacter | BackendCharacterListItem,
  fallbackOwner: string
): Character {
  return {
    id: character.id,
    name: character.name,
    templateId: character.template,
    values: character.data ?? {},
    owner: "user" in character && character.user ? character.user.name : fallbackOwner,
    createdAt: new Date(character.createdAt),
  };
}

function toDiceResult(data: Record<string, unknown> | null | undefined): DiceResult | null {
  if (!data) return null;

  const expression = typeof data.expression === "string" ? data.expression : null;
  const rolls = Array.isArray(data.rolls)
    ? data.rolls.filter((value): value is number => typeof value === "number")
    : null;
  const modifier = typeof data.modifier === "number" ? data.modifier : null;
  const total = typeof data.total === "number" ? data.total : null;

  if (!expression || !rolls || modifier === null || total === null) {
    return null;
  }

  return {
    expression,
    rolls,
    modifier,
    total,
  };
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

function mapMessage(
  message: BackendMessage,
  fallbackAuthor: string,
  fallbackAuthorId: string | null
): Message {
  const mappedAuthorId = toNullableString(message.user?.id ?? message.userId);
  const author = message.user?.name ?? message.userName ?? fallbackAuthor;
  const authorId =
    mappedAuthorId ?? (author === fallbackAuthor ? fallbackAuthorId : null);
  const rollData = toDiceResult(message.diceData);
  const isRoll = message.type === "DICE" && !!rollData;

  return {
    id: message.id,
    authorId,
    author,
    type: isRoll ? "roll" : "text",
    content: isRoll ? undefined : message.content,
    rollData: isRoll ? rollData : undefined,
    createdAt: new Date(message.createdAt),
  };
}

export async function listSessions() {
  const sessions = await apiRequest<BackendSessionListItem[]>("/sessions");
  return sessions.map(mapSessionSummary);
}

export async function createSession(input: { name: string; password?: string }) {
  const session = await apiRequest<BackendSession>("/sessions", {
    method: "POST",
    body: {
      name: input.name,
      password: input.password?.trim() || undefined,
    },
  });

  const currentUser = getAuthUserName() ?? "Voce";

  return {
    id: session.id,
    name: session.name,
    gm: currentUser,
    createdAt: new Date(session.createdAt),
  } satisfies SessionSummary;
}

export async function joinSession(input: { sessionId: string; password?: string }) {
  await apiRequest("/sessions/join", {
    method: "POST",
    body: {
      sessionId: input.sessionId,
      password: input.password?.trim() || undefined,
    },
  });
}

export async function getSession(sessionId: string) {
  const session = await apiRequest<BackendSession>(`/sessions/${sessionId}`);
  return mapSessionDetails(session);
}

export async function listCharacters(sessionId: string) {
  const currentUser = getAuthUserName() ?? "Voce";
  const characters = await apiRequest<BackendCharacterListItem[]>(
    `/sessions/${sessionId}/characters`
  );
  return characters.map((character) => mapCharacter(character, currentUser));
}

export async function createCharacter(
  sessionId: string,
  input: { name: string; template: string; data: Record<string, unknown> }
) {
  const currentUser = getAuthUserName() ?? "Voce";
  const character = await apiRequest<BackendCharacter>(
    `/sessions/${sessionId}/characters`,
    {
      method: "POST",
      body: input,
    }
  );

  return mapCharacter(character, currentUser);
}

export async function updateCharacter(
  sessionId: string,
  characterId: string,
  input: { data: Record<string, unknown> }
) {
  const currentUser = getAuthUserName() ?? "Voce";
  const character = await apiRequest<BackendCharacter>(
    `/sessions/${sessionId}/characters/${characterId}`,
    {
      method: "PUT",
      body: input,
    }
  );

  return mapCharacter(character, currentUser);
}

export async function removeCharacter(sessionId: string, characterId: string) {
  await apiRequest(`/sessions/${sessionId}/characters/${characterId}`, {
    method: "DELETE",
  });
}

export async function listMessages(sessionId: string) {
  const currentUser = getAuthUserName() ?? "Voce";
  const currentUserId = getAuthUserId();
  const messages = await apiRequest<BackendMessage[]>(`/sessions/${sessionId}/messages`);
  return messages.map((message) => mapMessage(message, currentUser, currentUserId));
}

export async function sendTextMessage(sessionId: string, content: string) {
  const currentUser = getAuthUserName() ?? "Voce";
  const currentUserId = getAuthUserId();
  const message = await apiRequest<BackendMessage>(`/sessions/${sessionId}/messages`, {
    method: "POST",
    body: {
      content,
      type: "TEXT",
    },
  });

  return mapMessage(message, currentUser, currentUserId);
}

export async function sendRollMessage(sessionId: string, result: DiceResult) {
  const currentUser = getAuthUserName() ?? "Voce";
  const currentUserId = getAuthUserId();
  const message = await apiRequest<BackendMessage>(`/sessions/${sessionId}/messages`, {
    method: "POST",
    body: {
      content: `Rolando ${result.expression}`,
      type: "DICE",
      diceData: result,
    },
  });

  return mapMessage(message, currentUser, currentUserId);
}
