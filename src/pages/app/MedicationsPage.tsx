
import { useEffect, useState } from "react";
import GlassCard from "../../components/app/GlassCard";
import MedicationsPanel from "../../components/app/MedicationsPanel";
import PageHeader from "../../components/app/PageHeader";
import {
  getAccessiblePatients,
  getMyPatientProfileId,
  type PatientProfile,
} from "../../services/api/patients";
import { useSession } from "../../modules/session/session";

type PatientOption = {
  id: string;
  name: string;
};

function toPatientOption(patient: PatientProfile): PatientOption | null {
  const id = patient._id ?? patient.id;

  if (!id) return null;

  const user = patient.userId;
  const name =
    typeof user === "object" && user !== null
      ? user.fullName
      : undefined;

  return {
    id,
    name: name || "Paciente",
  };
}

export default function MedicationsPage() {
  const { session } = useSession();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientsError, setPatientsError] = useState("");

  const picksPatient =
    session?.profile === "medico" ||
    session?.profile === "cuidador-clinico";

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      if (!session?.accessToken) return;

      setLoadingPatients(true);
      setPatientsError("");

      try {
        if (picksPatient) {
          const result = await getAccessiblePatients(session.accessToken);

          const options = result
            .map(toPatientOption)
            .filter(
              (patient): patient is PatientOption => patient !== null,
            );

          if (!cancelled) {
            setPatients(options);
            setSelectedId((current) =>
              options.some((patient) => patient.id === current)
                ? current
                : options[0]?.id ?? "",
            );
          }
        } else {
          const id = await getMyPatientProfileId(
            session.accessToken,
            session.userId ?? "",
          );

          if (!cancelled) {
            setSelectedId(id ?? "");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setPatientsError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os pacientes.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPatients(false);
        }
      }
    }

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, [
    session?.accessToken,
    session?.profile,
    session?.userId,
    picksPatient,
  ]);

  if (!session) return null;

  const patientId = selectedId;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Medicamentos"
        subtitle="Horários e registros do dia"
      />

      {picksPatient && (
        <GlassCard title="Paciente">
          {loadingPatients ? (
            <p className="text-sm text-muted">
              Carregando pacientes...
            </p>
          ) : patients.length > 0 ? (
            <div className="max-w-md">
              <label
                htmlFor="medications-patient"
                className="mb-2 block text-sm font-medium"
              >
                Escolher paciente
              </label>

              <select
                id="medications-patient"
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className="h-14 w-full rounded-full border border-field-border bg-white px-5 text-sm outline-none focus:border-action"
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-muted">
              {patientsError ||
                "Nenhum paciente disponível para acompanhamento."}
            </p>
          )}
        </GlassCard>
      )}

      {!picksPatient && patientsError && (
        <p className="text-sm text-alert-text">{patientsError}</p>
      )}

      {patientId && (
        <MedicationsPanel
          key={patientId}
          patientId={patientId}
          canConfirm={session.profile === "paciente"}
          prescribe={session.profile === "medico"}
          authorName={session.name}
        />
      )}
    </div>
  );
}