export type Role = "NURSE" | "CLIENT" | "ADMIN";
export type ShiftType = "MORNING" | "AFTERNOON" | "NIGHT" | "FULL_DAY";
export type CareSetting =
  | "HOME_CARE"
  | "OUTPATIENT_CLINIC"
  | "OPERATING_ROOM"
  | "HOSPITAL_WARD"
  | "NURSING_HOME"
  | "TELEHEALTH";

export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  MORNING: "Mattina",
  AFTERNOON: "Pomeriggio",
  NIGHT: "Notte",
  FULL_DAY: "Intero turno",
};

export const CARE_SETTING_LABELS: Record<CareSetting, string> = {
  HOME_CARE: "Domicilio",
  OUTPATIENT_CLINIC: "Ambulatorio",
  OPERATING_ROOM: "Sala operatoria",
  HOSPITAL_WARD: "Reparto ospedaliero",
  NURSING_HOME: "RSA",
  TELEHEALTH: "Telemedicina",
};

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface NurseProfile {
  id: string;
  userId: string;
  fullName: string;
  headline: string | null;
  bio: string;
  licenseNumber: string | null;
  yearsExperience: number;
  skills: string[];
  specializations: string[];
  certifications: string[];
  city: string;
  travelRadiusKm: number;
  minHourlyRate: number;
  acceptsHolidays: boolean;
  acceptsWeekends: boolean;
  acceptsNights: boolean;
  preferredShifts: ShiftType[];
  careSettings: CareSetting[];
  isActive: boolean;
}

export interface Auction {
  id: string;
  listingId: string;
  startAt: string;
  endAt: string;
  minIncrement: number;
  startingPrice: number;
  currentPrice: number;
  currentHighestBidId: string | null;
  status: "SCHEDULED" | "OPEN" | "CLOSED" | "AWARDED" | "CANCELLED";
}

export interface Listing {
  id: string;
  nurseId: string;
  title: string;
  description: string;
  careSetting: CareSetting;
  shiftType: ShiftType;
  isHoliday: boolean;
  isWeekend: boolean;
  serviceDate: string;
  durationHours: number;
  city: string;
  startingPrice: number;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";
  auction?: Auction | null;
}

export interface Bid {
  id: string;
  auctionId: string;
  clientId: string;
  amount: number;
  status: "ACTIVE" | "OUTBID" | "WINNING" | "WITHDRAWN";
  createdAt: string;
}

export interface Booking {
  id: string;
  auctionId: string;
  nurseId: string;
  clientId: string;
  finalPrice: number;
  status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DISPUTED";
}
