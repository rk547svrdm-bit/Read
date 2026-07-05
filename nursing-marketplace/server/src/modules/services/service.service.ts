import type { NurseService } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateServiceInput, UpdateServiceInput } from "./service.schemas.js";

export function serializeService(service: NurseService) {
  return {
    id: service.id,
    nurseId: service.nurseId,
    name: service.name,
    description: service.description,
    minPrice: service.minPrice,
    isActive: service.isActive,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

async function getOwnedNurseProfileOrThrow(userId: string) {
  const profile = await prisma.nurseProfile.findUnique({ where: { userId } });
  if (!profile) throw AppError.notFound("Profilo infermiere non trovato");
  return profile;
}

export async function listPublicServices(nurseId: string) {
  const services = await prisma.nurseService.findMany({
    where: { nurseId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return services.map(serializeService);
}

export async function listMyServices(userId: string) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);
  const services = await prisma.nurseService.findMany({
    where: { nurseId: nurse.id },
    orderBy: { createdAt: "asc" },
  });
  return services.map(serializeService);
}

export async function createService(userId: string, input: CreateServiceInput) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);
  const service = await prisma.nurseService.create({
    data: {
      nurseId: nurse.id,
      name: input.name,
      description: input.description,
      minPrice: input.minPrice,
    },
  });
  return serializeService(service);
}

async function getOwnedServiceOrThrow(userId: string, serviceId: string) {
  const nurse = await getOwnedNurseProfileOrThrow(userId);
  const service = await prisma.nurseService.findUnique({ where: { id: serviceId } });
  if (!service || service.nurseId !== nurse.id) throw AppError.notFound("Prestazione non trovata");
  return service;
}

export async function updateService(userId: string, serviceId: string, input: UpdateServiceInput) {
  await getOwnedServiceOrThrow(userId, serviceId);
  const service = await prisma.nurseService.update({ where: { id: serviceId }, data: input });
  return serializeService(service);
}

export async function deleteService(userId: string, serviceId: string) {
  await getOwnedServiceOrThrow(userId, serviceId);
  const activeAuction = await prisma.auction.findFirst({
    where: { serviceId, status: "OPEN" },
  });
  if (activeAuction) {
    throw AppError.conflict("Non puoi eliminare una prestazione con un'asta aperta");
  }
  await prisma.nurseService.delete({ where: { id: serviceId } });
}
