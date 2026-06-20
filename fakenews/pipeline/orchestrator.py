#!/usr/bin/env python3
"""
VERA – Orchestratore della pipeline multi-agente di fact-checking.

Ordine di esecuzione:
  1. Scout          → Gemini 1.5 Pro   — individua la fake news del giorno
  2. Investigatore  → Gemini 1.5 Pro   — ricostruisce origine e diffusione
  3. Ricercatore    → Gemini 1.5 Pro   — raccoglie prove scientifiche
  4. Fact-checker   → Claude Opus      — emette il verdetto motivato
  5. Redattore      → GPT-4o           — scrive l'articolo di smentita
  6. Supervisore    → Claude Opus      — revisiona, approva e pubblica

Questo script è progettato per essere eseguito ogni giorno alle 08:00 CEST
tramite GitHub Actions (cron: 0 6 * * *).
"""

import json
import os
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import anthropic
import google.generativeai as genai
from openai import OpenAI

# ---------------------------------------------------------------------------
# Percorsi
# ---------------------------------------------------------------------------
DATA_DIR = Path(__file__).parent.parent / "data"
OGGI_PATH = DATA_DIR / "oggi.json"
ARCHIVIO_PATH = DATA_DIR / "archivio.json"

# ---------------------------------------------------------------------------
# Fuso orario CEST (UTC+2)
# ---------------------------------------------------------------------------
CEST = timezone(timedelta(hours=2))


def ora_corrente() -> str:
    """Restituisce l'ora corrente in formato HH:MM (CEST)."""
    return datetime.now(CEST).strftime("%H:%M")


def data_corrente() -> str:
    """Restituisce la data corrente in formato ISO YYYY-MM-DD (CEST)."""
    return datetime.now(CEST).strftime("%Y-%m-%d")


# ---------------------------------------------------------------------------
# Gestione dello stato (oggi.json)
# ---------------------------------------------------------------------------

def load_state() -> dict:
    """Carica lo stato corrente da oggi.json; crea lo stato iniziale se mancante."""
    if OGGI_PATH.exists():
        with open(OGGI_PATH, "r", encoding="utf-8") as fh:
            state = json.load(fh)
        # Se il file è di un giorno precedente, reinizializza
        if state.get("data") != data_corrente():
            print(f"[VERA] Il file oggi.json è datato {state.get('data')}, "
                  f"oggi è {data_corrente()}. Reinizializzo lo stato.")
            state = _stato_iniziale()
            save_state(state)
        return state
    state = _stato_iniziale()
    save_state(state)
    return state


def _stato_iniziale() -> dict:
    """Restituisce lo stato iniziale per una nuova giornata."""
    return {
        "data": data_corrente(),
        "stato": "in_corso",
        "aggiornato_alle": ora_corrente(),
        "pipeline": {
            "scout": {"stato": "in_attesa", "alle": None},
            "investigatore": {"stato": "in_attesa", "alle": None},
            "ricercatore": {"stato": "in_attesa", "alle": None},
            "fact_checker": {"stato": "in_attesa", "alle": None},
            "redattore": {"stato": "in_attesa", "alle": None},
            "supervisore": {"stato": "in_attesa", "alle": None},
        },
        "fake_news": None,
        "indagine": None,
        "dossier": None,
        "verdetto": None,
        "articolo": None,
    }


def save_state(state: dict) -> None:
    """Salva lo stato corrente in oggi.json."""
    state["aggiornato_alle"] = ora_corrente()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OGGI_PATH, "w", encoding="utf-8") as fh:
        json.dump(state, fh, ensure_ascii=False, indent=2)
    print(f"[VERA] Stato salvato — {OGGI_PATH}")


def _segna_completato(state: dict, fase: str) -> None:
    """Marca una fase come completata con il timestamp attuale."""
    state["pipeline"][fase]["stato"] = "completato"
    state["pipeline"][fase]["alle"] = ora_corrente()


