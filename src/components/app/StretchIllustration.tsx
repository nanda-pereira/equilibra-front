
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

const SKIN = "#DCA783";
const SKIN_SHADOW = "#C88C6A";
const SHIRT = "#4EA4A0";
const SHIRT_LIGHT = "#78C5BC";
const SHIRT_DARK = "#247477";
const PANTS = "#24585A";
const FURNITURE = "#B8DEDA";

function Arm({
  d,
  width = 10,
  color = SKIN,
  className = "",
}: {
  d: string;
  width?: number;
  color?: string;
  className?: string;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    />
  );
}

function Leg({
  d,
  width = 12,
  className = "",
}: {
  d: string;
  width?: number;
  className?: string;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={PANTS}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    />
  );
}

function Hand({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="5.8" fill={SKIN_SHADOW} opacity=".35" />
      <circle cx={x} cy={y - 1} r="5.3" fill={SKIN} />
    </g>
  );
}

function Head({
  x,
  y,
  tilt = 0,
  look = 0,
}: {
  x: number;
  y: number;
  tilt?: number;
  look?: number;
}) {
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <ellipse
        cx={x - 1}
        cy={y + 1}
        rx="14"
        ry="16"
        fill={SKIN_SHADOW}
        opacity=".2"
      />
      <ellipse cx={x} cy={y} rx="13.5" ry="15" fill={SKIN} />
      <path
        d={`M ${x - 13} ${y - 3}
            Q ${x - 16} ${y - 18} ${x - 3} ${y - 17}
            Q ${x + 12} ${y - 20} ${x + 13} ${y - 5}
            L ${x + 7} ${y - 9}
            Q ${x - 1} ${y - 2} ${x - 12} ${y - 5} Z`}
        fill="#344B49"
      />
      <circle cx={x + 4 + look} cy={y + 1} r="1.25" fill="#34413D" />
      <circle cx={x - 4 + look} cy={y + 1} r="1.25" fill="#34413D" />
      <path
        d={`M ${x - 3} ${y + 7} Q ${x} ${y + 9} ${x + 3} ${y + 7}`}
        fill="none"
        stroke="#9F6555"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <ellipse
        cx={x - 7}
        cy={y + 5}
        rx="3"
        ry="2"
        fill="#EBA8A0"
        opacity=".38"
      />
      <ellipse
        cx={x + 7}
        cy={y + 5}
        rx="3"
        ry="2"
        fill="#EBA8A0"
        opacity=".38"
      />
    </g>
  );
}

