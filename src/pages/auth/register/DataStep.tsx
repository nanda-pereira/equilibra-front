import { useState, type FormEvent } from "react";
import Icon from "../../../components/ui/Icon";
import Input from "../../../components/ui/Input";
import PasswordInput from "../../../components/ui/PasswordInput";
import Select from "../../../components/ui/Select";
import StepHeading from "../../../components/ui/StepHeading";
import StepNav from "../../../components/ui/StepNav";
import { CheckIcon } from "../../../components/ui/icons";
import {
  PROFILE_FORM,
  type FieldConfig,
} from "../../../modules/auth/registerFields";
import type { ProfileType, RegisterData } from "../../../modules/auth/types";
import {
  PASSWORD_RULES,
  formatBirthDate,
  formatCpf,
  isPasswordValid,
  isValidBirthDate,
  isValidCpf,
  isValidEmail,
} from "../../../modules/auth/validation";

type Key = keyof RegisterData;
type Errors = Partial<Record<Key, string>>;

const REQUIRED = "Campo obrigatório";

function validateField(
  field: FieldConfig,
  data: RegisterData,
): string | undefined {
  const value = data[field.key];
  if (!value.trim()) {
    return field.kind === "select" ? "Selecione uma opção" : REQUIRED;
  }

  switch (field.key) {
    case "fullName":
      return value.trim().split(/\s+/).length < 2
        ? "Informe nome e sobrenome"
        : undefined;
    case "birthDate":
      return isValidBirthDate(value) ? undefined : "Data inválida. Use DD/MM/AAAA";
    case "cpf":
      return isValidCpf(value) ? undefined : "CPF inválido";
    case "email":
      return isValidEmail(value) ? undefined : "E-mail inválido";
    case "password":
      return isPasswordValid(value) ? undefined : "Não cumpre as regras abaixo";
    case "confirmPassword":
      return value === data.password ? undefined : "As senhas não são iguais";
    default:
      return undefined; // crm e specialty: só obrigatório (TODO: formato do CRM)
  }
}

function validate(profile: ProfileType, data: RegisterData): Errors {
  const errors: Errors = {};
  const form = PROFILE_FORM[profile];

  for (const field of PROFILE_FORM[profile].fields) {
    const message = validateField(field, data);
    if (message) errors[field.key] = message;
  }

  if (!data.consentTerms) {
  errors.consentTerms = "É necessário aceitar os Termos de Uso";
}

if (!data.consentPrivacy) {
  errors.consentPrivacy = "É necessário confirmar a leitura da Política de Privacidade";
}

if (form.sharesHealthData && !data.consentHealthData) {
  errors.consentHealthData =
    "É necessário registrar sua decisão sobre o tratamento de dados de saúde";
}
  return errors;
}