def _segna_in_corso(state: dict, fase: str) -> None:
    """Marca una fase come in corso con il timestamp attuale."""
    state["pipeline"][fase]["stato"] = "in_corso"
    state["pipeline"][fase]["alle"] = ora_corrente()


# ---------------------------------------------------------------------------
# Utilità: pulizia del JSON restituito dai modelli
# ---------------------------------------------------------------------------

def estrai_json(testo: str) -> dict:
    """
    Rimuove eventuali blocchi markdown (```json … ```) e analizza il JSON.
    Lancia un'eccezione se il testo non è JSON valido.
    """
    # Rimuove blocchi ```json ... ``` o ``` ... ```
    testo = re.sub(r"^```(?:json)?\s*", "", testo.strip(), flags=re.MULTILINE)
    testo = re.sub(r"\s*```$", "", testo.strip(), flags=re.MULTILINE)
    testo = testo.strip()
    return json.loads(testo)


# ---------------------------------------------------------------------------
# Inizializzazione dei client API
# ---------------------------------------------------------------------------

def _client_gemini():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("Variabile d'ambiente GEMINI_API_KEY non impostata.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-pro")


def _client_claude():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("Variabile d'ambiente ANTHROPIC_API_KEY non impostata.")
    return anthropic.Anthropic(api_key=api_key)


def _client_openai():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("Variabile d'ambiente OPENAI_API_KEY non impostata.")
    return OpenAI(api_key=api_key)


# ---------------------------------------------------------------------------
# FASE 1 – Scout (Gemini)
# ---------------------------------------------------------------------------

def run_scout(state: dict) -> None:
    """
    Individua la fake news italiana più diffusa e pericolosa della giornata.
    Utilizza Gemini 1.5 Pro.
    """
    if state["pipeline"]["scout"]["stato"] == "completato":
        print("[Scout] Fase già completata. Salto.")
        return

    print("[Scout] Avvio rilevamento della fake news del giorno…")
    _segna_in_corso(state, "scout")
    save_state(state)

    data_oggi = data_corrente()
    prompt = f"""Sei lo Scout di VERA, una redazione di agenti IA che smentisce fake news in italiano.

Oggi è {data_oggi}. Il tuo compito è identificare la notizia falsa, fuorviante o non verificata più
diffusa in Italia in questo momento, con particolare attenzione a:
- Catene WhatsApp e messaggistica privata
- Post virali su Facebook, TikTok, Instagram
- Notizie travisate da media minori o siti poco affidabili
- Teorie di salute, alimentazione, rimedi casalinghi non scientifici

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (nessun testo prima o dopo) con questa struttura:
{{
  "claim": "testo esatto dell'affermazione falsa così come circola",
  "categoria": "salute | politica | scienza | economia | cronaca | altro",
  "diffusione": "bassa | media | alta | virale",
  "canali_principali": ["lista", "dei", "canali"],
  "stima_condivisioni": "descrizione testuale es. decine di migliaia",
  "perche_pericolosa": "spiegazione del danno potenziale in 1-2 frasi"
}}

Scegli qualcosa di realmente plausibile per la data odierna, con preferenza per affermazioni
di tipo medico/salute poiché sono le più pericolose. L'affermazione deve sembrare credibile
a prima vista ma essere scientificamente non supportata o falsa."""

    modello = _client_gemini()
    risposta = modello.generate_content(prompt)
    testo = risposta.text

    print(f"[Scout] Risposta ricevuta da Gemini ({len(testo)} caratteri).")
    dati = estrai_json(testo)

    state["fake_news"] = {
        **dati,
        "scoperta_alle": ora_corrente(),
        "agente": "Scout (Gemini)",
    }
    _segna_completato(state, "scout")
    save_state(state)
    print(f"[Scout] Completato. Claim identificato: {dati.get('claim', '')[:80]}…")


# ---------------------------------------------------------------------------
# FASE 2 – Investigatore (Gemini)
# ---------------------------------------------------------------------------

