
(() => {
  "use strict";

  const root = document.getElementById("skillsStream");
  const track = document.getElementById("skillsStreamTrack");
  const canvas = document.getElementById("skillsStreamParticles");

  if (!root || !track || !canvas || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  const originals = Array.from(track.children);

  // Generate encrypted-looking data instead of source code.
  const cipherCharacters =
    "0123456789ABCDEFabcdef#$%&*@!?<>/\\|[]{}+=-_:;";

  function generateCipherLine(length = 58) {
    let result = "";

    for (let i = 0; i < length; i++) {
      result += cipherCharacters[
        Math.floor(Math.random() * cipherCharacters.length)
      ];
    }

    return result;
  }

  function generateCipherText() {
    const prefixes = ["0x", "7F", "01", ">>", "::", "A9", "0E", "FF"];

    return Array.from({ length: 10 }, (_, index) =>
      `${prefixes[index % prefixes.length]} ${generateCipherLine()}`
    ).join("\n");
  }

  // Add encrypted overlays to the original cards.
  originals.forEach((card) => {
    let overlay = card.querySelector(".skills-stream__ascii");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "skills-stream__ascii";
      overlay.setAttribute("aria-hidden", "true");
      card.appendChild(overlay);
    }

    overlay.textContent = generateCipherText();
  });

  // Duplicate the cards for a seamless loop.
  originals.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let x = 0;
  let lastTime = 0;
  let dragging = false;
  let pointerX = 0;
  let dragPointerId = null;
  let loopWidth = 0;

  const speed = 34;

  function measure() {
    loopWidth = track.scrollWidth / 2;

    if (loopWidth > 0) {
      wrapPosition();
    }
  }

  // Wrap the track in either direction.
  function wrapPosition() {
    if (!loopWidth) return;

    while (x <= -loopWidth) x += loopWidth;
    while (x >= 0) x -= loopWidth;
  }

  // Reveal encrypted data as each card passes the scanner.
  function updateScanner() {
    const scannerX =
      root.getBoundingClientRect().left + root.clientWidth / 2;

    track.querySelectorAll(".skills-stream__card").forEach((card) => {
      const rect = card.getBoundingClientRect();
      const overlay = card.querySelector(".skills-stream__ascii");

      if (!overlay) return;

      if (scannerX <= rect.left) {
        overlay.style.clipPath = "inset(0 100% 0 0)";
        card.classList.remove("is-scanned");
      } else if (scannerX >= rect.right) {
        overlay.style.clipPath = "inset(0 0 0 0)";
        card.classList.remove("is-scanned");
      } else {
        const progress =
          ((scannerX - rect.left) / rect.width) * 100;

        overlay.style.clipPath =
          `inset(0 ${100 - progress}% 0 0)`;

        card.classList.add("is-scanned");
      }
    });
  }

  // Automatic motion: LEFT TO RIGHT.
  function animate(now) {
    if (!lastTime) lastTime = now;

    const delta = Math.min((now - lastTime) / 1000, 0.04);
    lastTime = now;

    if (!dragging && !reducedMotion) {
      x += speed * delta;
    }

    wrapPosition();

    track.style.transform = `translate3d(${x}px, 0, 0)`;

    updateScanner();
    requestAnimationFrame(animate);
  }

  // Mouse and touch dragging.
  root.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest("a, button")) return;

    dragging = true;
    dragPointerId = event.pointerId;
    pointerX = event.clientX;

    track.classList.add("is-dragging");

    try {
      root.setPointerCapture(event.pointerId);
    } catch {
      // Continue if pointer capture is unavailable.
    }
  });

  root.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerId !== dragPointerId) return;

    x += event.clientX - pointerX;
    pointerX = event.clientX;

    wrapPosition();

    track.style.transform = `translate3d(${x}px, 0, 0)`;
    updateScanner();
  });

  function stopDragging(event) {
    if (!dragging) return;
    if (event && event.pointerId !== dragPointerId) return;

    dragging = false;
    dragPointerId = null;

    track.classList.remove("is-dragging");
  }

  root.addEventListener("pointerup", stopDragging);
  root.addEventListener("pointercancel", stopDragging);

  root.addEventListener("lostpointercapture", () => {
    if (dragging) stopDragging();
  });

  // Two-finger touchpad scrolling.
  root.addEventListener(
    "wheel",
    (event) => {
      const deltaX = event.deltaX;
      const deltaY = event.deltaY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        x -= deltaX;
      } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
        x -= deltaY * 0.6;
      } else {
        return;
      }

      event.preventDefault();

      wrapPosition();

      track.style.transform = `translate3d(${x}px, 0, 0)`;
      updateScanner();
    },
    { passive: false }
  );

  // Cyan particles.
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Skills stream: 2D canvas is unavailable.");
    return;
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];

  function resizeCanvas() {
    const rect = root.getBoundingClientRect();

    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = Array.from(
      { length: Math.max(24, Math.floor(width / 8)) },
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.3 + 0.3,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 5,
        alpha: Math.random() * 0.5 + 0.15
      })
    );
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.vx * 0.016;
      particle.y += particle.vy * 0.016;

      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      ctx.beginPath();
      ctx.fillStyle = `rgba(0,240,255,${particle.alpha})`;
      ctx.shadowColor = "rgba(0,240,255,.7)";
      ctx.shadowBlur = 8;

      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();
    });

    ctx.shadowBlur = 0;

    if (!reducedMotion) {
      requestAnimationFrame(drawParticles);
    }
  }

  // Start slightly left of the origin so the track can move right.
  measure();

  if (loopWidth > 0) {
    x = -loopWidth + 1;
  }

  resizeCanvas();

  window.addEventListener("resize", () => {
    measure();
    resizeCanvas();
    updateScanner();
  });

  requestAnimationFrame(animate);
  drawParticles();
})();
