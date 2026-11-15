import React from "react";

export type PoseId =
  | "neck"
  | "shoulder"
  | "twist"
  | "calf"
  | "hamstring"
  | "balance";

type StretchIllustrationProps = {
  pose: PoseId;
  /** Descrição da imagem para leitor de tela */
  label: string;
  className?: string;
};

const PALETTE = {
  skin: "#FBC168",
  skinShadow: "#E2A145",
  line: "#7A2E33",
  hair: "#EAE0C8",
  hairLine: "#C8BBA0",
  shirt: "#4EA4A0",
  shirtBack: "#3B8683",
  pants: "#24585A",
  pantsBack: "#1A4244",
  shoe: "#4EA4A0",
  furniture: "#B8DEDA",
  furnitureDark: "#94C7C1",
  bgStart: "#F3FBF9",
  bgEnd: "#E0F1EE",
};

function Hand({
  x,
  y,
  angle = 0,
  flip = false,
}: {
  x: number;
  y: number;
  angle?: number;
  flip?: boolean;
}) {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${angle}) scale(${flip ? -1 : 1}, 1)`}
    >
      <path
        d="M -3 -4
           C -2 -10, 0 -10, 0.5 -4.5
           C 1.5 -11.5, 3.8 -11, 3.2 -4.2
           C 5.2 -10.5, 7.2 -9.5, 5.5 -3.2
           C 8 -8.2, 9.5 -6.8, 6.8 -1.2
           C 9.5 -3.8, 10.5 -1.8, 6.5 1.5
           C 5 4.2, -2 4.5, -3.5 1.5 Z"
        fill={PALETTE.skin}
      />
    </g>
  );
}

function Shoe({
  x,
  y,
  dir = 1,
  angle = 0,
}: {
  x: number;
  y: number;
  dir?: 1 | -1;
  angle?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle}) scale(${dir}, 1)`}>
      <path d="M 1 -5 L 4 -7 L 5 -4 Z" fill={PALETTE.shoe} />
      <path d="M -7 -5 L 2 -5 Q 11 -4 14 2 L -7 2 Z" fill={PALETTE.shoe} />
    </g>
  );
}

/**
 * Cabeça + Pescoço integrados no mesmo pivô de rotação
 * para evitar que o pescoço desloque ou deforme ao inclinar.
 */
