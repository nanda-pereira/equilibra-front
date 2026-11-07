import { useState } from "react";
import { useNavigate } from "react-router";
import GlassCard from "../../components/app/GlassCard";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Switch from "../../components/app/Switch";
import {
  resetPreferences,
  setPreference,
  usePreferences,
  type TextSize,
} from "../../modules/app/preferences";
import { PROFILE_LABELS } from "../../modules/auth/types";
import { resetDemoData } from "../../modules/demo/appStore";
import { useSession } from "../../modules/session/session";

const SIZES: { id: TextSize; label: string }[] = [
  { id: "normal", label: "Padrão" },
  { id: "large", label: "Grande" },
  { id: "xlarge", label: "Muito grande" },
];

export default function SettingsPage() {
  const { session, signOut } = useSession();
  const prefs = usePreferences();
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");

  if (!session) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configurações" subtitle="Preferências do aplicativo" />

      <GlassCard title="Aparência e leitura">
        <p id="text-size-label" className="text-base font-medium text-ink">
          Tamanho do texto
        </p>
        <div role="group" aria-labelledby="text-size-label" className="mt-3 flex flex-wrap gap-2.5">
          {SIZES.map((size) => {
            const active = prefs.textSize === size.id;
            return (
              <button
                key={size.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPreference("textSize", size.id)}
                className={`inline-flex h-11 items-center rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
                  active
                    ? "bg-action text-white shadow-[0_8px_20px_rgba(36,116,119,0.25)]"
                    : "border border-brand text-action hover:bg-mint-100"
                }`}
              >
                {size.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 border-t border-line pt-2">
          <Switch
            label="Mais contraste"
            description="Deixa textos secundários e bordas mais escuros."
            checked={prefs.highContrast}
            onChange={(value) => setPreference("highContrast", value)}
          />
          <Switch
            label="Reduzir animações"
            description="Diminui transições e movimentos na tela."
            checked={prefs.reduceMotion}
            onChange={(value) => setPreference("reduceMotion", value)}
          />
        </div>
      </GlassCard>

      <GlassCard title="Assistente e lembretes">
        <Switch
          label="Mostrar o botão do assistente"
          description="Botão flutuante com um resumo do seu dia."
          checked={prefs.showAssistant}
          onChange={(value) => setPreference("showAssistant", value)}
        />
        <Switch
          label="Lembretes de medicamentos"
          description="Inclui os medicamentos do dia no resumo do assistente."
          checked={prefs.medReminders}
          onChange={(value) => setPreference("medReminders", value)}
        />
        <Switch
          label="Lembretes de consultas"
          description="Inclui as consultas no resumo do assistente."
          checked={prefs.apptReminders}
          onChange={(value) => setPreference("apptReminders", value)}
        />
      </GlassCard>

      <GlassCard title="Conta">
        <p className="text-base text-ink">
          {session.name} · {PROFILE_LABELS[session.profile]}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <SmallButton to="/app/perfil">Meu perfil</SmallButton>
          <SmallButton
            onClick={() => {
              signOut();
              navigate("/login");
            }}
          >
            Sair
          </SmallButton>
        </div>
      </GlassCard>

      <GlassCard
        title="Demonstração"
        description="Medicamentos, consultas e registros criados nesta sessão ficam só neste navegador."
      >
        <div className="flex flex-wrap gap-3">
          <SmallButton
            onClick={() => {
              resetDemoData();
              setNotice("Dados de demonstração restaurados.");
            }}
          >
            Restaurar dados de demonstração
          </SmallButton>
          <SmallButton
            onClick={() => {
              resetPreferences();
              setNotice("Preferências restauradas.");
            }}
          >
            Restaurar preferências
          </SmallButton>
        </div>
        <p role="status" className="mt-3 min-h-5 text-sm text-success-text">
          {notice}
        </p>
      </GlassCard>
    </div>
  );
}