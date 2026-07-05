import { Link } from "react-router-dom";
import type { Listing } from "../api/types";
import { CARE_SETTING_LABELS, SHIFT_TYPE_LABELS } from "../api/types";
import { CountdownTimer } from "./CountdownTimer";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link to={`/listings/${listing.id}`} className="card listing-card">
      <div className="listing-card-header">
        <h3>{listing.title}</h3>
        <span className="badge">{listing.city}</span>
      </div>
      <p className="tag-list">
        <span className="tag">{CARE_SETTING_LABELS[listing.careSetting]}</span>
        <span className="tag">{SHIFT_TYPE_LABELS[listing.shiftType]}</span>
        {listing.isHoliday && <span className="tag tag-warning">Festivo</span>}
        {listing.isWeekend && <span className="tag">Weekend</span>}
      </p>
      <p>{new Date(listing.serviceDate).toLocaleString("it-IT")}</p>
      {listing.auction && (
        <div className="listing-card-footer">
          <span className="price">Offerta attuale: {listing.auction.currentPrice} €/h</span>
          <CountdownTimer endAt={listing.auction.endAt} />
        </div>
      )}
    </Link>
  );
}
