import { DomBuilder } from "../utils/DomBuilder.js";

export class RemoteButton {
  #builder = new DomBuilder();
  #element;
  #command;
  #onPress;

  constructor(options) {
    this.#command = options.command ?? null;
    this.#onPress = options.onPress ?? null;
    this.#element = this.#createElement(options);
    this.#bind();
  }

  get element() {
    return this.#element;
  }

  get command() {
    return this.#command;
  }

  setAvailability(availability) {
    this.#element.disabled = !availability.available;
    this.#element.title = `${availability.method}: ${availability.reason}`;
    this.#element.dataset.method = availability.method;
  }

  setLoading(loading) {
    this.#element.setAttribute("aria-busy", loading ? "true" : "false");
  }

  #createElement(options) {
    const element = this.#builder.element("button", {
      className: `remote-button ${options.variant ?? ""}`.trim(),
      attributes: {
        type: "button",
        "aria-label": options.ariaLabel ?? options.label,
        "data-command": this.#command ?? "",
        "data-action": options.action ?? ""
      }
    });
    if (options.icon) {
      element.append(this.#builder.element("span", { className: "remote-button__icon", text: options.icon, attributes: { "aria-hidden": "true" } }));
    }
    if (options.label) {
      element.append(this.#builder.element("span", { className: "remote-button__label", text: options.label }));
    }
    if (options.disabled) {
      element.disabled = true;
      element.title = options.disabledReason ?? "Indisponivel";
    }
    return element;
  }

  #bind() {
    this.#element.addEventListener("pointerdown", () => this.#element.classList.add("is-pressed"));
    this.#element.addEventListener("pointerup", () => this.#element.classList.remove("is-pressed"));
    this.#element.addEventListener("pointerleave", () => this.#element.classList.remove("is-pressed"));
    this.#element.addEventListener("click", (event) => {
      if (!this.#onPress || this.#element.disabled) {
        return;
      }
      this.#onPress({ command: this.#command, element: this.#element, event });
    });
  }
}