function Head({
  x,
  y,
  tilt = 0,
  look = 0,
  ponytailSide = 1,
  neckLength = 15,
}: {
  x: number;
  y: number;
  tilt?: number;
  look?: number;
  ponytailSide?: 1 | -1;
  neckLength?: number;
}) {
  // O pivô fica na base do pescoço (onde encontra a gola da camiseta)
  const pivotY = y + 11 + neckLength * 0.5;

  return (
    <g transform={`rotate(${tilt} ${x} ${pivotY})`}>
      {/* Pescoço contínuo partindo do centro da cabeça até a gola */}
      <rect
        x={x - 5}
        y={y + 8}
        width="10"
        height={neckLength + 6}
        rx="5"
        fill={PALETTE.skin}
      />
      {/* Sombra suave do queixo no pescoço */}
      <path
        d={`M ${x - 5} ${y + 13} Q ${x} ${y + 16.5} ${x + 5} ${y + 13} L ${x + 5} ${y + 10} L ${x - 5} ${y + 10} Z`}
        fill={PALETTE.skinShadow}
        opacity=".45"
      />

      {/* Rabo de cavalo baixo */}
      <g transform={`translate(${x + ponytailSide * 12}, ${y + 11})`}>
        <ellipse
          cx={ponytailSide * 2}
          cy="3"
          rx="7.5"
          ry="6.5"
          fill={PALETTE.hair}
        />
        <path
          d={`M ${-ponytailSide * 2} -1 Q ${ponytailSide * 2} 2 ${ponytailSide * 3} 6`}
          fill="none"
          stroke={PALETTE.hairLine}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect
          x={-3}
          y={-3}
          width="6"
          height="2.5"
          rx="1.2"
          transform={`rotate(${ponytailSide * -35})`}
          fill="#E5A39B"
        />
      </g>

      {/* Orelha esquerda */}
      <g transform={`translate(${x - 14.5}, ${y + 1})`}>
        <circle r="4.2" fill={PALETTE.skin} />
        <path
          d="M 1 -1.5 Q -1.5 -1.5 -1.5 1.5 M -1 0 L 1 0.8"
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.15"
          strokeLinecap="round"
        />
      </g>

      {/* Orelha direita */}
      <g transform={`translate(${x + 14.5}, ${y + 1})`}>
        <circle r="4.2" fill={PALETTE.skin} />
        <path
          d="M -1 -1.5 Q 1.5 -1.5 1.5 1.5 M 1 0 L -1 0.8"
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.15"
          strokeLinecap="round"
        />
      </g>

      {/* Rosto */}
      <ellipse cx={x} cy={y} rx="14" ry="14.5" fill={PALETTE.skin} />

      {/* Cabelo partido ao meio */}
      <path
        d={`M ${x - 14} ${y - 2}
            Q ${x - 13} ${y - 16} ${x} ${y - 16}
            Q ${x + 13} ${y - 16} ${x + 14} ${y - 2}
            Q ${x + 7} ${y - 10} ${x} ${y - 11}
            Q ${x - 7} ${y - 10} ${x - 14} ${y - 2} Z`}
        fill={PALETTE.hair}
      />
      <path
        d={`M ${x} ${y - 15.5} L ${x} ${y - 11}
            M ${x - 8} ${y - 11} Q ${x - 4} ${y - 13} ${x - 1} ${y - 12}
            M ${x + 8} ${y - 11} Q ${x + 4} ${y - 13} ${x + 1} ${y - 12}`}
        fill="none"
        stroke={PALETTE.hairLine}
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Expressão facial */}
      <g transform={`translate(${look}, 0)`}>
        {/* Sobrancelhas */}
        <path
          d={`M ${x - 6.8} ${y - 6.5} Q ${x - 5} ${y - 7.5} ${x - 3.2} ${y - 6.5}`}
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <path
          d={`M ${x + 3.2} ${y - 6.5} Q ${x + 5} ${y - 7.5} ${x + 6.8} ${y - 6.5}`}
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.15"
          strokeLinecap="round"
        />

        {/* Olhos fechados tranquilos */}
        <path
          d={`M ${x - 6.8} ${y - 3.5} C ${x - 6.8} ${y + 0.5}, ${x - 3.2} ${y + 0.5}, ${x - 3.2} ${y - 3.5}`}
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d={`M ${x + 3.2} ${y - 3.5} C ${x + 3.2} ${y + 0.5}, ${x + 6.8} ${y + 0.5}, ${x + 6.8} ${y - 3.5}`}
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* Nariz */}
        <path
          d={`M ${x - 0.5} ${y - 2} L ${x - 1.5} ${y + 2} Q ${x + 1.5} ${y + 3.5} ${x + 2.5} ${y + 1}`}
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bochechas */}
        <path
          d={`M ${x - 7.5} ${y + 4.5} Q ${x - 5.5} ${y + 3} ${x - 4} ${y + 4.5}`}
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d={`M ${x + 4} ${y + 4.5} Q ${x + 5.5} ${y + 3} ${x + 7.5} ${y + 4.5}`}
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.1"
          strokeLinecap="round"
        />

        {/* Sorriso */}
        <path
          d={`M ${x - 2} ${y + 5.8} Q ${x + 1.5} ${y + 8.5} ${x + 4.5} ${y + 5.2}`}
          fill="none"
          stroke={PALETTE.line}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

function Chair() {
  return (
    <g>
      <rect x="61" y="96" width="8" height="44" rx="4" fill={PALETTE.furniture} />
      <rect x="63" y="131" width="74" height="8" rx="4" fill={PALETTE.furniture} />
      <path
        d="M 72 138 L 68 171 M 129 138 L 133 171"
        fill="none"
        stroke={PALETTE.furnitureDark}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </g>
  );
}

function Wall() {
  return (
    <rect x="155" y="28" width="13" height="145" rx="6.5" fill={PALETTE.furniture} />
  );
}

function NeckPose() {
  return (
    <>
      <rect x="82" y="157" width="7" height="13" fill={PALETTE.skin} />
      <rect x="111" y="157" width="7" height="13" fill={PALETTE.skin} />
      <Shoe x={84} y={171} dir={-1} />
      <Shoe x={116} y={171} dir={1} />

      <path
        d="M 83 114 L 117 114 L 122 159 L 107 159 L 100 128 L 93 159 L 78 159 Z"
        fill={PALETTE.pants}
      />

      {/* Braço esquerdo na cintura */}
      <path
        d="M 85 78 Q 66 93 84 108"
        fill="none"
        stroke={PALETTE.skin}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <Hand x={86} y={108} angle={85} />

      {/* Braço direito por cima da cabeça */}
      <path
        d="M 115 77 Q 134 55 104 37"
        fill="none"
        stroke={PALETTE.skin}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <Hand x={102} y={37} angle={-75} flip />

      <Head x={100} y={48} tilt={-18} />

      {/* Camiseta menta */}
      <path
        d="M 85 71 Q 100 68 115 71 L 126 83 L 118 91 L 117 116 L 83 116 L 82 91 L 74 83 Z"
        fill={PALETTE.shirt}
      />
    </>
  );
}

