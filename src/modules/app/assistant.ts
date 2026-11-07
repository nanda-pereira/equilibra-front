import type { ProfileType } from "../auth/types";
import {
  agendaToday,
  appointmentsNextDays,
  dosesToday,
  nextConsultation,
} from "../demo/appStore";
import { DEMO_PATIENT, PATIENTS_BASE, exerciseWeek, isSameDay, longDayLabel } from "../demo/demoData";

export type QuickReply = { id: string; label: string; answer: string[] };
export type AssistantData = { overview: string[]; replies: QuickReply[] };

type Options = {
  profile: ProfileType;
  name: string;
  medReminders: boolean;
  apptReminders: boolean;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function medLine(patientId: string, me: boolean, name: string) {
  const doses = dosesToday(patientId);
  const pending = doses.filter((dose) => !dose.taken);
  const who = me ? "Você" : name;
  if (doses.length === 0) return `${who} não tem medicamentos programados para hoje.`;
  const next = pending[0];
  if (!next) return `Todos os ${doses.length} horários de medicamento de hoje já foram registrados.`;
  return `Hoje ${me ? "você tem" : `${name} tem`} ${plural(doses.length, "horário", "horários")} de medicamento, ${pending.length} ainda sem registro. O próximo é ${next.name}, às ${next.time}.`;
}

function consultLine(patientId: string, me: boolean, name: string) {
  const next = nextConsultation(patientId);
  if (!next) return `Não há consultas agendadas para ${me ? "você" : name}.`;
  if (isSameDay(next.date, new Date())) {
    return `${me ? "Você tem" : `${name} tem`} consulta hoje, às ${next.time}.`;
  }
  return `A próxima consulta ${me ? "sua" : `de ${name}`} é ${longDayLabel(next.date, next.time)}.`;
}

function exerciseLine() {
  const exercise = exerciseWeek().days.find((day) => day.offset === 0)?.exercise;
  return exercise
    ? `Exercício previsto para hoje: ${exercise.title} (${exercise.duration}).`
    : "Não há exercício previsto para hoje.";
}

export function buildAssistant({ profile, name, medReminders, apptReminders }: Options): AssistantData {
  const first = name.split(" ")[0] ?? "";
  const hello = `${greeting()}, ${first}!`;
  const noReminders = !medReminders && !apptReminders;
  const muted = "Os lembretes estão desativados nas configurações.";

  if (profile === "paciente" || profile === "cuidador-domiciliar") {
    const me = profile === "paciente";
    const who = DEMO_PATIENT.firstName;
    const overview = [`${hello} ${me ? "Aqui está o resumo do seu dia." : `Aqui está o resumo do dia de ${who}.`}`];
    if (medReminders) overview.push(medLine("maria", me, who));
    if (apptReminders) overview.push(consultLine("maria", me, who));
    overview.push(exerciseLine());
    if (noReminders) overview.push(muted);
    return {
      overview,
      replies: [
        { id: "med", label: "Próximo medicamento", answer: [medLine("maria", me, who)] },
        { id: "consulta", label: "Próxima consulta", answer: [consultLine("maria", me, who)] },
        { id: "exercicio", label: "Exercício de hoje", answer: [exerciseLine()] },
      ],
    };
  }

  if (profile === "medico") {
    const today = agendaToday("medico");
    const weekCount = appointmentsNextDays().reduce((sum, day) => sum + day.appointments, 0);
    const next = nextConsultation();
    const firstToday = today[0];
    const todayLine = firstToday
      ? `Hoje você tem ${plural(today.length, "consulta", "consultas")}. A primeira é com ${firstToday.title}, às ${firstToday.time}.`
      : "Você não tem consultas hoje.";
    const overview = [`${hello} Aqui está o resumo do seu dia.`];
    if (apptReminders) {
      overview.push(todayLine, `Nos próximos 7 dias: ${plural(weekCount, "consulta", "consultas")}.`);
    } else {
      overview.push(muted);
    }
    overview.push(`Você acompanha ${PATIENTS_BASE.length} pacientes.`);
    return {
      overview,
      replies: [
        {
          id: "hoje",
          label: "Consultas de hoje",
          answer: today.length ? today.map((item) => `${item.time} · ${item.title}`) : ["Nenhuma consulta hoje."],
        },
        {
          id: "proxima",
          label: "Próxima consulta",
          answer: [next ? `${next.patientName}, ${longDayLabel(next.date, next.time)}.` : "Nenhuma consulta agendada."],
        },
        { id: "pacientes", label: "Meus pacientes", answer: [`${PATIENTS_BASE.map((p) => p.name).join(", ")}.`] },
      ],
    };
  }

  const pending = PATIENTS_BASE.map((patient) => ({
    name: patient.name,
    doses: dosesToday(patient.id).filter((dose) => !dose.taken),
  })).filter((item) => item.doses.length > 0);
  const pendingTotal = pending.reduce((sum, item) => sum + item.doses.length, 0);
  const today = agendaToday("cuidador-clinico");
  const pendingLine =
    pendingTotal === 0
      ? "Todos os horários de medicamento de hoje foram registrados."
      : `Há ${plural(pendingTotal, "horário", "horários")} de medicamento sem registro hoje entre os pacientes.`;
  const todayLine = `Consultas hoje: ${today.length}.`;
  const overview = [`${hello} Aqui está o resumo do seu dia.`];
  if (medReminders) overview.push(pendingLine);
  if (apptReminders) overview.push(todayLine);
  if (noReminders) overview.push(muted);
  return {
    overview,
    replies: [
      {
        id: "meds",
        label: "Medicamentos pendentes",
        answer: pending.length
          ? pending.map((item) => `${item.name}: próximo ${item.doses[0].name}, às ${item.doses[0].time}`)
          : ["Nada pendente."],
      },
      {
        id: "hoje",
        label: "Consultas de hoje",
        answer: today.length ? today.map((item) => `${item.time} · ${item.title}`) : ["Nenhuma consulta hoje."],
      },
    ],
  };
}