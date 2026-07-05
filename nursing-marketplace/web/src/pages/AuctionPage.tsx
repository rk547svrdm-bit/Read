import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Auction, Bid, Listing } from "../api/types";
import { CARE_SETTING_LABELS, SHIFT_TYPE_LABELS } from "../api/types";
import { CountdownTimer } from "../components/CountdownTimer";

interface AuctionDetail extends Auction {
  listing: Listing;
  bids: Bid[];
}

export function AuctionPage() {
  // :id qui è l'id del listing (come nei link da ListingCard); l'asta
  // associata viene poi risolta a partire da listing.auction.id.
  const { id: listingId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!listingId) return;
    const listing = await api.get<Listing & { auction: Auction | null }>(`/listings/${listingId}`);
    if (!listing.auction) {
      setError("Questa inserzione non ha ancora un'asta associata");
      return;
    }
    const data = await api.get<AuctionDetail>(`/auctions/${listing.auction.id}`);
    setAuction(data);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [listingId]);

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

  return (
    <div className="page">
      <div className="card">
        <h1>{auction.listing.title}</h1>
        <p className="tag-list">
          <span className="tag">{CARE_SETTING_LABELS[auction.listing.careSetting]}</span>
          <span className="tag">{SHIFT_TYPE_LABELS[auction.listing.shiftType]}</span>
          {auction.listing.isHoliday && <span className="tag tag-warning">Festivo</span>}
        </p>
        <p>{auction.listing.description}</p>
        <p>
          <strong>Data servizio:</strong> {new Date(auction.listing.serviceDate).toLocaleString("it-IT")}
        </p>
        <p>
          <strong>Città:</strong> {auction.listing.city}
        </p>

        <div className="auction-status">
          <span className="price price-large">Offerta attuale: {auction.currentPrice} €/h</span>
          <CountdownTimer endAt={auction.endAt} />
          <span className="badge">{auction.status}</span>
        </div>

        {auction.status === "OPEN" && user?.role === "CLIENT" && (
          <form className="bid-form" onSubmit={handleBid}>
            <label htmlFor="amount">La tua offerta (minimo {minNextBid} €/h)</label>
            <input
              id="amount"
              type="number"
              step="0.5"
              min={minNextBid}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Invio…" : "Fai un'offerta"}
            </button>
          </form>
        )}
        {!user && auction.status === "OPEN" && <p>Accedi come cliente per fare un'offerta.</p>}

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>

      <h2>Storico offerte</h2>
      <table className="bids-table">
        <thead>
          <tr>
            <th>Importo</th>
            <th>Stato</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {auction.bids.map((bid) => (
            <tr key={bid.id}>
              <td>{bid.amount} €/h</td>
              <td>{bid.status}</td>
              <td>{new Date(bid.createdAt).toLocaleString("it-IT")}</td>
            </tr>
          ))}
          {auction.bids.length === 0 && (
            <tr>
              <td colSpan={3}>Nessuna offerta ancora ricevuta.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
