/* "Is it covered?" · checks a film or series against the MPLC rights-holder list
   MPLC sent Cosmos Yoga (assets/mplc-rights-holders.json) using Wikidata for the
   film's producers and distributors. Internal tool for the Cosmos team. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const WD = 'https://www.wikidata.org/w/api.php';
  const FILM_CLASSES = ['Q11424', 'Q5398426', 'Q506240', 'Q93204', 'Q202866', 'Q24862', 'Q1259759', 'Q581714', 'Q1261214', 'Q20650540', 'Q29168811', 'Q24869', 'Q63952888', 'Q229390', 'Q226730'];
  const TODAY = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

  // Wikidata labels that mean a company NOT on the Cosmos list (so we can say why).
  const KNOWN_OUT = [
    { re: /^(sony pictures|columbia|tristar|screen gems|columbia tristar)/i, note: 'Sony/Columbia/TriStar/Screen Gems are on MPLC’s general list but NOT on the list MPLC sent Cosmos (Clubs and Leisure Centers). Ask MPLC before assuming coverage.' },
    { re: /^netflix/i, note: 'Netflix originals are not covered by MPLC.' },
    { re: /^(amazon|prime video|mgm\+)/i, note: 'Amazon originals are not covered (only the old MGM library is).' },
    { re: /^apple/i, note: 'Apple TV+ originals are not covered by MPLC.' },
    { re: /^(hbo|max\b|warner bros\. discovery)/i, note: 'HBO is not on the list (Warner Bros. Pictures is).' },
    { re: /^(hulu|disney\+)/i, note: 'Disney+/Hulu originals: only the programs on MPLC’s “available originals” page are covered.' },
    { re: /^(janus films|the criterion collection|criterion)/i, note: 'Janus Films / Criterion are not on the list (the “Janus TV GmbH” entry is a different German company).' },
    { re: /^(kino lorber|ifc films|bleecker street|music box films|oscilloscope|film movement|gkids|shout! factory|mubi|utopia|drafthouse)/i, note: 'This distributor is not on the Cosmos list; book it title-by-title or pick another film.' },
  ];
  // Streaming outlets: where a film is streamed says nothing about who owns it. Shown, but not counted.
  const STREAMING = /^(netflix|hulu|disney\+|hbo max|max|prime video|amazon prime video|apple tv\+|peacock|paramount\+|tubi|the roku channel|mubi)$/i;
  // Verified public-domain titles (no license needed). Add only titles checked carefully.
  const PUBLIC_DOMAIN = new Set(['Q623051' /* Night of the Living Dead 1968 */, 'Q151895' /* Nosferatu 1922 */]);
  // Wikidata label → list entry name, for names the plain matcher misses.
  const ALIASES = {
    'warner bros.': 'Warner Bros. Pictures', 'warner bros. entertainment': 'Warner Bros. Pictures', 'warner bros': 'Warner Bros. Pictures',
    'warner home video': 'Warner Bros. Pictures', 'warner bros. home entertainment': 'Warner Bros. Pictures', 'warner bros. discovery': null,
    'neon': 'NEON Rated LLC', 'lions gate films': 'Lionsgate Entertainment', 'lions gate entertainment': 'Lionsgate Entertainment', 'lionsgate films': 'Lionsgate Entertainment',
    'walt disney studios motion pictures': 'Walt Disney Pictures', 'buena vista pictures distribution': 'Buena Vista Pictures', 'buena vista international': 'Buena Vista Pictures',
    'buena vista distribution': 'Buena Vista Pictures', 'walt disney studios': 'Walt Disney Pictures',
    'universal studios': 'Universal Pictures', 'universal pictures home entertainment': 'Universal Pictures',
    '20th century fox': '20th Century Studios (fka Twentieth Century Fox Film Corp.)', 'twentieth century fox': '20th Century Studios (fka Twentieth Century Fox Film Corp.)',
    '20th century fox home entertainment': '20th Century Studios (fka Twentieth Century Fox Film Corp.)',
    'fox searchlight pictures': 'Searchlight Pictures (fka Fox Searchlight Pictures)', 'fox searchlight': 'Searchlight Pictures (fka Fox Searchlight Pictures)',
    'metro-goldwyn-mayer': 'Metro-Goldwyn-Mayer (MGM) Studios', 'mgm': 'Metro-Goldwyn-Mayer (MGM) Studios', 'mgm/ua entertainment company': 'Metro-Goldwyn-Mayer (MGM) Studios',
    'mgm distribution co.': 'Metro-Goldwyn-Mayer (MGM) Studios', 'united artists': 'United Artists Pictures', 'united artists releasing': 'United Artists Pictures',
    'miramax films': 'Miramax Library', 'miramax': 'Miramax Library', 'dimension films': 'Miramax Library',
    'dreamworks pictures': 'Dreamworks Pictures (Library Titles)', 'dreamworks': 'Dreamworks Pictures (Library Titles)',
    'paramount pictures': 'Paramount Pictures', 'paramount': 'Paramount Pictures', 'paramount home entertainment': 'Paramount Pictures',
    'new line cinema': 'New Line Cinema', 'focus features': 'Focus Features', 'a24': 'A24', 'orion pictures': 'Orion Pictures',
    'summit entertainment': 'Summit Entertainment', 'the weinstein company': 'The Weinstein Company', 'stx entertainment': 'STX (Lionsgate) Library', 'stxfilms': 'STX (Lionsgate) Library',
    'touchstone pictures': 'Touchstone Pictures', 'hollywood pictures': 'Hollywood Pictures', 'marvel studios': 'Marvel Studios', 'pixar': 'Pixar Animation Studios', 'lucasfilm': 'Lucasfilm Ltd.',
    'walt disney animation studios': 'Walt Disney Animation Studios', 'studiocanal': 'StudioCanal S.A.', 'magnolia pictures': 'Magnolia Pictures LLC', 'roadside attractions': 'Roadside Attractions',
    'castle rock entertainment': 'Castle Rock Entertainment', 'fine line features': 'Fine Line Features', 'picturehouse': 'Picturehouse (pre-2008 Library pictures)',
    'polygram filmed entertainment': 'Polygram Filmed Entertainment (Library titles)', 'artisan entertainment': 'Artisan Entertainment', 'vestron pictures': 'Vestron Pictures',
    'cannon films': 'Cannon Pictures', 'cannon group': 'Cannon Pictures', 'rko radio pictures': 'RKO Pictures Library', 'rko pictures': 'RKO Pictures Library',
    'republic pictures': 'Republic Pictures', 'monogram pictures': 'Monogram Pictures Library', 'selznick international pictures': 'Selznick International Library',
    'lorimar television': 'Lorimar Telepictures', 'lorimar': 'Lorimar Telepictures', 'usa films': 'USA Films', 'gramercy pictures': 'Polygram Filmed Entertainment (Library titles)',
    'amblin entertainment': 'Storyteller Distribution Co., LLC c/o Amblin', 'amblin partners': 'Storyteller Distribution Co., LLC c/o Amblin',
    'sony pictures classics': 'Sony Pictures Classics', 'gravitas ventures': 'Gravitas Ventures', 'rlj entertainment': 'RLJ Entertainment', 'screen media films': 'Screen Media Ventures',
    'quiver distribution': 'Quiver Distribution', 'relativity media': 'Ultra V RML NL Assets, LLC (fka Relativity Media)', 'annapurna pictures': 'Annapurna Productions LLC',
    'spyglass entertainment': 'Spyglass Media Group c/o Lionsgate', 'spyglass media group': 'Spyglass Media Group c/o Lionsgate',
  };
  const GENERIC = new Set(('pictures picture entertainment studios studio films film inc llc ltd limited corporation corp co company ' +
    'productions production international media group distribution distributing releasing library the home video ' +
    'worldwide motion holdings gmbh sa sl srl llp plc ag bv nv ab spa as kg sas us usa america american of and').split(' '));

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ')
    .replace(/[’'".,:;!?()\[\]/\\\-–—+]/g, ' ').replace(/\s+/g, ' ').trim();
  const core = (s) => norm(s).split(' ').filter((t) => t && !GENERIC.has(t)).join(' ');
  const parenParts = (name) => { // "Searchlight Pictures (fka Fox Searchlight Pictures)" -> ["Searchlight Pictures", "Fox Searchlight Pictures"]
    const out = [name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()];
    for (const m of name.matchAll(/\(([^)]*)\)/g)) {
      const inner = m[1].replace(/^(fka|aka|dba|formerly|ex\.?)\s+/i, '').trim();
      if (inner && !/^(ex\.|pre-|library|all programs|\d{4})/i.test(inner) && !/^[A-Z]{2}(,|$)/.test(inner)) out.push(inner);
    }
    return out;
  };

  const ALIAS = new Map(Object.entries(ALIASES).map(([k, v]) => [norm(k), v]));
  let DATA = null, INDEX = null, ready = null;
  async function load() {
    const r = await fetch('assets/mplc-rights-holders.json?v=' + encodeURIComponent(document.documentElement.dataset.v || '1'));
    DATA = await r.json();
    INDEX = { exact: new Map(), core: new Map() };
    for (const h of DATA.holders) {
      for (const part of parenParts(h.name)) {
        const n = norm(part), c = core(part);
        if (n) (INDEX.exact.get(n) || INDEX.exact.set(n, []).get(n)).push(h);
        if (c) (INDEX.core.get(c) || INDEX.core.set(c, []).get(c)).push(h);
      }
    }
    $('#list-meta').textContent = `${DATA.holders.length.toLocaleString()} rights holders · list scope “${DATA.scope}” · received ${DATA.source.match(/\d{4}-\d{2}-\d{2}/)[0]}`;
    renderMoratorium();
  }

  // Match one company label against the list. Returns {level, holders, note}
  function matchCompany(label) {
    const n = norm(label);
    if (ALIAS.has(n)) {
      const target = ALIAS.get(n);
      if (target === null) return { level: 'none', holders: [] };
      const hs = DATA.holders.filter((h) => h.name === target);
      if (hs.length) return { level: 'exact', holders: hs };
    }
    if (INDEX.exact.has(n)) return { level: 'exact', holders: INDEX.exact.get(n) };
    const c = core(label);
    if (c && INDEX.core.has(c)) {
      const hs = INDEX.core.get(c);
      const strong = c.split(' ').length >= 2;
      return { level: strong ? 'strong' : 'weak', holders: hs };
    }
    const out = KNOWN_OUT.find((k) => k.re.test(label));
    return { level: 'none', holders: [], note: out && out.note };
  }

  function moratoriumHits(title, year) {
    const t = norm(title), hits = [];
    for (const m of DATA.moratorium) {
      let key = m.title;
      key = key.split(/\s[–-]\s/)[0].split(' & ')[0].replace(/\s*franchise.*$/i, '').replace(/\s*all programs.*$/i, '');
      const k = norm(key);
      if (!k || k.length < 4) continue;
      const same = t === k || (k.split(' ').length >= 2 && t.startsWith(k + ' '));
      if (!same) continue;
      if (m.year && year && m.year !== year) continue;
      let state = 'note';
      if (m.indefinite) state = 'active';
      else if (m.start && m.end) state = TODAY < m.start ? 'upcoming' : TODAY > m.end ? 'past' : 'active';
      hits.push({ ...m, state });
    }
    return hits;
  }

  async function wd(params) {
    const u = new URL(WD); u.search = new URLSearchParams({ format: 'json', origin: '*', ...params });
    const r = await fetch(u); if (!r.ok) throw new Error('Wikidata ' + r.status);
    const j = await r.json(); if (j.error) throw new Error('Wikidata: ' + (j.error.info || j.error.code)); return j;
  }
  async function searchTitles(q) {
    const cls = FILM_CLASSES.map((c) => 'P31=' + c).join('|');
    const srsearch = `${q} haswbstatement:${cls}`;
    const settled = await Promise.allSettled([
      wd({ action: 'query', list: 'search', srsearch, srlimit: 8, srsort: 'incoming_links_desc' }),
      wd({ action: 'query', list: 'search', srsearch, srlimit: 5 }),
    ]);
    const hits = settled.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value.query?.search || []);
    if (!hits.length && settled.every((r) => r.status === 'rejected')) throw settled[0].reason;
    const ids = [...new Set(hits.map((s) => s.title))].filter((id) => /^Q[1-9]\d*$/.test(id));
    if (!ids.length) return [];
    const e = await wd({ action: 'wbgetentities', ids: ids.join('|'), props: 'labels|descriptions|claims', languages: 'en' });
    const films = ids.map((id) => e.entities[id]).filter(Boolean).map(parseFilm);
    const nq = norm(q);
    return films.map((f, i) => [f, i]).sort((a, b) => (norm(b[0].label) === nq) - (norm(a[0].label) === nq) || a[1] - b[1]).map((x) => x[0]);
  }
  const claimIds = (c, p) => (c[p] || []).map((x) => x.mainsnak.datavalue && x.mainsnak.datavalue.value.id).filter(Boolean);
  function parseFilm(ent) {
    const c = ent.claims || {};
    const dates = (c.P577 || []).map((x) => x.mainsnak.datavalue && x.mainsnak.datavalue.value.time).filter(Boolean).sort();
    const year = dates.length ? parseInt(dates[0].slice(1, 5), 10) : null;
    const dists = (c.P750 || []).filter((x) => x.mainsnak.datavalue).map((x) => ({
      id: x.mainsnak.datavalue.value.id,
      countries: [...(x.qualifiers?.P17 || []), ...(x.qualifiers?.P291 || [])].map((q) => q.datavalue && q.datavalue.value.id).filter(Boolean),
    }));
    return {
      id: ent.id, label: ent.labels?.en?.value || ent.id, desc: ent.descriptions?.en?.value || '', year,
      producers: claimIds(c, 'P272'), distributors: dists, directors: claimIds(c, 'P57'), countries: claimIds(c, 'P495'),
      isSeries: claimIds(c, 'P31').some((q) => ['Q5398426', 'Q1259759', 'Q581714'].includes(q)),
    };
  }
  async function labelsFor(ids) {
    const uniq = [...new Set(ids)]; const out = {};
    for (let i = 0; i < uniq.length; i += 50) {
      const e = await wd({ action: 'wbgetentities', ids: uniq.slice(i, i + 50).join('|'), props: 'labels', languages: 'en' });
      for (const [id, ent] of Object.entries(e.entities)) out[id] = ent.labels?.en?.value || id;
    }
    return out;
  }

  // ---------- UI ----------
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const CAT = (k) => (DATA.categories[k] || k).replace(' & Affiliated Labels', '');

  let searchGen = 0, pickGen = 0;
  async function runTitle(q) {
    const gen = ++searchGen;
    const res = $('#title-results'); res.innerHTML = '<p class="muted">Searching Wikidata…</p>';
    try {
      await ready;
      const films = await searchTitles(q);
      if (gen !== searchGen) return;
      if (!films.length) { res.innerHTML = '<p class="muted">No film or series by that name on Wikidata. Try the exact title, or search the list by studio below.</p>'; return; }
      res.innerHTML = '<p class="muted small">Pick the one you mean:</p><div class="picks">' + films.map((f, i) =>
        `<button class="pick" data-i="${i}"><strong>${esc(f.label)}</strong>${f.year ? ` <span class="yr">${f.year}</span>` : ''}<br><span class="small">${esc(f.desc)}</span></button>`).join('') + '</div><div id="verdict"></div>';
      res.querySelectorAll('.pick').forEach((b) => b.addEventListener('click', () => { res.querySelectorAll('.pick').forEach((x) => x.classList.toggle('on', x === b)); showVerdict(films[+b.dataset.i]); }));
      const first = films[0]; res.querySelector('.pick').classList.add('on'); showVerdict(first);
    } catch (e) { res.innerHTML = `<p class="warn">Could not reach Wikidata (${esc(e.message)}). Try again in a moment.</p>`; }
  }

  async function showVerdict(f) {
    const gen = ++pickGen;
    const v = $('#verdict'); if (!v) return; v.innerHTML = '<p class="muted">Looking up studios…</p>';
    const ids = [...f.producers, ...f.distributors.map((d) => d.id), ...f.distributors.flatMap((d) => d.countries), ...f.directors];
    let L;
    try { L = await labelsFor(ids); } catch (e) { if (gen === pickGen) v.innerHTML = `<p class="warn">Could not reach Wikidata (${esc(e.message)}). Try again.</p>`; return; }
    if (gen !== pickGen) return;
    const rows = [];
    for (const d of f.distributors) rows.push({ role: 'Distributor', label: L[d.id], where: d.countries.map((c) => L[c]).join(', '), us: !d.countries.length || d.countries.includes('Q30'), m: matchCompany(L[d.id]) });
    for (const p of f.producers) rows.push({ role: 'Production co.', label: L[p], where: '', us: true, m: matchCompany(L[p]) });
    for (const r of rows) { if (!r.label || /^Q\d+$/.test(r.label)) r.skip = true; else if (r.role === 'Distributor' && STREAMING.test(r.label)) { r.streaming = true; r.role += ' (streaming outlet)'; } }
    const real = rows.filter((r) => !r.skip);
    const owners = real.filter((r) => !r.streaming);
    const good = owners.filter((r) => r.us && (r.m.level === 'exact' || r.m.level === 'strong'));
    const weak = owners.filter((r) => r.m.level === 'weak' || (!r.us && r.m.level !== 'none'));
    const notes = [...new Set((owners.length ? owners : real).map((r) => r.m.note).filter(Boolean))];
    const mora = moratoriumHits(f.label, f.year);
    const activeMora = mora.filter((m) => m.state === 'active' || m.state === 'note');

    let cls, head, body;
    const noted = activeMora.filter((m) => m.state === 'note'), blocked = activeMora.filter((m) => m.state === 'active');
    if (PUBLIC_DOMAIN.has(f.id)) { cls = 'yes'; head = 'Public domain'; body = 'This film is in the US public domain, so no license is needed and you may advertise the title freely. Check that the copy you show is the original edition, not a restored or re-scored release.'; }
    else if (blocked.length) { cls = 'no'; head = 'In moratorium right now'; body = `MPLC lists this title as temporarily unavailable: ${blocked.map((m) => esc(m.raw)).join('; ')}. Not covered until that lifts.`; }
    else if (noted.length) { cls = 'maybe'; head = 'Restriction noted'; body = `MPLC’s moratorium list has a note on this title: ${noted.map((m) => esc(m.raw)).join('; ')}. Read it before choosing a version.`; }
    else if (good.length) { cls = 'yes'; head = 'Rights holder on the list'; body = `${esc(good[0].label)} is a rights holder on the Cosmos list (${esc(CAT(good[0].m.holders[0].cat))}), so this title is likely covered by the Blanket License. Confirm the title with MPLC before you announce a date, and show it from a disc, a purchase or a rental you own (streaming services like Netflix forbid public showings in their own terms).`; }
    else if (weak.length) { cls = 'maybe'; head = 'Possible match, verify'; body = `A name on the list resembles ${esc(weak[0].label)} but is not clearly the same company. Email info@mplc.com with the title before announcing it.`; }
    else if (owners.length) { cls = 'no'; head = 'No listed studio found'; body = `None of this title’s studios (${owners.map((r) => esc(r.label)).join(', ')}) appear on the Cosmos list.${notes.length ? ' ' + notes.map(esc).join(' ') : ''}`; }
    else if (real.length) { cls = 'unknown'; head = 'Can’t tell'; body = `Wikidata only records streaming outlets (${real.map((r) => esc(r.label)).join(', ')}) for this title, which says nothing about who owns it.${notes.length ? ' ' + notes.map(esc).join(' ') : ''}`; }
    else { cls = 'unknown'; head = 'Can’t tell'; body = 'Wikidata has no producer or distributor recorded for this title. Search the list by studio below, or ask MPLC.'; }
    if (f.year && f.year <= 1930 && !PUBLIC_DOMAIN.has(f.id)) { cls = 'maybe'; head = 'Probably public domain'; body = `Films published in 1930 or earlier are in the US public domain and need no license, but verify the edition you would show (restorations and new scores can carry their own copyright). ${body}`; }
    const pastMora = mora.filter((m) => m.state === 'past' || m.state === 'upcoming');
    const moraLine = pastMora.map((m) => `<p class="small"><strong>Moratorium note:</strong> ${esc(m.raw)} (${m.state === 'past' ? 'that window has passed' : 'upcoming, plan around it'}).</p>`).join('');
    const dir = f.directors.map((d) => L[d]).filter(Boolean).join(', ');
    v.innerHTML = `
      <div class="verdict ${cls}">
        <p class="verdict-head">${head}</p>
        <h3>${esc(f.label)}${f.year ? ` (${f.year})` : ''}${f.isSeries ? ' · series' : ''}</h3>
        ${dir ? `<p class="small muted">Directed by ${esc(dir)}</p>` : ''}
        <p>${body}</p>${moraLine}
        ${real.length ? `<table class="evidence"><thead><tr><th>Role</th><th>Company (Wikidata)</th><th>On the Cosmos list?</th></tr></thead><tbody>` +
          real.map((r) => `<tr><td>${r.role}${r.where ? `<br><span class="small muted">${esc(r.where)}</span>` : ''}</td><td>${esc(r.label)}</td><td>${r.m.holders.length ? r.m.holders.map((h) => `<span class="tag ${r.m.level}">${esc(h.name)}</span> <span class="small muted">${esc(CAT(h.cat))}</span>`).join('<br>') : '<span class="tag none">no</span>'}</td></tr>`).join('') + '</tbody></table>' : ''}
        <p class="small muted">Being on the list means MPLC represents that company; individual titles can still drop off (MPLC’s terms, §6). When it matters, confirm the title with <a href="mailto:info@mplc.com">info@mplc.com</a>. Data: <a href="https://www.wikidata.org/wiki/${esc(f.id)}" target="_blank" rel="noopener">Wikidata ${esc(f.id)}</a>.</p>
      </div>`;
  }

  function runList(q) {
    const out = $('#list-results'); const n = norm(q);
    if (!n) { out.innerHTML = ''; return; }
    const hits = DATA.holders.filter((h) => norm(h.name).includes(n)).slice(0, 60);
    out.innerHTML = hits.length ? `<table class="evidence"><tbody>${hits.map((h) => `<tr><td>${esc(h.name)}</td><td class="small muted">${esc(CAT(h.cat))}</td></tr>`).join('')}</tbody></table>${hits.length === 60 ? '<p class="small muted">Showing the first 60. Type more.</p>' : ''}`
      : `<p class="muted">Nothing on the list matches “${esc(q)}”.</p>`;
  }

  function renderMoratorium() {
    $('#moratorium').innerHTML = '<ul>' + DATA.moratorium.map((m) => {
      const state = m.indefinite ? 'active' : m.start && m.end ? (TODAY < m.start ? 'upcoming' : TODAY > m.end ? 'past' : 'active') : 'note';
      return `<li class="mora-${state}">${esc(m.raw)}${state === 'past' ? ' <span class="small muted">(window passed)</span>' : state === 'upcoming' ? ' <span class="small muted">(upcoming)</span>' : ''}</li>`;
    }).join('') + '</ul>';
  }

  $('#title-form').addEventListener('submit', (e) => { e.preventDefault(); const q = $('#title-q').value.trim(); if (q) runTitle(q); });
  $('#list-q').addEventListener('input', (e) => { if (DATA) runList(e.target.value); });
  document.querySelectorAll('[data-try]').forEach((b) => b.addEventListener('click', () => { $('#title-q').value = b.dataset.try; runTitle(b.dataset.try); }));
  const controls = document.querySelectorAll('#title-q, #title-form button, #list-q, [data-try]');
  controls.forEach((c) => { c.disabled = true; });
  ready = load().then(() => controls.forEach((c) => { c.disabled = false; }))
    .catch((e) => { $('#list-meta').textContent = 'Could not load the rights-holder list: ' + e.message; throw e; });
})();
