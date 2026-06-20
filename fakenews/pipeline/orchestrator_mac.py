#!/usr/bin/env python3
"""
VERA Mac Orchestrator
Usa i CLI locali di Gemini e Claude — nessuna API key richiesta.

Prerequisiti:
  npm install -g @google/gemini-cli @anthropic-ai/claude-code
  gemini auth      (accesso con account Google)
  claude           (accesso con account claude.ai)

Avvio manuale:    python3 orchestrator_mac.py
Da crontab:       0 6 * * * cd /path/to/repo && python3 fakenews/pipeline/orchestrator_mac.py >> /tmp/vera.log 2>&1
Orchestrato da Codex: vedi fakenews/prompts/04-istruzioni-codex.md
"""

import json, re, subprocess, logging, sys
from datetime import date, datetime
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger('vera-mac')

DATA_DIR = Path(__file__).parent.parent / 'data'
TODAY = date.today().isoformat()


# ── Helpers ──────────────────────────────────────────────────────────────────

def call_cli(cmd: str, prompt: str, timeout: int = 180) -> dict:
    """Chiama gemini o claude in modalità non-interattiva, restituisce JSON."""
    try:
        result = subprocess.run(
            [cmd, '-p', prompt],
            capture_output=True, text=True, timeout=timeout
        )
        output = result.stdout
    except FileNotFoundError:
        raise RuntimeError(
            f"Comando '{cmd}' non trovato. "
            f"Installa con: npm install -g @google/gemini-cli"
            if cmd == 'gemini'
            else f"Installa con: npm install -g @anthropic-ai/claude-code"
        )

    # Rimuovi eventuali blocchi markdown ```json ... ```
    output = re.sub(r'```json\s*', '', output)
    output = re.sub(r'```\s*', '', output)

    match = re.search(r'\{.*\}', output.strip(), re.DOTALL)
    if not match:
        raise ValueError(f"Nessun JSON trovato nell'output di {cmd}:\n{output[:300]}")

    return json.loads(match.group())


def gemini(prompt: str) -> dict:
    log.debug("→ Gemini CLI")
    return call_cli('gemini', prompt)


def claude_cli(prompt: str) -> dict:
    log.debug("→ Claude CLI")
    return call_cli('claude', prompt)


def load_state() -> dict:
    path = DATA_DIR / 'oggi.json'
    if path.exists():
        with open(path) as f:
            state = json.load(f)
        if state.get('data') == TODAY:
            log.info("Stato esistente trovato per oggi — riprendo da dove ero rimasto.")
            return state
    return {
        'data': TODAY,
        'stato': 'in_corso',
        'aggiornato_alle': datetime.now().strftime('%H:%M'),
        'pipeline': {k: {'stato': 'in_attesa', 'alle': None}
                     for k in ['scout', 'investigatore', 'ricercatore',
                                'fact_checker', 'redattore', 'supervisore']},
        'fake_news': None,
        'indagine':  None,
        'dossier':   None,
        'verdetto':  None,
        'articolo':  None,
    }


def save_state(state: dict) -> None:
    state['aggiornato_alle'] = datetime.now().strftime('%H:%M')
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(DATA_DIR / 'oggi.json', 'w') as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def mark_done(state: dict, phase: str) -> dict:
    state['pipeline'][phase] = {'stato': 'completato', 'alle': datetime.now().strftime('%H:%M')}
    return state


def skip_if_done(state: dict, phase: str) -> bool:
    if state['pipeline'][phase]['stato'] == 'completato':
        log.info(f"⏩  {phase}: già completato — salto.")
        return True
    return False


# ── Agenti ───────────────────────────────────────────────────────────────────

def run_scout(state: dict) -> dict:
    if skip_if_done(state, 'scout'): return state
    log.info("🛰️  Scout (Gemini) — ricerca la fake news del giorno…")

    data = gemini(f"""Sei lo Scout di VERA, una piattaforma italiana di fact-checking.
Oggi è {TODAY}. Individua la notizia falsa o fuorviante più diffusa in Italia
nelle ultime 24 ore (WhatsApp, Facebook, TikTok, siti di disinformazione).
Preferisci affermazioni su salute, scienza o sicurezza perché sono le più pericolose.

Rispondi SOLO con un oggetto JSON valido:
{{
  "claim": "l'affermazione esatta così come circola",
  "categoria": "salute",
  "diffusione": "alta",
  "canali_principali": ["WhatsApp", "Facebook"],
  "stima_condivisioni": "decine di migliaia",
  "perche_pericolosa": "breve spiegazione del danno potenziale"
}}""")

    data['scoperta_alle'] = datetime.now().strftime('%H:%M')
    data['agente'] = 'Scout (Gemini)'
    state['fake_news'] = data
    state = mark_done(state, 'scout')
    save_state(state)
    log.info(f"✅  Scout: «{data['claim'][:70]}…»")
    return state


