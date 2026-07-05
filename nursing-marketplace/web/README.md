# Bay Nurse — Web

Client React + TypeScript (Vite) per l'API del marketplace.

## Setup

```bash
npm install
cp .env.example .env   # imposta VITE_API_URL se il backend non gira su localhost:4000
npm run dev            # http://localhost:5173
```

Assicurati che il backend (`../server`) sia avviato e con i dati demo caricati.

## Pagine principali

- `/` — directory pubblica degli infermieri (filtro per città)
- `/listings` — aste attualmente aperte
- `/nurses/:id` — profilo pubblico infermiere (bio, competenze, requisiti richiesti)
- `/listings/:id` — dettaglio asta, storico offerte, form per fare un'offerta (cliente)
- `/dashboard/nurse` — modifica bio/CV e requisiti, pubblica nuove disponibilità
- `/dashboard/client` — prenotazioni (aste vinte)
