# VERA – Istruzioni per ChatGPT Codex (orchestratore alternativo)

Questo documento descrive come ChatGPT Codex può sostituire o affiancare lo script Python
`orchestrator.py` come orchestratore della pipeline VERA, eseguendo manualmente ogni fase
e salvando i risultati in `fakenews/data/oggi.json`.

---

## Compito giornaliero

Ogni giorno alle **08:00 CEST**, Codex deve eseguire le sei fasi seguenti in ordine.
Alla fine di ogni fase, aggiorna `fakenews/data/oggi.json` con i dati prodotti e
il nuovo stato della pipeline. Al termine, fai commit del file con:

```
git add fakenews/data/
git commit -m "VERA: smentita del $(date +%Y-%m-%d)"
git push
```

---

## Struttura del file `oggi.json`

```json
{
  "data": "YYYY-MM-DD",
  "stato": "in_corso | pubblicato | errore",
  "aggiornato_alle": "HH:MM",
  "pipeline": {
    "scout":         { "stato": "in_attesa | in_corso | completato | errore", "alle": "HH:MM o null" },
    "investigatore": { "stato": "...", "alle": "..." },
    "ricercatore":   { "stato": "...", "alle": "..." },
    "fact_checker":  { "stato": "...", "alle": "..." },
    "redattore":     { "stato": "...", "alle": "..." },
    "supervisore":   { "stato": "...", "alle": "..." }
  },
  "fake_news": { ... },
  "indagine":  { ... },
  "dossier":   { ... },
  "verdetto":  { ... },
  "articolo":  { ... }
}
```

---

## Fase 1 – Scout (Gemini via API o browser)

**Obiettivo:** Identificare la fake news italiana più diffusa della giornata.

**Prompt da inviare a Gemini:**

> Sei lo Scout di VERA. Oggi è [DATA]. Identifica la notizia falsa o fuorviante più diffusa
> in Italia in questo momento (WhatsApp, Facebook, TikTok, media). Preferisci affermazioni
> di tipo salute/alimentazione perché sono le più pericolose.
> Rispondi solo con JSON valido.

**Schema JSON atteso — campo `fake_news`:**

```json
{
  "claim": "testo dell'affermazione così come circola",
  "categoria": "salute | politica | scienza | economia | cronaca | altro",
  "diffusione": "bassa | media | alta | virale",
  "canali_principali": ["WhatsApp", "Facebook", "TikTok"],
  "stima_condivisioni": "descrizione testuale",
  "perche_pericolosa": "spiegazione del rischio in 1-2 frasi",
  "scoperta_alle": "HH:MM",
  "agente": "Scout (Gemini)"
}
```

---

## Fase 2 – Investigatore (Gemini via API o browser)

**Obiettivo:** Ricostruire origine e meccanismo di diffusione della fake news.

**Prompt da inviare a Gemini:**

> Sei l'Investigatore di VERA. La fake news è: «[CLAIM]».
> Ricostruisci in modo plausibile l'origine e la diffusione nel contesto italiano.
> Rispondi solo con JSON valido.

**Schema JSON atteso — campo `indagine`:**

```json
{
  "probabile_origine": "descrizione dell'origine più probabile",
  "prima_apparizione": "dove è comparsa per la prima volta",
  "meccanismo_diffusione": "come si sta propagando",
  "amplificatori": ["tipo di account o pagina 1", "tipo 2"],
  "plausibilita_superficiale": "perché sembra credibile a prima vista",
  "completata_alle": "HH:MM"
}
```

---

## Fase 3 – Ricercatore (Gemini via API o browser)

**Obiettivo:** Raccogliere prove scientifiche per e contro la claim.

**Prompt da inviare a Gemini:**

> Sei il Ricercatore di VERA. L'affermazione da verificare è: «[CLAIM]».
> Raccogli prove scientifiche, studi e linee guida autorevoli (OMS, ISS, ecc.).
> Distingui tra prove contrarie e prove a favore.
> Rispondi solo con JSON valido.

**Schema JSON atteso — campo `dossier`:**

