# VERA — Setup Mac (abbonamenti, zero API key)

Questa guida configura la pipeline VERA sul tuo Mac usando i CLI di Gemini e Claude
con i tuoi abbonamenti esistenti. Codex funge da orchestratore e scheduler.

---

## 1. Installa Node.js (se non ce l'hai)

```bash
brew install node
```

---

## 2. Installa il CLI di Gemini

```bash
npm install -g @google/gemini-cli
gemini auth
# Si apre il browser: accedi con il tuo account Google
gemini "ciao"   # test rapido
```

Quota gratuita: 1.500 richieste/giorno con Gemini 2.0 Flash — più che sufficiente.

---

## 3. Installa il CLI di Claude Code (io)

```bash
npm install -g @anthropic-ai/claude-code
claude
# Accedi con il tuo account claude.ai — incluso nel tuo abbonamento
claude -p "ciao"   # test non-interattivo
```

---

## 4. Codex (ChatGPT) — già installato sul tuo Mac

Codex è l'orchestratore: avvia la pipeline, coordina gli altri due agenti,
scrive il passo "Redattore" da solo, e fa il commit finale su GitHub.

---

## 5. Clona il repo (se non lo hai già)

```bash
git clone https://github.com/rk547svrdm-bit/Read.git
cd Read
git checkout claude/ai-agents-fake-news-debunk-94p6kq   # o main dopo il merge
```

---

## 6. Configura il crontab sul Mac (schedulazione automatica)

```bash
crontab -e
```

Aggiungi questa riga (avvia la pipeline alle 08:00 ogni giorno):

```
0 8 * * * cd /Users/TUO_NOME/Read && python3 fakenews/pipeline/orchestrator_mac.py >> /tmp/vera.log 2>&1
```

Sostituisci `/Users/TUO_NOME/Read` con il percorso reale del repo.

---

## 7. In alternativa: lascia che sia Codex a schedulare

Dai a Codex questo task programmato:

> Ogni giorno alle 08:00 esegui:
> `cd /Users/TUO_NOME/Read && python3 fakenews/pipeline/orchestrator_mac.py`
> Se l'esecuzione fallisce, riprova una volta dopo 15 minuti.

---

## 8. Come funziona la pipeline Mac

```
08:00  Avvio (cron o Codex)
         ↓
       Scout        →  gemini -p "trova la fake news del giorno..."
         ↓
       Investigatore →  gemini -p "analizza l'origine di..."
         ↓
       Ricercatore   →  gemini -p "raccogli le prove per..."
         ↓
       Fact-checker  →  claude -p "analizza e dai un verdetto..."
         ↓
       Redattore     →  claude -p "scrivi l'articolo di smentita..."
         ↓
       Supervisore   →  claude -p "revisiona e approva..."
         ↓
       Publisher     →  git commit + git push
         ↓
~19:00  VERA si aggiorna automaticamente
```

---

## 9. Ripristino automatico

Se la pipeline si interrompe (es. connessione assente), riavviala semplicemente:

```bash
python3 fakenews/pipeline/orchestrator_mac.py
```

Ogni fase controlla se è già stata completata e riparte dal punto in cui si era fermata.

---

## 10. Log in tempo reale

```bash
tail -f /tmp/vera.log
```

---

## Ripartizione dei ruoli (abbonamenti)

| CLI       | Fasi                              | Abbonamento usato      |
|-----------|-----------------------------------|------------------------|
| `gemini`  | Scout, Investigatore, Ricercatore | Account Google (gratis)|
| `claude`  | Fact-checker, Redattore, Supervisore | claude.ai (tuo piano)|
| Codex     | Orchestrazione + scheduling       | ChatGPT (tuo piano)   |
