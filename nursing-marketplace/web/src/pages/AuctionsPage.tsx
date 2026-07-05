import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Auction, AuctionType } from "../api/types";
import { AuctionCard } from "../components/AuctionCard";
import { ClockIcon, SyringeIcon } from "../components/Icon";

export function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [type, setType] = useState<AuctionType | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const query = type ? `?type=${type}` : "";
    api
      .get<Auction[]>(`/auctions${query}`)
      .then(setAuctions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="page">
      <h1>Aste aperte</h1>
      <p>I professionisti in asta in questo momento: fai un'offerta per aggiudicarteli.</p>

      <div className="filter-tabs">
        <button className={type === undefined ? "active" : ""} onClick={() => setType(undefined)}>
          Tutte
        </button>
        <button className={type === "HOURLY" ? "active" : ""} onClick={() => setType("HOURLY")}>
          <ClockIcon size={16} /> Orarie
        </button>
        <button className={type === "SERVICE" ? "active" : ""} onClick={() => setType("SERVICE")}>
          <SyringeIcon size={16} /> A prestazione
        </button>
      </div>

      {loading && <p>Caricamento…</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {auctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
        {!loading && auctions.length === 0 && <p>Nessuna asta aperta al momento.</p>}
      </div>
    </div>
  );
}
