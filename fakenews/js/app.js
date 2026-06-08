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
})();
