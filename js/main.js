/* ============================================================
   ladrefino101.com — main.js
   - scroll-driven background: deep blue → green → orange
   - top progress bar
   - mobile nav
   - KO6ITO morse "transmit" animation (radio section)
   ============================================================ */

(function () {
  'use strict';
  const root = document.documentElement;

  /* ---------- color engine ----------
     Three HSL stops along the scroll journey:
       0.00  deep navy blue
       ~0.50 dark teal green
       1.00  dark amber orange                        */
  const BG_TOP  = [224, 62, 7];   // #04081a-ish
  const BG_BOT_A= [226, 55, 13];  // navy at rest (bottom of page)
  const MID     = [168, 42, 9];   // dark teal-green
  const END_TOP = [172, 40, 9];   // where top has become by the end
  const END_BOT = [24, 65, 13];   // amber

  const ACC_A = [224, 88, 64];    // blue accent
  const ACC_M = [160, 62, 55];    // green accent
  const ACC_B = [27, 95, 58];     // orange accent

  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) {
    let h = lerp(c1[0], c2[0], t);
    // keep hue interpolation on the short path for blue→green (224→168 goes down, fine)
    return [h, lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
  }
  function hsl(c, a) {
    return a == null ? `hsl(${c[0]},${c[1]}%,${c[2]}%)` : `hsla(${c[0]},${c[1]}%,${c[2]}%,${a})`;
  }

  function applyScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

    // two-phase blend: navy→teal over first half, teal→amber over second half
    let top, acc;
    if (t < 0.5) {
      const k = t / 0.5;
      top = mix(BG_TOP, END_TOP, k);
      acc = mix(ACC_A, ACC_M, k);
    } else {
      const k = (t - 0.5) / 0.5;
      top = mix(END_TOP, [186, 45, 12], k * .6); // slight drift toward green-gold at the very end
      acc = mix(ACC_M, ACC_B, k);
    }
    const bot = t < 0.35 ? BG_BOT_A : (t < 0.7 ? mix(BG_BOT_A, MID, (t - .35) / .35) : mix(MID, END_BOT, (t - .7) / .3));

    root.style.setProperty('--bgA', hsl(top));
    root.style.setProperty('--bgB', hsl(bot));
    root.style.setProperty('--acc', hsl(acc));
    root.style.setProperty('--acc-soft', hsl(acc, 0.16));
    root.style.setProperty('--glow1-a', (0.9 * (1 - t)).toFixed(3));
    root.style.setProperty('--glow2-a', Math.max(0, (t - 0.45) / 0.55).toFixed(3));
    root.style.setProperty('--scroll-progress', t.toFixed(4));
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { applyScroll(); ticking = false; });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  applyScroll();

  /* ---------- mobile nav ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  /* ---------- KO6ITO morse transmit loop ---------- */
  // K -.-   O ---   6 -....   I ..   T -   O ---
  const CODE = { K: '-.-', O: '---', 6: '-....', I: '..', T: '-', };
  const callsignEl = document.getElementById('morseRow');
  if (callsignEl) {
    const seq = ('KO6ITO').split('').flatMap(ch => (CODE[ch] || '').split(''));
    const spans = seq.map(sym => {
      const s = document.createElement('span');
      s.className = sym === '-' ? 'dash' : '';
      callsignEl.appendChild(s);
      return s;
    });
    let visible = true, i = 0;
    const io = new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting), { threshold: .2 });
    io.observe(callsignEl.parentElement || callsignEl);

    function tick() {
      if (visible) {
        spans.forEach(s => s.classList.remove('on'));
        spans[i % spans.length].classList.add('on');
      }
      const cur = seq[i % spans.length];
      i++;
      setTimeout(tick, cur === '-' ? 340 : 150); // dash ≈ 3 dots long
    }
    tick();
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
