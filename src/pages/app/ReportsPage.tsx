import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import MetricCard from "../../components/app/MetricCard";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Icon from "../../components/ui/Icon";
import Select from "../../components/ui/Select";
import {
  CalendarIcon,
  DownloadIcon,
  MedicineIcon,
  MessageIcon,
} from "../../components/ui/icons";
import { downloadCsv } from "../../modules/app/csv";
import {
  getAccessiblePatients,
  getPatientAppointments,
  getPatientMedications,
  getPatientObservations,
  type ObservationData,
  type PatientAppointment,
  type PatientMedicationsData,
  type PatientProfile,
  type PatientRecord,
} from "../../services/api/patients";
import { useSession } from "../../modules/session/session";

const PERIODS = [
  { label: "Últimos 7 dias", days: 7 },
  { label: "Últimos 30 dias", days: 30 },
  { label: "Últimos 90 dias", days: 90 },
];

type PatientOption = {
  id: string;
  name: string;
};

function getPatientId(patient: PatientProfile): string {
  return patient.id ?? patient._id ?? "";
}

function getPatientName(patient: PatientProfile): string {
  const user = patient.userId;

  if (user && typeof user === "object" && user.fullName) {
    return user.fullName;
  }

  if (user && typeof user === "object" && user.email) {
    return user.email;
  }

  return "Paciente";
}

