import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import type { Auction, CareSetting, NurseProfile, NurseService, ShiftType } from "../api/types";
import { CARE_SETTINGS_OPTIONS, SERVICE_SUGGESTIONS, SHIFT_TYPE_OPTIONS } from "../constants";
import { Avatar } from "../components/Avatar";
import { AuctionTypeBadge, AuctionStatusBadge, PriceBadge } from "../components/Badges";
import { CountdownTimer } from "../components/CountdownTimer";
import { ClockIcon, PlusIcon, SyringeIcon, TrashIcon } from "../components/Icon";

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
  const [services, setServices] = useState<NurseService[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    bio: "",
    photoUrl: "",
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
        photoUrl: p.photoUrl ?? "",
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
      const [myServices, myAuctions] = await Promise.all([
        api.get<NurseService[]>("/nurses/me/services"),
        api.get<Auction[]>(`/auctions?nurseId=${p.id}&status=OPEN`),
      ]);
      setServices(myServices);
      setAuctions(myAuctions);
    } catch {
      // profilo non ancora inizializzato: si parte da un form vuoto
    }
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
        photoUrl: form.photoUrl || undefined,
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

  async function openHourlyAuction() {
    setError(null);
    try {
      await api.post("/auctions", { type: "HOURLY" });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Errore imprevisto");
    }
  }

  async function openServiceAuction(serviceId: string) {
    setError(null);
    try {
      await api.post("/auctions", { type: "SERVICE", serviceId });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Errore imprevisto");
    }
  }

  const hourlyAuctionOpen = auctions.some((a) => a.type === "HOURLY");
  const serviceIdsWithOpenAuction = new Set(auctions.filter((a) => a.type === "SERVICE").map((a) => a.serviceId));

  return (
    <div className="page">
      <h1>Il mio profilo</h1>

      <form className="card profile-form" onSubmit={handleSaveProfile}>
        <div className="photo-edit-row">
          <Avatar photoUrl={form.photoUrl || null} name={form.fullName || "?"} size={88} ring />
          <div className="photo-edit-input">
            <label htmlFor="photoUrl">URL foto profilo</label>
            <input
              id="photoUrl"
              placeholder="https://…"
              value={form.photoUrl}
              onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
            />
          </div>
        </div>

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
          rows={4}
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

        <h3>Disponibilità generale</h3>

        <label htmlFor="minHourlyRate">Tariffa oraria minima (€/h)</label>
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
            Festivi
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.acceptsWeekends}
              onChange={(e) => setForm({ ...form, acceptsWeekends: e.target.checked })}
            />
            Weekend
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.acceptsNights}
              onChange={(e) => setForm({ ...form, acceptsNights: e.target.checked })}
            />
            Turni notturni
          </label>
        </div>

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
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Salvataggio…" : "Salva profilo"}
        </button>
      </form>

      {profile && (
        <>
          <div className="card auction-manager-card">
            <div className="auction-manager-row">
              <div>
                <h3>
                  <ClockIcon size={18} /> Asta oraria
                </h3>
                <p className="muted small">Tariffa minima: {profile.minHourlyRate} €/h</p>
              </div>
              {hourlyAuctionOpen ? (
                <span className="status-pill status-open">Asta già aperta</span>
              ) : (
                <button className="btn-primary" onClick={openHourlyAuction}>
                  Apri asta oraria
                </button>
              )}
            </div>
            {auctions
              .filter((a) => a.type === "HOURLY")
              .map((a) => (
                <Link key={a.id} to={`/auctions/${a.id}`} className="auction-manager-item">
                  <PriceBadge amount={a.currentPrice} type="HOURLY" />
                  <CountdownTimer endAt={a.endAt} />
                  <AuctionStatusBadge status={a.status} />
                </Link>
              ))}
          </div>

          <ServicesManager
            services={services}
            openServiceAuction={openServiceAuction}
            serviceIdsWithOpenAuction={serviceIdsWithOpenAuction}
            auctions={auctions}
            onChanged={loadAll}
          />
        </>
      )}
    </div>
  );
}

function ServicesManager({
  services,
  openServiceAuction,
  serviceIdsWithOpenAuction,
  auctions,
  onChanged,
}: {
  services: NurseService[];
  openServiceAuction: (serviceId: string) => void;
  serviceIdsWithOpenAuction: Set<string | null>;
  auctions: Auction[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/nurses/me/services", { name, minPrice: Number(minPrice) });
      setName("");
      setMinPrice("");
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Errore imprevisto");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await api.delete(`/nurses/me/services/${id}`);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Errore imprevisto");
    }
  }

  const auctionByServiceId = new Map(
    auctions.filter((a) => a.type === "SERVICE" && a.serviceId).map((a) => [a.serviceId as string, a])
  );

  return (
    <div className="card">
      <h3>
        <SyringeIcon size={18} /> Le mie prestazioni
      </h3>
      <p className="muted small">
        Definisci tu quali prestazioni offri e la paga minima per ciascuna: iniezioni, prelievi, ECG,
        intramuscolo… o prestazioni più specifiche come un impianto PICC, a tua discrezione.
      </p>

      <div className="service-suggestions">
        {SERVICE_SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip-button" onClick={() => setName(s)}>
            {s}
          </button>
        ))}
      </div>

      <form className="add-service-form" onSubmit={handleAdd}>
        <input placeholder="Nome prestazione" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          type="number"
          min={0}
          step="0.5"
          placeholder="Paga minima (€)"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={submitting}>
          <PlusIcon size={16} /> Aggiungi
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      <div className="service-manage-list">
        {services.map((service) => {
          const auction = auctionByServiceId.get(service.id);
          return (
            <div key={service.id} className="service-manage-row">
              <div>
                <strong>{service.name}</strong>
                <PriceBadge amount={service.minPrice} type="SERVICE" suffix=" min" />
              </div>
              <div className="service-manage-actions">
                {auction ? (
                  <Link to={`/auctions/${auction.id}`} className="status-pill status-open">
                    Asta aperta — {auction.currentPrice} €
                  </Link>
                ) : (
                  <button className="btn-ghost" onClick={() => openServiceAuction(service.id)}>
                    Apri asta
                  </button>
                )}
                <button className="icon-button" onClick={() => handleDelete(service.id)} aria-label="Elimina">
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {services.length === 0 && <p className="muted">Non hai ancora aggiunto prestazioni.</p>}
      </div>
    </div>
  );
}
