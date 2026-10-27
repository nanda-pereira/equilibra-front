import { useState } from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import Stepper from "../../components/ui/Stepper";
import {
  EMPTY_REGISTER_DATA,
  type ProfileType,
  type RegisterData,
} from "../../modules/auth/types";
import ProfileStep from "./register/ProfileStep";
import DataStep from "./register/DataStep";

const REGISTER_STEPS = ["Perfil", "Seus dados", "Conferir", "Boas-vindas"];

export default function RegisterPage() {
  const [step, setStep] = useState(0); // 0 = Perfil
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [data, setData] = useState<RegisterData>(EMPTY_REGISTER_DATA);

  function updateField<K extends keyof RegisterData>(
    field: K,
    value: RegisterData[K],
  ) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    //ver qual das duas versoes de fundo fica melhor, para ver trocar de background="design-system" ou "figma"
    <AuthLayout background="figma">
      <div className="flex flex-col items-center">
        <Stepper steps={REGISTER_STEPS} current={step} />
        <p className="mt-6 text-sm font-medium uppercase tracking-[0.14em] text-action-hover">
          Etapa {step + 1} de {REGISTER_STEPS.length}
        </p>
        <h1 className="mt-2 text-center text-3xl font-medium text-deep md:text-4xl">
          Criar conta
        </h1>
      </div>

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

      {/*temporário, apagar quando a etapa 3 existir */}
      {step === 2 && (
        <p className="mt-10 text-center text-ink">Etapa 3 em construção.</p>
      )}
    </AuthLayout>
  );
}