function getRecordDate(record: {
  createdAt?: string;
  updatedAt?: string;
}): Date | null {
  const value = record.createdAt ?? record.updatedAt;

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string | null): string {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Data não informada";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Horário não informado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Horário não informado";

  return `${formatDate(value)} · ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function isWithinPeriod(
  date: Date | null,
  startDate: Date,
  endDate: Date,
): boolean {
  return Boolean(
    date &&
      !Number.isNaN(date.getTime()) &&
      date >= startDate &&
      date <= endDate,
  );
}

export default function ReportsPage() {
  const { session } = useSession();
  const accessToken = session?.accessToken;

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientId, setPatientId] = useState("");
  const [periodLabel, setPeriodLabel] = useState(PERIODS[1].label);

  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [observations, setObservations] = useState<
    PatientRecord<ObservationData>[]
  >([]);
  const [medications, setMedications] =
    useState<PatientMedicationsData | null>(null);

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = accessToken;

    if (typeof token !== "string" || token.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadPatients() {
      setLoadingPatients(true);
      setError("");

      try {
        const result = await getAccessiblePatients(token as string);

        if (cancelled) return;

        const options = result
          .map((patient) => ({
            id: getPatientId(patient),
            name: getPatientName(patient),
          }))
          .filter((patient) => patient.id);

        setPatients(options);

        setPatientId((current) => {
          if (options.some((patient) => patient.id === current)) {
            return current;
          }

          return options[0]?.id ?? "";
        });

        if (options.length === 0) {
          setAppointments([]);
          setObservations([]);
          setMedications(null);
          setLoadingReport(false);
        }
      } catch (err) {
        if (!cancelled) {
          setPatients([]);
          setPatientId("");
          setAppointments([]);
          setObservations([]);
          setMedications(null);
          setLoadingReport(false);
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os pacientes.",
          );
        }
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    }

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    const token = accessToken;
    const selectedPatientId = patientId;

    if (
      typeof token !== "string" ||
      token.length === 0 ||
      !selectedPatientId
    ) {
      return;
    }

    let cancelled = false;

    async function loadReport() {
      setLoadingReport(true);
      setError("");

      try {
        const [
          appointmentResult,
          observationResult,
          medicationResult,
        ] = await Promise.all([
          getPatientAppointments(token as string, selectedPatientId),
          getPatientObservations(token as string, selectedPatientId),
          getPatientMedications(token as string, selectedPatientId),
        ]);

        if (cancelled) return;

        setAppointments(appointmentResult);
        setObservations(observationResult);
        setMedications(medicationResult);
        setCurrentTime(Date.now());
      } catch (err) {
        if (cancelled) return;

        setAppointments([]);
        setObservations([]);
        setMedications(null);
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os dados do relatório.",
        );
      } finally {
        if (!cancelled) setLoadingReport(false);
      }
    }

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [accessToken, patientId]);

  if (!session) return null;

  if (
    session.profile !== "medico" &&
    session.profile !== "cuidador-clinico"
  ) {
    return <Navigate to="/app/inicio" replace />;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const selectedPatient = patients.find(
    (patient) => patient.id === patientId,
  );

  const period =
    PERIODS.find((item) => item.label === periodLabel) ?? PERIODS[1];

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const from = new Date();
  from.setDate(from.getDate() - period.days);
  from.setHours(0, 0, 0, 0);

  const filteredAppointments = appointments
    .filter((item) => {
      const date = item.data.scheduledAt
        ? new Date(item.data.scheduledAt)
        : getRecordDate(item);

      return isWithinPeriod(date, from, today);
    })
    .sort((a, b) => {
      const dateA = a.data.scheduledAt
        ? new Date(a.data.scheduledAt).getTime()
        : getRecordDate(a)?.getTime() ?? 0;

      const dateB = b.data.scheduledAt
        ? new Date(b.data.scheduledAt).getTime()
        : getRecordDate(b)?.getTime() ?? 0;

      return dateA - dateB;
    });

  const filteredObservations = observations
    .filter((item) =>
      isWithinPeriod(getRecordDate(item), from, today),
    )
    .sort(
      (a, b) =>
        (getRecordDate(b)?.getTime() ?? 0) -
        (getRecordDate(a)?.getTime() ?? 0),
    );

  const activeMedications =
    medications?.medications.filter((item) => item.status === "active") ??
    medications?.medications ??
    [];

  const medicationLogs =
    medications?.medicationLogs.filter((item) => {
      const dateValue =
        item.data.administeredAt ?? item.data.scheduledAt;

      if (!dateValue) {
        return isWithinPeriod(getRecordDate(item), from, today);
      }

      const date = new Date(dateValue);

      return isWithinPeriod(
        Number.isNaN(date.getTime()) ? null : date,
        from,
        today,
      );
    }) ?? [];

  function exportCsv() {
    if (!selectedPatient) return;

    const exportTime = Date.now();

    downloadCsv(
      `relatorio-${selectedPatient.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()}.csv`,
      [
      ["Relatório do Equilibra", selectedPatient.name, period.label],
      [],
      ["Consultas", "Data e horário", "Título", "Situação", "Observações"],
      ...filteredAppointments.map((item) => {
        const scheduledAt = item.data.scheduledAt;
        const date = scheduledAt
          ? new Date(scheduledAt)
          : getRecordDate(item);

        const status = date
          ? date.getTime() < exportTime
            ? "Já ocorreu"
            : "Agendada"
          : item.status;

        return [
          "",
          scheduledAt
            ? formatDateTime(scheduledAt)
            : date
              ? formatDate(date.toISOString())
              : "Data não informada",
          item.data.title,
          status,
          item.data.notes ?? "",
        ];
      }),
      [],
      ["Registros de evolução", "Data", "Categoria", "Observação"],
      ...filteredObservations.map((item) => [
        "",
        formatDate(getRecordDate(item)?.toISOString()),
        item.data.category,
        item.data.notes,
      ]),
      [],
      ["Medicamentos", "Dose prescrita", "Via", "Instruções"],
      ...(medications?.prescriptions ?? []).map((item) => [
        medications?.medications.find(
          (medication) => medication._id === item.data.medicationId,
        )?.data.name ?? "Medicamento",
        `${item.data.dose} ${item.data.unit}`,
        item.data.route,
        item.data.instructions ?? "",
      ]),
      [],
      ["Registros de medicação no período", String(medicationLogs.length)],
    ]);
  }

    function exportPdf() {
    if (!selectedPatient) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const exportTime = Date.now();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(18, 63, 66);
    doc.text("Relatório do Equilibra", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 43, 45);
    doc.text(`Paciente: ${selectedPatient.name}`, 14, 27);
    doc.text(`Período: ${period.label}`, 14, 33);
    doc.text(
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      pageWidth - 14,
      27,
      { align: "right" },
    );

    let currentY = 42;

    function addSection(
      title: string,
      headers: string[],
      rows: string[][],
    ) {
      // Evita deixar o título isolado no final de uma página.
      if (currentY > 175) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(18, 63, 66);
      doc.text(title, 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        head: [headers],
        body: rows.length > 0 ? rows : [["Nenhum registro no período", ...headers.slice(1).map(() => "")]],
        theme: "grid",
        margin: { left: 14, right: 14, bottom: 18 },
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 3,
          textColor: [40, 43, 45],
          lineColor: [220, 232, 230],
          lineWidth: 0.2,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [36, 116, 119],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [244, 249, 248],
        },
      });

      const tableDocument = doc as jsPDF & {
        lastAutoTable?: { finalY: number };
      };

      currentY = (tableDocument.lastAutoTable?.finalY ?? currentY) + 12;
    }

    const appointmentRows = filteredAppointments.map((item) => {
      const scheduledAt = item.data.scheduledAt;
      const date = scheduledAt
        ? new Date(scheduledAt)
        : getRecordDate(item);

      const status = date
        ? date.getTime() < exportTime
          ? "Já ocorreu"
          : "Agendada"
        : item.status;

      return [
        scheduledAt
          ? formatDateTime(scheduledAt)
          : date
            ? formatDate(date.toISOString())
            : "Data não informada",
        item.data.title ?? "Consulta",
        status,
        item.data.notes ?? "—",
      ];
    });

    addSection(
      "Consultas",
      ["Data e horário", "Título", "Situação", "Observações"],
      appointmentRows,
    );

    const observationRows = filteredObservations.map((item) => [
      formatDate(getRecordDate(item)?.toISOString()),
      item.data.category ?? "Não informada",
      item.data.notes ?? "—",
    ]);

    addSection(
      "Registros de evolução",
      ["Data", "Categoria", "Observação"],
      observationRows,
    );

    const medicationRows = (medications?.prescriptions ?? []).map((item) => [
      medications?.medications.find(
        (medication) => medication._id === item.data.medicationId,
      )?.data.name ?? "Medicamento",
      `${item.data.dose} ${item.data.unit}`,
      item.data.route ?? "Não informada",
      item.data.instructions ?? "—",
    ]);

    addSection(
      "Medicamentos prescritos",
      ["Medicamento", "Dose", "Via", "Instruções"],
      medicationRows,
    );

    addSection(
      "Registros de medicação no período",
      ["Descrição", "Quantidade"],
      [["Registros encontrados", String(medicationLogs.length)]],
    );

    // Numera todas as páginas, inclusive as criadas automaticamente pelas tabelas.
    const totalPages = doc.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(88, 100, 99);
      doc.text(
        `Equilibra • Documento confidencial • Página ${page} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" },
      );
    }

    doc.save(
    `relatorio-${selectedPatient.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()}.pdf`,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatórios"
        subtitle="Resumo por paciente e período"
      >
      <div className="flex flex-wrap gap-2">
        <SmallButton onClick={exportCsv}>
          <span className="inline-flex items-center gap-2">
            <Icon icon={DownloadIcon} size={18} />
            Exportar CSV
          </span>
        </SmallButton>

        <SmallButton onClick={exportPdf}>
          <span className="inline-flex items-center gap-2">
            <Icon icon={DownloadIcon} size={18} />
            Exportar PDF
          </span>
        </SmallButton>
      </div>
      </PageHeader>

      <GlassCard title="Filtros">
        <div className="grid gap-x-6 sm:grid-cols-2">
          <Select
            label="Paciente"
            options={patients.map((patient) => patient.name)}
            value={selectedPatient?.name ?? ""}
            onChange={(event) => {
              const selected = patients.find(
                (patient) => patient.name === event.target.value,
              );

              const nextPatientId = selected?.id ?? "";

              setPatientId(nextPatientId);

              if (!nextPatientId) {
                setAppointments([]);
                setObservations([]);
                setMedications(null);
                setLoadingReport(false);
              }
            }}
          />

          <Select
            label="Período"
            options={PERIODS.map((item) => item.label)}
            value={periodLabel}
            onChange={(event) => setPeriodLabel(event.target.value)}
          />
        </div>
      </GlassCard>

      {error && (
        <GlassCard>
          <p className="text-sm text-red-700">{error}</p>
        </GlassCard>
      )}

      {loadingPatients ? (
        <GlassCard>
          <p className="text-sm text-ink-soft">
            Carregando pacientes...
          </p>
        </GlassCard>
      ) : patients.length === 0 ? (
        <GlassCard>
          <EmptyState title="Nenhum paciente disponível para relatório" />
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-4">
            <MetricCard
              icon={CalendarIcon}
              label="Consultas no período"
              value={loadingReport ? "—" : String(filteredAppointments.length)}
            />
            <MetricCard
              icon={MessageIcon}
              label="Registros de evolução"
              value={loadingReport ? "—" : String(filteredObservations.length)}
            />
            <MetricCard
              icon={MedicineIcon}
              label="Medicamentos cadastrados"
              value={loadingReport ? "—" : String(activeMedications.length)}
            />
            <MetricCard
              icon={MedicineIcon}
              label="Registros de medicação"
              value={loadingReport ? "—" : String(medicationLogs.length)}
              note="no período selecionado"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <GlassCard title="Consultas">
              {loadingReport ? (
                <p className="text-sm text-ink-soft">
                  Carregando consultas...
                </p>
              ) : filteredAppointments.length === 0 ? (
                <EmptyState title="Nenhuma consulta no período" />
              ) : (
                <ul className="flex flex-col gap-3">
                  {filteredAppointments.map((item) => {
                    const date = item.data.scheduledAt
                      ? new Date(item.data.scheduledAt)
                      : getRecordDate(item);

                    const status = date
                      ? date.getTime() < currentTime
                        ? "Já ocorreu"
                        : "Agendada"
                      : "Sem data";

                    return (
                      <ListRow
                        key={item._id}
                        icon={CalendarIcon}
                        title={
                          item.data.scheduledAt
                            ? formatDateTime(item.data.scheduledAt)
                            : date
                              ? formatDate(date.toISOString())
                              : item.data.title
                        }
                        subtitle={`${item.data.title} · ${status}`}
                      />
                    );
                  })}
                </ul>
              )}
            </GlassCard>

            <GlassCard title="Registros de evolução">
              {loadingReport ? (
                <p className="text-sm text-ink-soft">
                  Carregando registros...
                </p>
              ) : filteredObservations.length === 0 ? (
                <EmptyState title="Nenhum registro no período" />
              ) : (
                <ul className="flex flex-col gap-3">
                  {filteredObservations.map((item) => (
                    <ListRow
                      key={item._id}
                      icon={MessageIcon}
                      title={item.data.category || "Observação"}
                      subtitle={`${formatDate(
                        getRecordDate(item)?.toISOString(),
                      )} · ${item.data.notes}`}
                    />
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>
        </>
      )}

      <p className="text-sm text-ink-soft">
        Os dados exibidos dependem dos registros disponíveis.
      </p>
    </div>
  );
}