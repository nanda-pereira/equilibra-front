
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import { ApiError, verifyEmail } from "../../modules/auth/authApi";

type VerificationState = "ready" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationState>(
    token ? "ready" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Confirme seu endereço de e-mail para concluir o cadastro."
      : "Este link não contém um token de confirmação válido.",
  );

  async function handleVerify() {
    if (!token) return;

    setStatus("loading");
    setMessage("Estamos confirmando seu e-mail...");

    try {
      await verifyEmail(token);
      setStatus("success");
      setMessage(
        "Seu e-mail foi confirmado. Agora você já pode entrar no Equilibra.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Não foi possível confirmar seu e-mail. O link pode ter expirado ou já ter sido utilizado.",
      );
    }
  }

  return (
    <AuthLayout background="figma">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5F3F1] text-3xl text-[#247477]">
          {status === "success" ? "✓" : "✉"}
        </div>

        <h1 className="text-2xl font-semibold text-[#282B2D] md:text-3xl">
          {status === "success"
            ? "E-mail confirmado!"
            : status === "loading"
              ? "Confirmando seu e-mail"
              : "Confirme seu e-mail"}
        </h1>

        <p
          role="status"
          aria-live="polite"
          className="mt-4 max-w-md text-sm leading-6 text-[#586463] md:text-base"
        >
          {message}
        </p>

        {status === "ready" && (
          <Button
            variant="primary"
            onClick={handleVerify}
            className="mt-8 w-full max-w-xs"
          >
            Confirmar e-mail
          </Button>
        )}

        {status === "loading" && (
          <div
            className="mt-8 h-6 w-6 animate-spin rounded-full border-2 border-[#247477] border-t-transparent"
            aria-label="Carregando"
          />
        )}

        {(status === "success" || status === "error") && (
          <Link
            to="/login"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#247477] px-8 font-medium text-white transition hover:bg-[#1B5E60]"
          >
            {status === "success" ? "Ir para entrar" : "Voltar ao login"}
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}