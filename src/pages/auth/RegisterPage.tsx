import { useState } from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import Stepper from "../../components/ui/Stepper";
import { ApiError, registerUser } from "../../modules/auth/authApi";
import {
  EMPTY_REGISTER_DATA,
  type ProfileType,
  type RegisterData,
} from "../../modules/auth/types";
import ProfileStep from "./register/ProfileStep";
import DataStep from "./register/DataStep";
import ReviewStep from "./register/ReviewStep";
import WelcomeStep from "./register/WelcomeStep";

const REGISTER_STEPS = ["Perfil", "Seus dados", "Conferir", "Boas-vindas"];

export default function RegisterPage() {
  const [step, setStep] = useState(0); // 0 = Perfil
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [data, setData] = useState<RegisterData>(EMPTY_REGISTER_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function updateField<K extends keyof RegisterData>(
    field: K,
    value: RegisterData[K],
  ) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateAccount() {
    if (!profile || submitting) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      await registerUser(profile, data);
      // a senha não precisa continuar na memória depois do cadastro
      setData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setStep(3);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível criar a conta agora. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // background: "figma" (reprodução do print) ou "design-system" (o meu)
    <AuthLayout background="figma">
      <div className="flex flex-col items-center">
        <Stepper steps={REGISTER_STEPS} current={step} />
        <p className="mt-5 text-base uppercase leading-7 tracking-[0.14em] text-deep">
          Etapa {step + 1} de {REGISTER_STEPS.length}
        </p>
      </div>

      <div className="flex flex-col lg:min-h-[600px]">
        {step === 0 && (
          <ProfileStep
            value={profile}
            onChange={setProfile}
            onNext={() => setStep(1)}
            backHref="/"
          />
        )}

        {step === 1 && profile && (
          <DataStep
            profile={profile}
            data={data}
            onChange={updateField}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && profile && (
          <ReviewStep
            profile={profile}
            data={data}
            submitting={submitting}
            error={submitError}
            onEditProfile={() => setStep(0)}
            onEditData={() => setStep(1)}
            onBack={() => setStep(1)}
            onNext={handleCreateAccount}
          />
        )}

        {step === 3 && profile && (
          <WelcomeStep profile={profile} fullName={data.fullName} />
        )}
      </div>
    </AuthLayout>
  );
}