type DataStepProps = {
  profile: ProfileType;
  data: RegisterData;
  onChange: <K extends Key>(field: K, value: RegisterData[K]) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function DataStep({
  profile,
  data,
  onChange,
  onBack,
  onNext,
}: DataStepProps) {
  const form = PROFILE_FORM[profile];
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(profile, data);
  const touch = (key: Key) => setTouched((t) => ({ ...t, [key]: true }));
  const shown = (key: Key) =>
    submitted || touched[key] ? errors[key] : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length === 0) onNext();
  }

  function renderField(field: FieldConfig) {
    const base = {
      label: field.label,
      placeholder: field.placeholder,
      value: data[field.key],
      onBlur: () => touch(field.key),
      error: shown(field.key),
    };
    const set = (value: string) => onChange(field.key, value);

    switch (field.kind) {
      case "password":
        return (
          <PasswordInput
            key={field.key}
            {...base}
            autoComplete="new-password"
            onChange={(e) => set(e.target.value)}
          />
        );
      case "email":
        return (
          <Input
            key={field.key}
            {...base}
            type="email"
            autoComplete="email"
            onChange={(e) => set(e.target.value)}
          />
        );
      case "date":
        return (
          <Input
            key={field.key}
            {...base}
            autoComplete="bday"
            inputMode="numeric"
            maxLength={10}
            onChange={(e) => set(formatBirthDate(e.target.value))}
          />
        );
      case "cpf":
        return (
          <Input
            key={field.key}
            {...base}
            autoComplete="off"
            inputMode="numeric"
            maxLength={14}
            onChange={(e) => set(formatCpf(e.target.value))}
          />
        );
      case "select":
        return (
          <Select
            key={field.key}
            {...base}
            options={field.options ?? []}
            onChange={(e) => set(e.target.value)}
          />
        );
      default:
        return (
          <Input
            key={field.key}
            {...base}
            autoComplete={field.autoComplete}
            onChange={(e) => set(e.target.value)}
          />
        );
    }
  }

  const gridClasses =
    form.columns === 3
      ? "max-w-[800px] min-[900px]:grid-cols-3"
      : "max-w-[560px] min-[900px]:grid-cols-2";

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <StepHeading
        className="mt-3"
        title="Criar conta"
        description="Agora, preencha esses dados para criar seu acesso."
      />

      <div
        className={`mx-auto mt-[53px] grid w-full grid-cols-1 gap-x-10 gap-y-1 ${gridClasses}`}
      >
        {form.fields.map(renderField)}
      </div>

      {/* Regras de senha */}
      <div className="mx-auto mt-2.5 flex w-full max-w-[800px] flex-wrap items-center gap-x-3 gap-y-2">
        <span id="password-rules-label" className="text-base text-ink">
          Sua senha precisa ter:
        </span>
        <ul
          aria-labelledby="password-rules-label"
          className="flex flex-wrap gap-2.5"
        >
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(data.password);
            return (
              <li
                key={rule.id}
                // TODO figma: o estado "atendido" (verde) não existe no Figma; é meu
                className={`inline-flex h-7 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors ${
                  ok
                    ? "bg-success-bg text-success-text"
                    : "bg-mint-100 text-action-hover"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-1 rounded-full ${ok ? "bg-success-text" : "bg-action"}`}
                />
                {rule.label}
                {ok && <span className="sr-only"> (atendido)</span>}
              </li>
            );
          })}
        </ul>
      </div>

    {/* Aceites e privacidade */}
    <div className="mx-auto mt-8 w-full max-w-[800px] space-y-4">
      <label className="flex items-start gap-2.5 text-sm leading-[19px] text-ink">
        <input
          type="checkbox"
          checked={data.consentTerms}
          onChange={(e) => onChange("consentTerms", e.target.checked)}
          aria-describedby={
            shown("consentTerms") ? "consent-terms-error" : undefined
          }
          className="mt-px size-[18px] shrink-0 cursor-pointer accent-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
        />
        <span>
          Li e aceito os{" "}
        <a
          href="/termos-de-uso"
          target="_blank"
          rel="noopener noreferrer"
          className="text-action-hover underline underline-offset-4"
        >
          Termos de Uso
        </a>
          .
        </span>
      </label>
      <p
        id="consent-terms-error"
        className="min-h-0 text-sm text-alert-text"
        aria-live="polite"
      >
        {shown("consentTerms")}
      </p>

      <label className="flex items-start gap-2.5 text-sm leading-[19px] text-ink">
        <input
          type="checkbox"
          checked={data.consentPrivacy}
          onChange={(e) => onChange("consentPrivacy", e.target.checked)}
          aria-describedby={
            shown("consentPrivacy") ? "consent-privacy-error" : undefined
          }
          className="mt-px size-[18px] shrink-0 cursor-pointer accent-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
        />
        <span>
          Li a{" "}
        <a
          href="/politica-de-privacidade"
          target="_blank"
          rel="noopener noreferrer"
          className="text-action-hover underline underline-offset-4"
        >
          Política de Privacidade
        </a>
          e estou ciente de como meus dados pessoais poderão ser tratados.
        </span>
      </label>
      <p
        id="consent-privacy-error"
        className="min-h-0 text-sm text-alert-text"
        aria-live="polite"
      >
        {shown("consentPrivacy")}
      </p>

      {form.sharesHealthData && (
        <>
          <label className="flex items-start gap-2.5 text-sm leading-[19px] text-ink">
            <input
              type="checkbox"
              checked={data.consentHealthData}
              onChange={(e) => onChange("consentHealthData", e.target.checked)}
              aria-describedby={
                shown("consentHealthData")
                  ? "consent-health-error"
                  : "consent-health-description"
              }
              className="mt-px size-[18px] shrink-0 cursor-pointer accent-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
            />
            <span>
              Autorizo o tratamento dos meus dados de saúde e de monitoramento
              para as finalidades acadêmicas e experimentais descritas na Política
              de Privacidade, incluindo o cálculo de métricas e a apresentação de
              resultados exploratórios.
            </span>
          </label>
          <p
            id="consent-health-description"
            className="text-xs leading-5 text-ink/65"
          >
            Esse tratamento não substitui avaliação médica. Consulte a Política
            de Privacidade para conhecer as finalidades e os direitos aplicáveis.
          </p>
          <p
            id="consent-health-error"
            className="min-h-0 text-sm text-alert-text"
            aria-live="polite"
          >
            {shown("consentHealthData")}
          </p>
        </>
      )}
    </div>

      <StepNav onBack={onBack} nextType="submit" />
    </form>
  );
}