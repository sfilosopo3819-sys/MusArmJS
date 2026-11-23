/*
 * The Music Army - interactions
 * 1. Program details pop-up   2. Button ripple        3. Header shadow on scroll
 * 4. Scroll reveal            5. Card glow (pointer)  6. Smooth FAQ accordion
 * 7. Filters (teachers page)  8. Chips and form toast
 * Everything is progressive: without JavaScript the site still works as plain pages.
 */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(.22,.8,.24,1)";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- 1. Program details pop-up ---------- */

  // Same content as the program pages, so the pop-up works without loading another page.
  const PROGRAMS = {
    infantry: {
      file: "infantry.html", name: "Infantry", level: "Discovery level", gradient: "d-infantry",
      summary: "Discover the joy of making music.",
      text: "Designed for absolute beginners or anyone testing the waters with a brand-new instrument. Infantry breaks down the intimidation barrier with basic posture, instrument handling, and simplified chunks of favorite songs from day one. Theory stays minimal and is introduced intuitively through the music.",
      ideal: "Complete beginners, young children exploring an instrument for the first time, or adults wanting a low-pressure trial run.",
      rows: [["Sessions", "6 one-on-one sessions, 1 hour each"], ["Schedule", "Twice a week"], ["Validity", "Use within 1 month"]],
      objectives: ["Proper instrument ergonomics, grip, and posture", "Basic rhythm counting and core coordination", "Play 1–2 simplified sections of favorite songs by ear"],
      price: "PHP 8,300",
    },
    "basic-combat": {
      file: "basic-combat.html", name: "Basic Combat", level: "Foundation level", gradient: "d-basic",
      summary: "Build your musical foundation.",
      text: "Moving past initial curiosity, this tier locks in the fundamentals. Students build essential muscle memory, learn clean finger and hand transitions, and dive deeper into basic music mechanics. The focus shifts to playing full song verses and choruses with consistent timing and steady rhythm.",
      ideal: "Students who have completed Infantry, or self-taught hobbyists looking to clean up bad habits and build a solid technical base.",
      rows: [["Sessions", "8 one-on-one sessions, 1 hour each"], ["Schedule", "Twice a week"], ["Validity", "Use within 1 month"]],
      objectives: ["Clean chord transitions, scale patterns, or foundational drumming rudiments", "Develop an internal metronome and rhythm consistency", "Read basic chord charts, tablature, or fundamental sheet music"],
      price: "PHP 10,200",
    },
    "a-team": {
      file: "a-team.html", name: "A-Team", level: "Growth & accelerator", gradient: "d-ateam",
      summary: "Accelerate your musical growth.",
      text: "The bridge from casual hobbyist to confident player. A-Team introduces dynamic control, finger dexterity, and song interpretation. Students tackle more intricate arrangements, explore the basics of improvisation, and start building performance stamina for real-world playing.",
      ideal: "Dedicated students ready to commit to accelerated progress and intermediate skill milestones.",
      rows: [["Sessions", "15 one-on-one sessions, 1 hour each"], ["Schedule", "Twice a week"], ["Validity", "Use within 1 month"]],
      objectives: ["Advanced dexterity: complex strumming patterns, multi-octave scales, syncopated rhythms", "Play complete, challenging songs with dynamic variance", "Intro to jamming, ear-tuning, and melodic interpretation"],
      price: "PHP 18,400",
    },
    "special-forces": {
      file: "special-forces.html", name: "Special Forces", level: "Mastery level", gradient: "d-special",
      summary: "Master your potential.",
      text: "The pinnacle of individual instruction at The Music Army. Tailored for advanced players seeking mastery, this tier focuses on nuanced expression, complex genre-specific techniques, intricate soloing, professional tone shaping, and performance readiness for major showcases.",
      ideal: "Advanced musicians, seasoned hobbyists chasing technical mastery, or students prepping for auditions, college programs, and headline recitals.",
      rows: [["Sessions", "24 one-on-one sessions, 1 hour each"], ["Schedule", "Twice a week"], ["Validity", "Use within 2 months"]],
      objectives: ["Professional-grade tone and touch control", "Complex improvisation, arrangement, and stylistic interpretation across genres", "Stage-presence coaching and recital piece polish"],
      price: "PHP 29,100",
    },
    "band-coaching": {
      file: "band-coaching.html", name: "Band Coaching", level: "For bands", gradient: "d-band",
      summary: "Get your band stage-ready with a working band musician.",
      text: "For students who want to experience the chemistry of playing in a live band. Mentored by working gigging musicians, you learn how to lock in with a bassist and drummer, blend vocals, manage stage volume, and move through setlists without missing a beat.",
      ideal: "Solo students wanting a band experience, or pre-formed local bands needing professional arrangement and live-performance direction.",
      rows: [["Sessions", "2 band sessions"], ["Band jams", "4 hours of weekend band jams"], ["Led by", "A working band musician"], ["Validity", "Use within 1 year"]],
      objectives: ["Stage chemistry and ensemble timing", "Vocal blending and stage volume control", "Dynamic setlist execution under a gigging musician"],
      price: "PHP 5,500",
    },
  };

  let dialog = null;

  function createDialog() {
    dialog = document.createElement("dialog");
    dialog.className = "modal";
    dialog.setAttribute("aria-labelledby", "modal-title");
    document.body.append(dialog);
    // Close on the X button, on "Close" links, or when the dark backdrop is clicked.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest("[data-close]")) closeModal();
    });
    // Esc key: run our closing animation instead of closing instantly.
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeModal();
    });
  }

  function setScrollLock(locked) {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = locked && scrollbar > 0 ? `${scrollbar}px` : "";
    document.body.classList.toggle("modal-open", locked);
  }

  function openModal(slug) {
    const program = PROGRAMS[slug];
    if (!program) return;
    if (!dialog) createDialog();
    dialog.innerHTML = `
      <button class="modal-close" type="button" data-close aria-label="Close details" autofocus>&times;</button>
      <div class="modal-head ${program.gradient}">
        <p class="level">${esc(program.level)}</p>
        <h2 id="modal-title">${esc(program.name)}</h2>
      </div>
      <div class="modal-body">
        <div>
          <h3>${esc(program.summary)}</h3>
          <p class="detail-text">${esc(program.text)}</p>
          <div class="ideal"><span class="tag">Ideal for</span><p>${esc(program.ideal)}</p></div>
        </div>
        <div class="spec">
          <p class="spec-label">Program details</p>
          <dl>${program.rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
          <p class="spec-label">Objectives</p>
          <ul>${program.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
          <p class="modal-price"><span class="price">${esc(program.price)}</span></p>
          <div class="spec-foot">
            <a class="btn" href="book.html">Book a lesson</a>
            <a class="btn o" href="${program.file}">Full details</a>
          </div>
        </div>
      </div>`;
    dialog.classList.remove("closing");
    setScrollLock(true);
    dialog.showModal();
    dialog.scrollTop = 0;
  }

  function closeModal() {
    if (!dialog || !dialog.open || dialog.classList.contains("closing")) return;
    const finish = () => {
      dialog.close();
      dialog.classList.remove("closing");
      setScrollLock(false);
    };
    if (reduceMotion) return finish();
    dialog.classList.add("closing");
    setTimeout(finish, 220); // same length as the CSS closing animation
  }

  $$("[data-program]").forEach((link) => link.setAttribute("aria-haspopup", "dialog"));
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-program]");
    if (!trigger || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault(); // keep the href as a no-JavaScript fallback
    openModal(trigger.dataset.program);
  });

  /* ---------- 2. Button ripple ---------- */

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".btn");
    if (!button || reduceMotion || event.detail === 0) return; // skip keyboard "clicks"
    const box = button.getBoundingClientRect();
    const size = Math.max(box.width, box.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${event.clientX - box.left - size / 2}px;top:${event.clientY - box.top - size / 2}px`;
    button.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });

  /* ---------- 3. Header shadow on scroll ---------- */

  const header = $("header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Scroll reveal ---------- */

  const REVEAL = [
    ".hero .wrap > *", ".row-r > *", ".band .wrap > .eyebrow", ".band .wrap > h1", ".band .wrap > h2",
    "section > .wrap > .eyebrow", "section > .wrap > h2", ".toolbar", ".plan", ".coach", ".perk", ".chip",
    ".tcard", ".profile", ".admin", ".masonry .ph", ".video > *", ".bcard", ".map", ".hours", ".contact",
    ".faq details", ".detail > *", ".cmp", ".cta", ".book-grid > *", ".faq-grid > *",
  ].join(",");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const perParent = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("in");
        // Once the animation ends, hand control back to the hover styles.
        const done = () => {
          el.classList.remove("reveal", "in");
          el.style.removeProperty("--i");
        };
        el.addEventListener("transitionend", (e) => {
          if (e.target === el && e.propertyName === "opacity") done();
        });
        setTimeout(done, 1300); // safety net if no transition runs (e.g. element already visible)
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    $$(REVEAL).forEach((el) => {
      const order = perParent.get(el.parentElement) || 0;
      perParent.set(el.parentElement, order + 1);
      el.style.setProperty("--i", Math.min(order, 5)); // stagger siblings, max 5 steps
      el.classList.add("reveal");
    });
    void document.body.offsetHeight; // commit the hidden state first so the first screen animates too
    $$(".reveal").forEach((el) => observer.observe(el));
  }

  /* ---------- 5. Pricing card glow follows the pointer ---------- */

  $$(".plan").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - box.left}px`);
      card.style.setProperty("--my", `${event.clientY - box.top}px`);
    });
  });

  /* ---------- 6. Smooth FAQ accordion ---------- */

  $$(".faq details").forEach((item) => {
    const summary = $("summary", item);
    const answer = $("p", item);
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      if (reduceMotion) { item.open = !item.open; return; }
      if (item.dataset.busy) return;
      item.dataset.busy = "1";
      const opening = !item.open;
      if (opening) item.open = true;
      const full = answer.offsetHeight;
      const closed = { height: "0px", opacity: 0, marginTop: "0px" };
      const shown = { height: `${full}px`, opacity: 1, marginTop: getComputedStyle(answer).marginTop };
      answer.style.overflow = "hidden";
      const animation = answer.animate(opening ? [closed, shown] : [shown, closed], { duration: 320, easing: EASE });
      animation.onfinish = () => {
        if (!opening) item.open = false;
        answer.style.overflow = "";
        delete item.dataset.busy;
      };
    });
  });

  /* ---------- 7. Filter pills (teachers page filters the cards) ---------- */

  const cards = $$(".tcard");
  const branchSelect = $("select.pill");
  let emptyNote = null;

  function applyTeacherFilter() {
    if (!cards.length) return;
    const instrument = ($(".filters .pill.on") || { textContent: "All instruments" }).textContent.trim();
    const branch = branchSelect ? branchSelect.value : "All branches";
    let visible = 0;
    cards.forEach((card) => {
      const matches =
        (instrument === "All instruments" || $(".tag", card).textContent.trim() === instrument) &&
        (branch === "All branches" || $("p", card).textContent.trim() === branch);
      const wasHidden = card.hidden;
      card.hidden = !matches;
      if (matches) visible += 1;
      if (matches && wasHidden) { // replay the pop-in animation on cards that return
        card.classList.remove("pop");
        void card.offsetWidth;
        card.classList.add("pop");
      }
    });
    if (!emptyNote) {
      emptyNote = document.createElement("p");
      emptyNote.className = "empty-note";
      emptyNote.setAttribute("role", "status");
      emptyNote.textContent = "No teachers match that filter yet. Try another instrument or branch.";
      $(".tcards").after(emptyNote);
    }
    emptyNote.hidden = visible > 0;
  }

  $$(".filters").forEach((group) => {
    group.addEventListener("click", (event) => {
      const pill = event.target.closest(".pill");
      if (!pill) return;
      $$(".pill", group).forEach((p) => {
        p.classList.toggle("on", p === pill);
        p.setAttribute("aria-pressed", String(p === pill));
      });
      applyTeacherFilter();
    });
  });
  if (branchSelect) branchSelect.addEventListener("change", applyTeacherFilter);

  /* ---------- 8. Instrument chips and booking form ---------- */

  $$(".chips").forEach((group) => {
    $$(".chip", group).forEach((chip) => {
      chip.addEventListener("click", () => {
        $$(".chip", group).forEach((item) => {
          item.setAttribute("aria-pressed", String(item === chip));
        });
      });
    });
  });

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.append(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  const form = $("form.form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault(); // the browser has already checked the required fields
      showToast("Thanks! We will message you to set up your free trial.");
      form.reset();
    });
  }
})();
