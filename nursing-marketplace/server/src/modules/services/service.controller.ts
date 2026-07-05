import type { Request, Response } from "express";
import { createServiceSchema, updateServiceSchema } from "./service.schemas.js";
import * as serviceService from "./service.service.js";
import { AppError } from "../../utils/AppError.js";

export async function listPublicServicesHandler(req: Request, res: Response) {
  const services = await serviceService.listPublicServices(req.params.id);
  res.json(services);
}

export async function listMyServicesHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const services = await serviceService.listMyServices(req.user.id);
  res.json(services);
}

export async function createServiceHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = createServiceSchema.parse(req.body);
  const service = await serviceService.createService(req.user.id, input);
  res.status(201).json(service);
}

export async function updateServiceHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const input = updateServiceSchema.parse(req.body);
  const service = await serviceService.updateService(req.user.id, req.params.serviceId, input);
  res.json(service);
}

export async function deleteServiceHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  await serviceService.deleteService(req.user.id, req.params.serviceId);
  res.status(204).send();
}
