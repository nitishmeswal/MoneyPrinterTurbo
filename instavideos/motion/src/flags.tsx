/* Country flags drawn from data (stripes + simple emblems) in a 150 x 100 box.
 * Flags are public symbols; these are simplified so they read on a small ball. */
import React from 'react';

const star = (cx: number, cy: number, r: number, rot = -90) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.42 : r;
    const a = ((rot + i * 36) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
};

type Def = { name: string; h?: string[]; hw?: number[]; v?: string[]; vw?: number[]; bg?: string; x?: React.ReactNode };

const H = (colors: string[], weights?: number[]) => {
  const tw = (weights ?? colors.map(() => 1)).reduce((a, b) => a + b, 0);
  let y = 0;
  return colors.map((c, i) => {
    const h = (100 * (weights ? weights[i] : 1)) / tw;
    const el = <rect key={`h${i}`} x={0} y={y} width={150} height={h + 0.5} fill={c} />;
    y += h;
    return el;
  });
};
const V = (colors: string[], weights?: number[]) => {
  const tw = (weights ?? colors.map(() => 1)).reduce((a, b) => a + b, 0);
  let x = 0;
  return colors.map((c, i) => {
    const w = (150 * (weights ? weights[i] : 1)) / tw;
    const el = <rect key={`v${i}`} x={x} y={0} width={w + 0.5} height={100} fill={c} />;
    x += w;
    return el;
  });
};
const nordic = (bg: string, cross: string, inner?: string) => (
  <>
    <rect width={150} height={100} fill={bg} />
    <rect x={40} y={0} width={22} height={100} fill={cross} />
    <rect x={0} y={39} width={150} height={22} fill={cross} />
    {inner ? (
      <>
        <rect x={46} y={0} width={10} height={100} fill={inner} />
        <rect x={0} y={45} width={150} height={10} fill={inner} />
      </>
    ) : null}
  </>
);

