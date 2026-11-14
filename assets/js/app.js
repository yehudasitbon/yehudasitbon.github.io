/* =========================================================
   יהודה סיטבון – תיק עבודות | app.js
   ========================================================= */
(() => {
  "use strict";

  // ----- פרטי קשר (לשנות כאן בלבד) -----
  const PHONE_LOCAL = "058-6700468";
  const PHONE_INTL = "972586700468";
  const WA_DEFAULT = "היי יהודה, ראיתי את תיק העבודות שלך ואשמח לשמוע פרטים על צילום אירוע 📸";

  const D = window.PORTFOLIO || { categories: [], hero: [] };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, attrs = {}, html = "") => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v; else if (k === "style") n.style.cssText = v; else n.setAttribute(k, v);
    }
    if (html) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const waLink = (text = WA_DEFAULT) => `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(text)}`;
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
  };

  const cats = D.categories;
  const catBy = (slug) => cats.find((c) => c.slug === slug);

  // ----- קישורי וואטסאפ / טלפון -----
  function wireContact(root = document, text) {
    $$("[data-wa]", root).forEach((a) => (a.href = waLink(text)));
    $$("[data-tel]", root).forEach((a) => (a.href = `tel:+${PHONE_INTL}`));
    $$("[data-phone-label]", root).forEach((s) => (s.textContent = PHONE_LOCAL));
  }
  wireContact();
  $$("[data-year]").forEach((s) => (s.textContent = new Date().getFullYear()));

  // =========================================================
  // אינטרו
  // =========================================================
  const intro = $("#intro");
  let introDone = false;
  function finishIntro() {
    if (introDone) return;
    introDone = true;
    intro.classList.add("done");
    document.body.classList.remove("is-loading");
    document.body.classList.add("ready");
    store.set("introSeen", "1");
    setTimeout(() => intro.remove(), 900);
  }
  if (reduced || store.get("introSeen") || location.hash.startsWith("#/")) {
    intro.classList.add("done");
    requestAnimationFrame(finishIntro);
  } else {
    setTimeout(() => intro.classList.add("snap"), 2100);
    setTimeout(finishIntro, 2550);
    $(".intro-skip", intro).addEventListener("click", finishIntro);
    intro.addEventListener("click", finishIntro);
  }

  // =========================================================
  // HERO: סליידר + פרלקסה
  // =========================================================
  const hero = $(".hero");
  const slidesWrap = $(".hero-slides");
  const heroList = D.hero.length ? D.hero : cats.slice(0, 5).map((c) => c.albums[0].photos[0]);
  const heroCaption = (p) => {
    const c = catBy(p.cat), a = c && c.albums.find((x) => x.slug === p.album);
    return c ? `${c.title} · ${a ? a.title : ""}` : "";
  };
  heroList.forEach((p, i) => {
    const s = el("div", { class: "hero-slide" + (i === 0 ? " active" : "") });
    const img = el("img", { alt: "", decoding: "async", ...(i === 0 ? { fetchpriority: "high" } : { loading: "lazy" }) });
    img.src = p.f;
    s.appendChild(img);
    slidesWrap.appendChild(s);
  });
  const slides = $$(".hero-slide", slidesWrap);
  const caption = $(".hero-caption");
  let heroIdx = 0;
  function showSlide(i) {
    slides[heroIdx].classList.remove("active");
    heroIdx = (i + slides.length) % slides.length;
    slides[heroIdx].classList.add("active");
    caption.textContent = heroCaption(heroList[heroIdx]);
  }
  if (slides.length) {
    showSlide(0);
    if (slides.length > 1) setInterval(() => !document.hidden && showSlide(heroIdx + 1), 6000);
  }

  $$("[data-depth]").forEach((n) => n.style.setProperty("--d", n.dataset.depth));
  if (finePointer && !reduced) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener("pointerleave", () => { hero.style.setProperty("--mx", 0); hero.style.setProperty("--my", 0); });
  }

  // =========================================================
  // גלילה: כותרת, פס נע, חשיפה
  // =========================================================
  const header = $(".site-header");
  const track = $("[data-marquee]");
  track.innerHTML += track.innerHTML;
  let lastY = scrollY, marqueeX = 0, scrollBoost = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    header.classList.toggle("scrolled", y > 40);
    header.classList.toggle("hide", y > lastY && y > 500);
    scrollBoost += Math.abs(y - lastY) * 0.35;
    lastY = y;
  }, { passive: true });
  (function loop() {
    if (!reduced) {
      const half = track.scrollWidth / 2;
      marqueeX = (marqueeX + 0.6 + scrollBoost) % half;
      scrollBoost *= 0.9;
      track.style.transform = `translate3d(${marqueeX}px,0,0)`;
    }
    requestAnimationFrame(loop);
  })();

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const t = en.target;
      t.classList.add("in"); revealIO.unobserve(t);
      setTimeout(() => (t.style.transitionDelay = ""), 1300);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$("[data-reveal]").forEach((n) => revealIO.observe(n));

  // =========================================================
  // אפקט הטיה תלת-ממדית
  // =========================================================
  function addTilt(node, max = 9) {
    if (!finePointer || reduced) return;
    node.addEventListener("pointermove", (e) => {
      const r = node.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      node.style.setProperty("--ry", `${((x - 0.5) * max * 1.3).toFixed(2)}deg`);
      node.style.setProperty("--rx", `${((0.5 - y) * max).toFixed(2)}deg`);
      node.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      node.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    });
    node.addEventListener("pointerleave", () => { node.style.setProperty("--rx", "0deg"); node.style.setProperty("--ry", "0deg"); });
  }

  // =========================================================
  // כרטיסי קטגוריות
  // =========================================================
  const grid = $("#catGrid");
  const cardTimers = new Map();
  cats.forEach((c, i) => {
    const covers = c.albums.map((a) => a.photos[0]).slice(0, 5);
    if (covers.length < 3) c.albums[0].photos.slice(1, 4 - covers.length + 1).forEach((p) => covers.push(p));
    const card = el("a", {
      class: "cat-card" + (i % 5 < 2 ? " wide" : ""),
      href: `#/c/${c.slug}`, "data-cursor": "view",
      style: `transition-delay:${(i % 3) * 90}ms`,
    });
    card.innerHTML = `
      <div class="card-inner">${covers.map((p, k) => `<img src="${p.t}" alt="" loading="lazy" decoding="async"${k === 0 ? ' class="on"' : ""}>`).join("")}</div>
      ${covers.length > 1 ? `<span class="card-dots">${covers.map((_, k) => `<i${k === 0 ? ' class="on"' : ""}></i>`).join("")}</span>` : ""}
      <div class="card-text">
        <span class="card-num">${pad(i + 1)}</span>
        <h3 class="card-title">${esc(c.title)}</h3>
        ${c.tagline ? `<p class="card-tag">${esc(c.tagline)}</p>` : ""}
      </div>`;
    grid.appendChild(card);
    revealIO.observe(card);
    addTilt(card, 10);

    const imgs = $$("img", card), dots = $$(".card-dots i", card);
    let k = 0;
    const step = () => {
      imgs[k].classList.remove("on"); dots[k] && dots[k].classList.remove("on");
      k = (k + 1) % imgs.length;
      imgs[k].classList.add("on"); dots[k] && dots[k].classList.add("on");
    };
    if (imgs.length > 1) {
      if (finePointer) {
        card.addEventListener("pointerenter", () => { step(); cardTimers.set(card, setInterval(step, 1100)); });
        card.addEventListener("pointerleave", () => clearInterval(cardTimers.get(card)));
      } else {
        card._step = step;
      }
    }
  });
  // במובייל – הכרטיסים שבמסך מתחלפים לבד
  if (!finePointer) {
    const visible = new Set();
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { threshold: 0.5 });
    $$(".cat-card", grid).forEach((c) => c._step && io.observe(c));
    setInterval(() => !document.hidden && visible.forEach((c) => c._step()), 2600);
  }

  // =========================================================
  // טבעת תלת-ממד
  // =========================================================
  const ringStage = $("#ringStage"), ring = $("#ring");
  const ringPicks = [];
  cats.forEach((c) => c.albums.forEach((a) => ringPicks.push({ c, a, p: a.photos[Math.min(1, a.photos.length - 1)] })));
  // עד 16 – פיזור שווה בין הקטגוריות
  const ringItems = ringPicks.length > 16 ? ringPicks.filter((_, i) => i % Math.ceil(ringPicks.length / 16) === 0).slice(0, 16) : ringPicks;
  ringItems.forEach(({ c, a, p }) => {
    const it = el("a", { class: "ring-item", href: `#/a/${c.slug}/${a.slug}`, "data-cursor": "view", draggable: "false" });
    it.innerHTML = `<img src="${p.t}" alt="${esc(a.title)}" loading="lazy" decoding="async" draggable="false"><span>${esc(a.title)}</span>`;
    ring.appendChild(it);
  });
  let ringAngle = 0, ringVel = 0, radius = 0, ringOn = false, dragging = false, dragX = 0, moved = 0;
  function layoutRing() {
    const n = ringItems.length;
    const w = innerWidth < 600 ? 140 : innerWidth < 1000 ? 180 : 220;
    ring.style.setProperty("--card-w", w + "px");
    radius = Math.round((w / 2) / Math.tan(Math.PI / n) + 26);
    $$(".ring-item", ring).forEach((it, i) => (it.style.transform = `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)`));
  }
  layoutRing();
  addEventListener("resize", layoutRing);
  new IntersectionObserver(([e]) => (ringOn = e.isIntersecting)).observe(ringStage);
  (function spin() {
    if (ringOn) {
      if (!dragging) { ringVel *= 0.95; ringAngle += ringVel + (reduced ? 0 : 0.08); }
      ring.style.transform = `translateZ(${-radius}px) rotateX(-4deg) rotateY(${ringAngle}deg)`;
    }
    requestAnimationFrame(spin);
  })();
  ringStage.addEventListener("pointerdown", (e) => {
    dragging = true; dragX = e.clientX; moved = 0; ringVel = 0;
    ringStage.classList.add("dragging");
  });
  addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragX; dragX = e.clientX; moved += Math.abs(dx);
    ringVel = dx * 0.22; ringAngle += ringVel;
  });
  const endDrag = () => { dragging = false; ringStage.classList.remove("dragging"); };
  addEventListener("pointerup", endDrag);
  addEventListener("pointercancel", endDrag);
  ringStage.addEventListener("click", (e) => { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } }, true);

  // =========================================================
  // אודות
  // =========================================================
  const allPhotos = cats.flatMap((c) => c.albums.flatMap((a) => a.photos));
  const tall = allPhotos.find((p) => p.f.startsWith("photos/weddings/") && p.h > p.w) || allPhotos.find((p) => p.h > p.w);
  const wide = allPhotos.find((p) => p.f.startsWith("photos/brit/") && p.w > p.h) || allPhotos[0];
  const [f1, f2] = $$(".about-frame img");
  if (tall) f1.src = tall.f;
  if (wide) f2.src = wide.t;
  $$("[data-tilt]").forEach((n) => addTilt(n, 8));

  // =========================================================
  // חלון קטגוריה / אלבום (ניתוב לפי #)
  // =========================================================
  const view = $("#view"), viewBody = $("#viewBody"), viewScroll = $("#viewScroll"), crumbs = $("#crumbs");
  let lastClick = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener("pointerdown", (e) => (lastClick = { x: e.clientX, y: e.clientY }), true);
  let tileIO = null;

  function openView() {
    if (view.classList.contains("open")) return;
    view.style.setProperty("--ox", lastClick.x + "px");
    view.style.setProperty("--oy", lastClick.y + "px");
    view.classList.add("open");
    view.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
  }
  function closeView() {
    if (!view.classList.contains("open")) return;
    view.classList.remove("open");
    view.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    document.title = BASE_TITLE;
  }
  const BASE_TITLE = document.title;
  function goHome() {
    history.pushState("", document.title, location.pathname + location.search);
    route();
  }

  function renderCategory(c) {
    crumbs.innerHTML = `<a href="#work">תיק עבודות</a> / <b>${esc(c.title)}</b>`;
    viewBody.innerHTML = `
      <header class="view-head">
        <p class="eyebrow hand">${esc(c.tagline || "תיק עבודות")}</p>
        <h1>${esc(c.title)}</h1>
        <p class="meta">בחרו אלבום לצפייה</p>
      </header>
      <div class="stacks">${c.albums.map((a, i) => {
        const ph = [a.photos[2], a.photos[1], a.photos[0]].filter(Boolean);
        return `<a class="stack" href="#/a/${c.slug}/${a.slug}" data-cursor="view" style="animation-delay:${120 + i * 90}ms">
          <div class="stack-pile">${ph.map((p) => `<div class="ph"><img src="${p.t}" alt="" loading="lazy" decoding="async"></div>`).join("")}</div>
          <h3>${esc(a.title)}</h3><p>לצפייה באלבום ←</p></a>`;
      }).join("")}</div>
      ${ctaBlock(c)}`;
    wireContact(viewBody, `היי יהודה, ראיתי את תיק העבודות שלך (${c.title}) ואשמח לשמוע פרטים 📸`);
    document.title = `${c.title} | יהודה סיטבון`;
  }

  function renderAlbum(c, a) {
    const i = c.albums.indexOf(a);
    const prev = c.albums[i - 1], next = c.albums[i + 1];
    crumbs.innerHTML = `<a href="#work">תיק עבודות</a> / <a href="#/c/${c.slug}">${esc(c.title)}</a> / <b>${esc(a.title)}</b>`;
    viewBody.innerHTML = `
      <header class="view-head">
        <p class="eyebrow hand">${esc(c.title)}</p>
        <h1>${esc(a.title)}</h1>
        <p class="meta">לחצו על תמונה להגדלה</p>
      </header>
      <div class="masonry">${a.photos.map((p, k) => `
        <a class="tile" href="${p.f}" data-i="${k}" data-cursor="view" aria-label="הגדלת תמונה">
          <img src="${p.t}" width="${p.w}" height="${p.h}" alt="${esc(a.title)} – ${k + 1}" loading="lazy" decoding="async">
        </a>`).join("")}</div>
      ${(prev || next) ? `<nav class="album-nav">
        ${prev ? `<a class="prev" href="#/a/${c.slug}/${prev.slug}"><span>→ האלבום הקודם</span><b>${esc(prev.title)}</b></a>` : ""}
        ${next ? `<a class="next" href="#/a/${c.slug}/${next.slug}"><span>האלבום הבא ←</span><b>${esc(next.title)}</b></a>` : ""}
      </nav>` : ""}
      ${ctaBlock(c)}`;
    wireContact(viewBody, `היי יהודה, ראיתי את האלבום "${a.title}" בתיק העבודות שלך ואשמח לשמוע פרטים על צילום ${c.title} 📸`);
    document.title = `${a.title} | יהודה סיטבון`;

    if (tileIO) tileIO.disconnect();
    tileIO = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); tileIO.unobserve(e.target); }
    }), { root: viewScroll, threshold: 0.05 });
    $$(".tile", viewBody).forEach((t, k) => {
      t.style.transitionDelay = `${(k % 3) * 70}ms`;
      tileIO.observe(t);
      const img = $("img", t);
      const done = () => img.classList.add("loaded");
      img.complete ? done() : img.addEventListener("load", done, { once: true });
      t.addEventListener("click", (e) => { e.preventDefault(); openLightbox(a, k); });
    });
  }

  function ctaBlock(c) {
    return `<div class="view-cta"><h3>אהבתם? בואו נצלם גם את ${c.slug === "sessions" ? "הבוק" : "האירוע"} שלכם.</h3>
      <a class="btn btn-wa" data-wa href="#" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wa"/></svg><span>שלחו הודעה בוואטסאפ</span></a></div>`;
  }

  function route() {
    const h = decodeURIComponent(location.hash);
    const m = h.match(/^#\/(c|a)\/([^/]+)(?:\/([^/]+))?/);
    if (!m) { closeLightbox(true); closeView(); return; }
    const c = catBy(m[2]);
    if (!c) { closeView(); return; }
    if (m[1] === "a") {
      const a = c.albums.find((x) => x.slug === m[3]);
      if (!a) { location.replace(`#/c/${c.slug}`); return; }
      renderAlbum(c, a);
    } else {
      renderCategory(c);
    }
    closeLightbox(true);
    viewScroll.scrollTop = 0;
    openView();
  }
  addEventListener("hashchange", route);
  $(".view-close").addEventListener("click", goHome);
  $(".view-back").addEventListener("click", () => {
    const m = location.hash.match(/^#\/a\/([^/]+)/);
    if (m) location.hash = `#/c/${m[1]}`; else goHome();
  });
  // קישורי עוגן מתוך החלון (למשל "תיק עבודות" בפירורי הלחם)
  view.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]:not([href^="#/"])');
    if (!a) return;
    e.preventDefault();
    const target = a.getAttribute("href");
    goHome();
    setTimeout(() => { const t = $(target); t && t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }, 50);
  });

  // =========================================================
  // לייטבוקס
  // =========================================================
  const lb = $("#lightbox"), lbStage = $("#lbStage"), lbTitle = $(".lb-title");
  let lbAlbum = null, lbIdx = 0, lbPushed = false;

  function lbShow(i, dir = 0) {
    const ps = lbAlbum.photos;
    lbIdx = (i + ps.length) % ps.length;
    const p = ps[lbIdx];
    const old = $$("img", lbStage);
    const img = el("img", { alt: `${lbAlbum.title} – ${lbIdx + 1}`, draggable: "false" });
    img.src = p.t;
    img.classList.add("lo");
    if (dir) img.classList.add(dir > 0 ? "enter-next" : "enter-prev");
    lbStage.appendChild(img);
    const full = new Image();
    full.onload = () => { if (img.isConnected) { img.src = p.f; img.classList.remove("lo"); } };
    full.src = p.f;
    requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove("enter-next", "enter-prev")));
    old.forEach((o) => {
      o.classList.add(dir >= 0 ? "leave-next" : "leave-prev");
      setTimeout(() => o.remove(), 500);
    });
    lbTitle.textContent = lbAlbum.title;
    // טעינה מוקדמת של השכנות
    [1, -1].forEach((d) => { const n = ps[(lbIdx + d + ps.length) % ps.length]; if (n) new Image().src = n.f; });
  }
  function openLightbox(album, i) {
    lbAlbum = album;
    lbStage.innerHTML = "";
    lbShow(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    if (!lbPushed) { history.pushState({ lb: 1 }, ""); lbPushed = true; }
  }
  function closeLightbox(fromHistory = false) {
    if (!lb.classList.contains("open")) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    if (lbPushed) { lbPushed = false; if (!fromHistory) history.back(); }
  }
  addEventListener("popstate", () => { if (lb.classList.contains("open")) closeLightbox(true); });
  $(".lb-next").addEventListener("click", () => lbShow(lbIdx + 1, 1));
  $(".lb-prev").addEventListener("click", () => lbShow(lbIdx - 1, -1));
  $(".lb-close").addEventListener("click", () => closeLightbox());
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target === lbStage) closeLightbox(); });
  // החלקה: בכיוון עברית – גרירה ימינה = הבאה
  let tX = null, tY = 0;
  lb.addEventListener("touchstart", (e) => { tX = e.touches[0].clientX; tY = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (tX === null) return;
    const dx = e.changedTouches[0].clientX - tX, dy = e.changedTouches[0].clientY - tY;
    tX = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) lbShow(lbIdx + (dx > 0 ? 1 : -1), dx > 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLightbox();
  });

  addEventListener("keydown", (e) => {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") lbShow(lbIdx + 1, 1);
      else if (e.key === "ArrowRight") lbShow(lbIdx - 1, -1);
    } else if (view.classList.contains("open") && e.key === "Escape") {
      $(".view-back").click();
    }
  });

  // =========================================================
  // סמן מותאם + הבזק בכפתורים
  // =========================================================
  if (finePointer) {
    const cur = $(".cursor"), label = $(".cursor-label");
    let cx = -100, cy = -100, x = -100, y = -100;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      const t = e.target.closest("a, button, [data-cursor]");
      const viewMode = t && t.dataset.cursor === "view" && !lb.classList.contains("open");
      const inRing = e.target.closest("#ringStage");
      cur.classList.toggle("is-view", !!viewMode);
      cur.classList.toggle("is-hover", !!t && !viewMode);
      label.textContent = inRing ? "גררו" : "צפייה";
    }, { passive: true });
    document.addEventListener("pointerleave", () => cur.classList.add("is-hidden"));
    document.addEventListener("pointerenter", () => cur.classList.remove("is-hidden"));
    (function follow() {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(follow);
    })();
  }
  document.addEventListener("pointermove", (e) => {
    const b = e.target.closest && e.target.closest(".btn");
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--bx", `${e.clientX - r.left}px`);
    b.style.setProperty("--by", `${e.clientY - r.top}px`);
  }, { passive: true });

  route();
})();
