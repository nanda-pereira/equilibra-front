
import { useNavigate } from "react-router";
import Button from "../../../components/ui/Button";
import StepHeading from "../../../components/ui/StepHeading";
import type { ProfileType } from "../../../modules/auth/types";
import type { RegisterResponseData } from "../../../modules/auth/authApi";

type WelcomeStepProps = {
  profile: ProfileType;
  fullName: string;
  registrationResult: RegisterResponseData | null;
};

export default function WelcomeStep({
  fullName,
  registrationResult,
}: WelcomeStepProps) {
  const navigate = useNavigate();

  const firstName = fullName.trim().split(/\s+/)[0] ?? "";
  const hasDevelopmentToken = Boolean(
    registrationResult?.emailVerificationDevToken,
  );

  function handleStart() {
    if (!registrationResult?.user?.email) return;

    if (registrationResult.emailVerificationDevToken) {
      const params = new URLSearchParams({
        token: registrationResult.emailVerificationDevToken,
      });

      navigate(`/verificar-email?${params.toString()}`);
      return;
    }

    navigate("/login", {
      state: { email: registrationResult.user.email },
    });
  }

  return (
    <div className="flex flex-col items-center">
      <StepHeading
        className="mt-16 md:mt-28"
        title={`Boas-vindas, ${firstName}!`}
        description={
          hasDevelopmentToken
            ? "Sua conta foi criada. Vamos confirmar seu e-mail para liberar seu acesso ao Equilibra."
            : "Sua conta foi criada. Confira sua caixa de entrada para confirmar seu e-mail e concluir o acesso."
        }
      />

      <Button
        variant="primary"
        withArrow
        onClick={handleStart}
        className="mt-14 w-[246px] gap-6! bg-action! hover:bg-action-hover!"
      >
        {hasDevelopmentToken ? "Confirmar e-mail" : "Ir para entrar"}
      </Button>
    </div>
  );
}