def run_investigatore(state: dict) -> None:
    """
    Ricostruisce l'origine e il meccanismo di diffusione della fake news.
    Utilizza Gemini 1.5 Pro.
    """
    if state["pipeline"]["investigatore"]["stato"] == "completato":
        print("[Investigatore] Fase già completata. Salto.")
        return

    if not state.get("fake_news"):
        raise RuntimeError("Impossibile avviare l'Investigatore: nessuna fake news identificata dallo Scout.")

    claim = state["fake_news"]["claim"]
    print(f"[Investigatore] Avvio mappatura dell'origine per: {claim[:60]}…")
    _segna_in_corso(state, "investigatore")
    save_state(state)

    prompt = f"""Sei l'Investigatore delle fonti di VERA, una redazione di agenti IA.

La fake news che devi investigare è:
«{claim}»

Il tuo compito è ricostruire in modo plausibile come questa notizia si è probabilmente originata
e diffusa nel contesto italiano. Analizza:
1. Dove ha avuto origine (tipo di fonte: gruppo privato, sito dubbio, travisamento di studio, ecc.)
2. Come si è propagata (screenshot, catene di messaggi, condivisioni social, ecc.)
3. Chi la sta amplificando (pagine Facebook, account TikTok, influencer wellness, ecc.)
4. Perché appare credibile a prima vista (elemento di verità parziale, linguaggio pseudo-scientifico, ecc.)

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (nessun testo prima o dopo) con questa struttura:
{{
  "probabile_origine": "descrizione dell'origine più probabile",
  "prima_apparizione": "dove è comparsa per la prima volta (es. canale specifico)",
  "meccanismo_diffusione": "come si sta propagando",
  "amplificatori": ["lista", "di", "tipologie", "di", "amplificatori"],
  "plausibilita_superficiale": "perché sembra credibile a prima vista"
}}"""

    modello = _client_gemini()
    risposta = modello.generate_content(prompt)
    testo = risposta.text

    print(f"[Investigatore] Risposta ricevuta da Gemini ({len(testo)} caratteri).")
    dati = estrai_json(testo)

    state["indagine"] = {
        **dati,
        "completata_alle": ora_corrente(),
    }
    _segna_completato(state, "investigatore")
    save_state(state)
    print("[Investigatore] Completato. Mappa della diffusione costruita.")


# ---------------------------------------------------------------------------
# FASE 3 – Ricercatore (Gemini)
# ---------------------------------------------------------------------------

def run_ricercatore(state: dict) -> None:
    """
    Raccoglie prove scientifiche per o contro la claim.
    Utilizza Gemini 1.5 Pro.
    """
    if state["pipeline"]["ricercatore"]["stato"] == "completato":
        print("[Ricercatore] Fase già completata. Salto.")
        return

    if not state.get("fake_news"):
        raise RuntimeError("Impossibile avviare il Ricercatore: nessuna fake news identificata.")

    claim = state["fake_news"]["claim"]
    print(f"[Ricercatore] Avvio raccolta prove per: {claim[:60]}…")
    _segna_in_corso(state, "ricercatore")
    save_state(state)

    prompt = f"""Sei il Ricercatore di VERA, una redazione di agenti IA specializzata nel fact-checking italiano.

L'affermazione da verificare è:
«{claim}»

Il tuo compito è raccogliere le prove scientifiche e le evidenze disponibili sull'argomento.
Cita studi, ricerche, linee guida di enti autorevoli (OMS, ISS, AIRC, ecc.) e opinioni di esperti del settore.
Distingui chiaramente tra prove contrarie (che smentiscono la claim) e prove a favore (elementi di verità parziale).

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (nessun testo prima o dopo) con questa struttura:
{{
  "prove_contrarie": [
    "descrizione della prova 1 con riferimento alla fonte",
    "descrizione della prova 2 con riferimento alla fonte",
    "descrizione della prova 3 con riferimento alla fonte"
  ],
  "prove_a_favore": [
    "eventuale elemento di verità parziale 1",
    "eventuale elemento di verità parziale 2"
  ],
  "fonti_tipologia": [
    "tipologia di fonte 1 (es. studi clinici pubblicati su PubMed)",
    "tipologia di fonte 2 (es. linee guida dell'ISS)",
    "tipologia di fonte 3 (es. dichiarazioni di nutrizionisti certificati)"
  ],
  "elemento_di_verita": "l'eventuale nucleo di verità contenuto nell'affermazione, se esiste",
  "grado_di_falsita_stimato": "percentuale numerica da 0 a 100 come stringa, es. 85"
}}"""

    modello = _client_gemini()
    risposta = modello.generate_content(prompt)
    testo = risposta.text

    print(f"[Ricercatore] Risposta ricevuta da Gemini ({len(testo)} caratteri).")
    dati = estrai_json(testo)

    state["dossier"] = {
        **dati,
        "completato_alle": ora_corrente(),
    }
    _segna_completato(state, "ricercatore")
    save_state(state)
    print("[Ricercatore] Completato. Dossier prove assemblato.")


