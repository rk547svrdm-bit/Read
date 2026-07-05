import { z } from "zod";
import { DOCUMENT_TYPES, DOCUMENT_STATUS } from "../../constants.js";

export const createDocumentSchema = z.object({
  type: z.enum(DOCUMENT_TYPES),
  label: z.string().min(2).max(140),
  // URL esterno o data URL (upload client-side via FileReader).
  fileUrl: z.string().min(1),
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentStatusSchema = z.object({
  status: z.enum(DOCUMENT_STATUS),
});
export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusSchema>;
