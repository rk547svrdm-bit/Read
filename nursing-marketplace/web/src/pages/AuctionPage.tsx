import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Auction, Bid } from "../api/types";
import { Avatar } from "../components/Avatar";
import { AuctionTypeBadge, AuctionStatusBadge } from "../components/Badges";
import { CountdownTimer } from "../components/CountdownTimer";
import { CoinIcon, HandRaisedIcon, TrophyIcon } from "../components/Icon";

const BID_STATUS_LABELS: Record<Bid["status"], string> = {
  WINNING: "In testa",
  OUTBID: "Superata",
  ACTIVE: "Attiva",
  WITHDRAWN: "Ritirata",
};

interface AuctionDetail extends Auction {
  bids: Bid[];
}

export function AuctionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!id) return;
    const data = await api.get<AuctionDetail>(`/auctions/${id}`);
    setAuction(data);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [id]);

  async function handleBid(e: React.FormEvent) {
    e.preventDefault();
    if (!auction) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await api.post(`/auctions/${auction.id}/bids`, { amount: Number(amount) });
      setSuccess("Offerta registrata!");
      setAmount("");
      await load();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Errore imprevisto");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !auction) return <p className="error">{error}</p>;
  if (!auction) return <p>Caricamento…</p>;

  const minNextBid =
    auction.bids.length === 0 ? auction.startingPrice : auction.currentPrice + auction.minIncrement;
  const title = auction.type === "HOURLY" ? "Tariffa oraria" : auction.service?.name ?? "Prestazione";

  return (
    <div className="page">
      <div className={`card auction-hero auction-hero-${auction.type === "HOURLY" ? "hourly" : "service"}`}>
        {auction.nurse && (
          <Link to={`/nurses/${auction.nurse.id}`} className="auction-hero-nurse">
            <Avatar photoUrl={auction.nurse.photoUrl} name={auction.nurse.fullName} size={56} ring />
            <div>
              <div className="auction-hero-nurse-name">{auction.nurse.fullName}</div>
              <div className="muted small">{auction.nurse.city}</div>
            </div>
          </Link>
        )}

        <div className="auction-hero-badges">
          <AuctionTypeBadge type={auction.type} />
          <AuctionStatusBadge status={auction.status} />
        </div>

        <h1>{title}</h1>
        {auction.service?.description && <p className="muted">{auction.service.description}</p>}

        <div className="auction-price-panel">
          <CoinIcon size={28} />
          <div>
            <div className="auction-price-value">
              {auction.currentPrice} € {auction.type === "HOURLY" ? "/h" : ""}
            </div>
            <div className="muted small">Offerta attuale</div>
          </div>
          <CountdownTimer endAt={auction.endAt} />
        </div>

        {auction.status === "OPEN" && user?.role === "CLIENT" && (
          <form className="bid-form" onSubmit={handleBid}>
            <label htmlFor="amount">La tua offerta (minimo {minNextBid} €)</label>
            <input
              id="amount"
              type="number"
              step="0.5"
              min={minNextBid}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={submitting}>
              <HandRaisedIcon size={16} /> {submitting ? "Invio…" : "Fai un'offerta"}
            </button>
          </form>
        )}
        {!user && auction.status === "OPEN" && <p>Accedi come cliente per fare un'offerta.</p>}

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>

      <h2>Storico offerte</h2>
      <div className="bid-list">
        {auction.bids.map((bid) => (
          <div key={bid.id} className={`bid-row ${bid.status === "WINNING" ? "bid-row-winning" : ""}`}>
            <span className="bid-amount">{bid.amount} €</span>
            <span className={`status-pill status-${bid.status.toLowerCase()}`}>
              {bid.status === "WINNING" ? <TrophyIcon size={13} /> : <HandRaisedIcon size={13} />}
              {BID_STATUS_LABELS[bid.status]}
            </span>
            <span className="muted small">{new Date(bid.createdAt).toLocaleString("it-IT")}</span>
          </div>
        ))}
        {auction.bids.length === 0 && <p className="muted">Nessuna offerta ancora ricevuta.</p>}
      </div>
    </div>
  );
}
