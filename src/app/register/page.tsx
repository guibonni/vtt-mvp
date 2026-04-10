"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { register, verifyRegister } from "@/src/services/auth";
import { ApiError, setAuthSession } from "@/src/services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"register" | "verify">("register");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!name.trim()) {
      setError("O nome e obrigatorio.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setStep("verify");
      setCode("");
      setInfoMessage(
        response.message ?? "Enviamos um codigo de verificacao para o seu e-mail."
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel iniciar o cadastro.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!code.trim()) {
      setError("Informe o codigo de verificacao.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyRegister({
        email: email.trim(),
        code: code.trim(),
      });

      setAuthSession(response.token, response.user.name, response.user.id);
      router.push("/sessions");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel validar o codigo.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleChangeEmail() {
    setStep("register");
    setCode("");
    setInfoMessage(null);
    setError(null);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[var(--accent)]/5 via-transparent to-transparent" />
      </div>

      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)] opacity-10 blur-[180px] rounded-full pointer-events-none" />

      <div
        className={`
          relative
          w-full
          max-w-md
          bg-[var(--bg-card)]
          border border-[var(--border-subtle)]
          rounded-2xl
          shadow-[0_0_60px_rgba(0,0,0,0.7)]
          p-10
          transform transition-all duration-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-wide">
            {step === "register" ? "Forjar Identidade" : "Confirmar Cadastro"}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            {step === "register"
              ? "Crie seu acesso ao reino"
              : "Digite o codigo enviado para seu e-mail"}
          </p>
        </div>

        {step === "register" ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Nome
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/40"
              />
            </div>

            {error && <div className="text-xs text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-2.5 rounded-lg text-sm font-medium
                transition flex items-center justify-center gap-2
                ${
                  isLoading
                    ? "bg-[var(--accent)]/70 cursor-not-allowed"
                    : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                }
                shadow-[0_0_20px_rgba(124,58,237,0.2)]
              `}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isLoading ? "Forjando..." : "Continuar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Email
              </label>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm">
                <span className="truncate">{email.trim()}</span>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-xs uppercase tracking-wider text-[var(--accent-soft)] hover:underline"
                >
                  Alterar
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Codigo de verificacao
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/40"
              />
            </div>

            {infoMessage && <div className="text-xs text-[var(--text-muted)]">{infoMessage}</div>}
            {error && <div className="text-xs text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-2.5 rounded-lg text-sm font-medium
                transition flex items-center justify-center gap-2
                ${
                  isLoading
                    ? "bg-[var(--accent)]/70 cursor-not-allowed"
                    : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                }
                shadow-[0_0_20px_rgba(124,58,237,0.2)]
              `}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isLoading ? "Validando..." : "Concluir Cadastro"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Ja possui acesso?
          <a href="/login" className="ml-1 text-[var(--accent-soft)] hover:underline">
            Entrar
          </a>
        </div>
      </div>
    </div>
  );
}
