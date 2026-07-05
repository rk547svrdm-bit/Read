import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.nurseProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  const nurse1User = await prisma.user.create({
    data: {
      email: "paolo.gulli@example.com",
      passwordHash,
      role: "NURSE",
      nurseProfile: {
        create: {
          fullName: "Paolo Gullì",
          headline: "Infermiere libero professionista - assistenza domiciliare",
          bio: "Oltre 10 anni di esperienza in assistenza infermieristica a domicilio, medicazioni complesse e prelievi. Copertura assicurativa RC professionale.",
          licenseNumber: "IPASVI-TO-12345",
          yearsExperience: 10,
          skillsJson: JSON.stringify(["Medicazioni avanzate", "Prelievi ematici", "Gestione stomie", "Terapie infusive"]),
          specializationsJson: JSON.stringify(["Assistenza domiciliare", "Wound care"]),
          certificationsJson: JSON.stringify(["BLSD", "Corso medicazioni avanzate"]),
          city: "Torino",
          travelRadiusKm: 30,
          minHourlyRate: 25,
          acceptsHolidays: true,
          acceptsWeekends: true,
          acceptsNights: false,
          preferredShiftsJson: JSON.stringify(["MORNING", "AFTERNOON"]),
          careSettingsJson: JSON.stringify(["HOME_CARE", "OUTPATIENT_CLINIC"]),
        },
      },
    },
    include: { nurseProfile: true },
  });

  const nurse2User = await prisma.user.create({
    data: {
      email: "giulia.bianchi@example.com",
      passwordHash,
      role: "NURSE",
      nurseProfile: {
        create: {
          fullName: "Giulia Bianchi",
          headline: "Infermiera di sala operatoria",
          bio: "Specializzata in strumentazione di sala operatoria e reparti chirurgici, disponibile anche su turni notturni e festivi.",
          yearsExperience: 6,
          skillsJson: JSON.stringify(["Strumentazione chirurgica", "Gestione emergenze", "Anestesia locale assistita"]),
          specializationsJson: JSON.stringify(["Sala operatoria", "Chirurgia generale"]),
          certificationsJson: JSON.stringify(["ACLS"]),
          city: "Milano",
          travelRadiusKm: 20,
          minHourlyRate: 35,
          acceptsHolidays: true,
          acceptsWeekends: true,
          acceptsNights: true,
          preferredShiftsJson: JSON.stringify(["MORNING", "AFTERNOON", "NIGHT", "FULL_DAY"]),
          careSettingsJson: JSON.stringify(["OPERATING_ROOM", "HOSPITAL_WARD"]),
        },
      },
    },
    include: { nurseProfile: true },
  });

  const clientUser = await prisma.user.create({
    data: {
      email: "famiglia.rossi@example.com",
      passwordHash,
      role: "CLIENT",
      clientProfile: {
        create: { displayName: "Famiglia Rossi", city: "Torino" },
      },
    },
  });

  const listing = await prisma.listing.create({
    data: {
      nurseId: nurse1User.nurseProfile!.id,
      title: "Medicazione post-operatoria a domicilio - sabato mattina",
      description: "Cambio medicazione e controllo parametri vitali per paziente post-chirurgico.",
      careSetting: "HOME_CARE",
      shiftType: "MORNING",
      isHoliday: false,
      isWeekend: true,
      serviceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      durationHours: 2,
      city: "Torino",
      startingPrice: 25,
      status: "PUBLISHED",
    },
  });

  const now = new Date();
  const auction = await prisma.auction.create({
    data: {
      listingId: listing.id,
      startAt: now,
      endAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      minIncrement: 1,
      startingPrice: 25,
      currentPrice: 27,
      status: "OPEN",
    },
  });

  const bid = await prisma.bid.create({
    data: { auctionId: auction.id, clientId: clientUser.id, amount: 27, status: "WINNING" },
  });

  await prisma.auction.update({
    where: { id: auction.id },
    data: { currentHighestBidId: bid.id },
  });

  console.log("Seed completato:");
  console.log({ nurse1: nurse1User.email, nurse2: nurse2User.email, client: clientUser.email });
  console.log("Password comune per il login demo: password123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
