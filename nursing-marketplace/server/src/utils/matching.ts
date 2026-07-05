import type { CareSetting, ShiftType } from "../constants.js";

/** Requisiti minimi che l'infermiere ha impostato sul proprio profilo. */
export interface NurseRequirements {
  minHourlyRate: number;
  acceptsHolidays: boolean;
  acceptsWeekends: boolean;
  acceptsNights: boolean;
  preferredShifts: ShiftType[]; // vuoto = nessuna restrizione sul turno
  careSettings: CareSetting[]; // vuoto = nessuna restrizione sull'ambiente
}

/** Condizioni proposte per una specifica disponibilità/incarico. */
export interface OfferedConditions {
  hourlyRate: number;
  isHoliday: boolean;
  isWeekend: boolean;
  shiftType: ShiftType;
  careSetting: CareSetting;
}

export interface MatchResult {
  matches: boolean;
  reasons: string[];
}

/**
 * Verifica se un'offerta rispetta i requisiti minimi impostati
 * dall'infermiere sul proprio profilo (paga, turni, ambienti, festivi/weekend).
 */
export function nurseAcceptsConditions(
  requirements: NurseRequirements,
  offer: OfferedConditions
): MatchResult {
  const reasons: string[] = [];

  if (offer.hourlyRate < requirements.minHourlyRate) {
    reasons.push(
      `Paga oraria proposta (${offer.hourlyRate}) inferiore al minimo richiesto (${requirements.minHourlyRate})`
    );
  }

  if (offer.isHoliday && !requirements.acceptsHolidays) {
    reasons.push("L'infermiere non è disponibile nei giorni festivi");
  }

  if (offer.isWeekend && !requirements.acceptsWeekends) {
    reasons.push("L'infermiere non è disponibile nel weekend");
  }

  if (offer.shiftType === "NIGHT" && !requirements.acceptsNights) {
    reasons.push("L'infermiere non è disponibile per turni notturni");
  }

  if (
    requirements.preferredShifts.length > 0 &&
    !requirements.preferredShifts.includes(offer.shiftType)
  ) {
    reasons.push(`Turno richiesto (${offer.shiftType}) non tra quelli accettati`);
  }

  if (
    requirements.careSettings.length > 0 &&
    !requirements.careSettings.includes(offer.careSetting)
  ) {
    reasons.push(`Ambiente richiesto (${offer.careSetting}) non tra quelli accettati`);
  }

  return { matches: reasons.length === 0, reasons };
}
