import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import type { NurseProfile, Listing } from "../api/types";
import { CARE_SETTING_LABELS, SHIFT_TYPE_LABELS } from "../api/types";
import { ListingCard } from "../components/ListingCard";

export function NursePage() {
  const { id } = useParams<{ id: string }>();
  const [nurse, setNurse] = useState<NurseProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<NurseProfile>(`/nurses/${id}`)
      .then(setNurse)
      .catch((err) => setError(err.message));
    api
      .get<Listing[]>("/listings")
      .then((all) => setListings(all.filter((l) => l.nurseId === id)))
      .catch(() => {});
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!nurse) return <p>Caricamento…</p>;

  return (
    <div className="page">
      <div className="card profile-card">
        <div className="nurse-card-header">
          <h1>{nurse.fullName}</h1>
          <span className="badge">{nurse.city}</span>
        </div>
        {nurse.headline && <p className="nurse-headline">{nurse.headline}</p>}
        <p>{nurse.bio}</p>

        <h3>Competenze</h3>
        <div className="tag-list">
          {nurse.skills.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>

        <h3>Specializzazioni</h3>
        <div className="tag-list">
          {nurse.specializations.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>

        <h3>Condizioni richieste</h3>
        <ul className="requirements-list">
          <li>Paga oraria minima: {nurse.minHourlyRate} €/h</li>
          <li>Festivi: {nurse.acceptsHolidays ? "disponibile" : "non disponibile"}</li>
          <li>Weekend: {nurse.acceptsWeekends ? "disponibile" : "non disponibile"}</li>
          <li>Turni notturni: {nurse.acceptsNights ? "disponibile" : "non disponibile"}</li>
          <li>
            Turni accettati:{" "}
            {nurse.preferredShifts.length > 0
              ? nurse.preferredShifts.map((s) => SHIFT_TYPE_LABELS[s]).join(", ")
              : "tutti"}
          </li>
          <li>
            Ambienti accettati:{" "}
            {nurse.careSettings.length > 0
              ? nurse.careSettings.map((s) => CARE_SETTING_LABELS[s]).join(", ")
              : "tutti"}
          </li>
        </ul>
      </div>

      <h2>Disponibilità pubblicate</h2>
      <div className="grid">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
        {listings.length === 0 && <p>Nessuna disponibilità pubblicata al momento.</p>}
      </div>
    </div>
  );
}
