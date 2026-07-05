import { Link } from "react-router-dom";
import type { NurseProfile } from "../api/types";
import { Avatar } from "./Avatar";
import { MapPinIcon, CoinIcon } from "./Icon";

export function NurseCard({ nurse }: { nurse: NurseProfile }) {
  return (
    <Link to={`/nurses/${nurse.id}`} className="card nurse-card">
      <div className="nurse-card-top">
        <Avatar photoUrl={nurse.photoUrl} name={nurse.fullName} size={72} ring />
        <div className="nurse-card-identity">
          <h3>{nurse.fullName}</h3>
          {nurse.headline && <p className="nurse-headline">{nurse.headline}</p>}
          <span className="nurse-card-location">
            <MapPinIcon size={14} /> {nurse.city}
          </span>
        </div>
      </div>

      <div className="tag-list">
        {nurse.specializations.slice(0, 3).map((s) => (
          <span key={s} className="tag">
            {s}
          </span>
        ))}
      </div>

      <div className="nurse-card-footer">
        <span className="price-badge price-badge-hourly">
          <CoinIcon size={16} /> da {nurse.minHourlyRate} €/h
        </span>
        <span className="nurse-card-experience">{nurse.yearsExperience} anni di esperienza</span>
      </div>
    </Link>
  );
}
