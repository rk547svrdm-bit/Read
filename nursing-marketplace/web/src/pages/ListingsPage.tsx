import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Listing } from "../api/types";
import { ListingCard } from "../components/ListingCard";

export function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Listing[]>("/listings")
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1>Aste aperte</h1>
      <p>Disponibilità pubblicate dai professionisti: fai un'offerta per aggiudicartele.</p>

      {loading && <p>Caricamento…</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
        {!loading && listings.length === 0 && <p>Nessuna inserzione pubblicata al momento.</p>}
      </div>
    </div>
  );
}
