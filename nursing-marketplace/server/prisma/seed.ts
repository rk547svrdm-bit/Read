import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.nurseService.deleteMany();
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
          headline: "Infermiere libero professionista · assistenza domiciliare",
          bio: "Oltre 10 anni di esperienza in assistenza infermieristica a domicilio, medicazioni complesse e prelievi. Copertura assicurativa RC professionale.",
          photoUrl: "https://i.pravatar.cc/400?img=12",
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
          services: {
            create: [
              { name: "Iniezione", minPrice: 15 },
              { name: "Prelievo ematico", minPrice: 20 },
              { name: "Elettrocardiogramma (ECG)", minPrice: 25 },
              { name: "Medicazione avanzata", minPrice: 30 },
              { name: "Impianto PICC", description: "Su appuntamento, valutazione preliminare richiesta", minPrice: 90 },
            ],
          },
        },
      },
    },
    include: { nurseProfile: { include: { services: true } } },
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
          photoUrl: "https://i.pravatar.cc/400?img=47",
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
          services: {
            create: [
              { name: "Assistenza a intervento chirurgico", minPrice: 120 },
              { name: "Intramuscolo", minPrice: 15 },
            ],
          },
        },
      },
    },
    include: { nurseProfile: { include: { services: true } } },
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

  const nurse1 = nurse1User.nurseProfile!;
  const medicazioneService = nurse1.services.find((s) => s.name === "Medicazione avanzata")!;

  const now = new Date();

  // Asta oraria aperta su Paolo, con un'offerta già ricevuta.
  const hourlyAuction = await prisma.auction.create({
    data: {
      nurseId: nurse1.id,
      type: "HOURLY",
      startAt: now,
      endAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      minIncrement: 1,
      startingPrice: nurse1.minHourlyRate,
      currentPrice: 27,
      status: "OPEN",
    },
  });
  const hourlyBid = await prisma.bid.create({
    data: { auctionId: hourlyAuction.id, clientId: clientUser.id, amount: 27, status: "WINNING" },
  });
  await prisma.auction.update({ where: { id: hourlyAuction.id }, data: { currentHighestBidId: hourlyBid.id } });

  // Asta a prestazione aperta su Paolo (medicazione avanzata), senza ancora offerte.
  await prisma.auction.create({
    data: {
      nurseId: nurse1.id,
      type: "SERVICE",
      serviceId: medicazioneService.id,
      startAt: now,
      endAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      minIncrement: 2,
      startingPrice: medicazioneService.minPrice,
      currentPrice: medicazioneService.minPrice,
      status: "OPEN",
    },
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
