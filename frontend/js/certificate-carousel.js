
(() => {
  "use strict";

  function initializeCertificateCarousel() {
    const root = document.querySelector(
      "#certifications .certificate-carousel"
    );

    if (!root || root.dataset.initialized === "true") return;

    const viewport = root.querySelector(
      ".certificate-carousel-viewport"
    );
    const track = root.querySelector(
      ".certificate-carousel-track"
    );
    const previousButton = root.querySelector(
      ".certificate-carousel-button.prev"
    );
    const nextButton = root.querySelector(
      ".certificate-carousel-button.next"
    );
    const indicatorsContainer = root.querySelector(
      ".certificate-carousel-indicators"
    );
    const status = root.querySelector(
      ".certificate-carousel-status"
    );

    if (
      !viewport ||
      !track ||
      !previousButton ||
      !nextButton ||
      !indicatorsContainer ||
      !status
    ) {
      console.error("Certificate carousel: required HTML elements are missing.");
      return;
    }

    const cards = Array.from(
      track.querySelectorAll(".certificate-carousel-card")
    );

    if (!cards.length) return;

    root.dataset.initialized = "true";

    let currentIndex = 0;
    let resizeTimer;
    let startX = 0;
    let startY = 0;
    let startTranslate = 0;
    let isDragging = false;
    let dragPointerId = null;
    let movedHorizontally = false;
    let suppressClick = false;
    let suppressClickTimer;

    // Create the indicator buttons.
    const indicators = cards.map((card, index) => {
      const indicator = document.createElement("button");

      indicator.type = "button";
      indicator.className = "certificate-carousel-indicator";
      indicator.setAttribute(
        "aria-label",
        `Show certificate ${index + 1}`
      );

      indicator.addEventListener("click", () => goTo(index));

      indicatorsContainer.appendChild(indicator);

      return indicator;
    });

    function getCurrentTranslate() {
      const transform = window.getComputedStyle(track).transform;

      if (!transform || transform === "none") return 0;

      try {
        return new DOMMatrixReadOnly(transform).m41;
      } catch {
        const match = transform.match(/matrix\(([^)]+)\)/);

        return match
          ? Number(match[1].split(",")[4]) || 0
          : 0;
      }
    }

    // Center any certificate, including the first and last.
    function centerActiveCard(animate = true) {
      const card = cards[currentIndex];

      if (!card) return;

      track.style.transition = animate ? "" : "none";

      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2;

      const viewportCenter = viewport.clientWidth / 2;
      const translateX = viewportCenter - cardCenter;

      track.style.transform = `translateX(${translateX}px)`;

      if (!animate) {
        requestAnimationFrame(() => {
          track.style.transition = "";
        });
      }
    }

    function updateCards() {
      cards.forEach((card, index) => {
        card.classList.remove(
          "is-active",
          "is-prev",
          "is-next",
          "is-far"
        );

        if (index === currentIndex) {
          card.classList.add("is-active");
        } else if (index === currentIndex - 1) {
          card.classList.add("is-prev");
        } else if (index === currentIndex + 1) {
          card.classList.add("is-next");
        } else {
          card.classList.add("is-far");
        }

        card.setAttribute(
          "aria-current",
          String(index === currentIndex)
        );
      });

      indicators.forEach((indicator, index) => {
        const active = index === currentIndex;

        indicator.classList.toggle("is-active", active);
        indicator.setAttribute("aria-pressed", String(active));
      });

      previousButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === cards.length - 1;

      const title = cards[currentIndex].querySelector(
        ".certificate-card-title"
      );

      const certificateName = title
        ? title.textContent.trim()
        : `Certificate ${currentIndex + 1}`;

      status.textContent =
        `Certificate ${currentIndex + 1} of ${cards.length} · ${certificateName}`;
    }

    function goTo(index, options = {}) {
      currentIndex = Math.max(
        0,
        Math.min(cards.length - 1, index)
      );

      updateCards();
      centerActiveCard(options.animate !== false);
    }

    previousButton.addEventListener("click", () => {
      goTo(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
      goTo(currentIndex + 1);
    });

    // Start dragging with the left mouse button or a touch gesture.
    viewport.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      // Keep buttons usable. Certificate links can still be dragged.
      if (event.target.closest("button")) return;

      startX = event.clientX;
      startY = event.clientY;
      startTranslate = getCurrentTranslate();

      isDragging = true;
      movedHorizontally = false;
      dragPointerId = event.pointerId;

      track.style.transition = "none";
      viewport.classList.add("is-dragging");

      try {
        viewport.setPointerCapture(event.pointerId);
      } catch {
        // Continue without pointer capture if unsupported.
      }
    });


    
    // Allow two-finger touchpad scrolling to change certificates.
    let wheelLocked = false;
    let wheelResetTimer;

    viewport.addEventListener(
      "wheel",
      (event) => {
        // Ignore primarily vertical scrolling so the page scrolls normally.
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
          return;
        }

        event.preventDefault();

        if (wheelLocked) return;

        // Trackpad horizontal swipe.
        if (Math.abs(event.deltaX) > 12) {
          wheelLocked = true;

          if (event.deltaX > 0) {
            goTo(currentIndex + 1);
          } else {
            goTo(currentIndex - 1);
          }

          window.clearTimeout(wheelResetTimer);
          wheelResetTimer = window.setTimeout(() => {
            wheelLocked = false;
          }, 450);
        }
      },
      { passive: false }
    );


    // Move the track with the pointer.
    viewport.addEventListener("pointermove", (event) => {
      if (!isDragging || event.pointerId !== dragPointerId) {
        return;
      }

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      // Allow normal vertical page scrolling on touch screens.
      if (
        !movedHorizontally &&
        Math.abs(deltaY) > Math.abs(deltaX) + 5
      ) {
        isDragging = false;
        dragPointerId = null;

        track.style.transition = "";
        viewport.classList.remove("is-dragging");

        return;
      }

      if (Math.abs(deltaX) > 5) {
        movedHorizontally = true;
      }

      if (movedHorizontally) {
        if (event.cancelable) {
          event.preventDefault();
        }

        track.style.transform =
          `translateX(${startTranslate + deltaX}px)`;
      }
    });

    function finishDrag(event) {
      if (!isDragging) return;

      if (event && event.pointerId !== dragPointerId) {
        return;
      }

      const deltaX = event
        ? event.clientX - startX
        : 0;

      const wasDragged = movedHorizontally;

      isDragging = false;
      dragPointerId = null;

      viewport.classList.remove("is-dragging");
      track.style.transition = "";

      const threshold = Math.max(
        35,
        cards[currentIndex].offsetWidth * 0.15
      );

      if (wasDragged && deltaX < -threshold) {
        goTo(currentIndex + 1);
      } else if (wasDragged && deltaX > threshold) {
        goTo(currentIndex - 1);
      } else {
        goTo(currentIndex);
      }

      // Prevent a certificate link from opening after a drag.
      if (wasDragged) {
        suppressClick = true;

        window.clearTimeout(suppressClickTimer);

        suppressClickTimer = window.setTimeout(() => {
          suppressClick = false;
        }, 400);
      }

      movedHorizontally = false;
    }

    viewport.addEventListener("pointerup", finishDrag);
    viewport.addEventListener("pointercancel", finishDrag);

    viewport.addEventListener("lostpointercapture", () => {
      if (isDragging) {
        finishDrag();
      }
    });

    // Suppress only the click that follows a drag.
    viewport.addEventListener(
      "click",
      (event) => {
        if (!suppressClick) return;

        event.preventDefault();
        event.stopPropagation();

        suppressClick = false;
        window.clearTimeout(suppressClickTimer);
      },
      true
    );

    // Prevent the browser from dragging certificate images separately.
    viewport.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    // Keyboard navigation.
    root.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(currentIndex + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(currentIndex - 1);
      }
    });

    // Recenter the current card when the viewport changes size.
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        goTo(currentIndex, { animate: false });
      }, 120);
    });

    // Initialize the carousel.
    updateCards();
    centerActiveCard(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeCertificateCarousel,
      { once: true }
    );
  } else {
    initializeCertificateCarousel();
  }
})();
