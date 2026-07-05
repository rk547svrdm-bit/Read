import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Auction, NurseProfile, NurseService, PublicVerification } from "../api/types";
import { CARE_SETTING_LABELS, SHIFT_TYPE_LABELS } from "../api/types";
import { Avatar } from "../components/Avatar";
import { AuctionTypeBadge, PriceBadge } from "../components/Badges";
import { CountdownTimer } from "../components/CountdownTimer";
import {
  MapPinIcon,
  CalendarIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  SyringeIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ShieldIcon,
  FileTextIcon,
} from "../components/Icon";

const VERIFICATION_ROWS: { key: keyof Omit<PublicVerification, "certifications">; label: string }[] = [
  { key: "license", label: "Iscrizione Albo/OPI" },
  { key: "insurance", label: "Assicurazione RC professionale" },
  { key: "identity", label: "Identità" },
];

export function NursePage() {
  const { id } = useParams<{ id: string }>();
  const [nurse, setNurse] = useState<NurseProfile | null>(null);
  const [services, setServices] = useState<NurseService[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [verification, setVerification] = useState<PublicVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<NurseProfile>(`/nurses/${id}`).then(setNurse).catch((err) => setError(err.message));
    api.get<NurseService[]>(`/nurses/${id}/services`).then(setServices).catch(() => {});
    api.get<Auction[]>(`/auctions?nurseId=${id}`).then(setAuctions).catch(() => {});
    api.get<PublicVerification>(`/nurses/${id}/verification`).then(setVerification).catch(() => {});
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!nurse) return <p>Caricamento…</p>;

  const hourlyAuction = auctions.find((a) => a.type === "HOURLY");
  const serviceAuctionByServiceId = new Map(
    auctions.filter((a) => a.type === "SERVICE" && a.serviceId).map((a) => [a.serviceId as string, a])
  );

  return (
    <div className="page">
      <div className="card profile-header">
        <Avatar photoUrl={nurse.photoUrl} name={nurse.fullName} size={120} ring />
        <div className="profile-header-info">
          <h1>{nurse.fullName}</h1>
          {nurse.headline && <p className="nurse-headline">{nurse.headline}</p>}
          <div className="icon-row">
            <span>
              <MapPinIcon size={16} /> {nurse.city}
            </span>
            <span>
              <CheckCircleIcon size={16} /> {nurse.yearsExperience} anni di esperienza
            </span>
          </div>
          {hourlyAuction && (
            <Link to={`/auctions/${hourlyAuction.id}`} className="hourly-cta">
              <ClockIcon size={16} />
              Asta oraria aperta — attuale {hourlyAuction.currentPrice} €/h
            </Link>
          )}
        </div>
      </div>

      <div className="profile-grid">
        <div className="card">
          <h3>Chi sono</h3>
          <p className="bio-text">{nurse.bio || "Nessuna descrizione inserita."}</p>

          <h3>Competenze</h3>
          <div className="tag-list">
            {nurse.skills.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
            {nurse.skills.length === 0 && <span className="muted">—</span>}
          </div>

          <h3>Specializzazioni</h3>
          <div className="tag-list">
            {nurse.specializations.map((s) => (
              <span key={s} className="tag tag-alt">
                {s}
              </span>
            ))}
            {nurse.specializations.length === 0 && <span className="muted">—</span>}
          </div>
        </div>

        <div className="card">
          <h3>Disponibilità generale</h3>
          <ul className="requirements-list">
            <li>
              <ClockIcon size={16} /> Tariffa oraria minima: <strong>{nurse.minHourlyRate} €/h</strong>
            </li>
            <li>
              <SunIcon size={16} /> Festivi: {nurse.acceptsHolidays ? "disponibile" : "non disponibile"}
            </li>
            <li>
              <CalendarIcon size={16} /> Weekend: {nurse.acceptsWeekends ? "disponibile" : "non disponibile"}
            </li>
            <li>
              <MoonIcon size={16} /> Turni notturni: {nurse.acceptsNights ? "disponibile" : "non disponibile"}
            </li>
          </ul>
          <p className="muted small">
            Turni:{" "}
            {nurse.preferredShifts.length > 0
              ? nurse.preferredShifts.map((s) => SHIFT_TYPE_LABELS[s]).join(", ")
              : "tutti"}
          </p>
          <p className="muted small">
            Ambienti:{" "}
            {nurse.careSettings.length > 0
              ? nurse.careSettings.map((s) => CARE_SETTING_LABELS[s]).join(", ")
              : "tutti"}
          </p>
        </div>
      </div>

      <div className="card verification-card">
        <h3>
          <ShieldCheckIcon size={18} /> Verifiche e certificazioni
        </h3>
        <p className="muted small">
          Documenti dichiarati dal professionista e controllati dal team Bay Nurse per garantire che sia
          davvero chi dice di essere.
        </p>
        <div className="verification-badges">
          {VERIFICATION_ROWS.map(({ key, label }) => {
            const verified = verification?.[key] ?? false;
            return (
              <span key={key} className={`verification-badge ${verified ? "verified" : "unverified"}`}>
                {verified ? <ShieldCheckIcon size={15} /> : <ShieldIcon size={15} />}
                {label}
                <em>{verified ? "Verificato" : "Non verificato"}</em>
              </span>
            );
          })}
        </div>

        {verification && verification.certifications.length > 0 && (
          <>
            <h3>Certificazioni consultabili</h3>
            <div className="certification-list">
              {verification.certifications.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="certification-row"
                >
                  <FileTextIcon size={16} />
                  <span>{doc.label}</span>
                  <span className={`status-pill status-${doc.status.toLowerCase()}`}>
                    {doc.status === "VERIFIED" ? "Verificato" : doc.status === "PENDING" ? "In attesa" : "Rifiutato"}
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      <h2>
        <SyringeIcon size={20} /> Prestazioni offerte
      </h2>
      <div className="grid">
        {services.map((service) => {
          const auction = serviceAuctionByServiceId.get(service.id);
          return (
            <div key={service.id} className="card service-card">
              <h3>{service.name}</h3>
              {service.description && <p className="muted small">{service.description}</p>}
              <PriceBadge amount={service.minPrice} type="SERVICE" suffix=" min" />
              {auction ? (
                <Link to={`/auctions/${auction.id}`} className="service-card-cta">
                  Asta aperta — {auction.currentPrice} € <CountdownTimer endAt={auction.endAt} />
                </Link>
              ) : (
                <span className="muted small">Nessuna asta attiva</span>
              )}
            </div>
          );
        })}
        {services.length === 0 && <p>Nessuna prestazione pubblicata al momento.</p>}
      </div>

      {auctions.filter((a) => a.type === "SERVICE").length === 0 && !hourlyAuction && (
        <p className="muted">Questo professionista non ha aste aperte in questo momento.</p>
      )}
    </div>
  );
}
