import type { ReactNode } from "react";

export type PoseId = "neck" | "shoulder" | "twist" | "calf" | "hamstring" | "balance";

type Pose = {
  head: [number, number];
  limbs: string[];
  hands: [number, number][];
  props?: ReactNode;
};

const FURNITURE = "#C5E3E0";

function Bar({ points, width = 8 }: { points: string; width?: number }) {
  return (
    <polyline
      points={points}
      fill="none"
      stroke={FURNITURE}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

const POSES: Record<PoseId, Pose> = {
  neck: {
    head: [108, 46],
    limbs: [
      "103,60 100,74",
      "82,74 118,74",
      "100,74 100,112",
      "82,74 78,94 80,114",
      "118,74 138,66 126,48",
      "100,112 92,140 91,168",
      "100,112 108,140 109,168",
    ],
    hands: [[80, 114], [126, 48]],
  },
  shoulder: {
    head: [100, 46],
    limbs: [
      "100,60 100,74",
      "82,74 118,74",
      "100,74 100,112",
      "118,74 98,88 80,82",
      "82,74 76,92 98,94",
      "100,112 92,140 91,168",
      "100,112 108,140 109,168",
    ],
    hands: [[80, 82], [98, 94]],
  },
  twist: {
    head: [104, 46],
    limbs: [
      "103,60 102,74",
      "88,74 114,72",
      "102,74 100,122",
      "114,72 140,74 160,70",
      "88,74 96,92 118,86",
      "96,122 84,130 84,168",
      "104,122 116,130 116,168",
    ],
    hands: [[160, 70], [118, 86]],
    props: (
      <>
        <Bar points="66,132 134,132" />
        <Bar points="136,134 136,92" />
        <Bar points="70,134 70,170" />
        <Bar points="132,134 132,170" />
      </>
    ),
  },
  calf: {
    head: [124, 54],
    limbs: [
      "120,62 114,74",
      "114,74 82,114",
      "82,114 46,168",
      "82,114 106,138 110,168",
      "114,74 148,78",
    ],
    hands: [[148, 78]],
    props: <rect x="150" y="24" width="14" height="148" rx="7" fill={FURNITURE} />,
  },
  hamstring: {
    head: [110, 78],
    limbs: [
      "98,92 104,84",
      "74,134 98,92",
      "74,134 128,164",
      "128,164 136,158",
      "74,134 96,140 94,168",
      "98,92 122,126",
    ],
    hands: [[122, 126]],
    props: (
      <>
        <Bar points="52,142 108,142" />
        <Bar points="54,144 54,104" />
        <Bar points="58,144 58,170" />
        <Bar points="104,144 104,170" />
      </>
    ),
  },
  balance: {
    head: [104, 46],
    limbs: [
      "103,60 102,74",
      "84,74 120,74",
      "102,74 102,112",
      "84,74 72,88 62,94",
      "120,74 142,80 160,74",
      "102,112 100,140 100,168",
      "102,112 120,136 136,150",
    ],
    hands: [[62, 94], [160, 74]],
    props: (
      <>
        <Bar points="28,98 72,98" />
        <Bar points="34,100 34,170" />
      </>
    ),
  },
};

type StretchIllustrationProps = {
  pose: PoseId;
  /** descrição da imagem para leitor de tela */
  label: string;
  className?: string;
};

export default function StretchIllustration({
  pose,
  label,
  className = "",
}: StretchIllustrationProps) {
  const { head, limbs, hands, props } = POSES[pose];

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={label} className={className}>
      <rect width="200" height="200" rx="28" fill="#E8F5F3" />
      <circle cx="100" cy="100" r="78" fill="#FFFFFF" opacity="0.65" />
      <line x1="24" y1="172" x2="176" y2="172" stroke={FURNITURE} strokeWidth="5" strokeLinecap="round" />
      {props}
      {limbs.map((points) => (
        <polyline
          key={points}
          points={points}
          fill="none"
          stroke="#247477"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {hands.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill="#4EA4A0" />
      ))}
      <circle cx={head[0]} cy={head[1]} r="14" fill="#4EA4A0" />
    </svg>
  );
}