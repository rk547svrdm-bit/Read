import { CARE_SETTING_LABELS, SHIFT_TYPE_LABELS } from "./api/types";
import type { CareSetting, ShiftType } from "./api/types";

export const SHIFT_TYPE_OPTIONS: { value: ShiftType; label: string }[] = (
  Object.keys(SHIFT_TYPE_LABELS) as ShiftType[]
).map((value) => ({ value, label: SHIFT_TYPE_LABELS[value] }));

export const CARE_SETTINGS_OPTIONS: { value: CareSetting; label: string }[] = (
  Object.keys(CARE_SETTING_LABELS) as CareSetting[]
).map((value) => ({ value, label: CARE_SETTING_LABELS[value] }));
