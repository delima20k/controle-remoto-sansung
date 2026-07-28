import { DomBuilder } from "../utils/DomBuilder.js";
import { RemoteButton } from "./RemoteButton.js";

export class DPad {
  #builder = new DomBuilder();
  #element;
  #buttons;

  constructor(onPress) {
    this.#element = this.#builder.element("section", { className: "dpad", attributes: { "aria-label": "Direcional" } });
    this.#buttons = [
      new RemoteButton({ icon: "^", command: "NAVIGATE_UP", ariaLabel: "Cima", variant: "dpad__up", onPress }),
      new RemoteButton({ icon: "v", command: "NAVIGATE_DOWN", ariaLabel: "Baixo", variant: "dpad__down", onPress }),
      new RemoteButton({ icon: "<", command: "NAVIGATE_LEFT", ariaLabel: "Esquerda", variant: "dpad__left", onPress }),
      new RemoteButton({ icon: ">", command: "NAVIGATE_RIGHT", ariaLabel: "Direita", variant: "dpad__right", onPress }),
      new RemoteButton({ label: "OK", command: "SELECT", ariaLabel: "OK", variant: "dpad__ok", onPress })
    ];
    this.#element.append(...this.#buttons.map((button) => button.element));
  }

  get element() {
    return this.#element;
  }

  get buttons() {
    return this.#buttons;
  }
}
