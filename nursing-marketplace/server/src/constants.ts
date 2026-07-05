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

export const LISTING_STATUS = ["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"] as const;
export type ListingStatus = (typeof LISTING_STATUS)[number];

export const AUCTION_STATUS = ["SCHEDULED", "OPEN", "CLOSED", "AWARDED", "CANCELLED"] as const;
export type AuctionStatus = (typeof AUCTION_STATUS)[number];

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
