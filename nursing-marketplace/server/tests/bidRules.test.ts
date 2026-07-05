import { describe, it, expect } from "vitest";
import { computeMinNextBid, validateBidAmount, type AuctionState } from "../src/utils/bidRules.js";

function baseAuction(overrides: Partial<AuctionState> = {}): AuctionState {
  const now = new Date("2026-01-01T10:00:00Z");
  return {
    status: "OPEN",
    startAt: new Date(now.getTime() - 1000),
    endAt: new Date(now.getTime() + 60 * 60 * 1000),
    startingPrice: 20,
    currentPrice: 20,
    minIncrement: 2,
    bidsCount: 0,
    ...overrides,
  };
}

const NOW = new Date("2026-01-01T10:00:00Z");

describe("computeMinNextBid", () => {
  it("richiede il prezzo di partenza se non ci sono ancora offerte", () => {
    expect(computeMinNextBid(baseAuction({ bidsCount: 0, startingPrice: 20 }))).toBe(20);
  });

  it("richiede prezzo corrente + rilancio minimo se ci sono già offerte", () => {
    expect(
      computeMinNextBid(baseAuction({ bidsCount: 2, currentPrice: 30, minIncrement: 2 }))
    ).toBe(32);
  });
});

describe("validateBidAmount", () => {
  it("accetta la prima offerta pari al prezzo di partenza", () => {
    const result = validateBidAmount(baseAuction({ bidsCount: 0, startingPrice: 20 }), 20, NOW);
    expect(result.valid).toBe(true);
  });

  it("rifiuta un'offerta inferiore al minimo richiesto", () => {
    const result = validateBidAmount(
      baseAuction({ bidsCount: 1, currentPrice: 30, minIncrement: 2 }),
      31,
      NOW
    );
    expect(result.valid).toBe(false);
    expect(result.minNextBid).toBe(32);
  });

  it("rifiuta offerte su aste non aperte", () => {
    const result = validateBidAmount(baseAuction({ status: "CLOSED" }), 100, NOW);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/non è aperta/);
  });

  it("rifiuta offerte dopo la scadenza dell'asta", () => {
    const result = validateBidAmount(
      baseAuction({ endAt: new Date(NOW.getTime() - 1000) }),
      100,
      NOW
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/scaduta/);
  });

  it("rifiuta importi non positivi", () => {
    const result = validateBidAmount(baseAuction(), -5, NOW);
    expect(result.valid).toBe(false);
  });
});
