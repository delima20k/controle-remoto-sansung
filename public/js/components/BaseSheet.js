import { DomBuilder } from "../utils/DomBuilder.js";

export class BaseSheet {
  #builder = new DomBuilder();
  #backdrop;
  #content;

  constructor(title, subtitle) {
    this.#backdrop = this.#builder.element("section", { className: "sheet-backdrop", attributes: { role: "dialog", "aria-modal": "true", "aria-label": title } });
    const sheet = this.#builder.element("div", { className: "bottom-sheet" });
    const header = this.#builder.element("header", { className: "bottom-sheet__header" });
    const titleWrap = this.#builder.element("div");
    titleWrap.append(this.#builder.element("h2", { className: "bottom-sheet__title", text: title }));
    titleWrap.append(this.#builder.element("p", { className: "bottom-sheet__subtitle", text: subtitle }));
    const close = this.#builder.element("button", { className: "icon-button", text: "X", attributes: { type: "button", "aria-label": "Fechar" } });
    close.addEventListener("click", () => this.close());
    header.append(titleWrap, close);
    this.#content = this.#builder.element("div", { className: "bottom-sheet__content" });
    sheet.append(header, this.#content);
    this.#backdrop.append(sheet);
    this.#backdrop.addEventListener("click", (event) => {
      if (event.target === this.#backdrop) {
        this.close();
      }
    });
    document.body.append(this.#backdrop);
  }

  get content() {
    return this.#content;
  }

  open() {
    this.#backdrop.classList.add("is-open");
  }

  close() {
    this.#backdrop.classList.remove("is-open");
  }
}
