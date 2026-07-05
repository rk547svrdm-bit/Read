# Nursing Marketplace — API

Backend Express + TypeScript + Prisma (SQLite di default).

## Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init   # crea/aggiorna dev.db
npm run seed                          # popola dati demo
npm run dev                           # avvia su http://localhost:4000
```

Utenti demo creati dal seed (password comune: `password123`):
- `paolo.gulli@example.com` (infermiere, Torino)
- `giulia.bianchi@example.com` (infermiere, Milano)
- `famiglia.rossi@example.com` (cliente)

## Test

```bash
npm test
```

## Panoramica endpoint

| Metodo | Path | Auth | Descrizione |
|---|---|---|---|
| POST | `/auth/register` | – | Registrazione (crea anche il profilo base) |
| POST | `/auth/login` | – | Login, restituisce JWT |
| GET | `/nurses` | – | Directory pubblica infermieri (filtri: city, careSetting, shiftType, acceptsHolidays, maxHourlyRate, q) |
| GET | `/nurses/:id` | – | Profilo pubblico infermiere |
| GET/PUT | `/nurses/me` | NURSE | Bio/CV e requisiti del proprio profilo |
| GET/PUT | `/clients/me` | CLIENT | Profilo cliente |
| GET | `/listings` | – | Inserzioni pubblicate (filtri: city, careSetting, shiftType) |
| GET | `/listings/me` | NURSE | Le proprie inserzioni |
| POST | `/listings` | NURSE | Crea inserzione in bozza |
| POST | `/listings/:id/publish` | NURSE | Pubblica e apre l'asta |
| GET | `/auctions` | – | Aste attualmente aperte |
| GET | `/auctions/:id` | – | Dettaglio asta con offerte |
| POST | `/auctions/:id/bids` | CLIENT | Fai un'offerta |
| GET | `/auctions/:id/bids` | – | Storico offerte |
| GET | `/bookings/me` | auth | Le proprie prenotazioni (aste vinte) |
| POST | `/bookings/:id/reviews` | auth | Lascia una recensione a prestazione completata |
| GET | `/reviews/users/:userId` | – | Recensioni ricevute da un utente |

La chiusura delle aste scadute avviene automaticamente in background
(vedi `src/index.ts`); per testarla manualmente in sviluppo è disponibile
anche `POST /auctions/:id/close` (richiede ruolo ADMIN).
