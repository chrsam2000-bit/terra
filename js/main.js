/* TerraReFlow — interactions: boundaries ring, scroll reveals, the turn, nav, contact. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* ======================================================================
     NAV
     ====================================================================== */
  var nav = document.querySelector('.site-nav');
  var onScroll = function () {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ======================================================================
     SCROLL REVEAL
     ====================================================================== */
  var revealables = document.querySelectorAll('.section [data-reveal], .turn [data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ======================================================================
     PLANETARY BOUNDARIES RING
     ====================================================================== */
  var BOUNDARIES = [
    {
      id: 'climate', name: 'Climate change', label: ['CLIMATE', 'CHANGE'],
      breached: true, landLife: false, sev: 1.34,
      desc: 'Carbon and energy imbalance pushed beyond the Holocene range. The planet is heating.',
      answer: [['TerraReCore Energy', '24/7 carbon-free firm power']]
    },
    {
      id: 'ocean', name: 'Ocean acidification', label: ['OCEAN', 'ACIDIFICATION'],
      breached: true, landLife: false, sev: 1.1, statusNote: 'Breached · newly, 2025',
      desc: 'Falling ocean pH — the seventh boundary to cross, confirmed by the 2025 Planetary Health Check.',
      answer: null
    },
    {
      id: 'freshwater', name: 'Freshwater change', label: ['FRESHWATER', 'CHANGE'],
      breached: true, landLife: false, sev: 1.2,
      desc: 'Green and blue water cycles pushed outside the stable range they held for millennia.',
      answer: null
    },
    {
      id: 'novel', name: 'Novel entities', label: ['NOVEL', 'ENTITIES'],
      breached: true, landLife: true, sev: 1.28,
      desc: 'Chemical pollution, plastics, and contamination accumulating in land and water.',
      answer: [
        ['TerraZero', 'waste & landfill reclamation'],
        ['TerraMaterials', 'recovered & circular materials'],
        ['TerraFuel', 'clean fuels & hydrogen']
      ]
    },
    {
      id: 'land', name: 'Land-system change', label: ['LAND-SYSTEM', 'CHANGE'],
      breached: true, landLife: true, sev: 1.24,
      desc: 'Ground degraded, converted, poisoned, and abandoned.',
      answer: [
        ['TerraReCore Energy', 'dead land → clean firm power'],
        ['TerraForm', 'land restoration']
      ]
    },
    {
      id: 'biosphere', name: 'Biosphere integrity', label: ['BIOSPHERE', 'INTEGRITY'],
      breached: true, landLife: true, sev: 1.36,
      desc: 'Biodiversity collapsing faster than at any time in human history.',
      answer: [
        ['TerraBio', 'biodiversity restoration'],
        ['TerraForm', 'land restoration'],
        ['TerraGrow', 'regenerative agriculture']
      ]
    },
    {
      id: 'nutrients', name: 'Biogeochemical flows', label: ['BIOGEOCHEMICAL', 'FLOWS · N & P'],
      breached: true, landLife: true, sev: 1.35,
      desc: 'The nitrogen and phosphorus cycles broken by how we grow and waste.',
      answer: [
        ['TerraGrow', 'regenerative agriculture'],
        ['TerraZero', 'waste & landfill reclamation']
      ]
    },
    {
      id: 'ozone', name: 'Stratospheric ozone', label: ['OZONE', 'LAYER'],
      breached: false, landLife: false, sev: 0.62, statusNote: 'Safe · healing',
      desc: 'Healing since the Montreal Protocol — proof a breached boundary can be pulled back.',
      answer: null, note: 'Proof of the way back.'
    },
    {
      id: 'aerosols', name: 'Aerosol loading', label: ['AEROSOL', 'LOADING'],
      breached: false, landLife: false, sev: 0.7, statusNote: 'Safe',
      desc: 'Atmospheric particle pollution falling across much of the world. Still inside the line.',
      answer: null
    }
  ];

  var svg = document.getElementById('boundaries-ring');
  var detailEl = document.getElementById('ring-detail');
  var legendEl = document.getElementById('ring-legend');

  var CX = 500, CY = 500;
  var R_INNER = 128, R_SAFE = 225;
  var WEDGE_DEG = 35, STEP_DEG = 40, START_DEG = -90 + 2.5;

  function polar(r, deg) {
    var a = (deg * Math.PI) / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }

  function wedgePath(a0, a1, r0, r1) {
    var p0 = polar(r1, a0), p1 = polar(r1, a1);
    var p2 = polar(r0, a1), p3 = polar(r0, a0);
    return 'M ' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
      ' A ' + r1 + ' ' + r1 + ' 0 0 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) +
      ' L ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2) +
      ' A ' + r0 + ' ' + r0 + ' 0 0 0 ' + p3[0].toFixed(2) + ' ' + p3[1].toFixed(2) + ' Z';
  }

  function el(name, attrs, parent) {
    var node = document.createElementNS(SVG_NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function buildDefs() {
    var defs = el('defs', {}, svg);

    var heat = el('radialGradient', {
      id: 'heatGrad', gradientUnits: 'userSpaceOnUse', cx: CX, cy: CY, r: 320
    }, defs);
    el('stop', { offset: '0', 'stop-color': '#FFD98A' }, heat);
    el('stop', { offset: '0.45', 'stop-color': '#FFB347' }, heat);
    el('stop', { offset: '0.78', 'stop-color': '#FF6A2B' }, heat);
    el('stop', { offset: '1', 'stop-color': '#E9500F' }, heat);

    var verd = el('radialGradient', {
      id: 'verdantGrad', gradientUnits: 'userSpaceOnUse', cx: CX, cy: CY, r: 320
    }, defs);
    el('stop', { offset: '0', 'stop-color': '#2A5C41' }, verd);
    el('stop', { offset: '0.6', 'stop-color': '#3E8F63' }, verd);
    el('stop', { offset: '1', 'stop-color': '#4FB07A' }, verd);

    var core = el('radialGradient', { id: 'coreGrad', cx: '0.5', cy: '0.5', r: '0.5' }, defs);
    el('stop', { offset: '0', 'stop-color': '#FFD98A' }, core);
    el('stop', { offset: '0.22', 'stop-color': '#FFB347' }, core);
    el('stop', { offset: '0.45', 'stop-color': '#FF6A2B' }, core);
    el('stop', { offset: '0.72', 'stop-color': '#43200E' }, core);
    el('stop', { offset: '1', 'stop-color': '#131418' }, core);
  }

  var wedges = []; // { data, path, overlay, label, legendBtn, rFinal, rNow, a0, a1 }
  var selectedId = null;

  function buildRing() {
    buildDefs();

    // safe operating space
    el('circle', { cx: CX, cy: CY, r: R_SAFE, 'class': 'safe-ring' }, svg);

    // the planet, lit from within
    var coreGroup = el('g', { 'class': 'ring-core' }, svg);
    el('circle', { cx: CX, cy: CY, r: 112, fill: 'url(#coreGrad)' }, coreGroup);
    el('circle', { cx: CX, cy: CY, r: 112, fill: 'none', stroke: 'rgba(236,231,223,0.12)', 'stroke-width': 1 }, coreGroup);

    var wedgeLayer = el('g', {}, svg);
    var overlayLayer = el('g', {}, svg);
    var labelLayer = el('g', {}, svg);

    BOUNDARIES.forEach(function (b, i) {
      var a0 = START_DEG + i * STEP_DEG;
      var a1 = a0 + WEDGE_DEG;
      var rFinal = R_SAFE * b.sev;
      var rStart = b.breached ? Math.min(R_SAFE * 0.96, rFinal) : R_INNER + 14;

      var status = b.breached ? 'breached' : 'safe';
      var answerNames = b.answer ? b.answer.map(function (a) { return a[0]; }).join(', ') : '';
      var ariaLabel = b.name + ' — ' + (b.breached ? 'breached' : 'safe') +
        (answerNames ? '. Answered by ' + answerNames + '.' : '.');

      var path = el('path', {
        d: wedgePath(a0, a1, R_INNER, rStart),
        'class': 'wedge ' + status + (b.landLife ? ' landlife' : ''),
        tabindex: '0',
        role: 'button',
        'aria-pressed': 'false',
        'aria-label': ariaLabel
      }, wedgeLayer);

      var overlay = null;
      if (b.landLife) {
        overlay = el('path', {
          d: wedgePath(a0, a1, R_INNER, rStart),
          'class': 'wedge-verdant'
        }, overlayLayer);
      }

      // label
      var mid = a0 + WEDGE_DEG / 2;
      var labelR = Math.max(rFinal, R_SAFE) + 36;
      var pos = polar(labelR, mid);
      var cos = Math.cos((mid * Math.PI) / 180);
      var anchor = cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle';
      var sin = Math.sin((mid * Math.PI) / 180);
      var baseY = pos[1] + (sin < -0.7 ? -14 : sin > 0.7 ? 14 : 0);

      var text = el('text', {
        x: pos[0].toFixed(1), y: baseY.toFixed(1),
        'text-anchor': anchor,
        'class': 'ring-label' + (b.landLife ? ' landlife-mark' : '')
      }, labelLayer);
      b.label.forEach(function (line, li) {
        var tspan = el('tspan', { x: pos[0].toFixed(1), dy: li === 0 ? 0 : 17 }, text);
        tspan.textContent = line;
      });
      if (b.landLife) {
        var mark = el('tspan', { x: pos[0].toFixed(1), dy: 17, fill: '#4FB07A' }, text);
        mark.textContent = '● LAND & LIFE';
      }

      var w = {
        data: b, path: path, overlay: overlay, label: text,
        a0: a0, a1: a1, rFinal: rFinal, rStart: rStart, rNow: rStart
      };
      wedges.push(w);

      path.addEventListener('mouseenter', function () { preview(b.id); });
      path.addEventListener('mouseleave', function () { preview(null); });
      path.addEventListener('click', function () { select(b.id); });
      path.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(b.id);
        }
      });
      path.addEventListener('focus', function () { preview(b.id); });
      path.addEventListener('blur', function () { preview(null); });
    });

    buildLegend();
    select('land');
  }

  function buildLegend() {
    BOUNDARIES.forEach(function (b) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML =
        '<span class="legend-dot ' + (b.breached ? 'breached' : 'safe') + (b.landLife ? ' landlife' : '') + '"></span>' +
        '<span class="legend-name">' + b.name + '</span>' +
        '<span class="legend-status">' + (b.breached ? 'Breached' : 'Safe') + '</span>';
      btn.addEventListener('click', function () { select(b.id); });
      btn.addEventListener('mouseenter', function () { preview(b.id); });
      btn.addEventListener('mouseleave', function () { preview(null); });
      li.appendChild(btn);
      legendEl.appendChild(li);
      var w = wedges.filter(function (x) { return x.data.id === b.id; })[0];
      if (w) w.legendBtn = btn;
    });
  }

  function renderDetail(b) {
    var statusText = b.statusNote || (b.breached ? 'Breached' : 'Safe');
    if (b.landLife) statusText += ' · Land & life';
    var html =
      '<p class="detail-status ' + (b.breached ? 'breached' : 'safe') + '">' + statusText + '</p>' +
      '<h3>' + b.name + '</h3>' +
      '<p>' + b.desc + '</p>';
    if (b.answer) {
      html += '<div class="detail-answer"><p class="mono">The way back</p><ul>';
      b.answer.forEach(function (a) {
        html += '<li><strong>' + a[0] + '</strong> — ' + a[1] + '</li>';
      });
      html += '</ul></div>';
    } else if (b.note) {
      html += '<p class="detail-note">' + b.note + '</p>';
    } else if (b.breached) {
      html += '<p class="detail-note">Beyond the platform’s first phase — the model is built to extend.</p>';
    }
    detailEl.innerHTML = html;
  }

  function applyHighlight() {
    var activeId = previewId || selectedId;
    wedges.forEach(function (w) {
      var isActive = w.data.id === activeId;
      var isSelected = w.data.id === selectedId;
      w.path.classList.toggle('is-active', isActive);
      w.path.setAttribute('aria-pressed', String(isSelected));
      w.label.classList.toggle('is-active', isActive);
      if (w.legendBtn) w.legendBtn.classList.toggle('is-active', isActive);
      if (w.overlay) w.overlay.classList.toggle('on', isActive && w.data.landLife);
    });
    var shown = BOUNDARIES.filter(function (b) { return b.id === activeId; })[0];
    if (shown) renderDetail(shown);
  }

  var previewId = null;
  function preview(id) {
    previewId = id;
    applyHighlight();
  }
  function select(id) {
    selectedId = id;
    applyHighlight();
  }

  /* breach animation: wedges push outward past the safe ring */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function setWedgeRadius(w, r) {
    w.rNow = r;
    var d = wedgePath(w.a0, w.a1, R_INNER, r);
    w.path.setAttribute('d', d);
    if (w.overlay) w.overlay.setAttribute('d', d);
  }

  function settleRing() {
    wedges.forEach(function (w) { setWedgeRadius(w, w.rFinal); });
    svg.classList.add('settled');
  }

  function animateBreach() {
    if (reduceMotion) { settleRing(); return; }
    var DURATION = 1100, STAGGER = 85;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var done = true;
      wedges.forEach(function (w, i) {
        var t = (ts - start - i * STAGGER) / DURATION;
        if (t < 0) { done = false; return; }
        if (t > 1) t = 1; else done = false;
        var r = w.rStart + (w.rFinal - w.rStart) * easeOutCubic(t);
        setWedgeRadius(w, r);
      });
      if (!done) {
        requestAnimationFrame(frame);
      } else {
        svg.classList.add('settled');
      }
    }
    requestAnimationFrame(frame);
  }

  if (svg && detailEl && legendEl) {
    buildRing();
    if ('IntersectionObserver' in window) {
      var ringObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateBreach();
            ringObserver.disconnect();
          }
        });
      }, { threshold: 0.35 });
      ringObserver.observe(svg);
    } else {
      settleRing();
    }
  }

  /* ======================================================================
     THE TURN — one transformation moment
     ====================================================================== */
  var clipRect = document.getElementById('turn-clip-rect');
  var turnLine = document.getElementById('turn-line');
  var turn = document.getElementById('turn');

  if (clipRect && turn) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      clipRect.setAttribute('width', '1440'); // static: show the restored state
    } else {
      clipRect.setAttribute('width', '0');
      var turnObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateTurn();
            turnObserver.disconnect();
          }
        });
      }, { threshold: 0.45 });
      turnObserver.observe(turn);
    }
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateTurn() {
    var DURATION = 1900;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / DURATION, 1);
      var w = 1440 * easeInOutCubic(t);
      clipRect.setAttribute('width', String(w));
      turnLine.setAttribute('x1', String(w));
      turnLine.setAttribute('x2', String(w));
      turnLine.setAttribute('opacity', t < 1 ? '0.7' : '0');
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ======================================================================
     CONTACT — route cards preselect topic; form composes a mailto
     ====================================================================== */
  var topicSelect = document.getElementById('cf-topic');
  document.querySelectorAll('.route-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var span = document.createElement('span');
      span.innerHTML = card.getAttribute('data-topic');
      topicSelect.value = span.textContent;
      document.getElementById('cf-name').focus();
      document.getElementById('contact-form').scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    });
  });

  var form = document.getElementById('contact-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('cf-name').value.trim();
    var org = document.getElementById('cf-org').value.trim();
    var email = document.getElementById('cf-email').value.trim();
    var topic = topicSelect.value;
    var msg = document.getElementById('cf-msg').value.trim();
    var subject = '[TerraReFlow] ' + topic + ' — ' + name + (org ? ', ' + org : '');
    var body = msg + '\n\n—\n' + name + (org ? '\n' + org : '') + '\n' + email;
    window.location.href = 'mailto:hello@terrareflow.com' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  });

  /* ======================================================================
     FOOTER YEAR
     ====================================================================== */
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
