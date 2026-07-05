import { Link } from "react-router-dom";
import type { NurseProfile } from "../api/types";

export function NurseCard({ nurse }: { nurse: NurseProfile }) {
  return (
    <Link to={`/nurses/${nurse.id}`} className="card nurse-card">
      <div className="nurse-card-header">
        <h3>{nurse.fullName}</h3>
        <span className="badge">{nurse.city}</span>
      </div>
      {nurse.headline && <p className="nurse-headline">{nurse.headline}</p>}
      <p className="nurse-experience">{nurse.yearsExperience} anni di esperienza</p>
      <div className="tag-list">
        {nurse.specializations.slice(0, 3).map((s) => (
          <span key={s} className="tag">
            {s}
          </span>
        ))}
      </div>
      <div className="nurse-card-footer">
        <span className="price">A partire da {nurse.minHourlyRate} €/h</span>
      </div>
    </Link>
  );
}
