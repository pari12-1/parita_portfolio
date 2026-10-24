
(() => {
  "use strict";

  const slider = document.querySelector("#experienceSlider");
  if (!slider) return;

  const slides = slider.querySelectorAll(".experience-slide");
  const indicators = slider.querySelectorAll(
    ".experience-indicator__index"
  );

  if (!slides.length || !indicators.length) return;

  function setActive(index) {
    indicators.forEach((button, i) => {
      const active = i === index;

      button.classList.toggle("expand", active);
      button.closest("li")?.classList.toggle("is-active", active);

      if (active) {
        button.setAttribute("aria-current", "step");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            b.intersectionRatio - a.intersectionRatio
        );

      if (visible.length) {
        const index = Number(visible[0].target.dataset.index);

        if (Number.isInteger(index) && indicators[index]) {
          setActive(index);
        }
      }
    },
    {
      threshold: [0.2, 0.4, 0.6, 0.8],
    }
  );

  slides.forEach((slide, index) => {
    slide.dataset.index = index;
    observer.observe(slide);
  });

  // Keep existing indicator-click navigation working.
  indicators.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.target);
      const slide = slides[index];

      if (!slide) return;

      setActive(index);

      slide.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  });

  setActive(0);
})();
