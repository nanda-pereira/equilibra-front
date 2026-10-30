import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TICK = { fontSize: 14, fill: "#586463" };
const TOOLTIP_STYLE = { borderRadius: 16, border: "1px solid #C5E3E0", fontSize: 14 };

type Row = Record<string, string | number>;

type TrendProps = {
  data: Row[];
  xKey: string;
  yKey: string;
  seriesName: string;
  /** descrição em texto do gráfico (acessibilidade) */
  summary: string;
  height?: number;
};

export function LineTrendChart({ data, xKey, yKey, seriesName, summary, height = 240 }: TrendProps) {
  return (
    <div role="img" aria-label={summary} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#E8F5F3" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={TICK} />
          <YAxis tickLine={false} axisLine={false} width={44} tick={TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey={yKey}
            name={seriesName}
            stroke="#247477"
            strokeWidth={3}
            dot={{ r: 4, fill: "#4EA4A0", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarTrendChart({ data, xKey, yKey, seriesName, summary, height = 240 }: TrendProps) {
  return (
    <div role="img" aria-label={summary} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#E8F5F3" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={TICK} />
          <YAxis tickLine={false} axisLine={false} width={44} tick={TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#E8F5F3" }} />
          <Bar dataKey={yKey} name={seriesName} fill="#4EA4A0" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type EventsRow = { day: string; stable: number; attention: number; alert: number };

export function EventsChart({
  data,
  summary,
  height = 260,
}: {
  data: EventsRow[];
  summary: string;
  height?: number;
}) {
  return (
    <div role="img" aria-label={summary} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#E8F5F3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={TICK} />
          <YAxis tickLine={false} axisLine={false} width={44} tick={TICK} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#E8F5F3" }} />
          <Legend wrapperStyle={{ fontSize: 14 }} />
          <Bar dataKey="stable" name="Estável" stackId="events" fill="#1F6B42" />
          <Bar dataKey="attention" name="Atenção" stackId="events" fill="#7A5600" />
          <Bar dataKey="alert" name="Alerta" stackId="events" fill="#B3261E" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}