# ---------------------------------------------------------------------------
# FASE 4 – Fact-checker (Claude Opus)
# ---------------------------------------------------------------------------

def run_fact_checker(state: dict) -> None:
    """
    Analizza le prove e assegna un verdetto motivato.
    Utilizza Claude claude-opus-4-8.
    """
    if state["pipeline"]["fact_checker"]["stato"] == "completato":
        print("[Fact-checker] Fase già completata. Salto.")
        return

    if not state.get("dossier"):
        raise RuntimeError("Impossibile avviare il Fact-checker: dossier prove mancante.")

    claim = state["fake_news"]["claim"]
    dossier = state["dossier"]
    indagine = state.get("indagine", {})

    print(f"[Fact-checker] Avvio verifica incrociata per: {claim[:60]}…")
    _segna_in_corso(state, "fact_checker")
    save_state(state)

    prompt = f"""Sei il Fact-checker incrociato di VERA, una redazione di agenti IA che smentisce fake news in italiano.

Devi analizzare le prove raccolte dal Ricercatore e dal team di indagine per emettere un verdetto
chiaro, motivato e verificabile sull'affermazione seguente.

AFFERMAZIONE:
«{claim}»

DOSSIER PROVE:
Prove contrarie: {json.dumps(dossier.get('prove_contrarie', []), ensure_ascii=False)}
Prove a favore: {json.dumps(dossier.get('prove_a_favore', []), ensure_ascii=False)}
Tipologie di fonti: {json.dumps(dossier.get('fonti_tipologia', []), ensure_ascii=False)}
Elemento di verità: {dossier.get('elemento_di_verita', 'nessuno')}
Grado di falsità stimato: {dossier.get('grado_di_falsita_stimato', 'N/D')}%

CONTESTO DI DIFFUSIONE:
Origine probabile: {indagine.get('probabile_origine', 'sconosciuta')}
Plausibilità superficiale: {indagine.get('plausibilita_superficiale', 'sconosciuta')}

Emetti un verdetto ragionato. Le categorie di verdetto disponibili sono:
- "falso": l'affermazione è dimostrata come non vera dalle prove disponibili
- "fuorviante": contiene elementi veri ma porta a conclusioni errate o esagerate
- "impreciso": è parzialmente vero ma manca di contesto essenziale
- "vero_ma_decontestualizzato": è tecnicamente vero ma usato in modo ingannevolmente fuori contesto
- "vero": è corretto e supportato dalle prove (raro in questo contesto)

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (nessun testo prima o dopo) con questa struttura:
{{
  "verdetto": "una delle categorie sopra indicate",
  "confidenza_percentuale": 85,
  "motivazione_principale": "spiegazione chiara e diretta del perché l'affermazione è categorizzata così",
  "punti_chiave": [
    "punto chiave 1: la prova o l'argomento più forte",
    "punto chiave 2: ulteriore elemento rilevante",
    "punto chiave 3: contesto o rischio specifico",
    "punto chiave 4: cosa il lettore dovrebbe sapere"
  ],
  "cosa_e_vero": "l'elemento di realtà eventualmente contenuto nell'affermazione",
  "cosa_e_falso": "la parte specificamente non vera o fuorviante"
}}"""

    cliente = _client_claude()
    messaggio = cliente.messages.create(
        model="claude-opus-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )
    testo = messaggio.content[0].text

    print(f"[Fact-checker] Risposta ricevuta da Claude ({len(testo)} caratteri).")
    dati = estrai_json(testo)

    state["verdetto"] = {
        **dati,
        "emesso_alle": ora_corrente(),
        "agente": "Fact-checker (Claude Opus)",
    }
    _segna_completato(state, "fact_checker")
    save_state(state)
    print(f"[Fact-checker] Completato. Verdetto: {dati.get('verdetto', 'N/D')} "
          f"(confidenza: {dati.get('confidenza_percentuale', 'N/D')}%)")


# ---------------------------------------------------------------------------
# FASE 5 – Redattore (GPT-4o)
# ---------------------------------------------------------------------------

def run_redattore(state: dict) -> None:
    """
    Scrive l'articolo di smentita in italiano leggibile.
    Utilizza GPT-4o.
    """
    if state["pipeline"]["redattore"]["stato"] == "completato":
        print("[Redattore] Fase già completata. Salto.")
        return

    if not state.get("verdetto"):
        raise RuntimeError("Impossibile avviare il Redattore: verdetto mancante.")

    claim = state["fake_news"]["claim"]
    verdetto = state["verdetto"]
    dossier = state["dossier"]

    print(f"[Redattore] Avvio stesura dell'articolo per: {claim[:60]}…")
    _segna_in_corso(state, "redattore")
    save_state(state)

    verdetto_label_map = {
        "falso": "Falso",
        "fuorviante": "Fuorviante",
        "impreciso": "Impreciso",
        "vero_ma_decontestualizzato": "Vero ma decontestualizzato",
        "vero": "Vero",
    }
    verdetto_label = verdetto_label_map.get(verdetto.get("verdetto", ""), verdetto.get("verdetto", ""))

    prompt = f"""Sei il Redattore di VERA, una redazione di agenti IA specializzata nel fact-checking italiano.

Devi scrivere un articolo di smentita chiaro, equilibrato e leggibile da tutti,
basandoti sulle informazioni raccolte dal team di ricerca e sul verdetto del Fact-checker.

AFFERMAZIONE DA SMENTIRE:
«{claim}»

VERDETTO: {verdetto_label} (confidenza: {verdetto.get('confidenza_percentuale', 'N/D')}%)
MOTIVAZIONE PRINCIPALE: {verdetto.get('motivazione_principale', '')}

PUNTI CHIAVE:
{chr(10).join(f"- {p}" for p in verdetto.get('punti_chiave', []))}

COSA È VERO: {verdetto.get('cosa_e_vero', 'nulla')}
COSA È FALSO: {verdetto.get('cosa_e_falso', '')}

PROVE CONTRARIE DISPONIBILI:
{chr(10).join(f"- {p}" for p in dossier.get('prove_contrarie', []))}

Linee guida per la scrittura:
- Tono: informativo, diretto, privo di allarmismi, mai condiscendente
- Pubblico: lettori non esperti, età 25-60
- Non amplificare la bufala: citala quanto basta per renderla riconoscibile
- Cita sempre il tipo di fonte (non inventa URL, ma indica la tipologia: es. "studi pubblicati su riviste di nutrizione clinica")
- Lunghezza articolo: circa 400 parole
- Struttura: paragrafo introduttivo → spiegazione del problema → cosa dice la scienza → conclusione pratica

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (nessun testo prima o dopo) con questa struttura:
{{
  "titolo": "titolo chiaro e diretto dell'articolo (max 80 caratteri)",
  "sommario": "sottotitolo o occhiello (max 160 caratteri)",
  "testo_completo": "testo dell'articolo completo di circa 400 parole in italiano, con paragrafi separati da doppio a-capo",
  "tag": ["tag1", "tag2", "tag3", "tag4"]
}}"""

    cliente = _client_openai()
    risposta = cliente.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000,
    )
    testo = risposta.choices[0].message.content

    print(f"[Redattore] Risposta ricevuta da GPT-4o ({len(testo)} caratteri).")
    dati = estrai_json(testo)

    state["articolo"] = {
        **dati,
        "scritto_alle": ora_corrente(),
        "agente": "Redattore (GPT-4o)",
        "approvato": False,
    }
    _segna_completato(state, "redattore")
    save_state(state)
    print(f"[Redattore] Completato. Titolo: {dati.get('titolo', '')[:60]}…")