function ShoulderPose() {
  return (
    <>
      <rect x="82" y="157" width="7" height="13" fill={PALETTE.skin} />
      <rect x="111" y="157" width="7" height="13" fill={PALETTE.skin} />
      <Shoe x={84} y={171} dir={-1} />
      <Shoe x={116} y={171} dir={1} />

      <path
        d="M 83 114 L 117 114 L 122 159 L 107 159 L 100 128 L 93 159 L 78 159 Z"
        fill={PALETTE.pants}
      />

      <Head x={100} y={48} />

      <path
        d="M 85 71 Q 100 68 115 71 L 126 84 L 117 91 L 117 116 L 83 116 L 83 91 L 74 84 Z"
        fill={PALETTE.shirt}
      />

      {/* Braço cruzando na frente */}
      <path
        d="M 116 81 L 74 86"
        fill="none"
        stroke={PALETTE.skin}
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <Hand x={71} y={86} angle={-90} flip />

      {/* Braço fazendo alavanca */}
      <path
        d="M 84 81 Q 83 99 97 97 L 97 82"
        fill="none"
        stroke={PALETTE.skin}
        strokeWidth="9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Hand x={97} y={80} angle={0} />
    </>
  );
}

function TwistPose() {
  return (
    <>
      <Chair />

      <rect x="83" y="158" width="6.5" height="12" fill={PALETTE.skinShadow} />
      <rect x="112" y="158" width="6.5" height="12" fill={PALETTE.skin} />
      <Shoe x={86} y={171} dir={1} />
      <Shoe x={115} y={171} dir={1} />

      <path
        d="M 86 113 L 104 113 L 94 159 L 80 159 Z"
        fill={PALETTE.pantsBack}
      />
      <path
        d="M 86 113 L 121 115 L 122 159 L 108 159 L 106 127 L 86 127 Z"
        fill={PALETTE.pants}
      />

      {/* Braço de trás no encosto */}
      <path
        d="M 87 79 Q 72 86 65 101"
        fill="none"
        stroke={PALETTE.skinShadow}
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <Hand x={65} y={102} angle={-140} />

      <Head x={100} y={48} tilt={-8} look={-2} />

      <path
        d="M 86 71 Q 100 68 114 71 L 123 84 L 114 91 L 114 115 L 86 115 L 85 90 L 76 83 Z"
        fill={PALETTE.shirt}
      />

      {/* Braço da frente no joelho */}
      <path
        d="M 114 81 Q 119 101 103 116"
        fill="none"
        stroke={PALETTE.skin}
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <Hand x={101} y={117} angle={-110} />
    </>
  );
}

function CalfPose() {
  return (
    <>
      <Wall />

      <rect
        x="61"
        y="156"
        width="7"
        height="12"
        transform="rotate(-25 61 156)"
        fill={PALETTE.skinShadow}
      />
      <rect x="122" y="158" width="7" height="12" fill={PALETTE.skin} />
      <Shoe x={65} y={169} dir={1} angle={-15} />
      <Shoe x={125} y={171} dir={1} />

      <path
        d="M 96 111 L 111 113 L 71 162 L 58 155 Z"
        fill={PALETTE.pantsBack}
      />
      <path
        d="M 101 112 L 117 112 L 132 135 L 131 159 L 118 159 L 117 138 Z"
        fill={PALETTE.pants}
      />

      {/* Braço de trás */}
      <path
        d="M 116 78 L 151 74"
        fill="none"
        stroke={PALETTE.skinShadow}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <Hand x={152} y={74} angle={15} />

      <Head x={118} y={48} tilt={12} look={2} ponytailSide={-1} />

      <path
        d="M 100 69 Q 114 67 126 73 L 133 86 L 123 91 L 119 114 L 94 111 L 98 87 L 91 81 Z"
        fill={PALETTE.shirt}
      />

      {/* Braço da frente na parede */}
      <path
        d="M 112 80 L 151 80"
        fill="none"
        stroke={PALETTE.skin}
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <Hand x={152} y={80} angle={15} />
    </>
  );
}

