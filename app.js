/* Interactive atlas. All work, notes and decisions are local sample data. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s), world = VillageWorld;
  const viewport = $('#viewport'), canvas = $('#world'), ctx = canvas.getContext('2d');
  const states = {}, notes = {}, decisions = {};
  const stateInfo = {
    working: { label: 'Working', icon: '⚙', color: '#3f9a45', text: 'At work. The lead is busy, the crew is moving and the machines are running.' },
    idle: { label: 'Idle', icon: '…', color: '#6a88bd', text: 'Ready for the next task. The lead waits calmly; the district is quiet.' },
    waiting: { label: 'Needs approval', icon: '?', color: '#c98f16', text: 'Work is paused and piled up until you decide. Look for the amber signals.' },
    error: { label: 'Error', icon: '!', color: '#d24a36', text: 'Something broke. Smoke, sparks and a blinking red lamp mark the problem.' },
    off: { label: 'Offline', icon: 'z', color: '#5f6a8e', text: 'Lights out. The lead is asleep and the equipment is still.' }
  };
  let selectedId = null, camera = { x: 0, y: 0, scale: 1 }, width = 0, height = 0, viewMode = 'gktc', elapsed = 0, lastTime = 0, lastFrame = 0;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches, labels = true, atlasVillage = 'gktc', lastTrigger = null;
  const zone = id => world.zones.find(z => z.id === id), state = z => world.stateOf(z, states), info = z => stateInfo[state(z)] || stateInfo.working;
  const node = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const say = text => $('#announcement').textContent = text;
  const villageName = v => v === 'commons' ? 'Western woods' : v === 'gktc' ? 'GKTC’s village' : 'Daghan’s village';
  function badge(z) { const b = node('span', 'state-badge'); b.dataset.state = state(z); b.append(node('span', 'state-icon', info(z).icon), document.createTextNode(info(z).label)); return b; }

  /* ---------- Camera ---------- */
  const fitScale = () => Math.min((width - 60) / world.width, (height - 60) / world.height);
  function clampCamera() {
    // Keep the map filling the screen; centre it on an axis where it is smaller than the viewport.
    const ww = world.width * camera.scale, wh = world.height * camera.scale;
    camera.x = ww <= width ? (width - ww) / 2 : Math.min(0, Math.max(width - ww, camera.x));
    camera.y = wh <= height ? (height - wh) / 2 : Math.min(0, Math.max(height - wh, camera.y));
  }
  function center(x, y, scale) { camera.scale = scale; camera.x = width / 2 - x * scale; camera.y = height / 2 - y * scale; clampCamera(); positionLabels(); }
  function fit() { viewMode = 'both'; center(world.width / 2, world.height / 2, fitScale()); }
  function fitVillage(v = 'gktc') { viewMode = v; const [x, y] = world.home[v]; center(x, y - 40, Math.min((width - (width < 650 ? 20 : 120)) / (width < 650 ? 900 : 1900), (height - 110) / 1360)); }
  function focus(z) {
    viewMode = 'custom'; const available = width - ($('#drawer').hidden || width < 760 ? 0 : 400);
    const scale = Math.max(.5, Math.min(4, available / (z.kind === 'arena' ? 680 : z.role === 'castle' ? 580 : z.role === 'library' ? 580 : 470), (height - 120) / (z.kind === 'arena' ? 520 : z.role === 'castle' ? 480 : z.role === 'library' ? 420 : 380)));
    camera.scale = scale; camera.x = available / 2 - z.x * scale; camera.y = height / 2 - z.y * scale; clampCamera(); positionLabels();
  }
  function zoom(factor, px = width / 2, py = height / 2) { const next = Math.max(fitScale() * .85, Math.min(6, camera.scale * factor)), ratio = next / camera.scale; camera.x = px - (px - camera.x) * ratio; camera.y = py - (py - camera.y) * ratio; camera.scale = next; viewMode = 'custom'; clampCamera(); positionLabels(); }
  function resize() { mapPainted = false; const r = viewport.getBoundingClientRect(); width = r.width; height = r.height; const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); if (viewMode === 'both') fit(); else if (viewMode === 'gktc' || viewMode === 'daghan') fitVillage(viewMode); else { clampCamera(); positionLabels(); } paint(); }

  /* ---------- Labels ---------- */
  function positionLabels() {
    for (const b of document.querySelectorAll('.zone-label')) {
      const z = zone(b.dataset.id), x = camera.x + z.x * camera.scale, y = camera.y + z.labelY * camera.scale;
      b.style.left = x + 'px'; b.style.top = y + 'px';
      b.hidden = x < -120 || x > width + 120 || y < -60 || y > height + 60 || (camera.scale < .32 && z.role !== 'castle' && z.kind !== 'arena' && z.id !== selectedId);
      b.classList.toggle('compact', camera.scale < .55);
    }
    for (const b of document.querySelectorAll('.land-title')) { b.style.left = camera.x + Number(b.dataset.x) * camera.scale + 'px'; b.style.top = camera.y + Number(b.dataset.y) * camera.scale + 'px'; b.style.fontSize = Math.max(9, Math.min(18, camera.scale * 16)) + 'px'; b.querySelector('small').hidden = camera.scale < .35; }
    $('#zoom-value').textContent = Math.round(camera.scale * 50) + '%';
  }
  function buildLabels() {
    world.zones.forEach(z => {
      const b = node('button', 'zone-label' + (z.kind !== 'agent' ? ' service' : '') + (z.role === 'castle' ? ' castle' : '') + (z.kind === 'arena' ? ' arena' : ''));
      b.dataset.id = z.id; const title = node('span', 'label-title');
      title.append(document.createTextNode(z.agent)); b.append(title, node('small', '', z.kind === 'agent' ? z.name : z.name + (z.action === 'page' ? ' ↗' : '')));
      if (z.kind === 'agent' || z.kind === 'resource') { const st = node('span', 'map-state'); st.append(node('i', 'state-icon'), node('b')); b.append(st); }
      b.setAttribute('aria-label', `${z.agent}, ${villageName(z.village)}. ${z.name}. ${z.action === 'page' ? 'Open page' : 'Open details'}`);
      b.addEventListener('click', () => visit(z, b)); $('#map-labels').append(b);
    });
    for (const [x, y, title, sub] of world.titles) { const el = node('div', 'land-title', title); el.dataset.x = x; el.dataset.y = y; el.append(node('small', '', sub)); $('#land-titles').append(el); }
  }
  function selection() {
    document.querySelectorAll('.zone-label').forEach(b => {
      b.classList.toggle('selected', b.dataset.id === selectedId); b.setAttribute('aria-pressed', String(b.dataset.id === selectedId));
      const z = zone(b.dataset.id), st = b.querySelector('.map-state');
      if (st) { const s = state(z); b.dataset.state = s; st.querySelector('.state-icon').textContent = stateInfo[s].icon; st.querySelector('b').textContent = stateInfo[s].label; }
    });
  }
  function hideWelcome() { $('#welcome').hidden = true; }

  /* ---------- Art views ---------- */
  const spanFor = z => z.kind === 'arena' ? 640 : z.role === 'castle' ? 580 : z.role === 'library' ? 560 : 440;
  function crop(c, z, span = spanFor(z)) { world.renderView(c, elapsed, { cx: z.x, cy: z.y + (z.kind === 'arena' ? 0 : z.role === 'library' ? -22 : -4), w: span, states }); }
  function art(z, cls = 'drawer-art') { const c = node('canvas', cls); c.width = 880; c.height = 560; c.setAttribute('aria-label', z.name + ' pixel-art environment'); crop(c, z); return c; }

  /* ---------- Drawers & modals ---------- */
  function closeDrawer() { const wasOpen = !$('#drawer').hidden; $('#drawer').hidden = true; selectedId = null; selection(); if (wasOpen) { if (lastTrigger?.isConnected && !lastTrigger.hidden) lastTrigger.focus({ preventScroll: true }); else viewport.focus({ preventScroll: true }); } }
  function visit(z, trigger) {
    lastTrigger = trigger || document.activeElement; selectedId = z.id; hideWelcome(); selection();
    if (z.action === 'page') { saveCamera(); location.href = `destination.html?place=${z.role}&village=${z.village}`; return; }
    if (z.kind === 'agent') agentDrawer(z); else if (z.kind === 'resource') resourceDrawer(z); else if (z.role === 'inbox') inboxDrawer(z); else if (z.kind === 'arena') arenaModal(z); else placeModal(z);
  }
  function startDrawer(z) {
    $('#drawer').hidden = false; $('#drawer').setAttribute('aria-label', z.agent + ' details'); const host = $('#drawer-content'); host.replaceChildren(art(z));
    const pad = node('div', 'drawer-pad'); pad.append(node('div', 'eyebrow', villageName(z.village).toUpperCase()), node('h1', '', z.agent), node('div', 'drawer-subtitle', z.name)); host.append(pad);
    $('#drawer-close').focus({ preventScroll: true }); return pad;
  }
  function agentDrawer(z) {
    const pad = startDrawer(z); const profile = AgentCharacters.profiles[z.role];
    const head = node('div', 'lead-head'), portrait = node('canvas', 'portrait'); portrait.width = 150; portrait.height = 210; portrait.dataset.role = z.role; portrait.setAttribute('aria-hidden', 'true');
    const txt = node('div', 'lead-profile'); txt.append(node('strong', '', profile.title), node('small', '', profile.description)); head.append(portrait, txt);
    pad.append(badge(z), head, node('p', '', z.description));
    if (z.role === 'kole') { const links = node('div', 'crew-links'); for (const role of ['lumberyard', 'mine', 'farm']) { const site = zone(z.village + '-' + role), b = node('button', 'button small', site.agent + ' ↗'); b.onclick = () => { resourceDrawer(site); selectedId = site.id; selection(); focus(site); }; links.append(b); } pad.append(node('p', 'notice', 'Small Köle crews work the southern resource lands and walk home to the bunks and mess hall here.'), links); }
    const tools = node('div', 'drawer-toolbar'); const focusButton = node('button', 'button', '⛶ Explore this district'); focusButton.onclick = () => focus(z); const inbox = node('button', 'button', 'Inbox ↗'); inbox.onclick = () => visit(zone(z.village + '-inbox'), inbox); tools.append(focusButton, inbox); pad.append(tools);
    pad.append(node('span', 'field-label', 'TRY AN AGENT STATE'));
    const group = node('div', 'state-picker'); group.setAttribute('role', 'radiogroup'); group.setAttribute('aria-label', 'Agent state');
    const explain = node('p', 'state-explanation', info(z).text);
    Object.entries(stateInfo).forEach(([key, item]) => { const b = node('button', 'state-chip'); b.dataset.state = key; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(state(z) === key)); b.append(node('span', 'state-icon', item.icon), document.createTextNode(item.label)); b.onclick = () => { states[z.id] = key; group.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b))); pad.querySelector('.state-badge').replaceWith(badge(z)); explain.textContent = info(z).text; selection(); say(z.agent + ' is now ' + item.label); }; group.append(b); });
    pad.append(group, explain);
    const form = node('form', 'note-form'), nl = node('label', 'field-label', 'LEAVE A LOCAL NOTE'), ta = node('textarea'), send = node('button', 'button primary full', 'Add note'); nl.htmlFor = 'zone-note'; ta.id = 'zone-note'; ta.maxLength = 1200; ta.placeholder = 'An idea for this district…'; send.type = 'submit'; send.disabled = true; ta.oninput = () => send.disabled = !ta.value.trim(); form.append(nl, ta, send);
    const list = node('div'); (notes[z.id] || []).forEach(t => list.append(node('div', 'note-entry', t)));
    form.onsubmit = e => { e.preventDefault(); const value = ta.value.trim(); if (!value) return; (notes[z.id] ||= []).push(value); list.append(node('div', 'note-entry', value)); ta.value = ''; send.disabled = true; say('Local note added.'); };
    pad.append(form, node('p', 'demo-note', 'PROTOTYPE ONLY · NO MODEL CONNECTED'), list); say(z.agent + ' district opened.');
  }
  function resourceDrawer(z) {
    const pad = startDrawer(z); pad.append(node('p', '', z.description));
    const crew = node('div', 'resource-crew'); pad.append(crew);
    const showCrew = () => { crew.replaceChildren(badge(z), node('p', '', state(z) === 'working' ? 'Köle crews are working this site and carrying supplies between here and the home workshop.' : 'This crew is not working right now. Their tools and delivery routes are paused.')); };
    showCrew();
    const focusButton = node('button', 'button full', '⛶ Watch this worksite'); focusButton.onclick = () => focus(z);
    const toggle = node('button', 'button primary full', state(z) === 'working' ? 'Rest this crew' : 'Resume work'); toggle.onclick = () => { states[z.id] = state(z) === 'working' ? 'idle' : 'working'; toggle.textContent = state(z) === 'working' ? 'Rest this crew' : 'Resume work'; showCrew(); selection(); say(z.agent + ': ' + (state(z) === 'working' ? 'crew resumed' : 'crew resting')); };
    const home = node('button', 'button full', 'Visit Köle’s bunks & dining hall ↗'); home.onclick = () => { const lead = zone(z.village + '-kole'); selectedId = lead.id; agentDrawer(lead); selection(); focus(lead); };
    const work = z.role === 'lumberyard' ? ['Fell managed timber', 'Saw and stack planks', 'Deliver wood to the workshop'] : z.role === 'mine' ? ['Work the rock face', 'Sort ore and load carts', 'Deliver stone and ore to the forge'] : ['Water and tend crops', 'Harvest and load produce', 'Bring food to the dining hall'];
    const jobs = node('ol', 'work-steps'); work.forEach(text => jobs.append(node('li', '', text)));
    pad.append(node('span', 'field-label', 'THE CREW’S ROUTINE'), jobs, focusButton, toggle, home, node('p', 'demo-note', 'ANIMATED LOCAL DEMO · NO REAL RESOURCE ECONOMY'));
  }
  function inboxDrawer(z) {
    const pad = startDrawer(z); pad.append(node('p', '', z.description)); const focusButton = node('button', 'button full', '⛶ Visit the post office & court'); focusButton.onclick = () => focus(z); pad.append(focusButton);
    const cards = [{ key: 'lead', title: 'Girard · update a prospect', body: 'Acme Enerji plant capacity: 800 → 1,200 kWp. Source reviewed; your decision is next.' }, { key: 'report', title: 'Gazeteci · publish the weekly digest', body: 'Six sources have been gathered. Review the draft before it joins the village archive.' }];
    cards.forEach(item => {
      const key = z.village + '-' + item.key, card = node('div', 'inbox-card'); card.append(node('h3', '', item.title), node('p', '', item.body));
      if (decisions[key]) card.append(node('span', 'decision', decisions[key] + ' · local demo'));
      else { const actions = node('div', 'actions'); for (const action of ['Approve', 'Reject']) { const b = node('button', 'button small' + (action === 'Approve' ? ' primary' : ''), action); b.onclick = () => { decisions[key] = action === 'Approve' ? 'Approved' : 'Rejected'; if (item.key === 'lead') states[z.village + '-girard'] = action === 'Approve' ? 'working' : 'idle'; if (item.key === 'report') states[z.village + '-gazeteci'] = 'working'; actions.replaceWith(node('span', 'decision', decisions[key] + ' · local demo')); selection(); say(item.title + ' ' + decisions[key].toLowerCase() + ' locally.'); }; actions.append(b); } card.append(actions); }
      pad.append(card);
    });
    pad.append(node('p', 'demo-note', 'SAMPLE DECISIONS · NO EXTERNAL CHANGES'));
  }
  function placeModal(z) {
    $('#place-dialog').classList.remove('arena-modal', 'verdict'); $('#drawer').hidden = true; $('#place-kicker').textContent = villageName(z.village).toUpperCase() + ' / ' + (z.role === 'hospital' ? 'HEALTH' : 'THE HEART OF THE VILLAGE'); $('#place-title').textContent = z.agent;
    const host = $('#place-content'); host.replaceChildren(art(z, 'feature-art'), node('p', 'subtle', z.description));
    if (z.role === 'hospital') {
      const metrics = node('div', 'metric-grid'); for (const [n, l] of [['4/4', 'systems available'], ['124 ms', 'sample response'], ['0', 'critical alerts']]) { const m = node('div', 'metric'); m.append(node('strong', '', n), node('small', '', l)); metrics.append(m); } host.append(metrics);
      for (const [label, status] of [['Village gateway', 'Healthy'], ['Document archive', 'Healthy'], ['Job queue', '2 sample jobs'], ['Model connection', 'Demo mode']]) { const row = node('div', 'health-row'); row.append(node('span', 'health-dot'), node('span', '', label), node('span', '', status)); host.append(row); }
      const check = node('button', 'button full', 'Run local diagnostic preview'); check.onclick = () => { check.textContent = '✓ Sample checks complete'; host.querySelector('.demo-note').textContent = 'Local preview completed at ' + new Date().toLocaleTimeString() + '. No servers were contacted.'; }; host.append(check, node('p', 'demo-note', 'ILLUSTRATIVE HEALTH DATA · NO LIVE MONITORING'));
    } else {
      const metrics = node('div', 'metric-grid'); for (const [n, l] of [['8', 'agent districts'], ['5', 'village landmarks'], ['1', 'bridge to a neighbour']]) { const m = node('div', 'metric'); m.append(node('strong', '', n), node('small', '', l)); metrics.append(m); }
      host.append(metrics, node('p', 'notice', 'The village is your navigation. The post office and court (' + (z.village === 'gktc' ? 'GGI' : 'DGI') + ') handle your Inbox. Head north for Command Grounds, the Grand Library and Healing Gardens. To the south, Köle crews work the lumberyard, mine and farm.'));
      const actions = node('div', 'castle-actions'); for (const [title, fn] of [['Explore this village', () => fitVillage(z.village)], ['Cross to the other village', () => fitVillage(z.village === 'gktc' ? 'daghan' : 'gktc')]]) { const b = node('button', 'button', title); b.onclick = () => { $('#place-dialog').close(); fn(); }; actions.append(b); }
      const kit = node('button', 'button', 'Meet the agents'); kit.onclick = buildingKit; actions.append(kit); host.append(actions);
    }
    if (!$('#place-dialog').open) $('#place-dialog').showModal();
  }

  /* ---------- Colosseum ---------- */
  let arenaCam = null, lastPhase = null, lastHp = null, mapPainted = false;
  // A CSS pixel die: nine pip cells, lit per face.
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const dieNode = () => { const d = node('span', 'die'); for (let i = 0; i < 9; i++) d.append(node('i')); return d; };
  const setDie = (d, face, rolling) => { if (d.dataset.face === String(face) && d.classList.contains('rolling') === rolling) return; d.dataset.face = face; d.classList.toggle('rolling', rolling); [...d.children].forEach((p, i) => p.classList.toggle('on', PIPS[face].includes(i))); };
  function arenaModal(z) {
    $('#drawer').hidden = true; $('#place-dialog').classList.add('arena-modal'); $('#place-dialog').classList.remove('verdict'); $('#place-kicker').textContent = 'WESTERN WOODS / THE COLOSSEUM'; $('#place-title').textContent = 'The founders duel. The dice decide.';
    const host = $('#place-content'); host.replaceChildren(); arenaCam = null;
    const stage = node('div', 'arena-stage'); const view = node('canvas', 'arena-view'); view.id = 'arena-view'; view.width = 960; view.height = 540; view.setAttribute('aria-label', 'Animated duel between GKTC and Daghan in the Colosseum');
    const stamp = node('div', 'verdict-stamp'); stamp.id = 'verdict-stamp'; stamp.hidden = true; stage.append(view, stamp); host.append(stage);
    const fighters = node('div', 'arena-fighters'); Colosseum.fighters.forEach((f, i) => { const card = node('div', 'fighter-card'); card.style.setProperty('--fighter-color', f.color); const head = node('div', 'fighter-head'), name = node('div'); name.append(node('strong', '', f.name), node('small', '', f.style)); const dice = node('div', 'fighter-dice'); dice.id = 'fighter-dice-' + i; dice.setAttribute('aria-hidden', 'true'); dice.append(dieNode(), dieNode(), node('b', 'dice-total', '')); head.append(name, dice); card.append(head); const bar = node('div', 'hp-bar'); bar.setAttribute('role', 'meter'); bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', '100'); bar.setAttribute('aria-label', f.name + ' health'); bar.id = 'fighter-hp-' + i; bar.append(node('span', 'hp-lag'), node('span', 'hp-fill')); card.append(bar, node('span', 'fighter-hp', '100 / 100')); fighters.append(card); }); host.append(fighters);
    const turn = node('p', 'arena-turn'); turn.id = 'arena-turn'; host.append(turn);
    const status = node('p', 'arena-status'); status.id = 'arena-status'; status.setAttribute('role', 'status'); host.append(status);
    const actions = node('div', 'arena-actions'), start = node('button', 'button primary', 'Start the bout'), pause = node('button', 'button', 'Pause fight'), speed = node('button', 'button', '2× speed'); start.id = 'arena-start'; pause.id = 'arena-pause'; speed.id = 'arena-speed';
    start.onclick = () => { Colosseum.start(elapsed); $('#verdict-stamp').hidden = true; renderArena(); pause.focus(); }; pause.onclick = () => { paused = !paused; motion(); renderArena(); };
    speed.onclick = () => { Colosseum.setSpeed(Colosseum.speed > 1 ? 1 : 2, elapsed); say('Fight speed ' + Colosseum.speed + '×.'); renderArena(); }; actions.append(start, pause, speed); host.append(actions);
    const verdict = node('section', 'arena-verdict'); verdict.id = 'arena-verdict'; verdict.hidden = true; verdict.append(node('span', 'eyebrow', 'YOUR VERDICT'), node('h2', ''));
    const votes = node('div', 'arena-votes');
    for (const [choice, label] of [['spare', 'Spare them'], ['kill', 'Finish them!']]) { const b = node('button', 'button vote ' + (choice === 'spare' ? 'primary' : 'condemn')); b.dataset.vote = choice; b.append(node('span', 'thumb ' + choice, ''), document.createTextNode(label)); b.onclick = () => { if (Colosseum.vote(choice, elapsed)) { say('Your verdict: ' + (choice === 'spare' ? 'spared.' : 'finish them.')); showStamp(choice); renderArena(); start.focus(); } }; votes.append(b); }
    verdict.append(votes); host.append(verdict, node('p', 'demo-note', 'LOCAL ARENA DEMO · 2D6 EACH PER TURN · ONE DECIDING VOTE PER BOUT'));
    if (!$('#place-dialog').open) $('#place-dialog').showModal(); renderArena();
  }
  function showStamp(choice) { const s = $('#verdict-stamp'); if (!s) return; s.className = 'verdict-stamp ' + choice; s.textContent = choice === 'spare' ? 'MERCY' : 'FINISHER!'; s.hidden = false; s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; }
  function renderArena() {
    const view = $('#arena-view'); if (!view || !$('#place-dialog').open) return;
    const a = zone('commons-colosseum'), sc = Colosseum.scene(elapsed), target = ZoneDesigns.colosseum.camera(sc);
    // Ease the close-up camera toward its target for smooth, cinematic framing.
    if (!arenaCam) arenaCam = { ...target };
    const e = paused ? 0 : .12; arenaCam.x += (target.x - arenaCam.x) * e; arenaCam.y += (target.y - arenaCam.y) * e; arenaCam.w += (target.w - arenaCam.w) * e * 1.4;
    const shake = paused ? 0 : (sc.shake || 0), sx = Math.round(Math.sin(elapsed * 97) * shake), sy = Math.round(Math.cos(elapsed * 83) * shake * .6);
    world.renderView(view, elapsed, { cx: a.x + arenaCam.x + sx, cy: a.y + arenaCam.y + sy, w: arenaCam.w, states });
    const winner = sc.fighters[sc.winner].name, loser = sc.fighters[sc.loser].name, tr = sc.turn;
    for (let i = 0; i < 2; i++) {
      const bar = $('#fighter-hp-' + i); bar.style.setProperty('--hp', sc.hp[i] + '%'); bar.setAttribute('aria-valuenow', sc.hp[i]); bar.classList.toggle('hurt', !!lastHp && sc.hp[i] < lastHp[i]); bar.nextElementSibling.textContent = sc.hp[i] + ' / 100';
      const dice = $('#fighter-dice-' + i); dice.hidden = !tr; if (!tr) continue;
      dice.querySelectorAll('.die').forEach((d, j) => setDie(d, tr.shown[i][j], !tr.landed));
      const total = dice.querySelector('.dice-total'), txt = tr.landed ? (i ? tr.totals[i] + ' =' : '= ' + tr.totals[i]) : ''; if (total.textContent !== txt) total.textContent = txt;
      dice.classList.toggle('win', tr.landed && tr.by === i); dice.classList.toggle('tie', tr.landed && tr.by < 0);
    }
    lastHp = sc.hp;
    const tt = tr ? tr.text : sc.phase === 'ready' ? 'Each turn both founders roll two dice. The higher total attacks; doubles unleash a signature move.' : '';
    if ($('#arena-turn').textContent !== tt) $('#arena-turn').textContent = tt;
    const text = sc.phase === 'ready' ? 'GKTC and Daghan wait at the gates. Start a bout to watch them clash.' : sc.phase === 'fighting' ? (paused ? 'The fight is paused. Resume when you’re ready.' : 'Bout ' + sc.bout + ' · ' + sc.remaining + 's' + (sc.speed > 1 ? ' at 2×' : '') + ' · The crowd roars with every blow.') : sc.phase === 'verdict' ? winner + ' wins and mocks ' + loser + ', who kneels, dizzy, awaiting your verdict.' : sc.outcome === 'spare' ? 'Mercy! ' + winner + ' helps ' + loser + ' up. Both bow, and the crowd showers the sand with petals.' : 'The thumb turns down. ' + winner + ' unleashes a finisher, then stands over the knocked-out ' + loser + ' and flips the finger.';
    if ($('#arena-status').textContent !== text) $('#arena-status').textContent = text;
    const start = $('#arena-start'); start.hidden = sc.phase === 'fighting' || sc.phase === 'verdict'; start.textContent = sc.phase === 'resolved' ? 'Start the next bout' : 'Start the bout';
    const pause = $('#arena-pause'); pause.hidden = sc.phase !== 'fighting' && !paused; pause.textContent = paused ? 'Resume animations' : 'Pause fight';
    const speed = $('#arena-speed'), st = sc.speed > 1 ? '1× speed' : '2× speed'; if (speed.textContent !== st) speed.textContent = st; speed.setAttribute('aria-pressed', String(sc.speed > 1));
    const vd = $('#arena-verdict'); if (vd.hidden !== (sc.phase !== 'verdict')) { vd.hidden = sc.phase !== 'verdict'; if (!vd.hidden) vd.classList.add('enter'); } $('#place-dialog').classList.toggle('verdict', sc.phase === 'verdict');
    $('#arena-verdict h2').textContent = 'What is ' + loser + '’s fate?';
    lastPhase = sc.phase;
  }

  function buildingKit() {
    $('#place-dialog').classList.remove('arena-modal', 'verdict'); $('#place-kicker').textContent = 'ORIGINAL PIXEL ART'; $('#place-title').textContent = 'Meet the agents';
    const host = $('#place-content'); host.replaceChildren(node('p', 'subtle', 'Eight leads, each with a work cycle and five readable states. Click one to visit their district.'));
    const legend = node('div', 'state-legend'); Object.entries(stateInfo).forEach(([k, v]) => { const s = node('span', 'state-chip static'); s.dataset.state = k; s.append(node('span', 'state-icon', v.icon), document.createTextNode(v.label)); legend.append(s); }); host.append(legend);
    const roster = node('div', 'character-grid');
    world.zones.filter(z => z.village === 'gktc' && z.kind === 'agent').forEach(z => { const card = node('button', 'character-card'), c = node('canvas', 'portrait'); c.width = 150; c.height = 210; c.dataset.role = z.role; c.dataset.state = 'working'; card.append(c, node('strong', '', z.agent), node('small', '', AgentCharacters.profiles[z.role].title)); card.onclick = () => { $('#place-dialog').close(); selectedId = z.id; agentDrawer(z); selection(); focus(z); }; roster.append(card); });
    host.append(roster, node('h2', 'kit-heading', 'Places & environments'));
    const grid = node('div', 'kit-grid'); world.zones.filter(z => z.village === 'gktc' || z.village === 'commons').forEach(z => { const card = node('button', 'kit-card'); const c = art(z, 'kit-art'); card.append(c, node('strong', '', z.agent), node('small', '', z.name)); card.onclick = () => { $('#place-dialog').close(); selectedId = z.id; selection(); focus(z); }; grid.append(card); }); host.append(grid);
  }
  function atlasResults() {
    const query = $('#place-search').value.trim().toLocaleLowerCase(), host = $('#atlas-results'); host.replaceChildren();
    for (const kind of ['place', 'agent', 'resource', 'arena']) {
      const items = world.zones.filter(z => (z.village === atlasVillage || z.village === 'commons') && z.kind === kind && (z.agent + ' ' + z.name + ' ' + z.description).toLocaleLowerCase().includes(query)); if (!items.length) continue;
      host.append(node('h2', 'atlas-group-title', kind === 'arena' ? 'WESTERN WOODS' : kind === 'place' ? 'CIVIC GROUNDS & LANDMARKS' : kind === 'resource' ? 'SOUTHERN WORKING LANDS' : 'AGENT DISTRICTS'));
      items.forEach(z => { const b = node('button', 'atlas-item'); const text = node('span'); text.append(node('strong', '', z.agent), node('small', '', z.name)); const right = node('span', '', z.action === 'page' ? 'OPEN PAGE ↗' : z.kind === 'agent' ? info(z).label.toUpperCase() + ' · VISIT →' : 'OPEN →'); b.append(text, right); b.onclick = () => { $('#atlas-dialog').close(); if (z.action !== 'page') focus(z); visit(z, b); }; host.append(b); });
    }
    if (!host.children.length) host.append(node('p', 'subtle', 'No places found. Try an agent name, Inbox, Tasks, Documents or Health.'));
  }
  function openAtlas() { $('#place-search').value = ''; atlasResults(); $('#atlas-dialog').showModal(); $('#place-search').focus(); }
  function saveCamera() { try { sessionStorage.setItem('brownie-atlas-return-v2', JSON.stringify({ camera, viewMode, selectedId, paused, states })); } catch { } }
  function restoreCamera() {
    if (!new URLSearchParams(location.search).has('return')) return;
    try { const saved = JSON.parse(sessionStorage.getItem('brownie-atlas-return-v2')); if (saved?.camera && Number.isFinite(saved.camera.scale) && saved.camera.scale > 0) { camera = saved.camera; viewMode = 'custom'; selectedId = saved.selectedId; Object.assign(states, saved.states || {}); paused = matchMedia('(prefers-reduced-motion: reduce)').matches || !!saved.paused; clampCamera(); positionLabels(); selection(); hideWelcome(); } } catch { }
    history.replaceState(null, '', location.pathname);
  }

  /* ---------- Minimap ---------- */
  const mini = $('#minimap'), miniCtx = mini.getContext('2d'), MW = 260, MH = Math.round(MW * world.height / world.width); mini.width = MW; mini.height = MH;
  function drawMini() {
    if ($('#minimap-wrap').hidden) return; miniCtx.clearRect(0, 0, MW, MH); miniCtx.drawImage(world.minimapCanvas(MW), 0, 0);
    const sx = MW / world.width, sy = MH / world.height;
    for (const z of world.zones) { if (z.kind !== 'agent' && z.kind !== 'resource') continue; const s = state(z); miniCtx.fillStyle = Pixel.C[s]; const blink = (s === 'error' || s === 'waiting') && Math.floor(elapsed * 3) % 2; miniCtx.fillRect(Math.round(z.x * sx) - (blink ? 3 : 2), Math.round(z.y * sy) - (blink ? 3 : 2), blink ? 6 : 4, blink ? 6 : 4); }
    miniCtx.strokeStyle = '#fff5c4'; miniCtx.lineWidth = 1.5; miniCtx.fillStyle = '#fff6d522';
    const x = -camera.x / camera.scale * sx, y = -camera.y / camera.scale * sy, w = width / camera.scale * sx, h = height / camera.scale * sy; miniCtx.fillRect(x, y, w, h); miniCtx.strokeRect(x, y, w, h);
  }
  mini.onclick = e => { const r = mini.getBoundingClientRect(); viewMode = 'custom'; center((e.clientX - r.left) / r.width * world.width, (e.clientY - r.top) / r.height * world.height, Math.max(1, camera.scale)); hideWelcome(); };
  mini.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fit(); } };

  /* ---------- Input ---------- */
  const pointers = new Map(); let gesture = null, pinch = null;
  const toWorld = e => { const r = viewport.getBoundingClientRect(); return [(e.clientX - r.left - camera.x) / camera.scale, (e.clientY - r.top - camera.y) / camera.scale]; };
  // Avatars can be picked up and dropped anywhere; the district lead then walks over to meet them.
  function carry(e) {
    const av = Avatars.hit(...toWorld(e)); if (!av) return false;
    viewport.focus({ preventScroll: true }); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); viewport.setPointerCapture(e.pointerId);
    gesture = { avatar: av, id: e.pointerId }; Avatars.pick(av, ...toWorld(e)); viewport.classList.add('carrying'); hideWelcome(); return true;
  }
  function dropAvatar() {
    const av = gesture.avatar, z = Avatars.drop(av, elapsed); viewport.classList.remove('carrying');
    say(av.title + '’s avatar is now ' + (z ? 'in ' + z.agent + (z.kind === 'agent' ? '. ' + z.agent + ' walks over to talk.' : '.') : 'on the open map.'));
  }
  viewport.addEventListener('pointermove', e => { if (pointers.size) return; viewport.classList.toggle('can-carry', !!Avatars.hit(...toWorld(e))); });
  viewport.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; if (gesture?.avatar) return; if (!pointers.size && carry(e)) return; viewport.focus({ preventScroll: true }); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); viewport.setPointerCapture(e.pointerId); gesture = { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false }; if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } viewport.classList.add('dragging'); });
  viewport.addEventListener('pointermove', e => { if (!pointers.has(e.pointerId)) return; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (gesture?.avatar) { Avatars.move(gesture.avatar, ...toWorld(e)); return; } if (pointers.size === 2) { const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) zoom(d / pinch, (a.x + b.x) / 2, (a.y + b.y) / 2); pinch = d; gesture.moved = true; return; } if (!gesture) return; camera.x += e.clientX - gesture.x; camera.y += e.clientY - gesture.y; if (Math.hypot(e.clientX - gesture.startX, e.clientY - gesture.startY) > 4) gesture.moved = true; gesture.x = e.clientX; gesture.y = e.clientY; viewMode = 'custom'; clampCamera(); positionLabels(); hideWelcome(); });
  function end(e) { if (!pointers.has(e.pointerId)) return; if (gesture?.avatar) { pointers.delete(e.pointerId); dropAvatar(); gesture = null; return; } const wasPinch = !!pinch; pointers.delete(e.pointerId); if (gesture && !gesture.moved && !wasPinch && e.type === 'pointerup') { const r = viewport.getBoundingClientRect(), x = (e.clientX - r.left - camera.x) / camera.scale, y = (e.clientY - r.top - camera.y) / camera.scale, z = world.hitTest(x, y); if (z) visit(z, viewport); } if (pointers.size === 1) { const p = [...pointers.values()][0]; gesture = { x: p.x, y: p.y, startX: p.x, startY: p.y, moved: true }; } else gesture = null; pinch = null; if (!pointers.size) viewport.classList.remove('dragging'); }
  viewport.addEventListener('pointerup', end); viewport.addEventListener('pointercancel', end);
  viewport.addEventListener('wheel', e => { e.preventDefault(); const r = viewport.getBoundingClientRect(); zoom(Math.exp(-e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top); hideWelcome(); }, { passive: false });
  viewport.addEventListener('keydown', e => { if (e.target !== viewport) return; const dirs = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] }; if (dirs[e.key]) { e.preventDefault(); camera.x += dirs[e.key][0]; camera.y += dirs[e.key][1]; viewMode = 'custom'; clampCamera(); positionLabels(); hideWelcome(); } else if (['+', '=', '-', '0', 'Home'].includes(e.key)) { e.preventDefault(); if (e.key === '0' || e.key === 'Home') fit(); else zoom(e.key === '-' ? .8 : 1.25); } });
  $('#zoom-in').onclick = () => zoom(1.25); $('#zoom-out').onclick = () => zoom(.8); $('#fit-map').onclick = fit; $('#home-view').onclick = () => fitVillage('gktc'); $('#drawer-close').onclick = closeDrawer; $('#welcome-close').onclick = hideWelcome;
  $('#labels-toggle').onclick = () => { labels = !labels; $('#map-labels').hidden = !labels; $('#labels-toggle').setAttribute('aria-pressed', String(labels)); };
  function motion() { document.body.classList.toggle('motion-paused', paused); const b = $('#motion-toggle'); b.textContent = paused ? '▶' : 'Ⅱ'; b.setAttribute('aria-pressed', String(paused)); b.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations'); b.title = paused ? 'Resume animations' : 'Pause animations'; }
  $('#motion-toggle').onclick = () => { paused = !paused; motion(); }; matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { paused = e.matches; motion(); });
  $('#minimap-toggle').onclick = () => { const wrap = $('#minimap-wrap'); wrap.hidden = !wrap.hidden; $('#minimap-toggle').setAttribute('aria-expanded', String(!wrap.hidden)); $('#mini-toggle-icon').textContent = wrap.hidden ? '+' : '−'; };
  $('#atlas-open').onclick = openAtlas; $('#place-search').oninput = atlasResults; document.querySelectorAll('[data-village]').forEach(b => b.onclick = () => { atlasVillage = b.dataset.village; document.querySelectorAll('[data-village]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); atlasResults(); });
  $('#help-open').onclick = () => $('#help-dialog').showModal(); document.querySelectorAll('[data-close-dialog]').forEach(b => b.onclick = () => b.closest('dialog').close());
  document.addEventListener('keydown', e => { if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.target.closest('input,textarea,select,dialog')) { e.preventDefault(); openAtlas(); } if (e.key === 'Escape' && !document.querySelector('dialog[open]')) closeDrawer(); });

  /* ---------- Frame loop (capped at 30 fps, stops when hidden) ---------- */
  function frame(now) { requestAnimationFrame(frame); if (document.hidden || now - lastFrame < 32) return; const dt = lastTime ? Math.min((now - lastTime) / 1000, .1) : 0; lastTime = now; lastFrame = now; if (!paused) elapsed += dt; paint(); }
  function paint() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    // The map behind an open dialog stays frozen, so only the dialog's view is animated.
    if (!document.querySelector('dialog[open]') || !mapPainted) { world.render(ctx, elapsed, { camera, width, height, dpr, states, selectedId }); mapPainted = true; }
    drawMini(); renderArena();
    if (!$('#drawer').hidden && selectedId) { const z = zone(selectedId), c = $('#drawer-content canvas.drawer-art'); if (c && z) crop(c, z); }
    for (const p of document.querySelectorAll('canvas.portrait')) { const z = world.zones.find(q => q.role === p.dataset.role && q.village === (zone(selectedId)?.village || 'gktc')); AgentCharacters.portrait(p, p.dataset.role, p.dataset.state || (z ? state(z) : 'working'), elapsed); }
  }
  buildLabels(); selection(); resize(); restoreCamera(); motion(); new ResizeObserver(resize).observe(viewport); requestAnimationFrame(frame);
  window.addEventListener('pagehide', saveCamera);
  // Test hooks for screenshots: ?open=<zone id>&fight=<s>&seed=<n, default 1>&speed=1|2&vote=spare|kill&after=<s>&state=<state>
  (() => {
    const q = new URLSearchParams(location.search); if (q.has('avatar')) { const [id, zid, ago] = q.get('avatar').split(','); Avatars.visit(id, zid, +q.get('t') || 0, +ago || 8); } if (q.has('cam')) { const [x, y, sc] = q.get('cam').split(',').map(Number); center(x, y, sc); viewMode = 'custom'; hideWelcome(); if (q.has('t')) elapsed = +q.get('t'); paused = true; motion(); paint(); } if (!q.has('open')) return;
    const id = q.get('open'); if (q.has('state')) states[id] = q.get('state');
    if (q.has('fight')) { const sp = +q.get('speed') || 1; Colosseum.setSpeed(sp, 0); Colosseum.start(0, q.has('seed') ? +q.get('seed') : 1); elapsed = +q.get('fight'); if (q.has('vote')) { const d = Colosseum.snapshot(0).duration / sp; Colosseum.snapshot(d + .5); Colosseum.vote(q.get('vote'), d + .5); elapsed = d + .5 + (+q.get('after') || 0); } }
    visit(zone(id)); if (q.get('focus')) focus(zone(id)); paused = true; motion(); arenaCam = null; paint(); if (q.has('vote')) showStamp(q.get('vote'));
  })();
  if (new URLSearchParams(location.search).has('bench')) (() => {
    const out = [], run = (name, fn) => { fn(); paint(); const t0 = performance.now(); for (let i = 0; i < 20; i++) { elapsed += 1 / 30; paint(); } out.push(name + ' ' + ((performance.now() - t0) / 20).toFixed(1) + 'ms'); };
    const b0 = performance.now(); world.ready(); out.push('bake ' + (performance.now() - b0).toFixed(0) + 'ms');
    // Bench points follow the layout: castle, the first district and the arena (the map has a forest margin).
    const at = id => [zone(id).x, zone(id).y];
    run('village', () => fitVillage('gktc')); run('fit', fit); run('zoom2', () => center(...at('gktc-castle'), 2)); run('zoom4', () => center(...at('gktc-sekreter'), 4)); run('arena', () => center(...at('commons-colosseum'), 1.5));
    if (world.energy) run('energy', () => center(world.energy.x, world.energy.y, 2));
    document.title = 'BENCH ' + out.join(' | ') + ' | zoneErrors=' + world.zones.filter(z => z._err).map(z => z.id).join(',');
  })();
  window.__atlas = { focus: id => { const z = zone(id); selectedId = id; selection(); focus(z); }, visit: id => visit(zone(id)), states, setTime: t => { elapsed = t; paint(); }, center, fit, fitVillage, pause: v => { paused = v; motion(); } };
})();
