import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeExpiredAuctions } from "./modules/auctions/auction.service.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Nursing Marketplace API in ascolto sulla porta ${env.port}`);
});

// Scheduler minimale in-process per chiudere le aste scadute.
// Da sostituire con un job queue reale (es. BullMQ/cron) in produzione,
// specialmente su deployment multi-istanza.
setInterval(() => {
  closeExpiredAuctions().catch((err) => {
    console.error("Errore durante la chiusura delle aste scadute", err);
  });
}, env.auctionCloserIntervalSeconds * 1000);
