import { useNavigate } from "react-router";
import Button from "../../../components/ui/Button";
import StepHeading from "../../../components/ui/StepHeading";
import type { ProfileType } from "../../../modules/auth/types";
import { useSession } from "../../../modules/session/session";
import type { RegisterResponseData } from "../../../modules/auth/authApi";

type WelcomeStepProps = {
  profile: ProfileType;
  fullName: string;
  registrationResult: RegisterResponseData | null;
};

export default function WelcomeStep({ profile, fullName, registrationResult }: WelcomeStepProps) {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";

  function handleStart() {
    if (registrationResult) {
      // O cadastro real ainda exige verificação de e-mail.
      // Não liberar /app antes dessa verificação.
      navigate("/login", {
        state: {
          email: registrationResult.user?.email,
          requiresEmailVerification: true,
          verificationToken:
            registrationResult.emailVerificationDevToken,
        },
      });
      return;
    }

    // Fluxo de demonstração, sem backend.
    signIn({ profile, name: fullName.trim() });
    navigate("/app");
  }

  return (
    <div className="flex flex-col items-center">
      <StepHeading
        className="mt-16 md:mt-28"
        title={`Boas-vindas, ${firstName}!`}
        description="Sua conta foi criada com sucesso. Você está a um passo de um cuidado mais seguro e preventivo."
      />

      <Button
        variant="primary"
        withArrow
        onClick={handleStart}
        className="mt-14 w-[246px] gap-6! bg-action! hover:bg-action-hover!"
      >
        Começar agora
      </Button>
    </div>
  );
}