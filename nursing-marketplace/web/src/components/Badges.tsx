import { ClockIcon, SyringeIcon, CoinIcon } from "./Icon";
import type { AuctionStatus, AuctionType } from "../api/types";

export function AuctionTypeBadge({ type }: { type: AuctionType }) {
  if (type === "HOURLY") {
    return (
      <span className="pill pill-hourly">
        <ClockIcon size={14} /> Asta oraria
      </span>
    );
  }
  return (
    <span className="pill pill-service">
      <SyringeIcon size={14} /> Asta a prestazione
    </span>
  );
}

export function PriceBadge({ amount, type, suffix }: { amount: number; type: AuctionType; suffix?: string }) {
  return (
    <span className={`price-badge price-badge-${type === "HOURLY" ? "hourly" : "service"}`}>
      <CoinIcon size={16} />
      {amount} €{suffix ?? (type === "HOURLY" ? "/h" : "")}
    </span>
  );
}

const STATUS_LABELS: Record<AuctionStatus, string> = {
  OPEN: "Aperta",
  CLOSED: "Chiusa",
  AWARDED: "Aggiudicata",
  CANCELLED: "Annullata",
};

export function AuctionStatusBadge({ status }: { status: AuctionStatus }) {
  return <span className={`status-pill status-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>;
}
