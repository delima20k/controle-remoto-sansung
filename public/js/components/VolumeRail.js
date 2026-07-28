import { DomBuilder } from "../utils/DomBuilder.js";
import { PressRepeater } from "../utils/PressRepeater.js";
import { RemoteButton } from "./RemoteButton.js";

export class VolumeRail {
  #builder = new DomBuilder();
  #element;
  #buttons;

  constructor(onPress) {
    this.#element = this.#builder.element("section", { className: "rail rail--volume", attributes: { "aria-label": "Volume" } });
    this.#buttons = [
      this.#repeatButton({ label: "VOL +", command: "VOLUME_UP", onPress }),
      this.#repeatButton({ label: "VOL -", command: "VOLUME_DOWN", onPress }),
      new RemoteButton({ label: "MUTE", command: "MUTE", ariaLabel: "Mudo", onPress })
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
