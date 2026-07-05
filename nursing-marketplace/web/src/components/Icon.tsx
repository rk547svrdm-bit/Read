import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(props: IconProps) {
  const { size = 18, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function SyringeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M19 9 9 19l-4 2 2-4L17 7Z" />
      <path d="m14.5 6.5 3 3" />
      <path d="m11.5 9.5 3 3" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 12.5A9 9 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5Z" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function GavelIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m14 13-7.5 7.5a1.7 1.7 0 0 1-2.4 0L2.5 18.9a1.7 1.7 0 0 1 0-2.4L10 9" />
      <path d="m16 6 2.5-2.5a1.7 1.7 0 0 1 2.4 0l1.6 1.6a1.7 1.7 0 0 1 0 2.4L20 10" />
      <path d="m9 12 5 5" />
      <path d="m13 8 3 3" />
      <path d="M2 22h8" />
    </svg>
  );
}

export function CoinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9.5c0-1 .9-1.5 2.2-1.5.9 0 1.6.3 2.1.8M9 14.5c0 1 .9 1.5 2.2 1.5 1.3 0 2.3-.6 2.3-1.6 0-2.4-4.5-1-4.5-3.4 0-1 1-1.5 2.2-1.5M12 6.5v1M12 16.5v1" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.3 2.3L16 10" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13" />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

/** Icona per il gesto di rilancio/offerta in asta. */
export function HandRaisedIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M11 13V5a1.5 1.5 0 0 1 3 0v6" />
      <path d="M14 11V4a1.5 1.5 0 0 1 3 0v7" />
      <path d="M17 11.5a1.5 1.5 0 0 1 3 0V14" />
      <path d="M8 13V7a1.5 1.5 0 0 1 3 0v7" />
      <path d="M8 13c-1.5-1-3.3-.6-3.3 1 0 3 2.3 8 9.3 8 5 0 6-3.5 6-6v-3.5" />
    </svg>
  );
}

/** Icona per l'offerta vincente al momento. */
export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
      <path d="M8 5H5a1 1 0 0 0-1 1c0 2.5 1.8 4 4 4.3" />
      <path d="M16 5h3a1 1 0 0 1 1 1c0 2.5-1.8 4-4 4.3" />
      <path d="M12 13v3" />
      <path d="M9 20h6" />
      <path d="M10 16.5h4l.6 3.5H9.4Z" />
    </svg>
  );
}

/** Icona per la trattativa conclusa / asta aggiudicata. */
export function HandshakeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m2 12 5-5 4 2 2-2 4 4-2 2 3 3-2.5 2.5L12 14l-2.5 2.5L7 14l-3 3-2-2Z" />
      <path d="m11 9 3 3" />
    </svg>
  );
}

/** Icona generica "documento/certificato". */
export function FileTextIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6M9 17h6M9 9h2" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6Z" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
