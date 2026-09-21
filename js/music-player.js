/* ============================================================
   ladrefino101.com — music-player.js
   Self-hosted jukebox for music.html (data in js/music-data.js)
   - album rail + tracklist, transport, seek, volume
   - WebAudio spectrum visualizer (degrades gracefully)
   - deep links: music.html#<album-slug>
   ============================================================ */
(function () {
  'use strict';
  const ALBUMS = window.ALBUMS;
  if (!ALBUMS || !ALBUMS.length) return;

  /* ---------- elements ---------- */
  const rail       = document.getElementById('albumRail');
  const npArt      = document.getElementById('npArt');
  const npTitle    = document.getElementById('npTitle');
  const npSub      = document.getElementById('npSub');
  const tracklist  = document.getElementById('tracklist');
  const listHead   = document.getElementById('listHead');
  const bcLink     = document.getElementById('bcSupport');
  const btnPrev    = document.getElementById('btnPrev');
  const btnPlay    = document.getElementById('btnPlay');
  const btnNext    = document.getElementById('btnNext');
  const seekbar    = document.getElementById('seekbar');
  const tCur       = document.getElementById('tCur');
  const tTot       = document.getElementById('tTot');
  const vol        = document.getElementById('volume');
  const canvas     = document.getElementById('viz');

  const audio = new Audio();
  let ai = 0, ti = 0;              // album index, track index
  let seeking = false;

  /* ---------- helpers ---------- */
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  const album = () => ALBUMS[ai];

  /* ---------- render ---------- */
  function renderRail() {
    rail.innerHTML = '';
    ALBUMS.forEach((a, i) => {
      const b = document.createElement('button');
      b.className = 'rail-item' + (i === ai ? ' active' : '');
      b.title = a.title;
      b.innerHTML = `<img src="${a.art}" alt="" loading="lazy"><span><span class="t">${a.title}</span><br><span class="y">${a.year || ''} · ${a.tracks.length} tracks</span></span>`;
      b.addEventListener('click', () => selectAlbum(i, true));
      rail.appendChild(b);
    });
  }

  function renderTracks() {
    const a = album();
    listHead.textContent = `${a.title}${a.year ? ' · ' + a.year : ''}`;
    tracklist.innerHTML = '';
    a.tracks.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'track' + (i === ti ? ' playing' : '');
      li.innerHTML = `<span class="num">${String(i + 1).padStart(2, '0')}</span>
        <span class="tt">${t.title}</span>${t.bonus ? '<span class="bonus-badge">BONUS</span>' : ''}
        <a class="dl" href="${t.file}" download title="Download .mp3">⬇</a>
        <span class="dur">${fmt(t.dur)}</span>`;
      li.addEventListener('click', e => { if (!e.target.closest('.dl')) playTrack(i); });
      tracklist.appendChild(li);
    });
  }

  function renderNow() {
    const a = album(), t = a.tracks[ti];
    npArt.src = a.art;
    npTitle.textContent = a.title;
    npSub.textContent = `${t ? t.title : '—'}${t && t.bonus ? '  · bonus track' : ''}`;
    bcLink.href = a.bandcamp;
    if (t) document.title = `${t.title} — ${a.title} · ladrefino101`;
  }

  /* ---------- playback ---------- */
  function playTrack(i, autoplay) {
    ti = i;
    const t = album().tracks[ti];
    audio.src = t.file;
    renderTracks(); renderNow();
    audio.play().catch(() => {}); // ignore autoplay-policy rejects; user can hit ▶
  }

  function selectAlbum(i, autoplay) {
    ai = i; ti = 0;
    history.replaceState(null, '', '#' + ALBUMS[i].slug);
    renderRail(); renderTracks();
    if (autoplay !== false) playTrack(0); else renderNow();
  }

  function next() {
    const n = album().tracks.length;
    if (!n) return;
    playTrack((ti + 1) % n); // wraps — jukebox loops the album
  }
  function prev() {
    const t = audio.currentTime;
    if (t > 3) return audio.currentTime = 0;
    playTrack(Math.max(0, ti - 1));
  }

  btnPlay.addEventListener('click', () => {
    if (!audio.src) playTrack(ti);
    else audio.paused ? audio.play() : audio.pause();
  });
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  // auto-advance: wrap to album start (jukebox loops the album)
  audio.addEventListener('ended', () => {
    const a = album();
    if (ti + 1 < a.tracks.length) playTrack(ti + 1);
    else playTrack(0);
  });

  audio.addEventListener('play',  () => btnPlay.innerHTML = ICON_PAUSE);
  audio.addEventListener('pause', () => { if (!audio.ended) btnPlay.innerHTML = ICON_PLAY; });

  /* ---------- seek / volume ---------- */
  audio.addEventListener('loadedmetadata', () => { seekbar.max = audio.duration || 0; tTot.textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', () => {
    if (!seeking) seekbar.value = audio.currentTime || 0;
    tCur.textContent = fmt(audio.currentTime);
  });
  seekbar.addEventListener('input', () => { seeking = true; audio.currentTime = Number(seekbar.value); });
  seekbar.addEventListener('change', () => { seeking = false; });

  const savedVol = localStorage.getItem('lf101-vol');
  if (savedVol != null) vol.value = savedVol;
  audio.volume = vol.value / 100;
  vol.addEventListener('input', () => {
    audio.volume = vol.value / 100;
    localStorage.setItem('lf101-vol', vol.value);
  });

  /* ---------- icons ---------- */
  const ICON_PLAY  = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  btnPlay.innerHTML = ICON_PLAY;

  /* ---------- visualizer (WebAudio) ---------- */
  let actx = null, analyser = null, dataArr = null, vizOK = false;
  function setupViz() {
    if (vizOK || !canvas) return;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const srcNode = actx.createMediaElementSource(audio);
      analyser = actx.createAnalyser();
      analyser.fftSize = 128;
      dataArr = new Uint8Array(analyser.frequencyBinCount);
      srcNode.connect(analyser);
      analyser.connect(actx.destination);
      vizOK = true;
    } catch (e) { if (canvas) canvas.style.display = 'none'; }
  }
  btnPlay.addEventListener('click', () => { setupViz(); if (actx && actx.state === 'suspended') actx.resume(); });

  function draw() {
    requestAnimationFrame(draw);
    if (!vizOK || !canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (audio.paused || audio.ended) { drawIdle(ctx, W, H); return; }
    analyser.getByteFrequencyData(dataArr);
    const acc = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#5b8cff';
    const n = 40, bw = W / n;
    for (let i = 0; i < n; i++) {
      const v = dataArr[Math.floor(i * dataArr.length / n)] / 255;
      const h = Math.max(3, v * H);
      ctx.globalAlpha = 0.35 + v * 0.65;
      ctx.fillStyle = acc;
      ctx.fillRect(i * bw + 1, H - h, bw - 2, h);
    }
    ctx.globalAlpha = 1;
  }
  function drawIdle(ctx, W, H) {
    // flat baseline "scope" line
    const acc = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#5b8cff';
    ctx.globalAlpha = .25; ctx.fillStyle = acc;
    for (let i = 0; i < W; i += 6) ctx.fillRect(i, H / 2 - 1.5, 4, 3);
    ctx.globalAlpha = 1;
  }
  if (canvas) { const dpr = window.devicePixelRatio || 1; canvas.width = canvas.clientWidth * dpr; canvas.height = 64 * dpr; draw(); }

  /* ---------- deep link + init ---------- */
  function fromHash() {
    const slug = location.hash.slice(1);
    const i = ALBUMS.findIndex(a => a.slug === slug);
    if (i >= 0) { ai = i; ti = 0; renderRail(); renderTracks(); playTrack(0, true); return; }
  }
  window.addEventListener('hashchange', fromHash);

  // default: first album in the list (chronological order)
  ai = 0; ti = 0;
  if (!location.hash || !fromHash()) { renderRail(); renderTracks(); playTrack(0, false); }
})();