```json
{
  "prove_contrarie": [
    "prova 1 con riferimento alla fonte",
    "prova 2 con riferimento alla fonte"
  ],
  "prove_a_favore": [
    "eventuale elemento di verità parziale"
  ],
  "fonti_tipologia": [
    "studi clinici su riviste peer-reviewed",
    "linee guida dell'Istituto Superiore di Sanità"
  ],
  "elemento_di_verita": "il nucleo di verità, se esiste",
  "grado_di_falsita_stimato": "85",
  "completato_alle": "HH:MM"
}
```

---

## Fase 4 – Fact-checker (Claude via API o browser)

**Obiettivo:** Analizzare le prove e assegnare un verdetto motivato.

**Prompt da inviare a Claude:**

> Sei il Fact-checker di VERA. L'affermazione è: «[CLAIM]».
> Prove contrarie: [LISTA]. Prove a favore: [LISTA].
> Emetti un verdetto tra: falso, fuorviante, impreciso, vero_ma_decontestualizzato, vero.
> Rispondi solo con JSON valido.

**Schema JSON atteso — campo `verdetto`:**

```json
{
  "verdetto": "falso | fuorviante | impreciso | vero_ma_decontestualizzato | vero",
  "confidenza_percentuale": 85,
  "motivazione_principale": "spiegazione del verdetto",
  "punti_chiave": [
    "punto 1",
    "punto 2",
    "punto 3",
    "punto 4"
  ],
  "cosa_e_vero": "elemento di verità contenuto nell'affermazione",
  "cosa_e_falso": "parte non vera o fuorviante",
  "emesso_alle": "HH:MM",
  "agente": "Fact-checker (Claude Opus)"
}
```

---

## Fase 5 – Redattore (ChatGPT / Codex stesso)

**Obiettivo:** Scrivere l'articolo di smentita in italiano leggibile (~400 parole).

Codex può svolgere questa fase direttamente, senza chiamare un'API esterna.

**Schema JSON atteso — campo `articolo`:**

```json
{
  "titolo": "titolo chiaro e diretto (max 80 caratteri)",
  "sommario": "sottotitolo o occhiello (max 160 caratteri)",
  "testo_completo": "testo completo dell'articolo (~400 parole, paragrafi separati da doppio a-capo)",
  "tag": ["tag1", "tag2", "tag3"],
  "scritto_alle": "HH:MM",
  "agente": "Redattore (ChatGPT)",
  "approvato": false
}
```

**Linee guida per la stesura:**
- Tono: informativo, diretto, privo di allarmismi, mai condiscendente
- Non amplificare la bufala: citala quanto basta per renderla riconoscibile
- Cita sempre la tipologia di fonte (non inventare URL)
- Struttura: introduzione → problema → cosa dice la scienza → conclusione pratica

---

## Fase 6 – Supervisore (Claude via API o browser)

**Obiettivo:** Revisionare l'articolo, migliorarlo se necessario e approvarlo.

**Prompt da inviare a Claude:**

> Sei il Supervisore editoriale di VERA. Revisiona questo articolo di smentita
> e valutalo su una scala 0-10. Se il punteggio è almeno 7/10, approvalo.
> Correggi tono, chiarezza e struttura se necessario.
> Rispondi solo con JSON valido.

**Schema JSON atteso (aggiorna il campo `articolo` con la versione finale):**

```json
{
  "approvato": true,
  "punteggio_qualita": 8.5,
  "articolo_finale": {
    "titolo": "titolo corretto o invariato",
    "sommario": "sommario corretto o invariato",
    "testo_completo": "testo finale approvato"
  },
  "note_revisione": "note su cosa è stato corretto"
}
```

Dopo l'approvazione, imposta `stato: "pubblicato"` nel file `oggi.json` e aggiorna
il campo `articolo` con i valori di `articolo_finale`.

---

## Aggiornamento dell'archivio

Dopo la pubblicazione, aggiungi la voce di oggi in cima all'array `smentite`
nel file `fakenews/data/archivio.json`:

```json
{
  "data": "YYYY-MM-DD",
  "claim": "...",
  "categoria": "...",
  "verdetto": "...",
  "titolo": "...",
  "sommario": "...",
  "confidenza": 85
}
```

Mantieni un massimo di 60 voci nell'archivio (rimuovi le più vecchie se necessario).

---

## Commit finale

```bash
git add fakenews/data/oggi.json fakenews/data/archivio.json
git commit -m "VERA: smentita del $(date +%Y-%m-%d)"
git push
```
