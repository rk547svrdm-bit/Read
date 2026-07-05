import { useEffect, useState } from "react";
import { ClockIcon } from "./Icon";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Asta terminata";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export function CountdownTimer({ endAt }: { endAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = new Date(endAt).getTime() - now;

  return (
    <span className={remaining <= 0 ? "countdown countdown-ended" : "countdown"}>
      <ClockIcon size={14} />
      {formatRemaining(remaining)}
    </span>
  );
}