function Shirt({
  d,
  className = "",
}: {
  d: string;
  className?: string;
}) {
  return (
    <g className={className}>
      <path d={d} fill={SHIRT_DARK} opacity=".16" transform="translate(0 2)" />
      <path d={d} fill={SHIRT} />
      <path
        d="M 94 76 Q 100 81 106 76"
        fill="none"
        stroke={SHIRT_LIGHT}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

function Chair() {
  return (
    <g className="eq-furniture">
      <rect
        x="61"
        y="116"
        width="9"
        height="47"
        rx="4.5"
        fill={FURNITURE}
      />
      <rect
        x="63"
        y="129"
        width="76"
        height="9"
        rx="4.5"
        fill={FURNITURE}
      />
      <path
        d="M 72 136 L 76 169 M 132 136 L 128 169"
        fill="none"
        stroke="#9DCBC6"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect x="70" y="123" width="64" height="8" rx="4" fill="#D2EBE7" />
    </g>
  );
}

function Wall() {
  return (
    <g className="eq-furniture">
      <rect x="153" y="29" width="13" height="141" rx="6.5" fill={FURNITURE} />
      <rect x="153" y="29" width="4" height="141" rx="2" fill="#D5EBE8" />
    </g>
  );
}

function NeckPose() {
  return (
    <>
      <Leg d="M 96 117 L 91 143 L 90 165" />
      <Leg d="M 105 117 L 111 143 L 112 165" />
      <path
        d="M 81 167 Q 90 162 95 167 L 95 171 L 79 171 Q 77 170 81 167 Z"
        fill="#E0A98B"
      />
      <path
        d="M 105 167 Q 113 162 119 167 L 120 171 L 105 171 Z"
        fill="#E0A98B"
      />
      <Arm d="M 91 79 Q 81 88 81 104 L 82 116" />
      <Arm d="M 109 79 Q 124 75 133 66 L 122 49" />
      <Shirt d="M 88 70 Q 99 65 111 71 L 119 81 L 112 94 L 113 119 Q 99 124 88 118 L 89 94 L 81 83 Z" />
      <path
        d="M 98 68 Q 98 77 105 78 L 110 72"
        fill="none"
        stroke="#2D8581"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Head x={105} y={47} tilt={-23} />
      <Hand x={82} y={116} />
      <Hand x={122} y={49} />
      <path
        d="M 117 42 Q 125 37 130 44"
        fill="none"
        stroke={SHIRT_LIGHT}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".9"
      />
    </>
  );
}

function ShoulderPose() {
  return (
    <>
      <Leg d="M 94 116 L 91 142 L 90 165" />
      <Leg d="M 106 116 L 110 142 L 111 165" />
      <Arm d="M 89 80 Q 82 92 93 97 L 115 93" width={10} />
      <Arm d="M 111 80 Q 120 91 116 99 L 98 91" width={10} />
      <Shirt d="M 88 70 Q 100 65 112 71 L 120 81 L 113 94 L 113 118 Q 100 123 87 118 L 88 94 L 80 82 Z" />
      <Arm d="M 111 79 Q 100 85 94 88 L 79 83" width={9} />
      <Arm d="M 89 79 Q 91 88 98 92 L 115 92" width={9} />
      <Head x={100} y={47} />
      <Hand x={79} y={83} />
      <Hand x={115} y={92} />
      <path
        d="M 91 105 Q 100 109 109 105"
        fill="none"
        stroke={SHIRT_LIGHT}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".7"
      />
    </>
  );
}

function TwistPose() {
  return (
    <>
      <Chair />
      <Leg d="M 94 113 Q 87 123 87 137 L 87 151" />
      <Leg d="M 107 113 Q 116 122 116 137 L 116 151" />
      <path d="M 78 151 Q 88 147 96 151 L 96 156 L 77 156 Z" fill={SKIN} />
      <path d="M 107 151 Q 116 147 125 151 L 126 156 L 107 156 Z" fill={SKIN} />
      <Arm d="M 88 80 Q 79 83 80 96 L 115 88" />
      <Arm d="M 112 80 Q 128 79 143 74 L 160 70" />
      <Shirt d="M 91 69 Q 103 65 114 71 L 120 81 L 113 95 L 113 116 Q 101 121 88 116 L 89 94 L 83 82 Z" />
      <path
        d="M 89 83 Q 102 92 115 81"
        fill="none"
        stroke={SHIRT_LIGHT}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Head x={104} y={47} tilt={-12} look={1} />
      <Hand x={160} y={70} />
      <Hand x={115} y={88} />
      <path
        d="M 144 59 Q 151 55 158 59"
        fill="none"
        stroke={SHIRT_LIGHT}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  );
}

function CalfPose() {
  return (
    <>
      <Wall />
      <Leg d="M 111 111 Q 98 126 84 141 L 57 164" />
      <Leg d="M 111 111 Q 124 128 126 143 L 127 164" />
      <path d="M 47 165 Q 57 159 64 164 L 66 169 L 46 170 Z" fill={SKIN} />
      <path d="M 120 165 Q 128 160 134 165 L 135 170 L 120 170 Z" fill={SKIN} />
      <Arm d="M 111 77 Q 128 75 141 77 L 151 78" />
      <Arm d="M 108 78 Q 127 72 145 75 L 151 78" width={8} />
      <Shirt d="M 108 68 Q 119 64 129 71 L 135 82 L 128 94 L 123 114 Q 111 119 99 112 L 106 91 L 101 81 Z" />
      <Head x={124} y={53} tilt={-8} />
      <Hand x={151} y={78} />
      <circle cx="142" cy="78" r="3" fill={SKIN_SHADOW} opacity=".4" />
    </>
  );
}

function HamstringPose() {
  return (
    <>
      <Chair />
      <Leg d="M 87 116 Q 99 124 117 133 L 146 151" />
      <Leg d="M 87 116 Q 77 128 78 142 L 79 151" />
      <path d="M 138 150 Q 147 145 153 151 L 156 155 L 140 157 Z" fill={SKIN} />
      <path d="M 72 151 Q 79 147 85 151 L 87 156 L 70 156 Z" fill={SKIN} />
      <Arm d="M 94 87 Q 84 100 102 115 L 124 126" />
      <Arm d="M 107 89 Q 117 103 124 126" />
      <Shirt d="M 94 82 Q 104 77 114 84 L 121 96 L 112 105 L 105 119 L 89 113 L 95 98 L 87 92 Z" />
      <Head x={108} y={76} tilt={34} />
      <Hand x={124} y={126} />
      <path
        d="M 97 90 Q 103 96 111 94"
        fill="none"
        stroke={SHIRT_LIGHT}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  );
}

function BalancePose() {
  return (
    <>
      <g className="eq-furniture">
        <path
          d="M 27 97 L 73 97"
          fill="none"
          stroke={FURNITURE}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 34 100 L 34 166"
          fill="none"
          stroke={FURNITURE}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 29 166 L 40 166"
          fill="none"
          stroke="#9DCBC6"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
      <Leg d="M 97 114 Q 96 136 97 163" />
      <Leg d="M 106 114 Q 120 130 135 147" />
      <path d="M 89 163 Q 97 159 103 163 L 105 168 L 87 168 Z" fill={SKIN} />
      <path d="M 129 145 Q 136 141 142 147 L 144 151 L 130 153 Z" fill={SKIN} />
      <Arm d="M 89 79 Q 77 82 70 91 L 62 94" />
      <Arm d="M 111 79 Q 127 72 143 77 L 160 74" />
      <Shirt d="M 89 70 Q 100 65 112 71 L 120 81 L 113 94 L 113 116 Q 101 122 88 116 L 89 94 L 81 82 Z" />
      <Head x={103} y={47} />
      <Hand x={62} y={94} />
      <Hand x={160} y={74} />
      <path
        d="M 94 103 Q 101 107 109 103"
        fill="none"
        stroke={SHIRT_LIGHT}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".75"
      />
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
        <linearGradient id="eq-stretch-background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EFF9F7" />
          <stop offset="100%" stopColor="#DDEFEA" />
        </linearGradient>
        <radialGradient id="eq-stretch-glow" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".96" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity=".22" />
        </radialGradient>
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
          transform-origin: center;
          animation: eq-person-breathe 3.8s ease-in-out infinite;
        }

        .eq-stretch-illustration .eq-furniture {
          transform-box: fill-box;
          transform-origin: center;
        }

        .eq-stretch-illustration .eq-decoration {
          transform-box: fill-box;
          transform-origin: center;
          animation: eq-decoration-float 5s ease-in-out infinite;
        }

        .eq-stretch-illustration .eq-pose-motion {
          transform-box: fill-box;
          transform-origin: center;
          animation: eq-pose-sway 4.5s ease-in-out infinite;
        }

        @keyframes eq-person-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }

        @keyframes eq-decoration-float {
          0%, 100% { transform: translateY(0); opacity: .75; }
          50% { transform: translateY(-3px); opacity: 1; }
        }

        @keyframes eq-pose-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-1deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .eq-stretch-illustration *,
          .eq-stretch-illustration *::before,
          .eq-stretch-illustration *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <rect
        width="200"
        height="200"
        rx="28"
        fill="url(#eq-stretch-background)"
      />
      <circle cx="100" cy="96" r="75" fill="url(#eq-stretch-glow)" />

      <g className="eq-decoration" opacity=".85">
        <circle cx="37" cy="45" r="4" fill="#9BD4CC" />
        <circle cx="163" cy="53" r="3" fill="#B1DFD8" />
        <path
          d="M 143 35 Q 148 28 153 35 Q 148 42 143 35 Z"
          fill="#9BD4CC"
        />
        <path
          d="M 42 127 Q 47 120 52 127 Q 47 134 42 127 Z"
          fill="#C3E5DF"
        />
      </g>

      <ellipse
        cx="100"
        cy="172"
        rx="55"
        ry="5"
        fill="#9ACBC5"
        opacity=".25"
      />
      <line
        x1="25"
        y1="173"
        x2="175"
        y2="173"
        stroke="#B8DCD7"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <g className="eq-person">
        <g className="eq-pose-motion">
          <Illustration />
        </g>
      </g>

      <circle
        cx="163"
        cy="151"
        r="12"
        fill="#FFFFFF"
        opacity=".72"
      />
      <path
        d="M 158 151 L 162 155 L 168 147"
        fill="none"
        stroke="#4EA4A0"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}