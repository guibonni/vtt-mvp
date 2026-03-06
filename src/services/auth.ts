import { API_BASE_URL } from "@/src/config/api";
import { ApiError } from "@/src/services/api";

type AuthResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  token: string;
};

type ErrorPayload = {
  message?: string;
};

async function authRequest(path: string, body: Record<string, string>) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as AuthResponse | ErrorPayload;

  if (!response.ok) {
    const message = (payload as ErrorPayload).message ?? "Falha de autenticação";
    throw new ApiError(message, response.status);
  }

  return payload as AuthResponse;
}

export async function login(credentials: { email: string; password: string }) {
  return authRequest("/auth/login", credentials);
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  return authRequest("/auth/register", input);
}
