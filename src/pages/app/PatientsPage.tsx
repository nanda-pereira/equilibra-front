
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import Avatar from "../../components/app/Avatar";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Input from "../../components/ui/Input";
import {
  getAccessiblePatients,
  type PatientProfile,
} from "../../services/api/patients";
import { useSession } from "../../modules/session/session";

type PatientItem = {
  id: string;
  name: string;
  email?: string;
};

const plain = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function toPatientItem(patient: PatientProfile): PatientItem | null {
  const id = patient.id ?? patient._id;

  if (!id) return null;

  const user = patient.userId;
  const name =
    typeof user === "object" && user !== null
      ? user.fullName || user.email
      : undefined;

  const email =
    typeof user === "object" && user !== null
      ? user.email
      : undefined;

  return {
    id,
    name: name || "Paciente",
    email,
  };
}

export default function PatientsPage() {
  const { session } = useSession();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const accessToken = session?.accessToken;
  const profile = session?.profile;

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      if (
        !accessToken ||
        (profile !== "medico" && profile !== "cuidador-clinico")
      ) {
        setPatients([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await getAccessiblePatients(accessToken);
        const items = result
          .map(toPatientItem)
          .filter((item): item is PatientItem => item !== null)
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

        if (!cancelled) {
          setPatients(items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os pacientes.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, [accessToken, profile]);

  if (!session) return null;

  if (
    session.profile !== "medico" &&
    session.profile !== "cuidador-clinico"
  ) {
    return <Navigate to="/app/inicio" replace />;
  }

  const filtered = patients.filter((patient) =>
    plain(patient.name).includes(plain(query.trim())),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pacientes"
        subtitle="Pacientes sob sua responsabilidade"
      />

      {error && (
        <p
          role="alert"
          className="rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
        >
          {error}
        </p>
      )}

      <GlassCard>
        <div className="max-w-md">
          <Input
            label="Buscar paciente"
            placeholder="Digite o nome"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <p aria-live="polite" className="text-sm text-ink-soft">
          {loading
            ? "Carregando pacientes..."
            : `${filtered.length} ${
                filtered.length === 1 ? "paciente" : "pacientes"
              }`}
        </p>
      </GlassCard>

      {loading ? (
        <GlassCard>
          <p className="text-sm text-ink-soft">
            Buscando pacientes cadastrados...
          </p>
        </GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard>
          <EmptyState
            title={
              error
                ? "Não foi possível carregar os pacientes"
                : query.trim()
                  ? "Nenhum paciente encontrado"
                  : "Nenhum paciente cadastrado"
            }
            description={
              query.trim()
                ? "Confira o nome digitado e tente novamente."
                : "Os pacientes vinculados à sua conta aparecerão aqui."
            }
          />
        </GlassCard>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((patient) => (
            <li
              key={patient.id}
              className="glass-card flex flex-col gap-4 rounded-3xl p-5"
            >
              <div className="flex items-center gap-4">
                <Link
                  to={`/app/pacientes/${patient.id}`}
                  aria-label={`Ver dados de ${patient.name}`}
                  className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
                >
                  <Avatar
                    name={patient.name}
                    tone="soft"
                    className="size-14! text-xl!"
                  />
                </Link>

                <div className="min-w-0">
                  <p className="text-lg font-medium text-deep">
                    {patient.name}
                  </p>
                  <p className="break-words text-sm text-ink-soft">
                    {patient.email || "Paciente vinculado"}
                  </p>
                </div>
              </div>

              <dl className="flex flex-col gap-2 text-sm">
                <div>
                  <dt className="font-medium text-action-hover">
                    Acompanhamento
                  </dt>
                  <dd className="text-ink">
                    Consulte os dados do paciente
                  </dd>
                </div>
              </dl>

              <div className="mt-auto flex flex-wrap gap-2.5">
                <SmallButton to={`/app/pacientes/${patient.id}`}>
                  Ver dados
                </SmallButton>

                <SmallButton
                  variant="solid"
                  to={`/app/mensagens?paciente=${patient.id}`}
                  label={`Contatar ${patient.name}`}
                >
                  Contatar
                </SmallButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}