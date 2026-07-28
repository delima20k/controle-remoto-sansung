import { DomBuilder } from "../utils/DomBuilder.js";
import { PressRepeater } from "../utils/PressRepeater.js";
import { RemoteButton } from "./RemoteButton.js";

export class ChannelRail {
  #builder = new DomBuilder();
  #element;
  #buttons;

  constructor(onPress) {
    this.#element = this.#builder.element("section", { className: "rail rail--channel", attributes: { "aria-label": "Canal" } });
    this.#buttons = [
      this.#repeatButton({ label: "CH +", command: "CHANNEL_UP", onPress }),
      this.#repeatButton({ label: "CH -", command: "CHANNEL_DOWN", onPress }),
      new RemoteButton({ label: "GUIA", command: null, ariaLabel: "Guia", disabled: true, disabledReason: "Indisponivel ate a TV confirmar suporte.", onPress }),
      new RemoteButton({ label: "LISTA", command: null, ariaLabel: "Lista de canais", disabled: true, disabledReason: "Indisponivel ate a TV confirmar suporte.", onPress })
    ];
    this.#element.append(...this.#buttons.map((button) => button.element));
  }

  get element() {
    return this.#element;
  }

  get buttons() {
    return this.#buttons;
  }

  #repeatButton(options) {
    const button = new RemoteButton({ label: options.label, command: options.command, ariaLabel: options.label, onPress: null });
    const repeater = new PressRepeater(() => options.onPress({ command: options.command, element: button.element }));
    button.element.addEventListener("pointerdown", () => {
      if (!button.element.disabled) {
        repeater.start();
      }
    });
    button.element.addEventListener("pointerup", () => repeater.stop());
    button.element.addEventListener("pointercancel", () => repeater.stop());
    button.element.addEventListener("pointerleave", () => repeater.stop());
    globalThis.addEventListener?.("blur", () => repeater.stop());
    return button;
  }
}
