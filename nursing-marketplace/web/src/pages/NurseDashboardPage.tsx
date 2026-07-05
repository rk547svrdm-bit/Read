import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { CareSetting, Listing, NurseProfile, ShiftType } from "../api/types";
import { CARE_SETTINGS_OPTIONS, SHIFT_TYPE_OPTIONS } from "../constants";
import { ListingCard } from "../components/ListingCard";

function toCsv(values: string[]): string {
  return values.join(", ");
}

function fromCsv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function NurseDashboardPage() {
  const [profile, setProfile] = useState<NurseProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    bio: "",
    city: "",
    yearsExperience: 0,
    minHourlyRate: 0,
    skills: "",
    specializations: "",
    certifications: "",
    acceptsHolidays: false,
    acceptsWeekends: false,
    acceptsNights: false,
    preferredShifts: [] as ShiftType[],
    careSettings: [] as CareSetting[],
  });

  async function loadAll() {
    try {
      const p = await api.get<NurseProfile>("/nurses/me");
      setProfile(p);
      setForm({
        fullName: p.fullName,
        headline: p.headline ?? "",
        bio: p.bio,
        city: p.city,
        yearsExperience: p.yearsExperience,
        minHourlyRate: p.minHourlyRate,
        skills: toCsv(p.skills),
        specializations: toCsv(p.specializations),
        certifications: toCsv(p.certifications),
        acceptsHolidays: p.acceptsHolidays,
        acceptsWeekends: p.acceptsWeekends,
        acceptsNights: p.acceptsNights,
        preferredShifts: p.preferredShifts,
        careSettings: p.careSettings,
      });
    } catch {
      // profilo non ancora inizializzato: si parte da un form vuoto
    }
    const my = await api.get<Listing[]>("/listings/me");
    setListings(my);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function toggleShift(shift: ShiftType) {
    setForm((f) => ({
      ...f,
      preferredShifts: f.preferredShifts.includes(shift)
        ? f.preferredShifts.filter((s) => s !== shift)
        : [...f.preferredShifts, shift],
    }));
  }

  function toggleCareSetting(setting: CareSetting) {
    setForm((f) => ({
      ...f,
      careSettings: f.careSettings.includes(setting)
        ? f.careSettings.filter((s) => s !== setting)
        : [...f.careSettings, setting],
    }));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const updated = await api.put<NurseProfile>("/nurses/me", {
        fullName: form.fullName,
        headline: form.headline || undefined,
        bio: form.bio,
        city: form.city,
        yearsExperience: Number(form.yearsExperience),
        minHourlyRate: Number(form.minHourlyRate),
        skills: fromCsv(form.skills),
        specializations: fromCsv(form.specializations),
        certifications: fromCsv(form.certifications),
        acceptsHolidays: form.acceptsHolidays,
        acceptsWeekends: form.acceptsWeekends,
        acceptsNights: form.acceptsNights,
        preferredShifts: form.preferredShifts,
        careSettings: form.careSettings,
      });
      setProfile(updated);
      setSuccess("Profilo aggiornato");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Errore imprevisto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h1>Il mio profilo</h1>
      <p>
        Qui definisci la tua bio/CV e i requisiti minimi che devono avere le offerte di lavoro
        perché tu le prenda in considerazione.
      </p>

      <form className="card profile-form" onSubmit={handleSaveProfile}>
        <label htmlFor="fullName">Nome completo</label>
        <input
          id="fullName"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />

        <label htmlFor="headline">Titolo professionale</label>
        <input
          id="headline"
          value={form.headline}
          onChange={(e) => setForm({ ...form, headline: e.target.value })}
        />

        <label htmlFor="bio">Bio / CV</label>
        <textarea
          id="bio"
          rows={5}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />

        <label htmlFor="city">Città</label>
        <input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />

        <label htmlFor="yearsExperience">Anni di esperienza</label>
        <input
          id="yearsExperience"
          type="number"
          min={0}
          value={form.yearsExperience}
          onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })}
        />

        <label htmlFor="skills">Competenze (separate da virgola)</label>
        <input id="skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />

        <label htmlFor="specializations">Specializzazioni (separate da virgola)</label>
        <input
          id="specializations"
          value={form.specializations}
          onChange={(e) => setForm({ ...form, specializations: e.target.value })}
        />

        <label htmlFor="certifications">Certificazioni (separate da virgola)</label>
        <input
          id="certifications"
          value={form.certifications}
          onChange={(e) => setForm({ ...form, certifications: e.target.value })}
        />

        <h3>Requisiti richiesti per considerare un'offerta</h3>

        <label htmlFor="minHourlyRate">Paga oraria minima (€/h)</label>
        <input
          id="minHourlyRate"
          type="number"
          min={0}
          step="0.5"
          value={form.minHourlyRate}
          onChange={(e) => setForm({ ...form, minHourlyRate: Number(e.target.value) })}
          required
        />

        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={form.acceptsHolidays}
              onChange={(e) => setForm({ ...form, acceptsHolidays: e.target.checked })}
            />
            Disponibile nei festivi
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.acceptsWeekends}
              onChange={(e) => setForm({ ...form, acceptsWeekends: e.target.checked })}
            />
            Disponibile nel weekend
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.acceptsNights}
              onChange={(e) => setForm({ ...form, acceptsNights: e.target.checked })}
            />
            Disponibile per turni notturni
          </label>
        </div>

        <p>Turni accettati (nessuna selezione = tutti)</p>
        <div className="checkbox-row">
          {SHIFT_TYPE_OPTIONS.map(({ value, label }) => (
            <label key={value}>
              <input
                type="checkbox"
                checked={form.preferredShifts.includes(value)}
                onChange={() => toggleShift(value)}
              />
              {label}
            </label>
          ))}
        </div>

        <p>Ambienti di lavoro accettati (nessuna selezione = tutti)</p>
        <div className="checkbox-row">
          {CARE_SETTINGS_OPTIONS.map(({ value, label }) => (
            <label key={value}>
              <input
                type="checkbox"
                checked={form.careSettings.includes(value)}
                onChange={() => toggleCareSetting(value)}
              />
              {label}
            </label>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit" disabled={saving}>
          {saving ? "Salvataggio…" : "Salva profilo"}
        </button>
      </form>

      {profile && <CreateListingForm onCreated={loadAll} />}

      <h2>Le mie inserzioni</h2>
      <div className="grid">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
        {listings.length === 0 && <p>Non hai ancora pubblicato inserzioni.</p>}
      </div>
    </div>
  );
}

function CreateListingForm({ onCreated }: { onCreated: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    careSetting: CARE_SETTINGS_OPTIONS[0].value,
    shiftType: SHIFT_TYPE_OPTIONS[0].value,
    isHoliday: false,
    isWeekend: false,
    serviceDate: "",
    durationHours: 2,
    city: "",
    startingPrice: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const listing = await api.post<{ id: string }>("/listings", {
        ...form,
        durationHours: Number(form.durationHours),
        startingPrice: form.startingPrice ? Number(form.startingPrice) : undefined,
        serviceDate: new Date(form.serviceDate).toISOString(),
      });
      await api.post(`/listings/${listing.id}/publish`);
      setSuccess("Inserzione pubblicata! L'asta è ora aperta alle offerte.");
      setForm({ ...form, title: "", description: "" });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Errore imprevisto");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card listing-form" onSubmit={handleSubmit}>
      <h2>Pubblica una nuova disponibilità</h2>

      <label htmlFor="title">Titolo</label>
      <input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

      <label htmlFor="description">Descrizione</label>
      <textarea
        id="description"
        rows={3}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <label htmlFor="careSetting">Ambiente</label>
      <select
        id="careSetting"
        value={form.careSetting}
        onChange={(e) => setForm({ ...form, careSetting: e.target.value as CareSetting })}
      >
        {CARE_SETTINGS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label htmlFor="shiftType">Turno</label>
      <select
        id="shiftType"
        value={form.shiftType}
        onChange={(e) => setForm({ ...form, shiftType: e.target.value as ShiftType })}
      >
        {SHIFT_TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="checkbox-row">
        <label>
          <input
            type="checkbox"
            checked={form.isHoliday}
            onChange={(e) => setForm({ ...form, isHoliday: e.target.checked })}
          />
          Festivo
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.isWeekend}
            onChange={(e) => setForm({ ...form, isWeekend: e.target.checked })}
          />
          Weekend
        </label>
      </div>

      <label htmlFor="serviceDate">Data e ora del servizio</label>
      <input
        id="serviceDate"
        type="datetime-local"
        value={form.serviceDate}
        onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
        required
      />

      <label htmlFor="durationHours">Durata (ore)</label>
      <input
        id="durationHours"
        type="number"
        min={0.5}
        step="0.5"
        value={form.durationHours}
        onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })}
      />

      <label htmlFor="listingCity">Città</label>
      <input
        id="listingCity"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        required
      />

      <label htmlFor="startingPrice">Prezzo di partenza (€/h, vuoto = tua paga minima)</label>
      <input
        id="startingPrice"
        type="number"
        min={0}
        step="0.5"
        value={form.startingPrice}
        onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
      />

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Pubblicazione…" : "Pubblica e avvia l'asta"}
      </button>
    </form>
  );
}
