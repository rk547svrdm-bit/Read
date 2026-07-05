import type { NurseDocument } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateDocumentInput, UpdateDocumentStatusInput } from "./document.schemas.js";

export function serializeDocument(doc: NurseDocument) {
  return {
    id: doc.id,
    nurseId: doc.nurseId,
    type: doc.type,
    label: doc.label,
    fileUrl: doc.fileUrl,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

async function getOwnedNurseProfileOrThrow(userId: string) {
  const profile = await prisma.nurseProfile.findUnique({ where: { userId } });
  if (!profile) throw AppError.notFound("Profilo infermiere non trovato");
  return profile;
}

export async function listMyDocuments(userId: string) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);
  const docs = await prisma.nurseDocument.findMany({
    where: { nurseId: nurse.id },
    orderBy: { createdAt: "desc" },
  });
  return docs.map(serializeDocument);
}

export async function createDocument(userId: string, input: CreateDocumentInput) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);
  const doc = await prisma.nurseDocument.create({
    data: { nurseId: nurse.id, type: input.type, label: input.label, fileUrl: input.fileUrl },
  });
  return serializeDocument(doc);
}

export async function deleteDocument(userId: string, documentId: string) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);
  const doc = await prisma.nurseDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.nurseId !== nurse.id) throw AppError.notFound("Documento non trovato");
  await prisma.nurseDocument.delete({ where: { id: documentId } });
}

/**
 * Riepilogo pubblico delle verifiche: per i tipi sensibili (albo,
 * assicurazione, identità) espone solo un booleano "verificato", mai il
 * file. Le certificazioni (corsi, attestati) sono invece pensate per essere
 * consultate dal cliente, quindi vengono restituite per intero se non
 * rifiutate.
 */
export async function getPublicVerification(nurseId: string) {
  const docs = await prisma.nurseDocument.findMany({ where: { nurseId } });

  const isVerified = (type: string) => docs.some((d) => d.type === type && d.status === "VERIFIED");

  const certifications = docs
    .filter((d) => d.type === "CERTIFICATION" && d.status !== "REJECTED")
    .map(serializeDocument);

  return {
    license: isVerified("LICENSE"),
    insurance: isVerified("INSURANCE"),
    identity: isVerified("ID"),
    certifications,
  };
}

export async function updateDocumentStatus(documentId: string, input: UpdateDocumentStatusInput) {
  const doc = await prisma.nurseDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw AppError.notFound("Documento non trovato");
  const updated = await prisma.nurseDocument.update({
    where: { id: documentId },
    data: { status: input.status },
  });
  return serializeDocument(updated);
}
