import { useState } from "react";

const GRADIENTS: [string, string][] = [
  ["#f472b6", "#a855f7"],
  ["#22d3ee", "#6366f1"],
  ["#f59e0b", "#ef4444"],
  ["#34d399", "#0ea5e9"],
  ["#fb7185", "#f97316"],
];

function gradientFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  photoUrl,
  name,
  size = 56,
  ring = false,
}: {
  photoUrl?: string | null;
  name: string;
  size?: number;
  ring?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [from, to] = gradientFor(name);
  const showPhoto = !!photoUrl && !failed;

  const inner = showPhoto ? (
    <img
      src={photoUrl!}
      alt={name}
      width={size}
      height={size}
      className="avatar-img"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      className="avatar-fallback"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${from}, ${to})`, fontSize: size * 0.38 }}
    >
      {initialsFor(name)}
    </div>
  );

  if (!ring) return inner;

  return (
    <div
      className="avatar-ring"
      style={{ width: size + 8, height: size + 8, background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {inner}
    </div>
  );
}
