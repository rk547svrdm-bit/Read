import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { NurseProfile } from "../api/types";
import { NurseCard } from "../components/NurseCard";

export function HomePage() {
  const [nurses, setNurses] = useState<NurseProfile[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const query = city ? `?city=${encodeURIComponent(city)}` : "";
    api
      .get<NurseProfile[]>(`/nurses${query}`)
      .then(setNurses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <div className="page">
      <section className="hero-section">
        <h1>Trova l'infermiere giusto per te</h1>
        <p>
          Sfoglia i profili dei professionisti disponibili e partecipa alle aste per
          aggiudicarti la prestazione alle condizioni migliori.
        </p>
        <input
          className="search-input"
          placeholder="Filtra per città (es. Torino)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </section>

      {loading && <p>Caricamento…</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {nurses.map((nurse) => (
          <NurseCard key={nurse.id} nurse={nurse} />
        ))}
        {!loading && nurses.length === 0 && <p>Nessun infermiere trovato.</p>}
      </div>
    </div>
  );
}