# ---------------------------------------------------------------------------
# FASE 6 – Supervisore (Claude Opus)
# ---------------------------------------------------------------------------

def run_supervisore(state: dict) -> None:
    """
    Revisiona l'articolo, lo approva e segna la pipeline come pubblicata.
    Utilizza Claude claude-opus-4-8.
    """
    if state["pipeline"]["supervisore"]["stato"] == "completato":
        print("[Supervisore] Fase già completata. Salto.")
        return

    if not state.get("articolo"):
        raise RuntimeError("Impossibile avviare il Supervisore: bozza dell'articolo mancante.")

    articolo = state["articolo"]
    verdetto = state["verdetto"]
    claim = state["fake_news"]["claim"]

    print("[Supervisore] Avvio revisione editoriale dell'articolo…")
    _segna_in_corso(state, "supervisore")
    save_state(state)

    prompt = f"""Sei il Supervisore editoriale di VERA, una redazione di agenti IA.

Il tuo compito è revisionare l'articolo di smentita scritto dal Redattore, verificarne
la qualità, l'equilibrio, la correttezza e approvarlo (o richiedere correzioni).

AFFERMAZIONE SMENTITA: «{claim}»
VERDETTO: {verdetto.get('verdetto', 'N/D')} ({verdetto.get('confidenza_percentuale', 'N/D')}% confidenza)

ARTICOLO DA REVISIONARE:
Titolo: {articolo.get('titolo', '')}
Sommario: {articolo.get('sommario', '')}

Testo:
{articolo.get('testo_completo', '')}

Criteri di valutazione (punteggio da 0 a 10):
1. Chiarezza e leggibilità per un pubblico non esperto
2. Correttezza e coerenza con il verdetto del Fact-checker
3. Tono equilibrato (non allarmista, non condiscendente)
4. Struttura narrativa efficace
5. Citazione adeguata delle tipologie di fonti
6. Assenza di amplificazione involontaria della bufala
7. Accuratezza del titolo rispetto al contenuto

Se necessario, correggi il testo dell'articolo per migliorare qualità e tono.
Approvalo se il punteggio complessivo è almeno 7/10.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (nessun testo prima o dopo) con questa struttura:
{{
  "approvato": true,
  "punteggio_qualita": 8.5,
  "articolo_finale": {{
    "titolo": "titolo eventualmente corretto",
    "sommario": "sommario eventualmente corretto",
    "testo_completo": "testo eventualmente corretto o migliorato"
  }},
  "note_revisione": "brevi note su cosa è stato corretto o perché è stato approvato così com'è"
}}"""

    cliente = _client_claude()
    messaggio = cliente.messages.create(
        model="claude-opus-4-5",
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}],
    )
    testo = messaggio.content[0].text

    print(f"[Supervisore] Risposta ricevuta da Claude ({len(testo)} caratteri).")
    dati = estrai_json(testo)

    # Aggiorna l'articolo con la versione finale approvata
    articolo_finale = dati.get("articolo_finale", {})
    state["articolo"].update({
        "titolo": articolo_finale.get("titolo", state["articolo"].get("titolo")),
        "sommario": articolo_finale.get("sommario", state["articolo"].get("sommario")),
        "testo_completo": articolo_finale.get("testo_completo", state["articolo"].get("testo_completo")),
        "approvato": dati.get("approvato", False),
        "punteggio_qualita": dati.get("punteggio_qualita"),
        "note_revisione": dati.get("note_revisione"),
        "approvato_alle": ora_corrente(),
        "agente_revisione": "Supervisore (Claude Opus)",
    })

    state["stato"] = "pubblicato"
    _segna_completato(state, "supervisore")
    save_state(state)

    approvato = dati.get("approvato", False)
    punteggio = dati.get("punteggio_qualita", "N/D")
    print(f"[Supervisore] Completato. Approvato: {approvato}, "
          f"Punteggio qualità: {punteggio}/10")


