import type { ArtKind, Product } from "@/lib/types";

/* ── цвет ─────────────────────────────────────────── */
function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
}
function mix(a: string, b: string, t: number) {
  const A = rgb(a);
  const B = rgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
}
const shade = (c: string, t: number) => mix(c, "#000000", t);
const tint = (c: string, t: number) => mix(c, "#ffffff", t);
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

/* ── мебель (viewBox 400×300) ──────────────────────── */
export function Furniture({ kind, tone, accent }: { kind: ArtKind; tone: string; accent: string }) {
  const dark = shade(tone, 0.22);
  const light = tint(tone, 0.18);
  const leg = "#3a2e26";
  const shadow = <ellipse cx="200" cy="262" rx="150" ry="9" fill="#0f2217" opacity="0.13" />;

  switch (kind) {
    case "sofa":
      return (
        <g>
          {shadow}
          <rect x="70" y="98" width="260" height="96" rx="36" fill={tone} />
          <rect x="44" y="132" width="52" height="104" rx="24" fill={dark} />
          <rect x="304" y="132" width="52" height="104" rx="24" fill={dark} />
          <rect x="82" y="168" width="236" height="62" rx="22" fill={light} />
          <rect x="92" y="150" width="104" height="52" rx="20" fill={tone} />
          <rect x="204" y="150" width="104" height="52" rx="20" fill={tone} />
          <rect x="98" y="154" width="92" height="12" rx="6" fill="#fff" opacity="0.16" />
          <rect x="210" y="154" width="92" height="12" rx="6" fill="#fff" opacity="0.16" />
          <rect x="66" y="236" width="10" height="20" rx="3" fill={leg} />
          <rect x="324" y="236" width="10" height="20" rx="3" fill={leg} />
        </g>
      );
    case "corner":
      return (
        <g>
          {shadow}
          <rect x="40" y="92" width="320" height="84" rx="30" fill={tone} />
          <rect x="30" y="126" width="48" height="108" rx="22" fill={dark} />
          <rect x="50" y="164" width="226" height="64" rx="22" fill={light} />
          <rect x="246" y="168" width="116" height="84" rx="24" fill={light} />
          <rect x="62" y="146" width="100" height="50" rx="18" fill={tone} />
          <rect x="170" y="146" width="100" height="50" rx="18" fill={tone} />
          <rect x="262" y="196" width="86" height="40" rx="16" fill={tone} />
          <rect x="268" y="258" width="10" height="12" rx="3" fill={leg} />
          <rect x="336" y="258" width="10" height="12" rx="3" fill={leg} />
          <rect x="48" y="232" width="10" height="20" rx="3" fill={leg} />
        </g>
      );
    case "dining": {
      const seat = accent;
      const chair = (x: number, flip: boolean) => (
        <g transform={flip ? `translate(${x + 80} 0) scale(-1 1)` : `translate(${x} 0)`}>
          <rect x="10" y="106" width="58" height="78" rx="20" fill={shade(seat, 0.1)} />
          <rect x="2" y="170" width="76" height="26" rx="12" fill={seat} />
          <rect x="8" y="196" width="7" height="58" rx="3" fill={leg} />
          <rect x="64" y="196" width="7" height="58" rx="3" fill={leg} />
        </g>
      );
      return (
        <g>
          {shadow}
          {chair(40, false)}
          {chair(280, true)}
          <rect x="190" y="168" width="20" height="74" rx="6" fill={dark} />
          <ellipse cx="200" cy="246" rx="52" ry="10" fill={dark} />
          <ellipse cx="200" cy="162" rx="124" ry="30" fill={dark} />
          <ellipse cx="200" cy="154" rx="124" ry="30" fill={tone} />
          <ellipse cx="200" cy="150" rx="70" ry="14" fill="#fff" opacity="0.12" />
          <g transform="translate(200 136)">
            <rect x="-6" y="-2" width="12" height="14" rx="3" fill="#e8e2d2" />
            <path d="M0 -4 C-14 -22 -4 -34 0 -40 C4 -34 14 -22 0 -4Z" fill="#2f7a52" />
          </g>
        </g>
      );
    }
    case "glassdining":
      return (
        <g>
          {shadow}
          <g fill={accent}>
            <rect x="52" y="96" width="50" height="86" rx="12" />
            <rect x="46" y="172" width="64" height="20" rx="8" />
            <rect x="298" y="96" width="50" height="86" rx="12" />
            <rect x="290" y="172" width="64" height="20" rx="8" />
          </g>
          <rect x="82" y="190" width="5" height="62" fill="#c4c9cc" />
          <rect x="313" y="190" width="5" height="62" fill="#c4c9cc" />
          <polygon points="86,150 314,150 346,184 54,184" fill={tone} stroke="#d9dede" strokeWidth="2" />
          <g fill="none" stroke={accent} strokeWidth="2.4" opacity="0.85">
            <circle cx="140" cy="167" r="11" />
            <circle cx="190" cy="165" r="6" />
            <circle cx="236" cy="168" r="13" />
            <circle cx="286" cy="167" r="7" />
          </g>
          <rect x="70" y="184" width="260" height="6" fill="#cfd5d8" />
          <rect x="110" y="190" width="5" height="60" fill="#c4c9cc" />
          <rect x="285" y="190" width="5" height="60" fill="#c4c9cc" />
        </g>
      );
    case "chair":
      return (
        <g>
          {shadow}
          <rect x="132" y="54" width="10" height="110" rx="4" fill={tone} />
          <rect x="258" y="54" width="10" height="110" rx="4" fill={tone} />
          <rect x="132" y="58" width="136" height="16" rx="6" fill={tone} />
          <rect x="146" y="86" width="108" height="56" rx="10" fill={accent} opacity="0.9" />
          <rect x="120" y="156" width="160" height="34" rx="12" fill={accent} />
          <rect x="120" y="186" width="160" height="12" rx="5" fill={dark} />
          <rect x="128" y="196" width="10" height="62" rx="4" fill={tone} />
          <rect x="262" y="196" width="10" height="62" rx="4" fill={tone} />
          <rect x="152" y="196" width="8" height="52" rx="3" fill={dark} />
          <rect x="240" y="196" width="8" height="52" rx="3" fill={dark} />
        </g>
      );
    case "armchair": {
      const lines = [];
      for (let i = 0; i < 6; i++) {
        lines.push(<line key={`a${i}`} x1={120 + i * 30} y1="62" x2={160 + i * 30 - 80} y2="150" stroke={dark} strokeWidth="1.6" opacity="0.5" />);
        lines.push(<line key={`b${i}`} x1={200 + i * 30 - 80} y1="62" x2={240 + i * 30 - 160} y2="150" stroke={dark} strokeWidth="1.6" opacity="0.5" />);
      }
      return (
        <g>
          {shadow}
          <path d="M118 160 C112 70 150 48 200 48 C250 48 288 70 282 160 Z" fill={tone} />
          <g clipPath="url(#qclip)">{lines}</g>
          <clipPath id="qclip"><path d="M126 156 C122 78 156 58 200 58 C244 58 278 78 274 156 Z" /></clipPath>
          <rect x="104" y="146" width="192" height="44" rx="20" fill={light} />
          <rect x="94" y="120" width="34" height="78" rx="16" fill={tone} />
          <rect x="272" y="120" width="34" height="78" rx="16" fill={tone} />
          <path d="M128 198 L112 258" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M272 198 L288 258" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M160 198 L156 252" stroke={accent} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
          <path d="M240 198 L244 252" stroke={accent} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
        </g>
      );
    }
    case "theatre":
      return (
        <g>
          <ellipse cx="200" cy="262" rx="170" ry="9" fill="#0f2217" opacity="0.13" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${46 + i * 108} 0)`}>
              <rect x="6" y="64" width="90" height="116" rx="18" fill={tone} />
              <rect x="16" y="76" width="70" height="30" rx="10" fill="#fff" opacity="0.1" />
              <rect x="0" y="172" width="102" height="40" rx="14" fill={shade(tone, 0.12)} />
              <rect x="-4" y="140" width="14" height="78" rx="6" fill={shade(tone, 0.35)} />
              <rect x="44" y="214" width="14" height="44" rx="4" fill="#2b2b2b" />
              <rect x="22" y="252" width="58" height="8" rx="4" fill="#2b2b2b" />
            </g>
          ))}
          <rect x="344" y="140" width="14" height="78" rx="6" fill={shade(tone, 0.35)} />
        </g>
      );
    case "office":
      return (
        <g>
          {shadow}
          <rect x="164" y="30" width="72" height="30" rx="14" fill={accent} />
          <rect x="188" y="58" width="24" height="18" fill="#444" />
          <rect x="146" y="74" width="108" height="112" rx="26" fill={tone} />
          <g stroke="#fff" strokeOpacity="0.12" strokeWidth="1.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={i} x1={160 + i * 10} y1="84" x2={160 + i * 10} y2="176" />
            ))}
          </g>
          <rect x="126" y="176" width="148" height="30" rx="14" fill={shade(tone, 0.1)} />
          <rect x="108" y="130" width="14" height="48" rx="6" fill={accent} />
          <rect x="278" y="130" width="14" height="48" rx="6" fill={accent} />
          <rect x="192" y="206" width="16" height="36" fill="#555" />
          <path d="M200 242 L130 262 M200 242 L270 262 M200 242 L200 266" stroke="#2a2a2a" strokeWidth="9" strokeLinecap="round" />
          <circle cx="128" cy="266" r="7" fill="#1c1c1c" />
          <circle cx="272" cy="266" r="7" fill="#1c1c1c" />
          <circle cx="200" cy="270" r="7" fill="#1c1c1c" />
        </g>
      );
    case "desk":
      return (
        <g>
          {shadow}
          <g fill={accent}>
            <rect x="244" y="110" width="12" height="34" rx="4" opacity="0" />
            <rect x="258" y="96" width="70" height="66" rx="14" />
            <rect x="250" y="156" width="86" height="22" rx="9" />
            <rect x="262" y="178" width="7" height="76" rx="3" fill="#555" />
            <rect x="318" y="178" width="7" height="76" rx="3" fill="#555" />
          </g>
          <polygon points="58,138 238,138 262,168 36,168" fill={tone} />
          <polygon points="36,168 262,168 262,180 36,180" fill={shade(tone, 0.25)} />
          <rect x="58" y="180" width="7" height="76" rx="3" fill="#555" />
          <rect x="230" y="180" width="7" height="76" rx="3" fill="#555" />
          <rect x="66" y="212" width="164" height="6" rx="3" fill="#555" />
        </g>
      );
    case "bed":
      return (
        <g>
          {shadow}
          <rect x="52" y="104" width="22" height="106" rx="8" fill={accent} />
          <rect x="326" y="136" width="22" height="74" rx="8" fill={accent} />
          <rect x="70" y="164" width="262" height="34" rx="10" fill="#e5eaee" />
          <rect x="82" y="140" width="238" height="40" rx="16" fill="#fff" stroke="#dfe5e9" strokeWidth="2" />
          <rect x="94" y="130" width="62" height="24" rx="12" fill="#fff" stroke="#dfe5e9" strokeWidth="2" />
          <rect x="82" y="150" width="238" height="14" rx="6" fill={tint(accent, 0.7)} />
          <g stroke="#9aa5ad" strokeWidth="4" strokeLinecap="round">
            <line x1="100" y1="122" x2="300" y2="122" />
            <line x1="112" y1="122" x2="112" y2="164" />
            <line x1="200" y1="122" x2="200" y2="164" />
            <line x1="288" y1="122" x2="288" y2="164" />
            <line x1="90" y1="206" x2="90" y2="244" />
            <line x1="310" y1="206" x2="310" y2="244" />
          </g>
          <circle cx="90" cy="252" r="9" fill="#333" />
          <circle cx="310" cy="252" r="9" fill="#333" />
        </g>
      );
    case "door":
    default: {
      const glassy = lum(tone) > 0.8;
      return (
        <g>
          <ellipse cx="200" cy="284" rx="110" ry="6" fill="#0f2217" opacity="0.12" />
          <rect x="116" y="12" width="168" height="272" rx="3" fill={shade(tone, 0.3)} />
          <rect x="126" y="22" width="148" height="262" fill={tone} />
          {glassy ? (
            <>
              <rect x="146" y="42" width="108" height="96" rx="4" fill="#cfe0d6" opacity="0.85" />
              <path d="M150 130 L196 46 M180 138 L254 62" stroke="#fff" strokeWidth="6" opacity="0.45" />
              <rect x="146" y="158" width="108" height="100" rx="4" fill="none" stroke={shade(tone, 0.12)} strokeWidth="3" />
            </>
          ) : (
            <>
              <rect x="146" y="42" width="108" height="96" rx="4" fill="none" stroke={shade(tone, 0.2)} strokeWidth="3" />
              <rect x="146" y="158" width="108" height="100" rx="4" fill="none" stroke={shade(tone, 0.2)} strokeWidth="3" />
              <rect x="154" y="50" width="92" height="80" rx="3" fill={shade(tone, 0.06)} />
            </>
          )}
          <rect x="246" y="150" width="20" height="6" rx="3" fill="#b8964e" />
          <circle cx="252" cy="153" r="5" fill="#d4b56a" />
        </g>
      );
    }
  }
}

/* ── карточка товара: мебель целиком, фон заполняет любую пропорцию ── */
export function ProductArt({
  product,
  className = "",
  variant = "cream",
}: {
  product: Pick<Product, "art" | "tone" | "accent" | "image" | "name">;
  className?: string;
  variant?: "cream" | "green";
}) {
  if (product.image && process.env.NEXT_PUBLIC_NO_PHOTOS !== "1") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.image} alt={product.name.ru} loading="lazy" decoding="async" className={`h-full w-full object-cover ${className}`} />;
  }
  const bg =
    variant === "green"
      ? "linear-gradient(to top, rgba(0,0,0,.14) 0 13%, transparent 13%), radial-gradient(circle at 50% 40%, #18a04f, #0a6a30 78%)"
      : "linear-gradient(to top, #e2ddcf 0 13%, #efebe2 13%)";
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} style={{ background: bg }}>
      <svg viewBox="-20 -10 440 300" className="absolute inset-x-0 bottom-0 h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden>
        <Furniture kind={product.art} tone={product.tone} accent={product.accent} />
      </svg>
    </div>
  );
}

/* ── hero ──────────────────────────────────────────── */
export function HeroScene() {
  return (
    <svg viewBox="0 0 520 640" className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Интерьер">
      <defs>
        <linearGradient id="hw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe7d8" />
          <stop offset="1" stopColor="#e2d6c0" />
        </linearGradient>
        <linearGradient id="hf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9a47a" />
          <stop offset="1" stopColor="#a67f55" />
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="520" height="640" fill="url(#hw)" />
      {/* молдинги */}
      <g fill="none" stroke="#d8ccb4" strokeWidth="2">
        <rect x="40" y="60" width="150" height="330" rx="4" />
        <rect x="330" y="60" width="150" height="330" rx="4" />
      </g>
      {/* картина */}
      <rect x="170" y="90" width="180" height="140" rx="3" fill="#f7f1e4" stroke="#b8964e" strokeWidth="5" />
      <path d="M180 190 C230 150 270 210 340 160 L340 222 L180 222Z" fill="#cdb98f" />
      <path d="M180 205 C240 180 280 225 340 195 L340 222 L180 222Z" fill="#a99468" opacity="0.7" />
      <circle cx="292" cy="130" r="22" fill="#e8c98a" opacity="0.8" />
      {/* пол */}
      <rect y="400" width="520" height="240" fill="url(#hf)" />
      <g stroke="#8d6a45" strokeOpacity="0.25">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1="0" y1={420 + i * 28} x2="520" y2={420 + i * 28} />
        ))}
      </g>
      <polygon points="0,0 260,0 0,520" fill="url(#sun)" opacity="0.5" />
      {/* ковёр */}
      <ellipse cx="260" cy="520" rx="220" ry="46" fill="#e9e1cf" opacity="0.9" />
      {/* диван */}
      <g transform="translate(40 250) scale(1.2)">
        <Furniture kind="sofa" tone="#e4d6bb" accent="#bfae90" />
      </g>
      {/* журнальный столик */}
      <g>
        <ellipse cx="260" cy="552" rx="70" ry="18" fill="#0f2217" opacity="0.15" />
        <rect x="256" y="508" width="8" height="42" fill="#6f4a2d" />
        <ellipse cx="260" cy="506" rx="64" ry="15" fill="#8a5a36" />
        <ellipse cx="260" cy="502" rx="64" ry="15" fill="#a47346" />
        <rect x="244" y="478" width="30" height="24" rx="4" fill="#f0e9d6" />
      </g>
      {/* растение */}
      <g transform="translate(404 330)">
        <rect x="-26" y="120" width="52" height="64" rx="8" fill="#ece5d3" />
        <path d="M0 120 C-60 80 -50 10 -10 -20 C-2 30 8 70 0 120Z" fill="#2f7a52" />
        <path d="M0 120 C60 80 56 0 24 -26 C10 30 -2 70 0 120Z" fill="#1f6b46" />
        <path d="M0 120 C-6 50 20 0 6 -50 C-24 -10 -10 60 0 120Z" fill="#3f9467" />
      </g>
      {/* торшер */}
      <g>
        <rect x="58" y="330" width="6" height="190" fill="#3a2e26" />
        <path d="M30 330 L92 330 L80 276 L42 276Z" fill="#f4ecd8" />
        <ellipse cx="61" cy="522" rx="26" ry="6" fill="#3a2e26" />
      </g>
    </svg>
  );
}

/* ── сцены проектов (viewBox 600×400) ──────────────── */
export type SceneKind = "living" | "dining" | "hall" | "school" | "clinic" | "theatre" | "office" | "cafe";

const SCENES: Record<SceneKind, { wall: string; floor: string; art: ArtKind; tone: string; accent: string; extra: "window" | "frame" | "door" | "board" | "stage" | "none" }> = {
  living: { wall: "#e9e2d2", floor: "#c9a47a", art: "sofa", tone: "#d9c8aa", accent: "#bfae90", extra: "frame" },
  dining: { wall: "#dfe7dc", floor: "#bfa07a", art: "dining", tone: "#9a6b43", accent: "#6f4a2d", extra: "window" },
  hall: { wall: "#ece8dd", floor: "#d8cdb8", art: "door", tone: "#f2f0ea", accent: "#cfd8cf", extra: "none" },
  school: { wall: "#dbe7ea", floor: "#b99a74", art: "desk", tone: "#a47346", accent: "#2d5fb0", extra: "board" },
  clinic: { wall: "#e6eef0", floor: "#d9dfe0", art: "bed", tone: "#f4f6f7", accent: "#2d5fb0", extra: "window" },
  theatre: { wall: "#3a1d20", floor: "#4a2a2d", art: "theatre", tone: "#a3262f", accent: "#6d1a21", extra: "stage" },
  office: { wall: "#e3e6e3", floor: "#b9b2a4", art: "office", tone: "#23272a", accent: "#8a9189", extra: "window" },
  cafe: { wall: "#e8dccb", floor: "#a8825a", art: "dining", tone: "#e9e8e2", accent: "#6e7a86", extra: "frame" },
};

export function Scene({ kind }: { kind: SceneKind }) {
  const s = SCENES[kind];
  return (
    <svg viewBox="0 0 600 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="600" height="400" fill={s.wall} />
      <rect y="262" width="600" height="138" fill={s.floor} />
      <rect y="258" width="600" height="6" fill="#000" opacity="0.08" />
      {s.extra === "window" && (
        <g>
          <rect x="60" y="50" width="130" height="170" rx="4" fill="#d6ecf5" stroke="#fff" strokeWidth="8" />
          <line x1="125" y1="50" x2="125" y2="220" stroke="#fff" strokeWidth="5" />
          <line x1="60" y1="135" x2="190" y2="135" stroke="#fff" strokeWidth="5" />
        </g>
      )}
      {s.extra === "frame" && (
        <g>
          <rect x="70" y="60" width="120" height="90" fill="#f7f1e4" stroke="#b8964e" strokeWidth="5" />
          <path d="M76 130 C110 100 140 140 184 112 L184 146 L76 146Z" fill="#cdb98f" />
          <rect x="430" y="70" width="86" height="60" fill="#f7f1e4" stroke="#b8964e" strokeWidth="4" />
        </g>
      )}
      {s.extra === "board" && (
        <g>
          <rect x="70" y="50" width="200" height="120" rx="4" fill="#2f5d4a" stroke="#b9a07a" strokeWidth="6" />
          <path d="M90 90 L170 90 M90 112 L220 112 M90 134 L150 134" stroke="#e8efe9" strokeWidth="3" opacity="0.7" />
        </g>
      )}
      {s.extra === "stage" && (
        <g>
          <rect x="0" y="0" width="600" height="46" fill="#1d0e10" />
          <path d="M0 0 H70 Q40 120 0 230Z M600 0 H530 Q560 120 600 230Z" fill="#6d1a21" />
          <rect x="150" y="150" width="300" height="108" fill="#2b1517" />
        </g>
      )}
      <g transform="translate(90 70) scale(1.05)">
        <Furniture kind={s.art} tone={s.tone} accent={s.accent} />
      </g>
      {kind === "dining" || kind === "cafe" ? (
        <g transform="translate(470 250)">
          <rect x="-4" y="10" width="8" height="90" fill="#6f4a2d" />
          <circle cx="0" cy="0" r="26" fill="#2f7a52" />
        </g>
      ) : null}
    </svg>
  );
}

/* ── Комната за дверью: вид на горы и арчу (viewBox 1600×900) ── */
function Juniper({ x, y, s = 1, c = "#1d4a33" }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-6" width="6" height="18" fill="#3b2a1d" />
      <path d="M0 -70 C10 -50 18 -40 14 -28 C22 -20 24 -8 16 -2 L-16 -2 C-24 -8 -22 -20 -14 -28 C-18 -40 -10 -50 0 -70Z" fill={c} />
    </g>
  );
}

export function RoomScene({ className = "", align = "xMidYMid" }: { className?: string; align?: string }) {
  return (
    <svg viewBox="0 0 1600 900" className={className} preserveAspectRatio={`${align} slice`} role="img" aria-label="Интерьер с мебелью Арча">
      <defs>
        <linearGradient id="rs-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e3d6" />
          <stop offset="1" stopColor="#ddd3c1" />
        </linearGradient>
        <linearGradient id="rs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd3df" />
          <stop offset="1" stopColor="#eef2e8" />
        </linearGradient>
        <linearGradient id="rs-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b98a5d" />
          <stop offset="1" stopColor="#8c6342" />
        </linearGradient>
        <radialGradient id="rs-sun" cx="0.5" cy="0.3" r="0.6">
          <stop offset="0" stopColor="#fff4d6" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
        </radialGradient>
        <clipPath id="rs-win"><path d="M560 560 V250 a240 240 0 0 1 480 0 V560Z" /></clipPath>
      </defs>
      <rect width="1600" height="900" fill="url(#rs-wall)" />
      {/* арочное окно с видом на горы */}
      <g clipPath="url(#rs-win)">
        <rect x="540" y="0" width="520" height="580" fill="url(#rs-sky)" />
        <path d="M540 470 L640 330 L700 390 L800 250 L880 350 L940 300 L1060 440 V580 H540Z" fill="#8fa9b6" />
        <path d="M800 250 L835 295 L815 290 L800 305 L785 290 L768 296Z M640 330 L660 358 L640 352 L626 360Z" fill="#f7f7f2" />
        <path d="M540 520 L620 430 L700 480 L780 410 L860 470 L960 420 L1060 500 V580 H540Z" fill="#5d7d6c" />
        <path d="M540 560 L640 505 L760 540 L880 500 L1060 548 V580 H540Z" fill="#3f6450" />
        <Juniper x={610} y={548} s={0.9} />
        <Juniper x={660} y={556} s={0.65} c="#245a3e" />
        <Juniper x={960} y={540} s={1.1} />
        <Juniper x={1010} y={552} s={0.7} c="#245a3e" />
      </g>
      <path d="M560 560 V250 a240 240 0 0 1 480 0 V560Z" fill="none" stroke="#f6f1e6" strokeWidth="22" />
      <path d="M800 10 V560 M560 330 H1040" stroke="#f6f1e6" strokeWidth="9" />
      <rect x="540" y="560" width="520" height="18" rx="3" fill="#f6f1e6" />
      {/* свет из окна */}
      <path d="M560 578 L1040 578 L1240 900 L380 900Z" fill="url(#rs-sun)" opacity="0.5" />
      {/* молдинги */}
      <g fill="none" stroke="#d2c6af" strokeWidth="3">
        <rect x="120" y="140" width="320" height="400" rx="4" />
        <rect x="1160" y="140" width="320" height="400" rx="4" />
      </g>
      {/* картина */}
      <rect x="1210" y="210" width="220" height="160" fill="#f6f0e2" stroke="#b08c4f" strokeWidth="7" />
      <path d="M1220 330 C1270 290 1320 340 1420 300 L1420 362 L1220 362Z" fill="#c9b48a" />
      <circle cx="1370" cy="262" r="20" fill="#e5c78b" />
      {/* пол */}
      <rect y="640" width="1600" height="260" fill="url(#rs-floor)" />
      <g stroke="#6d4b31" strokeOpacity="0.22" strokeWidth="2">
        {Array.from({ length: 8 }).map((_, i) => <line key={i} x1="0" y1={668 + i * 32} x2="1600" y2={668 + i * 32} />)}
      </g>
      <rect y="630" width="1600" height="14" fill="#efe7d6" />
      <ellipse cx="800" cy="790" rx="520" ry="70" fill="#ebe2cf" opacity="0.92" />
      {/* мебель */}
      <g transform="translate(470 418) scale(1.65)"><Furniture kind="sofa" tone="#e3d4b8" accent="#c4b18f" /></g>
      <g transform="translate(1080 470) scale(1.25)"><Furniture kind="armchair" tone="#1f6b46" accent="#2b2f2c" /></g>
      <g>
        <ellipse cx="800" cy="842" rx="140" ry="22" fill="#0f2217" opacity="0.14" />
        <rect x="792" y="776" width="16" height="64" fill="#5d3c24" />
        <ellipse cx="800" cy="776" rx="130" ry="26" fill="#6f4a2d" />
        <ellipse cx="800" cy="768" rx="130" ry="26" fill="#9a6b43" />
        <rect x="770" y="728" width="44" height="38" rx="6" fill="#efe8d6" />
        <path d="M792 728 C770 700 784 680 792 668 C800 680 814 700 792 728Z" fill="#2f7a52" />
      </g>
      {/* торшер и растение */}
      <g>
        <rect x="296" y="420" width="8" height="300" fill="#3a2e26" />
        <path d="M250 420 L350 420 L332 340 L268 340Z" fill="#f5ecd6" />
        <ellipse cx="300" cy="722" rx="38" ry="8" fill="#3a2e26" />
      </g>
      <g transform="translate(1440 560)">
        <rect x="-38" y="120" width="76" height="96" rx="10" fill="#e9e1cc" />
        <path d="M0 122 C-80 70 -70 -20 -14 -60 C-4 10 10 60 0 122Z" fill="#2f7a52" />
        <path d="M0 122 C84 70 76 -26 30 -66 C12 10 -2 60 0 122Z" fill="#1f6b46" />
        <path d="M0 122 C-8 40 26 -20 8 -86 C-30 -30 -14 60 0 122Z" fill="#3f9467" />
      </g>
    </svg>
  );
}
