(function () {
  'use strict';

  /* ===== Mobile nav toggle ===== */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===== Pipeline phases (used both for the live status and the simulation) ===== */
  var DAY_START = 8 * 60;   // 08:00 in minutes
  var DAY_END = 19 * 60;    // 19:00 in minutes

  var timelineItems = Array.prototype.slice.call(document.querySelectorAll('#timeline-list .timeline-item'));
  var phases = timelineItems.map(function (item) {
    return {
      el: item,
      label: item.querySelector('h4') ? item.querySelector('h4').textContent : '',
      start: toMinutes(item.getAttribute('data-time')),
      end: toMinutes(item.getAttribute('data-end'))
    };
  });

  function toMinutes(hhmm) {
    var parts = hhmm.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function formatMinutes(total) {
    var h = Math.floor(total / 60);
    var m = total % 60;
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
    }

  /* Apply a "current minute of the day" to the timeline DOM + status banner */
  function applyState(nowMinutes, statusDot, statusText, isSimulation) {
    phases.forEach(function (phase) {
      phase.el.classList.remove('is-done', 'is-active');
      if (nowMinutes >= phase.end) {
        phase.el.classList.add('is-done');
      } else if (nowMinutes >= phase.start && nowMinutes < phase.end) {
        phase.el.classList.add('is-active');
      }
    });

    if (!statusDot || !statusText) { return; }

    statusDot.classList.remove('is-live', 'is-done', 'is-idle');

    if (nowMinutes < DAY_START) {
      statusDot.classList.add('is-idle');
      statusText.textContent = 'Sono le ' + formatMinutes(nowMinutes) + ': la redazione è a riposo, lo Scout entra in azione alle 08:00.';
      return;
    }

    if (nowMinutes >= DAY_END) {
      statusDot.classList.add('is-done');
      statusText.textContent = isSimulation
        ? 'Sono le ' + formatMinutes(nowMinutes) + ': la smentita di oggi è stata pubblicata. Si ricomincia domani alle 08:00.'
        : 'La smentita di oggi è stata pubblicata entro le 19:00. La redazione ricomincia domani alle 08:00.';
      return;
    }

    var active = phases.filter(function (p) { return nowMinutes >= p.start && nowMinutes < p.end; })[0];
    statusDot.classList.add('is-live');
    if (active) {
      statusText.textContent = 'Sono le ' + formatMinutes(nowMinutes) + ': fase in corso — "' + active.label + '".';
    } else {
      statusText.textContent = 'Sono le ' + formatMinutes(nowMinutes) + ': la redazione sta lavorando alla smentita di oggi.';
    }
  }

  /* ===== Live status, based on the visitor's local clock ===== */
  var statusDot = document.getElementById('status-dot');
  var statusText = document.getElementById('status-text');

  function tickLiveStatus() {
    var now = new Date();
    applyState(now.getHours() * 60 + now.getMinutes(), statusDot, statusText, false);
  }
  tickLiveStatus();
  setInterval(tickLiveStatus, 60 * 1000);

  /* ===== Accelerated demo simulation: walks through a full day in seconds ===== */
  var playButton = document.getElementById('play-simulation');
  var simulationTimer = null;

  function runSimulation() {
    if (simulationTimer) { return; }

    var totalSteps = 90;                 // resolution of the simulated day
    var stepDurationMs = 120;            // real-world ms per simulated step
    var minutesPerStep = (DAY_END - DAY_START) / totalSteps;
    var step = 0;

    playButton.disabled = true;
    playButton.textContent = '⏸ Simulazione in corso…';

    simulationTimer = setInterval(function () {
      var simulatedMinutes = Math.round(DAY_START + step * minutesPerStep);
      applyState(simulatedMinutes, statusDot, statusText, true);
      step += 1;

      if (step > totalSteps) {
        clearInterval(simulationTimer);
        simulationTimer = null;
        applyState(DAY_END, statusDot, statusText, true);
        playButton.disabled = false;
        playButton.textContent = '▶ Rivedi la simulazione della giornata';

        // After a short pause, restore the real, current status
        setTimeout(tickLiveStatus, 4000);
      }
    }, stepDurationMs);
  }

  if (playButton) {
    playButton.addEventListener('click', runSimulation);
  }

  /* ===== Live data loading from oggi.json / archivio.json ===== */

  var verdettoCssMap = {
    'falso': 'verdict-false',
    'fuorviante': 'verdict-misleading',
    'impreciso': 'verdict-imprecise',
    'vero_ma_decontestualizzato': 'verdict-imprecise',
    'vero': 'verdict-true'
  };

  var verdettoLabelMap = {
    'falso': 'Falso',
    'fuorviante': 'Fuorviante',
    'impreciso': 'Impreciso',
    'vero_ma_decontestualizzato': 'Vero ma decontestualizzato',
    'vero': 'Vero'
  };

  function renderClaim(data) {
    var card = document.getElementById('case-claim');
    if (!card || !data.fake_news) { return; }

    var fn = data.fake_news;

    // Update the claim label with real detection time
    var label = card.querySelector('.case-label');
    if (label && fn.scoperta_alle) {
      label.textContent = '🔴 Bufala rilevata alle ' + fn.scoperta_alle;
    }

    // Update the claim text
    var h3 = card.querySelector('h3');
    if (h3 && fn.claim) {
      h3.textContent = '“' + fn.claim + '”';
    }

    // Update the risk badge with real diffusione value
    var badge = card.querySelector('.risk-badge');
    if (badge && fn.diffusione) {
      badge.textContent = 'Livello di diffusione stimato: ' + fn.diffusione;
    }
  }

  function renderVerdict(data) {
    var card = document.getElementById('case-verdict');
    if (!card) { return; }

    // Show article title/sommario even if verdict is not yet complete
    var articolo = data.articolo;
    if (articolo && articolo.approvato) {
      var labelEl = card.querySelector('.case-label');
      if (labelEl) {
        labelEl.textContent = '✅ Smentita pubblicata alle ' + (articolo.approvato_alle || '19:00');
      }
    }

    var verdetto = data.verdetto;
    if (!verdetto) { return; }

    // Update verdict tag
    var h3 = card.querySelector('h3');
    if (h3) {
      var etichetta = verdettoLabelMap[verdetto.verdetto] || verdetto.verdetto || 'N/D';
      var cssClass = verdettoCssMap[verdetto.verdetto] || 'verdict-false';
      h3.innerHTML = 'Verdetto: <span class="verdict-tag ' + cssClass + '">' + etichetta + '</span>';
    }

    // Populate evidence list from punti_chiave
    var ul = card.querySelector('.evidence-list');
    if (ul && verdetto.punti_chiave && verdetto.punti_chiave.length) {
      ul.innerHTML = '';
      verdetto.punti_chiave.forEach(function (punto) {
        var li = document.createElement('li');
        li.textContent = punto;
        ul.appendChild(li);
      });
    }

    // Update sources note with article title/sommario if available
    if (articolo && articolo.titolo) {
      var sourcesNote = card.querySelector('.sources-note');
      if (sourcesNote) {
        sourcesNote.innerHTML = '<strong>' + articolo.titolo + '</strong><br><span class="muted">' + (articolo.sommario || '') + '</span>';
      }
    }
  }

  function renderArchive(archivio) {
    var grid = document.getElementById('archive-grid');
    if (!grid || !archivio || !archivio.smentite) { return; }

    grid.innerHTML = '';

    archivio.smentite.forEach(function (voce) {
      var card = document.createElement('article');
      card.className = 'archive-card';

      // Format date to Italian locale
      var dataDisplay = voce.data;
      try {
        var d = new Date(voce.data + 'T12:00:00');
        dataDisplay = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) { /* use raw string */ }

      var cssClass = verdettoCssMap[voce.verdetto] || 'verdict-false';
      var etichetta = verdettoLabelMap[voce.verdetto] || voce.verdetto || 'N/D';

      card.innerHTML =
        '<span class="archive-date">' + dataDisplay + '</span>' +
        '<h4>“' + (voce.claim || '') + '”</h4>' +
        '<span class="verdict-tag ' + cssClass + '">' + etichetta + '</span>';

      grid.appendChild(card);
    });
  }

  function updateTimelineFromData(data) {
    if (!data || !data.pipeline) { return; }

    var pipeline = data.pipeline;
    var items = document.querySelectorAll('#timeline-list .timeline-item[data-phase]');

    items.forEach(function (item) {
      var fase = item.getAttribute('data-phase');
      var info = pipeline[fase];
      if (!info) { return; }

      item.classList.remove('is-done', 'is-active');

      if (info.stato === 'completato') {
        item.classList.add('is-done');
      } else if (info.stato === 'in_corso') {
        item.classList.add('is-active');
      }
      // 'in_attesa' and 'errore' leave the item without extra class
    });
  }

  async function loadPipelineData() {
    var today = new Date().toISOString().slice(0, 10);
    var liveBadge = document.getElementById('live-badge');

    try {
      // Fetch oggi.json
      var res = await fetch('data/oggi.json');
      if (!res.ok) { throw new Error('oggi.json non disponibile (HTTP ' + res.status + ')'); }
      var data = await res.json();

      // Only use data if it matches today's date
      if (data.data !== today) {
        console.info('[VERA] oggi.json è del giorno', data.data, '— non oggi (', today, '). Uso modalità demo.');
        return;
      }

      console.info('[VERA] Dati live caricati per', today, '— stato:', data.stato);

      // Show LIVE badge
      if (liveBadge) { liveBadge.style.display = 'inline'; }

      // Render live claim and verdict
      renderClaim(data);
      renderVerdict(data);

      // Override timeline state from real pipeline data
      updateTimelineFromData(data);

    } catch (e) {
      console.info('[VERA] Impossibile caricare dati live:', e.message, '— modalità demo attiva.');
    }

    // Always try to load and render the archive
    try {
      var archRes = await fetch('data/archivio.json');
      if (archRes.ok) {
        var archivio = await archRes.json();
        renderArchive(archivio);
        console.info('[VERA] Archivio caricato:', (archivio.smentite || []).length, 'voci.');
      }
    } catch (e) {
      console.info('[VERA] Impossibile caricare archivio:', e.message);
    }
  }

  // Kick off live data loading
  loadPipelineData();

})();