def run_investigatore(state: dict) -> dict:
    if skip_if_done(state, 'investigatore'): return state
    log.info("🧭  Investigatore (Gemini) — risale all'origine…")

    claim = state['fake_news']['claim']
    data = gemini(f"""Sei l'Investigatore di VERA. La fake news da analizzare è:
«{claim}»

Ricostruisci la probabile origine e il meccanismo di diffusione nel contesto italiano.

Rispondi SOLO con un oggetto JSON valido:
{{
  "probabile_origine": "descrizione dell'origine",
  "prima_apparizione": "es. gruppo WhatsApp anonimo, pagina Facebook",
  "meccanismo_diffusione": "come si è propagata",
  "amplificatori": ["tipo di account 1", "tipo di account 2"],
  "plausibilita_superficiale": "perché sembra credibile a prima vista",
  "completata_alle": "{datetime.now().strftime('%H:%M')}"
}}""")

    state['indagine'] = data
    state = mark_done(state, 'investigatore')
    save_state(state)
    log.info("✅  Investigatore completato.")
    return state


def run_ricercatore(state: dict) -> dict:
    if skip_if_done(state, 'ricercatore'): return state
    log.info("📚  Ricercatore (Gemini) — raccoglie le prove…")

    claim = state['fake_news']['claim']
    cat   = state['fake_news'].get('categoria', 'salute')
    data = gemini(f"""Sei il Ricercatore di VERA. L'affermazione da verificare è:
«{claim}» (categoria: {cat})

Cerca studi, dati ufficiali e dichiarazioni di esperti. Distingui prove contrarie da prove a favore.

Rispondi SOLO con un oggetto JSON valido:
{{
  "prove_contrarie": ["prova 1 con fonte", "prova 2 con fonte"],
  "prove_a_favore": ["eventuale elemento parzialmente vero"],
  "fonti_tipologia": ["studi peer-reviewed", "linee guida OMS"],
  "elemento_di_verita": "il nucleo di verità, se esiste",
  "grado_di_falsita_stimato": "85",
  "completato_alle": "{datetime.now().strftime('%H:%M')}"
}}""")

    state['dossier'] = data
    state = mark_done(state, 'ricercatore')
    save_state(state)
    log.info("✅  Ricercatore completato.")
    return state


def run_fact_checker(state: dict) -> dict:
    if skip_if_done(state, 'fact_checker'): return state
    log.info("⚖️   Fact-checker (Claude) — analisi critica e verdetto…")

    claim   = state['fake_news']['claim']
    dossier = json.dumps(state['dossier'], ensure_ascii=False, indent=2)
    data = claude_cli(f"""Sei il Fact-checker di VERA, una piattaforma italiana di fact-checking.

Affermazione: «{claim}»

Dossier prove:
{dossier}

Analizza le prove, individua lacune o bias e assegna un verdetto definitivo.

Rispondi SOLO con un oggetto JSON valido:
{{
  "verdetto": "falso",
  "confidenza_percentuale": 95,
  "motivazione_principale": "spiegazione chiara in 2-3 frasi",
  "punti_chiave": ["punto 1", "punto 2", "punto 3", "punto 4"],
  "cosa_e_vero": "eventuale nucleo di verità",
  "cosa_e_falso": "cosa è specificamente errato",
  "emesso_alle": "{datetime.now().strftime('%H:%M')}",
  "agente": "Fact-checker (Claude)"
}}""")

    state['verdetto'] = data
    state = mark_done(state, 'fact_checker')
    save_state(state)
    log.info(f"✅  Fact-checker: {data.get('verdetto')} ({data.get('confidenza_percentuale')}%)")
    return state


def run_redattore(state: dict) -> dict:
    if skip_if_done(state, 'redattore'): return state
    log.info("✍️   Redattore (Claude) — stesura articolo…")

    claim    = state['fake_news']['claim']
    verdetto = json.dumps(state['verdetto'], ensure_ascii=False, indent=2)
    dossier  = json.dumps(state['dossier'],  ensure_ascii=False, indent=2)

    # In modalità Mac, il Redattore è gestito da Claude (Codex può sovrascrivere questo step).
    # Se Codex è l'orchestratore, può saltare questa fase e scrivere l'articolo direttamente.
    data = claude_cli(f"""Sei il Redattore di VERA. Scrivi un articolo di debunking in italiano.

Notizia falsa: «{claim}»
Verdetto: {verdetto}
Prove: {dossier}

Linee guida:
- Tono informativo, mai condiscendente, niente allarmismi
- Non ripetere la fake news nel titolo
- Cita la tipologia di fonte, non inventare URL
- Lunghezza: 380-480 parole
- Struttura: intro → cosa c'è di falso → cosa dice la scienza → conclusione pratica

Rispondi SOLO con un oggetto JSON valido:
{{
  "titolo": "titolo chiaro (max 80 caratteri)",
  "sommario": "sottotitolo (max 160 caratteri)",
  "testo_completo": "testo completo con paragrafi separati da \\n\\n",
  "tag": ["tag1", "tag2", "tag3"],
  "scritto_alle": "{datetime.now().strftime('%H:%M')}",
  "agente": "Redattore (Claude)"
}}""")

    state['articolo'] = data
    state = mark_done(state, 'redattore')
    save_state(state)
    log.info(f"✅  Redattore: «{data.get('titolo', '')}»")
    return state


