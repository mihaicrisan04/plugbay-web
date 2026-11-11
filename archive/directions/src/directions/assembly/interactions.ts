// Two small enhancements. The page works without either: the directory switch
// is two radio inputs, and the install command is selectable text.

const COPIED_FOR_MS = 1600;

function wireCopyButtons() {
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-copy]"
  )) {
    const status = button.parentElement?.querySelector("[data-copy-status]");
    let reset: ReturnType<typeof setTimeout> | undefined;

    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(button.dataset.copy ?? "");
      button.dataset.copied = "";
      if (status) {
        status.textContent = "Copied to clipboard";
      }
      clearTimeout(reset);
      reset = setTimeout(() => {
        delete button.dataset.copied;
        if (status) {
          status.textContent = "";
        }
      }, COPIED_FOR_MS);
    });
  }
}

// The press animation is armed by the first directory change, so it never plays on load.
function armPressOnFirstChange() {
  const root = document.querySelector<HTMLElement>(".asm");
  root?.addEventListener("change", (event) => {
    if (
      event.target instanceof HTMLInputElement &&
      event.target.name === "asm-dir"
    ) {
      root.dataset.armed = "";
    }
  });
}

wireCopyButtons();
armPressOnFirstChange();
