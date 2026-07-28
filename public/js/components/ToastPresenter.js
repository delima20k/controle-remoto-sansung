import { DomBuilder } from "../utils/DomBuilder.js";

export class ToastPresenter {
  #builder = new DomBuilder();
  #container;

  constructor(root) {
    this.#container = this.#builder.element("div", { className: "toast-stack", attributes: { "aria-live": "polite" } });
    root.append(this.#container);
  }

  show(message) {
    const toast = this.#builder.element("div", { className: "toast", text: message, attributes: { role: "status" } });
    this.#container.append(toast);
    globalThis.setTimeout(() => toast.remove(), 2600);
  }
}