def run_supervisore(state: dict) -> dict:
    if skip_if_done(state, 'supervisore'): return state
    log.info("🛡️   Supervisore (Claude) — revisione finale…")

    articolo = json.dumps(state['articolo'], ensure_ascii=False, indent=2)
    verdetto = json.dumps(state['verdetto'], ensure_ascii=False, indent=2)

    data = claude_cli(f"""Sei il Supervisore editoriale di VERA. Revisiona l'articolo.

Articolo da revisionare:
{articolo}

Verdetto di riferimento:
{verdetto}

Valuta: correttezza fattuale, tono, chiarezza, rispetto del lettore (0–10).
Se punteggio ≥ 7, approva. Correggi direttamente se necessario.

Rispondi SOLO con un oggetto JSON valido:
{{
  "approvato": true,
  "punteggio_qualita": 8,
  "articolo_finale": {{
    "titolo": "titolo finale",
    "sommario": "sommario finale",
    "testo_completo": "testo approvato"
  }},
  "note_revisione": "cosa è stato verificato o corretto",
  "pubblicato_alle": "{datetime.now().strftime('%H:%M')}"
}}""")

    if data.get('articolo_finale'):
        state['articolo'].update(data['articolo_finale'])
    state['articolo']['approvato']        = data.get('approvato', True)
    state['articolo']['punteggio_qualita'] = data.get('punteggio_qualita', 8)
    state['articolo']['note_revisione']   = data.get('note_revisione', '')
    state['articolo']['pubblicato_alle']  = data.get('pubblicato_alle')
    state['stato'] = 'pubblicato'
    state = mark_done(state, 'supervisore')
    save_state(state)
    log.info(f"✅  Supervisore: approvato {data.get('punteggio_qualita')}/10")
    return state


def update_archive(state: dict) -> None:
    archive_path = DATA_DIR / 'archivio.json'
    archivio = json.loads(archive_path.read_text()) if archive_path.exists() else {'smentite': []}

    if state.get('verdetto') and state.get('articolo'):
        entry = {
            'data':        state['data'],
            'claim':       state['fake_news']['claim'],
            'categoria':   state['fake_news'].get('categoria', ''),
            'verdetto':    state['verdetto']['verdetto'],
            'titolo':      state['articolo'].get('titolo', ''),
            'sommario':    state['articolo'].get('sommario', ''),
            'confidenza':  state['verdetto'].get('confidenza_percentuale', 0),
        }
        dates = [s['data'] for s in archivio['smentite']]
        if state['data'] not in dates:
            archivio['smentite'].insert(0, entry)
            archivio['smentite'] = archivio['smentite'][:60]

    archive_path.write_text(json.dumps(archivio, ensure_ascii=False, indent=2))
    log.info("✅  Archivio aggiornato.")


def git_publish() -> None:
    log.info("📤  Pubblicazione su GitHub…")
    repo = DATA_DIR.parent.parent
    cmds = [
        ['git', 'add', 'fakenews/data/oggi.json', 'fakenews/data/archivio.json'],
        ['git', 'diff', '--cached', '--quiet'],  # esce con 1 se ci sono modifiche
    ]
    subprocess.run(cmds[0], cwd=repo, check=True)
    result = subprocess.run(cmds[1], cwd=repo)
    if result.returncode == 0:
        log.info("Nessuna modifica da committare.")
        return
    today = date.today().strftime('%d/%m/%Y')
    subprocess.run(
        ['git', 'commit', '-m', f'VERA: smentita del {today}'],
        cwd=repo, check=True
    )
    subprocess.run(['git', 'push'], cwd=repo, check=True)
    log.info("✅  Pubblicato su GitHub.")


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    log.info("═══ VERA Mac Pipeline avviata ═══")
    state = load_state()
    try:
        state = run_scout(state)
        state = run_investigatore(state)
        state = run_ricercatore(state)
        state = run_fact_checker(state)
        state = run_redattore(state)
        state = run_supervisore(state)
        update_archive(state)
        git_publish()
        log.info("═══ Pipeline completata — smentita pubblicata ✅ ═══")
    except Exception as exc:
        log.error(f"Errore pipeline: {exc}")
        state['stato'] = 'errore'
        state['errore'] = str(exc)
        save_state(state)
        sys.exit(1)


if __name__ == '__main__':
    main()
