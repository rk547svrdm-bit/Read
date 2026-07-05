# Nursing Marketplace — "eBay per infermieri"

Piattaforma marketplace dove i professionisti sanitari (infermieri liberi
professionisti) pubblicano la propria disponibilità come **inserzioni**
(listing), i clienti (privati o strutture) fanno **offerte** in un'asta al
rialzo per aggiudicarsi la prestazione, a partire da un prezzo minimo
stabilito dal professionista.

Questo repository è uno **scaffold funzionante** pensato per essere ripreso
e sviluppato ulteriormente (es. da Codex): il dominio, le API e la logica
d'asta sono implementati e testati; la UI è un client minimale che copre i
flussi principali.

## Idea centrale

- Ogni infermiere ha un **profilo pubblico** (bio, competenze, esperienze,
  anni di attività, certificazioni) — il suo "CV" in vetrina, come una
  scheda prodotto su eBay.
- Ogni infermiere definisce le **condizioni che accetta** per prendere in
  considerazione un incarico: turni (mattina/pomeriggio/notte/tutti),
  ambienti di lavoro (domicilio, ambulatorio, sala operatoria, reparto,
  RSA, telemedicina), disponibilità a festivi e weekend, e soprattutto la
  **paga oraria minima**.
- L'infermiere pubblica **inserzioni** (listing) per specifiche
  disponibilità (es. "Sabato mattina, medicazione a domicilio, zona
  Torino") con un prezzo di partenza (di default la propria paga minima).
- Ogni inserzione pubblicata genera automaticamente un'**asta**: i clienti
  interessati fanno offerte al rialzo entro una finestra temporale; vince
  l'offerta più alta allo scadere dell'asta, generando una **prenotazione
  confermata** (booking) tra cliente e infermiere.
- A prenotazione completata, cliente e infermiere possono lasciarsi una
  **recensione**.

## Struttura del repository

```
nursing-marketplace/
├── server/   API REST (Express + TypeScript + Prisma, SQLite di default)
└── web/      Client React + TypeScript (Vite) che consuma le API
```

Vedi il README in ciascuna cartella per dettagli su setup e sviluppo.

## Modello di dominio (riassunto)

| Entità         | Descrizione |
|----------------|-------------|
| `User`         | Account con ruolo `NURSE` / `CLIENT` / `ADMIN` |
| `NurseProfile` | Bio/CV, competenze, requisiti accettati, paga oraria minima |
| `ClientProfile`| Anagrafica cliente (privato o struttura) |
| `Listing`      | Disponibilità pubblicata dall'infermiere, con condizioni e prezzo di partenza |
| `Auction`      | Asta al rialzo generata dalla pubblicazione di un listing |
| `Bid`          | Offerta di un cliente su un'asta |
| `Booking`      | Prenotazione confermata al termine dell'asta (aggiudicazione) |
| `Review`       | Recensione reciproca dopo una prestazione completata |

## Roadmap suggerita per il proseguimento (Codex)

- [ ] Autenticazione via provider esterno (Google/SPID) invece della sola password
- [ ] Pagamenti e deposito cauzionale all'aggiudicazione (Stripe Connect)
- [ ] Notifiche realtime (WebSocket/SSE) per rilanci d'asta e scadenze
- [ ] Sostituire lo scheduler in-process (`setInterval`) con un job queue reale
      (BullMQ/cron) per la chiusura delle aste
- [ ] Verifica identità/albo professionale (upload documenti, stato "verificato")
- [ ] Ricerca geografica reale (raggio in km da coordinate, non solo città)
- [ ] Sistema di messaggistica tra cliente e infermiere pre/post aggiudicazione
- [ ] Passaggio da SQLite a PostgreSQL in produzione (basta cambiare
      `provider` e `DATABASE_URL` in `prisma/schema.prisma`, lo schema è già
      compatibile)
