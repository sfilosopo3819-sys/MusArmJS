/*
 * The Music Army - shared client-side interactions
 *
 * Loaded by public HTML pages through <script src="script.js" defer>.
 *
 * Uses:
 * - Header scroll shadow and mobile menu behavior
 * - Mobile header hide/show based on scroll direction
 * - Scroll reveal for elements selected in revealSelectors
 * - Animated FAQ accordions
 * - Teacher instrument and branch filtering
 * - Instrument chip selection
 *
 * Properties:
 * - Uses IntersectionObserver when available and respects prefers-reduced-motion
 * - Uses .js, .reveal, and .in classes for progressive scroll animations
 * - Targets only elements that exist on the current page
 * - Does not contain admin dashboard or student-management logic
 *
 * Key classes:
 * - header.scrolled: adds a header shadow after the page scrolls 8px
 * - header.mobile-hidden: hides the mobile header while scrolling up
 * - header.menu-open: opens the mobile navigation menu
 * - .reveal: starts an element in an animated hidden state
 * - .reveal.in: shows a reveal element in its final position
 * - .pill.on: identifies the selected teacher instrument filter
 * - .chip[aria-pressed="true"]: identifies the selected instrument chip
 */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Header behavior:
  // Adds a mobile menu toggle dynamically, tracks scroll direction, and applies
  // .scrolled or .mobile-hidden to <header>.
  // Properties: max-width 800px, 80px reveal threshold, 8px shadow threshold.
  const header = $("header");
  if (header) {
    // Mobile menu:
    // Creates the toggle only once, since script.js is loaded once per page.
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-menu-toggle";
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "<span></span>";
    header.querySelector(".wrap")?.append(toggle);

    toggle.addEventListener("click", () => {
      // State: menu-open toggles the dropdown; aria-expanded exposes state to assistive tech.
      const open = header.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });

    let lastScrollY = window.scrollY;
    const updateHeader = () => {
      // State: currentScrollY is compared with lastScrollY to detect scroll direction.
      const currentScrollY = window.scrollY;
      // Property: .scrolled appears after 8px on desktop and mobile.
      header.classList.toggle("scrolled", currentScrollY > 8);

      if (window.matchMedia("(max-width: 800px)").matches) {
        // At the top: always show the header.
        if (currentScrollY < 80) {
          header.classList.remove("mobile-hidden");
        } else if (currentScrollY > lastScrollY) {
          header.classList.remove("mobile-hidden");
        } else if (currentScrollY < lastScrollY) {
          header.classList.add("mobile-hidden");
          header.classList.remove("menu-open");
        }
      } else {
        header.classList.remove("mobile-hidden");
      }
      lastScrollY = Math.max(currentScrollY, 0);
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  // Scroll reveal behavior:
  // revealSelectors lists page elements that animate upward and fade in.
  // Properties: 0.12 visibility threshold, 6% bottom viewport margin,
  // 28px translation, staggered --i values 0–4.
  const revealSelectors = [
    ".hero .wrap > *",
    ".home-hero .wrap > *",
    ".row-r > *",
    ".band .wrap > .eyebrow",
    ".band .wrap > h1",
    ".band .wrap > h2",
    "section > .wrap > .eyebrow",
    "section > .wrap > h2",
    ".plan",
    ".cta",
    ".who-card",
    ".build-copy > *",
    ".collage .ph",
    ".community-grid > *",
    ".teacher-row .ph",
    ".teacher-card",
    ".review-card",
    ".location-card",
    ".bcard",
    ".tcard",
    ".profile",
    ".masonry .ph",
    ".video > *"
  ].join(",");

  if (!reduceMotion && "IntersectionObserver" in window) {
    // Property: .js enables CSS reveal styles; elements remain visible without JS.
    document.documentElement.classList.add("js");
    const perParent = new Map();
    // Observer callback: one reveal per element, with no repeated reveal on scroll back.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("in");
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    $$(revealSelectors).forEach((el) => {
      // Property: --i controls stagger delay and is capped at 4 per parent group.
      const order = perParent.get(el.parentElement) || 0;
      perParent.set(el.parentElement, order + 1);
      el.style.setProperty("--i", Math.min(order, 4));
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  // FAQ accordion behavior:
  // Each <details> summary animates its <p> answer open or closed.
  // Properties: 320ms duration, no-op/reduced-motion fallback, item.dataset.busy
  // prevents repeated clicks while an animation is running.
  $$(".faq details").forEach((item) => {
    const summary = $("summary", item);
    const answer = $("p", item);
    if (!summary || !answer) return;

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      if (reduceMotion) {
        item.open = !item.open;
        return;
      }
      if (item.dataset.busy) return;
      item.dataset.busy = "1";
      const opening = !item.open;
      // State: opening=true adds the open height and opacity; false reverses it.
      if (opening) item.open = true;
      const shownHeight = answer.offsetHeight;
      const shown = { height: `${shownHeight}px`, opacity: 1, marginTop: getComputedStyle(answer).marginTop };
      const closed = { height: "0px", opacity: 0, marginTop: "0px" };
      answer.style.overflow = "hidden";
      const animation = answer.animate(opening ? [closed, shown] : [shown, closed], {
        duration: 320,
        easing: "cubic-bezier(.22,.8,.24,1)"
      });
      animation.onfinish = () => {
        if (!opening) item.open = false;
        answer.style.overflow = "";
        delete item.dataset.busy;
      };
    });
  });

  // Teacher filter behavior:
  // Combines the selected .pill instrument and select.pill branch.
  // Properties: cards use card.hidden; matching tag text and branch <p> text.
  $$(".filters").forEach((group) => {
    const cards = $$(".tcard", group.closest("section") || document);
    const branchSelect = $("select.pill", group.parentElement);

    const applyFilter = () => {
      const instrument = $(".pill.on", group)?.textContent.trim() || "All instruments";
      const branch = branchSelect?.value || "All branches";

      cards.forEach((card) => {
        const cardInstrument = $(".tag", card)?.textContent.trim();
        const cardBranch = $("p", card)?.textContent.trim();
        card.hidden =
          (instrument !== "All instruments" && cardInstrument !== instrument) ||
          (branch !== "All branches" && cardBranch !== branch);
      });
    };

    group.addEventListener("click", (event) => {
      const pill = event.target.closest(".pill");
      if (!pill) return;
      $$(".pill", group).forEach((item) => {
        item.classList.toggle("on", item === pill);
        item.setAttribute("aria-pressed", String(item === pill));
      });
      applyFilter();
    });

    branchSelect?.addEventListener("change", applyFilter);
  });

  // Instrument chip behavior:
  // Keeps one selected chip inside each .chips group.
  // Properties: sets aria-pressed="true" on the selected .chip and "false" on others.
  $$(".chips").forEach((group) => {
    $$(".chip", group).forEach((chip) => {
      chip.addEventListener("click", () => {
        $$(".chip", group).forEach((item) => {
          item.setAttribute("aria-pressed", String(item === chip));
        });
      });
    });
  });
})();
