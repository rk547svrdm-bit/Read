import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Avatar } from "../components/Avatar";
import { AuctionTypeBadge } from "../components/Badges";
import type { AuctionType, NurseProfile, NurseService } from "../api/types";

interface BookingWithAuction {
  id: string;
  finalPrice: number;
  status: string;
  auction: {
    id: string;
    type: AuctionType;
    nurse: NurseProfile;
    service: NurseService | null;
  };
}

export function ClientDashboardPage() {
  const [bookings, setBookings] = useState<BookingWithAuction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<BookingWithAuction[]>("/bookings/me")
      .then(setBookings)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <h1>Le mie prenotazioni</h1>
      <p>
        Qui trovi le aste che hai vinto. Sfoglia la <Link to="/">directory</Link> o le{" "}
        <Link to="/auctions">aste aperte</Link> per farne di nuove.
      </p>

      {error && <p className="error">{error}</p>}

      <div className="grid">
        {bookings.map((b) => (
          <div key={b.id} className="card booking-card">
            <Link to={`/nurses/${b.auction.nurse.id}`} className="booking-card-nurse">
              <Avatar photoUrl={b.auction.nurse.photoUrl} name={b.auction.nurse.fullName} size={48} />
              <div>
                <strong>{b.auction.nurse.fullName}</strong>
                <div className="muted small">{b.auction.nurse.city}</div>
              </div>
            </Link>
            <AuctionTypeBadge type={b.auction.type} />
            <p>{b.auction.type === "HOURLY" ? "Tariffa oraria" : b.auction.service?.name}</p>
            <div className="booking-card-footer">
              <span className="price-badge price-badge-hourly">{b.finalPrice} €</span>
              <span className={`status-pill status-${b.status.toLowerCase()}`}>{b.status}</span>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p>Nessuna prenotazione ancora.</p>}
      </div>
    </div>
  );
}