export const FLAGS: Record<string, Def> = {
  FR: { name: 'France', v: ['#0055A4', '#FFFFFF', '#EF4135'] },
  IT: { name: 'Italy', v: ['#009246', '#FFFFFF', '#CE2B37'] },
  IE: { name: 'Ireland', v: ['#169B62', '#FFFFFF', '#FF883E'] },
  BE: { name: 'Belgium', v: ['#111111', '#FAE042', '#ED2939'] },
  DE: { name: 'Germany', h: ['#111111', '#DD0000', '#FFCE00'] },
  NL: { name: 'Netherlands', h: ['#AE1C28', '#FFFFFF', '#21468B'] },
  RU: { name: 'Russia', h: ['#FFFFFF', '#0039A6', '#D52B1E'] },
  AT: { name: 'Austria', h: ['#ED2939', '#FFFFFF', '#ED2939'] },
  HU: { name: 'Hungary', h: ['#CE2939', '#FFFFFF', '#477050'] },
  BG: { name: 'Bulgaria', h: ['#FFFFFF', '#00966E', '#D62612'] },
  EE: { name: 'Estonia', h: ['#0072CE', '#111111', '#FFFFFF'] },
  LT: { name: 'Lithuania', h: ['#FDB913', '#006A44', '#C1272D'] },
  PL: { name: 'Poland', h: ['#FFFFFF', '#DC143C'] },
  UA: { name: 'Ukraine', h: ['#0057B7', '#FFD700'] },
  ID: { name: 'Indonesia', h: ['#FF0000', '#FFFFFF'] },
  NG: { name: 'Nigeria', v: ['#008751', '#FFFFFF', '#008751'] },
  PE: { name: 'Peru', v: ['#D91023', '#FFFFFF', '#D91023'] },
  RO: { name: 'Romania', v: ['#002B7F', '#FCD116', '#CE1126'] },
  ML: { name: 'Mali', v: ['#14B53A', '#FCD116', '#CE1126'] },
  GN: { name: 'Guinea', v: ['#CE1126', '#FCD116', '#009460'] },
  CI: { name: 'Ivory Coast', v: ['#F77F00', '#FFFFFF', '#009E60'] },
  CO: { name: 'Colombia', h: ['#FCD116', '#003893', '#CE1126'], hw: [2, 1, 1] },
  YE: { name: 'Yemen', h: ['#CE1126', '#FFFFFF', '#111111'] },
  SL: { name: 'Sierra Leone', h: ['#1EB53A', '#FFFFFF', '#0072C6'] },
  GA: { name: 'Gabon', h: ['#009E60', '#FCD116', '#3A75C4'] },
  AM: { name: 'Armenia', h: ['#D90012', '#0033A0', '#F2A800'] },
  LU: { name: 'Luxembourg', h: ['#ED2939', '#FFFFFF', '#00A1DE'] },
  LV: { name: 'Latvia', h: ['#9E3039', '#FFFFFF', '#9E3039'], hw: [2, 1, 2] },
  TH: { name: 'Thailand', h: ['#A51931', '#F4F5F8', '#2D2A4A', '#F4F5F8', '#A51931'], hw: [1, 1, 2, 1, 1] },
  ES: { name: 'Spain', h: ['#AA151B', '#F1BF00', '#AA151B'], hw: [1, 2, 1] },
  JP: { name: 'Japan', bg: '#FFFFFF', x: <circle cx={75} cy={50} r={30} fill="#BC002D" /> },
  BD: { name: 'Bangladesh', bg: '#006A4E', x: <circle cx={67} cy={50} r={28} fill="#F42A41" /> },
  SE: { name: 'Sweden', x: nordic('#006AA7', '#FECC00') },
  NO: { name: 'Norway', x: nordic('#BA0C2F', '#FFFFFF', '#00205B') },
  DK: { name: 'Denmark', x: nordic('#C8102E', '#FFFFFF') },
  FI: { name: 'Finland', x: nordic('#FFFFFF', '#003580') },
  IS: { name: 'Iceland', x: nordic('#02529C', '#FFFFFF', '#DC1E35') },
  CH: {
    name: 'Switzerland',
    bg: '#DA291C',
    x: (
      <>
        <rect x={64} y={22} width={22} height={56} fill="#fff" />
        <rect x={47} y={39} width={56} height={22} fill="#fff" />
      </>
    ),
  },
  BR: {
    name: 'Brazil',
    bg: '#009C3B',
    x: (
      <>
        <polygon points="75,10 140,50 75,90 10,50" fill="#FFDF00" />
        <circle cx={75} cy={50} r={22} fill="#002776" />
        <path d="M54,46 Q75,38 96,52" stroke="#fff" strokeWidth={4} fill="none" />
      </>
    ),
  },
  IN: {
    name: 'India',
    h: ['#FF9933', '#FFFFFF', '#138808'],
    x: <circle cx={75} cy={50} r={11} fill="none" stroke="#000080" strokeWidth={3} />,
  },
  AR: { name: 'Argentina', h: ['#74ACDF', '#FFFFFF', '#74ACDF'], x: <circle cx={75} cy={50} r={10} fill="#F6B40E" /> },
  MX: { name: 'Mexico', v: ['#006847', '#FFFFFF', '#CE1126'], x: <circle cx={75} cy={50} r={11} fill="#8C5A2B" /> },
  CZ: { name: 'Czechia', h: ['#FFFFFF', '#D7141A'], x: <polygon points="0,0 75,50 0,100" fill="#11457E" /> },
  VN: { name: 'Vietnam', bg: '#DA251D', x: <polygon points={star(75, 52, 30)} fill="#FFFF00" /> },
  CN: {
    name: 'China',
    bg: '#DE2910',
    x: (
      <>
        <polygon points={star(30, 30, 17)} fill="#FFDE00" />
        {[[58, 12], [68, 24], [68, 40], [58, 52]].map(([x, y], i) => (
          <polygon key={i} points={star(x, y, 6, -90 + i * 20)} fill="#FFDE00" />
        ))}
      </>
    ),
  },
  TR: {
    name: 'Turkey',
    bg: '#E30A17',
    x: (
      <>
        <circle cx={58} cy={50} r={25} fill="#fff" />
        <circle cx={65} cy={50} r={20} fill="#E30A17" />
        <polygon points={star(90, 50, 11, 0)} fill="#fff" />
      </>
    ),
  },
  GR: {
    name: 'Greece',
    h: ['#0D5EAF', '#FFFFFF', '#0D5EAF', '#FFFFFF', '#0D5EAF', '#FFFFFF', '#0D5EAF', '#FFFFFF', '#0D5EAF'],
    x: (
      <>
        <rect x={0} y={0} width={55.5} height={55.5} fill="#0D5EAF" />
        <rect x={22} y={0} width={11} height={55.5} fill="#fff" />
        <rect x={0} y={22} width={55.5} height={11} fill="#fff" />
      </>
    ),
  },
  PT: { name: 'Portugal', v: ['#006600', '#FF0000'], vw: [2, 3], x: <circle cx={60} cy={50} r={16} fill="#FFE000" stroke="#FFE000" /> },
  US: {
    name: 'USA',
    h: Array.from({ length: 13 }, (_, i) => (i % 2 ? '#FFFFFF' : '#B22234')),
    x: (
      <>
        <rect x={0} y={0} width={62} height={54} fill="#3C3B6E" />
        {Array.from({ length: 20 }, (_, i) => (
          <circle key={i} cx={8 + (i % 5) * 11.5} cy={8 + Math.floor(i / 5) * 12.5} r={2.6} fill="#fff" />
        ))}
      </>
    ),
  },
  GB: {
    name: 'United Kingdom',
    bg: '#012169',
    x: (
      <>
        <path d="M0,0 L150,100 M150,0 L0,100" stroke="#fff" strokeWidth={20} />
        <path d="M0,0 L150,100 M150,0 L0,100" stroke="#C8102E" strokeWidth={7} />
        <rect x={60} y={0} width={30} height={100} fill="#fff" />
        <rect x={0} y={35} width={150} height={30} fill="#fff" />
        <rect x={66} y={0} width={18} height={100} fill="#C8102E" />
        <rect x={0} y={41} width={150} height={18} fill="#C8102E" />
      </>
    ),
  },
  PK: {
    name: 'Pakistan',
    v: ['#FFFFFF', '#01411C'],
    vw: [1, 3],
    x: (
      <>
        <circle cx={92} cy={52} r={24} fill="#fff" />
        <circle cx={100} cy={46} r={21} fill="#01411C" />
        <polygon points={star(108, 38, 8, -60)} fill="#fff" />
      </>
    ),
  },
  GH: { name: 'Ghana', h: ['#CE1126', '#FCD116', '#006B3F'], x: <polygon points={star(75, 52, 15)} fill="#111" /> },
  CM: { name: 'Cameroon', v: ['#007A5E', '#CE1126', '#FCD116'], x: <polygon points={star(75, 52, 13)} fill="#FCD116" /> },
  SN: { name: 'Senegal', v: ['#00853F', '#FDEF42', '#E31B23'], x: <polygon points={star(75, 52, 13)} fill="#00853F" /> },
  MA: { name: 'Morocco', bg: '#C1272D', x: <polygon points={star(75, 52, 22)} fill="none" stroke="#006233" strokeWidth={4} /> },
  CL: {
    name: 'Chile',
    h: ['#FFFFFF', '#D52B1E'],
    x: (
      <>
        <rect x={0} y={0} width={50} height={50} fill="#0039A6" />
        <polygon points={star(25, 26, 11)} fill="#fff" />
      </>
    ),
  },
  EG: { name: 'Egypt', h: ['#CE1126', '#FFFFFF', '#111111'], x: <circle cx={75} cy={50} r={9} fill="#C09300" /> },
  CA: {
    name: 'Canada',
    v: ['#D52B1E', '#FFFFFF', '#D52B1E'],
    vw: [1, 2, 1],
    x: <polygon points="75,22 81,34 89,30 86,48 96,42 94,52 102,56 88,64 90,72 78,68 78,80 72,80 72,68 60,72 62,64 48,56 56,52 54,42 64,48 61,30 69,34" fill="#D52B1E" />,
  },
};

/** A flag, filling a circle of radius r centred on (0, 0). */
export const FlagBall: React.FC<{ code: string; r: number; uid: string }> = ({ code, r, uid }) => {
  const d = FLAGS[code] ?? FLAGS.FR;
  const s = (2 * r) / 100;
  return (
    <g>
      <clipPath id={`c${uid}`}>
        <circle cx={0} cy={0} r={r} />
      </clipPath>
      <g clipPath={`url(#c${uid})`}>
        <g transform={`translate(${-75 * s} ${-50 * s}) scale(${s})`}>
          {d.bg ? <rect width={150} height={100} fill={d.bg} /> : null}
          {d.h ? H(d.h, d.hw) : null}
          {d.v ? V(d.v, d.vw) : null}
          {d.x ?? null}
        </g>
      </g>
    </g>
  );
};