# ---------------------------------------------------------------------------
# Aggiornamento archivio
# ---------------------------------------------------------------------------

def update_archive(state: dict) -> None:
    """
    Aggiunge la smentita di oggi all'archivio e mantiene un massimo di 60 voci.
    """
    if state.get("stato") != "pubblicato":
        print("[Archivio] Pipeline non ancora pubblicata. Salto aggiornamento archivio.")
        return

    articolo = state.get("articolo", {})
    verdetto = state.get("verdetto", {})
    fake_news = state.get("fake_news", {})

    nuova_voce = {
        "data": state.get("data"),
        "claim": fake_news.get("claim", ""),
        "categoria": fake_news.get("categoria", ""),
        "verdetto": verdetto.get("verdetto", ""),
        "titolo": articolo.get("titolo", ""),
        "sommario": articolo.get("sommario", ""),
        "confidenza": verdetto.get("confidenza_percentuale", 0),
    }

    if ARCHIVIO_PATH.exists():
        with open(ARCHIVIO_PATH, "r", encoding="utf-8") as fh:
            archivio = json.load(fh)
    else:
        archivio = {"smentite": []}

    smentite = archivio.get("smentite", [])

    # Evita duplicati per la stessa data
    smentite = [v for v in smentite if v.get("data") != nuova_voce["data"]]

    # Prepend (voce più recente in cima)
    smentite.insert(0, nuova_voce)

    # Mantieni massimo 60 voci
    archivio["smentite"] = smentite[:60]

    with open(ARCHIVIO_PATH, "w", encoding="utf-8") as fh:
        json.dump(archivio, fh, ensure_ascii=False, indent=2)

    print(f"[Archivio] Aggiornato. Totale voci in archivio: {len(archivio['smentite'])}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print(f"VERA – Avvio pipeline giornaliera — {data_corrente()} ore {ora_corrente()}")
    print("=" * 60)

    state = load_state()

    fasi = [
        ("scout", run_scout),
        ("investigatore", run_investigatore),
        ("ricercatore", run_ricercatore),
        ("fact_checker", run_fact_checker),
        ("redattore", run_redattore),
        ("supervisore", run_supervisore),
    ]

    for nome_fase, funzione_fase in fasi:
        try:
            print(f"\n{'─' * 40}")
            print(f"▶ Fase: {nome_fase.upper()}")
            funzione_fase(state)
        except Exception as exc:
            print(f"\n[ERRORE] Fase '{nome_fase}' fallita: {exc}", file=sys.stderr)
            state["pipeline"][nome_fase]["stato"] = "errore"
            state["stato"] = "errore"
            save_state(state)
            sys.exit(1)

    # Aggiorna l'archivio dopo la pubblicazione
    try:
        print(f"\n{'─' * 40}")
        print("▶ Aggiornamento archivio…")
        update_archive(state)
    except Exception as exc:
        print(f"[ATTENZIONE] Aggiornamento archivio fallito (non bloccante): {exc}", file=sys.stderr)

    print(f"\n{'=' * 60}")
    print(f"VERA – Pipeline completata con successo — ore {ora_corrente()}")
    print("=" * 60)


if __name__ == "__main__":
    main()
