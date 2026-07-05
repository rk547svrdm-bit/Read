import { describe, it, expect } from "vitest";
import { nurseAcceptsConditions, type NurseRequirements, type OfferedConditions } from "../src/utils/matching.js";

function requirements(overrides: Partial<NurseRequirements> = {}): NurseRequirements {
  return {
    minHourlyRate: 25,
    acceptsHolidays: false,
    acceptsWeekends: true,
    acceptsNights: false,
    preferredShifts: ["MORNING", "AFTERNOON"],
    careSettings: ["HOME_CARE"],
    ...overrides,
  };
}

function offer(overrides: Partial<OfferedConditions> = {}): OfferedConditions {
  return {
    hourlyRate: 25,
    isHoliday: false,
    isWeekend: false,
    shiftType: "MORNING",
    careSetting: "HOME_CARE",
    ...overrides,
  };
}

describe("nurseAcceptsConditions", () => {
  it("accetta un'offerta che rispetta tutti i requisiti", () => {
    expect(nurseAcceptsConditions(requirements(), offer()).matches).toBe(true);
  });

  it("rifiuta una paga sotto il minimo richiesto", () => {
    const result = nurseAcceptsConditions(requirements(), offer({ hourlyRate: 20 }));
    expect(result.matches).toBe(false);
    expect(result.reasons.some((r) => r.includes("Paga oraria"))).toBe(true);
  });

  it("rifiuta un turno festivo se l'infermiere non lo accetta", () => {
    const result = nurseAcceptsConditions(requirements(), offer({ isHoliday: true }));
    expect(result.matches).toBe(false);
  });

  it("rifiuta un turno notturno se l'infermiere non lo accetta", () => {
    const result = nurseAcceptsConditions(requirements(), offer({ shiftType: "NIGHT" }));
    expect(result.matches).toBe(false);
  });

  it("rifiuta un ambiente di cura non tra quelli accettati", () => {
    const result = nurseAcceptsConditions(requirements(), offer({ careSetting: "OPERATING_ROOM" }));
    expect(result.matches).toBe(false);
  });

  it("nessuna restrizione su turni/ambienti se le liste sono vuote", () => {
    const result = nurseAcceptsConditions(
      requirements({ preferredShifts: [], careSettings: [] }),
      offer({ shiftType: "NIGHT", careSetting: "OPERATING_ROOM", isHoliday: false })
    );
    // Notte comunque rifiutata perché acceptsNights è false, indipendentemente dalla lista turni
    expect(result.matches).toBe(false);
  });
});
