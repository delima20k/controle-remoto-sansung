import { BaseSheet } from "./BaseSheet.js";
import { RemoteButton } from "./RemoteButton.js";

export class NumericKeypadSheet {
  #sheet;
  #buttons = [];

  constructor(onPress) {
    this.#sheet = new BaseSheet("Teclado 123", "Numeros usam NUMBER_KEY; Enter e Delete aguardam capacidade confirmada.");
    const grid = document.createElement("div");
    grid.className = "keypad-grid";
    for (const digit of [1, 2, 3, 4, 5, 6, 7, 8, 9, "DEL", 0, "ENTER"]) {
      const isNumber = Number.isInteger(digit);
      const button = new RemoteButton({
        label: String(digit),
        command: isNumber ? "NUMBER_KEY" : null,
        ariaLabel: String(digit),
        disabled: !isNumber,
        disabledReason: "Indisponivel ate a TV ou API confirmar suporte.",
        onPress: ({ element }) => onPress({ command: "NUMBER_KEY", parameters: { digit }, element })
      });
      if (isNumber) {
        this.#buttons.push(button);
      }
      grid.append(button.element);
    }
    this.#sheet.content.append(grid);
  }

  get buttons() {
    return this.#buttons;
  }

  open() {
    this.#sheet.open();
  }
}
