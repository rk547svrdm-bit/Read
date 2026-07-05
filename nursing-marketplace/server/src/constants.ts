export const ROLES = ["NURSE", "CLIENT", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const SHIFT_TYPES = ["MORNING", "AFTERNOON", "NIGHT", "FULL_DAY"] as const;
export type ShiftType = (typeof SHIFT_TYPES)[number];

export const CARE_SETTINGS = [
  "HOME_CARE",
  "OUTPATIENT_CLINIC",
  "OPERATING_ROOM",
  "HOSPITAL_WARD",
  "NURSING_HOME",
  "TELEHEALTH",
] as const;
export type CareSetting = (typeof CARE_SETTINGS)[number];

/** L'asta riguarda sempre il professionista: o la sua tariffa oraria (HOURLY)
 * o una specifica prestazione del suo catalogo (SERVICE). */
export const AUCTION_TYPES = ["HOURLY", "SERVICE"] as const;
export type AuctionType = (typeof AUCTION_TYPES)[number];

export const AUCTION_STATUS = ["OPEN", "CLOSED", "AWARDED", "CANCELLED"] as const;
export type AuctionStatus = (typeof AUCTION_STATUS)[number];

/** Suggerimenti di prestazioni comuni mostrati in UI; il professionista può
 * comunque aggiungerne di personalizzate (es. Impianto PICC, assistenza a
 * intervento chirurgico) con nome e paga minima a sua discrezione. */
export const SERVICE_SUGGESTIONS = [
  "Iniezione",
  "Prelievo ematico",
  "Elettrocardiogramma (ECG)",
  "Intramuscolo",
  "Flebo / terapia infusionale",
  "Medicazione semplice",
  "Medicazione avanzata",
  "Cateterismo",
  "Impianto PICC",
  "Assistenza a intervento chirurgico",
] as const;

export const BID_STATUS = ["ACTIVE", "OUTBID", "WINNING", "WITHDRAWN"] as const;
export type BidStatus = (typeof BID_STATUS)[number];

export const BOOKING_STATUS = [
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];
