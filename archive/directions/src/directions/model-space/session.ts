// Enhancements only. The session itself is two radio inputs and CSS :has(),
// so the drawing, the transcript and the layer list work with scripts off.

const COPIED_MS = 1600;
const AUTOPLAY_DELAY_MS = 3200;

const motionOk = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const wireCopyButtons = () => {
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-copy]"
  )) {
    const label = button.querySelector<HTMLElement>(".copy-label");
    const status =
      button.parentElement?.querySelector<HTMLElement>("[data-copy-status]");
    let reset = 0;

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? "");
      } catch {
        return;
      }
      button.dataset.state = "copied";
      if (label) {
        label.textContent = label.dataset.copied ?? "Copied";
      }
      if (status) {
        status.textContent = "Copied to clipboard";
      }
      window.clearTimeout(reset);
      reset = window.setTimeout(() => {
        delete button.dataset.state;
        if (label) {
          label.textContent = label.dataset.idle ?? "Copy";
        }
        if (status) {
          status.textContent = "";
        }
      }, COPIED_MS);
    });
  }
};

// Run the second half of the session once, unless the reader got there first.
const autoplaySession = () => {
  const session = document.querySelector<HTMLElement>(".ms");
  const next = document.querySelector<HTMLInputElement>("#cwd-globex");
  if (!(session && next && motionOk())) {
    return;
  }

  let driven = false;
  const stop = () => {
    driven = true;
  };
  session.addEventListener("pointerdown", stop, { once: true });
  session.addEventListener("keydown", stop, { once: true });

  window.setTimeout(() => {
    const { top, bottom } = session.getBoundingClientRect();
    const onScreen = top < window.innerHeight && bottom > 0;
    if (driven || document.hidden || !onScreen) {
      return;
    }
    next.checked = true;
  }, AUTOPLAY_DELAY_MS);
};

// Scope dimensions draw once, when the elevation scrolls into view.
const drawOnView = () => {
  const drawing = document.querySelector<HTMLElement>(".elev");
  if (!(drawing && motionOk() && "IntersectionObserver" in window)) {
    return;
  }
  if (drawing.getBoundingClientRect().top < window.innerHeight * 0.6) {
    return;
  }
  drawing.classList.add("is-waiting");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        drawing.classList.replace("is-waiting", "is-drawing");
        observer.disconnect();
      }
    },
    { threshold: 0.35 }
  );
  observer.observe(drawing);
};

wireCopyButtons();
autoplaySession();
drawOnView();

// A module, so its names stay out of the global scope.
export {};
