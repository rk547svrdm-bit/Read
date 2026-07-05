import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface BookingWithAuction {
  id: string;
  finalPrice: number;
  status: string;
  auction: {
    id: string;
    listing: { title: string; city: string; serviceDate: string };
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
        <Link to="/listings">aste aperte</Link> per farne di nuove.
      </p>

      {error && <p className="error">{error}</p>}

      <table className="bids-table">
        <thead>
          <tr>
            <th>Servizio</th>
            <th>Città</th>
            <th>Data</th>
            <th>Prezzo aggiudicato</th>
            <th>Stato</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.auction.listing.title}</td>
              <td>{b.auction.listing.city}</td>
              <td>{new Date(b.auction.listing.serviceDate).toLocaleString("it-IT")}</td>
              <td>{b.finalPrice} €/h</td>
              <td>{b.status}</td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={5}>Nessuna prenotazione ancora.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
