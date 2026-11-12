
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

  function handleStart() {
    if (!registrationResult) return;

    navigate("/login", {
      state: {
        email: registrationResult.user?.email,
        requiresEmailVerification: true,
        verificationToken:
          registrationResult.emailVerificationDevToken,
      },
    });
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