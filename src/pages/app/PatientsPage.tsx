import { useState } from "react";
import { Link, Navigate } from "react-router";
import Avatar from "../../components/app/Avatar";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Input from "../../components/ui/Input";
import { patients } from "../../modules/demo/demoData";
import { useSession } from "../../modules/session/session";

const plain = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export default function PatientsPage() {
  const { session } = useSession();
  const [query, setQuery] = useState("");

  if (!session) return null;
  if (session.profile !== "medico" && session.profile !== "cuidador-clinico") {
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
        demo
      />

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
          {filtered.length} {filtered.length === 1 ? "paciente" : "pacientes"}
        </p>
      </GlassCard>

      {filtered.length === 0 ? (
        <GlassCard>
          <EmptyState
            title="Nenhum paciente encontrado"
            description="Confira o nome digitado e tente novamente."
          />
        </GlassCard>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((patient) => (
            <li key={patient.id} className="glass-card flex flex-col gap-4 rounded-3xl p-5">
              <div className="flex items-center gap-4">
                <Link
                  to={`/app/pacientes/${patient.id}`}
                  aria-label={`Ver dados de ${patient.name}`}
                  className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
                >
                  <Avatar name={patient.name} tone="soft" className="size-14! text-xl!" />
                </Link>
                <div className="min-w-0">
                  <p className="text-lg font-medium text-deep">{patient.name}</p>
                  <p className="text-sm text-ink-soft">{patient.age} anos</p>
                </div>
              </div>

              <dl className="flex flex-col gap-2 text-sm">
                <div>
                  <dt className="font-medium text-action-hover">Próxima consulta</dt>
                  <dd className="text-ink">{patient.nextAppointment}</dd>
                </div>
                <div>
                  <dt className="font-medium text-action-hover">Medicamentos na semana</dt>
                  <dd className="text-ink">
                    {patient.medsWeek.taken} de {patient.medsWeek.total} registrados
                  </dd>
                </div>
              </dl>

              <div className="mt-auto flex flex-wrap gap-2.5">
                <SmallButton to={`/app/pacientes/${patient.id}`}>Ver dados</SmallButton>
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