function HamstringPose() {
  return (
    <>
      <Chair />

      <rect x="74" y="158" width="6.5" height="12" fill={PALETTE.skinShadow} />
      <rect
        x="142"
        y="155"
        width="6.5"
        height="12"
        transform="rotate(-40 142 155)"
        fill={PALETTE.skin}
      />
      <Shoe x={77} y={171} dir={1} />
      <Shoe x={150} y={166} dir={1} angle={-35} />

      <path
        d="M 83 114 L 96 116 L 83 159 L 70 159 Z"
        fill={PALETTE.pantsBack}
      />
      <path
        d="M 84 114 L 97 114 L 150 156 L 140 165 Z"
        fill={PALETTE.pants}
      />

      {/* Braço de trás */}
      <path
        d="M 107 84 L 134 134"
        fill="none"
        stroke={PALETTE.skinShadow}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <Hand x={135} y={136} angle={145} />

      <Head x={111} y={59} tilt={28} look={2} ponytailSide={-1} />

      <path
        d="M 92 78 Q 105 76 115 84 L 118 98 L 109 101 L 101 118 L 82 112 L 88 94 L 82 87 Z"
        fill={PALETTE.shirt}
      />

      {/* Braço da frente */}
      <path
        d="M 96 87 Q 112 110 131 138"
        fill="none"
        stroke={PALETTE.skin}
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <Hand x={132} y={140} angle={145} />
    </>
  );
}

function BalancePose() {
  return (
    <>
      <path
        d="M 28 96 L 72 96"
        fill="none"
        stroke={PALETTE.furniture}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 36 99 L 36 171"
        fill="none"
        stroke={PALETTE.furnitureDark}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 27 171 L 45 171"
        fill="none"
        stroke={PALETTE.furniture}
        strokeWidth="5"
        strokeLinecap="round"
      />

      <rect x="88" y="157" width="7" height="13" fill={PALETTE.skin} />
      <rect
        x="128"
        y="138"
        width="7"
        height="11"
        transform="rotate(-35 128 138)"
        fill={PALETTE.skinShadow}
      />
      <Shoe x={91} y={171} dir={1} />
      <Shoe x={136} y={148} dir={1} angle={25} />

      <path
        d="M 101 114 L 114 114 L 136 138 L 125 146 Z"
        fill={PALETTE.pantsBack}
      />
      <path
        d="M 85 114 L 103 114 L 99 159 L 84 159 Z"
        fill={PALETTE.pants}
      />

      {/* Braço na barra */}
      <path
        d="M 86 79 Q 72 84 62 92"
        fill="none"
        stroke={PALETTE.skin}
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <Hand x={60} y={92} angle={-110} />

      <Head x={100} y={48} look={1} />

      <path
        d="M 85 71 Q 100 68 115 71 L 125 83 L 116 90 L 115 116 L 85 116 L 84 90 L 75 83 Z"
        fill={PALETTE.shirt}
      />

      {/* Braço aberto */}
      <path
        d="M 115 79 Q 134 73 153 77"
        fill="none"
        stroke={PALETTE.skin}
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <Hand x={156} y={77} angle={85} />
    </>
  );
}

const RENDER_POSE: Record<PoseId, () => React.ReactNode> = {
  neck: NeckPose,
  shoulder: ShoulderPose,
  twist: TwistPose,
  calf: CalfPose,
  hamstring: HamstringPose,
  balance: BalancePose,
};

export default function StretchIllustration({
  pose,
  label,
  className = "",
}: StretchIllustrationProps) {
  const Illustration = RENDER_POSE[pose];

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      className={`eq-stretch-illustration ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{label}</title>
      <defs>
        <linearGradient id="eq-mint-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PALETTE.bgStart} />
          <stop offset="100%" stopColor={PALETTE.bgEnd} />
        </linearGradient>
      </defs>

      <style>{`
        .eq-stretch-illustration {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .eq-stretch-illustration .eq-person {
          transform-box: fill-box;
          transform-origin: 50% 90%;
          animation: eq-person-breathe 4.2s ease-in-out infinite;
        }

        @keyframes eq-person-breathe {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-1.2px) scaleY(1.007); }
        }

        @media (prefers-reduced-motion: reduce) {
          .eq-stretch-illustration * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Fundo menta suave */}
      <rect width="200" height="200" rx="28" fill="url(#eq-mint-bg)" />

      {/* Sombra sutil no chão */}
      <ellipse cx="100" cy="173.5" rx="52" ry="3.5" fill="#B5D6D1" opacity=".45" />

      {/* Personagem */}
      <g className="eq-person">
        <Illustration />
      </g>
    </svg>
  );
}