import { CARE_SETTING_LABELS, DOCUMENT_TYPE_LABELS, SHIFT_TYPE_LABELS } from "./api/types";
import type { CareSetting, DocumentType, ShiftType } from "./api/types";

export const SHIFT_TYPE_OPTIONS: { value: ShiftType; label: string }[] = (
  Object.keys(SHIFT_TYPE_LABELS) as ShiftType[]
).map((value) => ({ value, label: SHIFT_TYPE_LABELS[value] }));

export const CARE_SETTINGS_OPTIONS: { value: CareSetting; label: string }[] = (
  Object.keys(CARE_SETTING_LABELS) as CareSetting[]
).map((value) => ({ value, label: CARE_SETTING_LABELS[value] }));

// Suggerimenti rapidi di prestazioni comuni; l'infermiere può comunque
// aggiungerne di personalizzate con nome e paga minima a sua discrezione.
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
];

// Avatar illustrati locali, utili come foto profilo di esempio finché non
// si carica una foto reale (nessuna dipendenza da servizi esterni).
export const SAMPLE_AVATARS = ["/avatars/avatar-1.svg", "/avatars/avatar-2.svg", "/avatars/avatar-3.svg"];

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = (
  Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]
).map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }));
