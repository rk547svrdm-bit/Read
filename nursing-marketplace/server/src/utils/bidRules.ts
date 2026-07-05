export interface AuctionState {
  status: string; // AuctionStatus
  startAt: Date;
  endAt: Date;
  startingPrice: number;
  currentPrice: number;
  minIncrement: number;
  bidsCount: number;
}

export interface BidValidationResult {
  valid: boolean;
  reason?: string;
  minNextBid: number;
}

/** Importo minimo accettabile per la prossima offerta su un'asta. */
export function computeMinNextBid(auction: Pick<AuctionState, "bidsCount" | "startingPrice" | "currentPrice" | "minIncrement">): number {
  if (auction.bidsCount === 0) return auction.startingPrice;
  return auction.currentPrice + auction.minIncrement;
}

/** Valida un'offerta rispetto allo stato corrente dell'asta, senza toccare il DB. */
export function validateBidAmount(auction: AuctionState, amount: number, now: Date = new Date()): BidValidationResult {
  const minNextBid = computeMinNextBid(auction);

  if (auction.status !== "OPEN") {
    return { valid: false, reason: "L'asta non è aperta alle offerte", minNextBid };
  }

  if (now < auction.startAt) {
    return { valid: false, reason: "L'asta non è ancora iniziata", minNextBid };
  }

  if (now >= auction.endAt) {
    return { valid: false, reason: "L'asta è già scaduta", minNextBid };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, reason: "Importo non valido", minNextBid };
  }

  if (amount < minNextBid) {
    return {
      valid: false,
      reason: `L'offerta deve essere almeno ${minNextBid}`,
      minNextBid,
    };
  }

  return { valid: true, minNextBid };
}
