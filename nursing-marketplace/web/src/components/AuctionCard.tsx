import { Link } from "react-router-dom";
import type { Auction } from "../api/types";
import { Avatar } from "./Avatar";
import { AuctionTypeBadge, PriceBadge } from "./Badges";
import { CountdownTimer } from "./CountdownTimer";

export function AuctionCard({ auction }: { auction: Auction }) {
  const title = auction.type === "HOURLY" ? "Tariffa oraria" : auction.service?.name ?? "Prestazione";

  return (
    <Link to={`/auctions/${auction.id}`} className="card auction-card">
      {auction.nurse && (
        <div className="auction-card-nurse">
          <Avatar photoUrl={auction.nurse.photoUrl} name={auction.nurse.fullName} size={36} />
          <div>
            <div className="auction-card-nurse-name">{auction.nurse.fullName}</div>
            <div className="auction-card-nurse-city">{auction.nurse.city}</div>
          </div>
        </div>
      )}
      <AuctionTypeBadge type={auction.type} />
      <h3 className="auction-card-title">{title}</h3>
      <div className="auction-card-footer">
        <PriceBadge amount={auction.currentPrice} type={auction.type} />
        <CountdownTimer endAt={auction.endAt} />
      </div>
    </Link>
  );
}
