import { ExtrasCatalog } from "../data/ExtrasCatalog.js";
import { BaseSheet } from "./BaseSheet.js";
import { RemoteButton } from "./RemoteButton.js";

export class ExtrasSheet {
  #sheet;
  #catalog = new ExtrasCatalog();
  #buttons = [];

  constructor(onPress) {
    this.#sheet = new BaseSheet("Extras", "Somente comandos confirmados ficam habilitados.");
    const grid = document.createElement("div");
    grid.className = "extras-grid";
    for (const extra of this.#catalog.getAll()) {
      const button = new RemoteButton({
        label: extra.label,
        command: extra.command,
        ariaLabel: extra.label,
        disabled: !extra.command,
        disabledReason: "Indisponivel ate a TV ou API confirmar suporte.",
        onPress
      });
      if (extra.command) {
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
