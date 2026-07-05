# Bay Nurse — "l'eBay degli infermieri"

Piattaforma marketplace social-style dove i professionisti sanitari
(infermieri liberi professionisti) sono in vetrina con un profilo simile a
un mix tra LinkedIn e Instagram (foto, bio, competenze), e i clienti fanno
**offerte** in un'asta al rialzo per aggiudicarsi la loro prestazione.

Questo repository è uno **scaffold funzionante** pensato per essere ripreso
e sviluppato ulteriormente (es. da Codex): il dominio, le API e la logica
d'asta sono implementati e testati; la UI è un client che copre i flussi
principali con una grafica curata.

## Idea centrale

- Ogni infermiere ha un **profilo pubblico** (foto, bio, competenze,
  esperienze, anni di attività, certificazioni) — il suo "CV" in vetrina.
- Ogni infermiere definisce delle **preferenze generali** mostrate sul
  profilo (turni, ambienti di lavoro, disponibilità a festivi/weekend).
- **L'asta riguarda sempre ed esclusivamente il professionista**, mai una
  specifica data o turno: il professionista decide se aprirla
  - **oraria**, a partire dalla propria tariffa/ora minima, oppure
  - **a prestazione**, su una voce del proprio catalogo servizi (es.
    Iniezione, Prelievo, ECG, Intramuscolo, ma anche prestazioni
    personalizzate come Impianto PICC o assistenza a un intervento
    chirurgico), ciascuna con la propria paga minima decisa a sua
    discrezione.
- I clienti interessati fanno offerte al rialzo entro una finestra
  temporale; vince l'offerta più alta allo scadere dell'asta, generando
  una **prenotazione confermata** (booking) tra cliente e infermiere.
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
| `NurseProfile` | Foto, bio/CV, competenze, preferenze generali, tariffa oraria minima |
| `ClientProfile`| Anagrafica cliente (privato o struttura) |
| `NurseService` | Prestazione offerta dal professionista (nome + paga minima, a sua discrezione) |
| `Auction`      | Asta al rialzo sul professionista: oraria oppure su una `NurseService` |
| `Bid`          | Offerta di un cliente su un'asta |
| `Booking`      | Prenotazione confermata al termine dell'asta (aggiudicazione) |
| `Review`       | Recensione reciproca dopo una prestazione completata |

## Roadmap suggerita per il proseguimento (Codex)

- [ ] Upload reale della foto profilo (oggi è un campo URL) su storage (S3/Cloudinary)
- [ ] Autenticazione via provider esterno (Google/SPID) invece della sola password
- [ ] Pagamenti e deposito cauzionale all'aggiudicazione (Stripe Connect)
- [ ] Notifiche realtime (WebSocket/SSE) per rilanci d'asta e scadenze
- [ ] Sostituire lo scheduler in-process (`setInterval`) con un job queue reale
      (BullMQ/cron) per la chiusura delle aste
- [ ] Verifica identità/albo professionale (upload documenti, stato "verificato")
- [ ] Ricerca geografica reale (raggio in km da coordinate, non solo città)
- [ ] Sistema di messaggistica tra cliente e infermiere per concordare data/luogo dopo l'aggiudicazione
- [ ] Passaggio da SQLite a PostgreSQL in produzione (basta cambiare
      `provider` e `DATABASE_URL` in `prisma/schema.prisma`, lo schema è già
      compatibile)
