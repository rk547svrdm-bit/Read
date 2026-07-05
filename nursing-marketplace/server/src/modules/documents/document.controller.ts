import type { Request, Response } from "express";
import { createDocumentSchema, updateDocumentStatusSchema } from "./document.schemas.js";
import * as documentService from "./document.service.js";
import { AppError } from "../../utils/AppError.js";

export async function listMyDocumentsHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const docs = await documentService.listMyDocuments(req.user.id);
  res.json(docs);
}

export async function createDocumentHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = createDocumentSchema.parse(req.body);
  const doc = await documentService.createDocument(req.user.id, input);
  res.status(201).json(doc);
}

export async function deleteDocumentHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  await documentService.deleteDocument(req.user.id, req.params.documentId);
  res.status(204).send();
}

export async function getPublicVerificationHandler(req: Request, res: Response) {
  const summary = await documentService.getPublicVerification(req.params.id);
  res.json(summary);
}

export async function updateDocumentStatusHandler(req: Request, res: Response) {
  const input = updateDocumentStatusSchema.parse(req.body);
  const doc = await documentService.updateDocumentStatus(req.params.documentId, input);
  res.json(doc);
}
