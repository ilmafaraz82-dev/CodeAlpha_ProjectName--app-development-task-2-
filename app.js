/**
 * app.js
 * ─────────────────────────────────────────────────────────────
 * Random Quote Generator — main application logic.
 *
 * Flow:
 *   1. On load → show a random quote from the local library
 *   2. In the background → fetch from quotable.io API
 *   3. If API succeeds → silently add quotes to the pool
 *   4. "New Quote" button / Spacebar → display next quote
 *
 * Dependencies (loaded before this file):
 *   - window.QUOTES   (js/quotes.js)
 *   - window.BgCanvas (js/canvas.js)
 */

(() => {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────────── */
  const elText    = document.getElementById('quote-text');
  const elAuthor  = document.getElementById('quote-author');
  const elSource  = document.getElementById('quote-source');
  const elSpinner = document.getElementById('spinner');
  const btnNew    = document.getElementById('btn-new');
  const btnTweet  = document.getElementById('btn-tweet');
  const btnCopy   = document.getElementById('btn-copy');
  const copyLabel = document.getElementById('copy-label');

  /* ── Quote pool — starts with local, grows with API quotes ── */
  let pool      = [...window.QUOTES];
  let lastIndex = -1;          // prevent immediate repeat
  let current   = null;        // currently displayed quote

  /* ── Pick a random quote (avoid repeating last) ──────────── */
  function pickRandom() {
    if (pool.length === 1) return pool[0];
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); }
    while (idx === lastIndex);
    lastIndex = idx;
    return pool[idx];
  }

  /* ── Cross-fade helpers ───────────────────────────────────── */
  function fadeOut(el) {
    el.classList.remove('fade-in');
    el.classList.add('fade-out');
  }
  function fadeIn(el) {
    /* Force reflow so transition fires even if class was just removed */
    void el.offsetWidth;
    el.classList.remove('fade-out');
    el.classList.add('fade-in');
  }

  /* ── Render a quote object onto the DOM ─────────────────── */
  function renderQuote(quote) {
    current = quote;

    /* Step 1 — fade out old content */
    fadeOut(elText);
    fadeOut(elAuthor);

    /* Step 2 — after fade-out, swap text & fade in */
    setTimeout(() => {
      elText.textContent   = quote.text;
      elAuthor.textContent = quote.author;
      elSource.textContent = quote.source ?? '';

      fadeIn(elText);
      fadeIn(elAuthor);

      /* Update background colour */
      const hue = quote.hue ?? Math.floor(Math.random() * 360);
      BgCanvas.setHue(hue);
      document.documentElement.style.setProperty('--hue', hue);
      document.documentElement.style.setProperty('--accent',
        `hsl(${(hue + 20) % 360}, 80%, 72%)`);
      document.documentElement.style.setProperty('--accent-dim',
        `hsl(${(hue + 20) % 360}, 50%, 55%)`);

    }, 280); /* matches fade-out duration in CSS */
  }

  /* ── Show next quote ─────────────────────────────────────── */
  function nextQuote() {
    renderQuote(pickRandom());
  }

  /* ── API fetch — quotable.io ─────────────────────────────── */
  async function fetchFromAPI() {
    const API_URL = 'https://api.quotable.io/quotes?limit=50';
    try {
      const res = await fetch(API_URL, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      /* Map API response to our schema */
      const apiQuotes = (data.results ?? []).map(q => ({
        text:   q.content,
        author: q.author,
        source: q.tags?.join(', ') || undefined,
        /* Assign a hue deterministically from author name so same
           author always gets the same colour */
        hue: hashHue(q.author),
      }));

      if (apiQuotes.length) {
        pool = [...pool, ...apiQuotes];
        console.info(`[Luminary] +${apiQuotes.length} quotes loaded from API. Pool: ${pool.length}`);
      }
    } catch (err) {
      /* Silently fall back to local quotes — user never sees this */
      console.warn('[Luminary] API unavailable, using local quotes only.', err.message);
    }
  }

  /* ── Deterministic hue from a string ────────────────────── */
  function hashHue(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 360;
  }

  /* ── Tweet / share ───────────────────────────────────────── */
  function tweetQuote() {
    if (!current) return;
    const text = `"${current.text}" — ${current.author}`;
    const url  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=560,height=420');
  }

  /* ── Copy to clipboard ───────────────────────────────────── */
  async function copyQuote() {
    if (!current) return;
    const text = `"${current.text}" — ${current.author}`;
    try {
      await navigator.clipboard.writeText(text);
      /* Visual feedback */
      btnCopy.classList.add('copied');
      copyLabel.textContent = 'Copied!';
      setTimeout(() => {
        btnCopy.classList.remove('copied');
        copyLabel.textContent = 'Copy';
      }, 2000);
    } catch {
      /* Fallback for browsers that block clipboard without user gesture */
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      copyLabel.textContent = 'Copied!';
      setTimeout(() => { copyLabel.textContent = 'Copy'; }, 2000);
    }
  }

  /* ── Keyboard shortcuts ─────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    /* Ignore when user is interacting with an input */
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();  // prevent page scroll
      nextQuote();
    }
    if (e.key === 'c' || e.key === 'C') {
      copyQuote();
    }
  });

  /* ── Button events ───────────────────────────────────────── */
  btnNew.addEventListener('click', nextQuote);
  btnTweet.addEventListener('click', tweetQuote);
  btnCopy.addEventListener('click', copyQuote);

  /* ── Spinner helpers (for future loading states) ─────────── */
  function showSpinner() { elSpinner.removeAttribute('hidden'); }
  function hideSpinner() { elSpinner.setAttribute('hidden', ''); }

  /* ── Initialise ──────────────────────────────────────────── */
  function init() {
    /* Show first quote immediately from local library */
    renderQuote(pickRandom());

    /* Then silently fetch more from API in the background */
    fetchFromAPI();
  }

  init();

})();
