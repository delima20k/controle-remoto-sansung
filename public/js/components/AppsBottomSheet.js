import { StreamingAppsCatalog } from "../data/StreamingAppsCatalog.js";
import { BaseSheet } from "./BaseSheet.js";
import { RemoteButton } from "./RemoteButton.js";

export class AppsBottomSheet {
  #sheet;
  #catalog = new StreamingAppsCatalog();
  #buttons = [];

  constructor(onPress) {
    this.#sheet = new BaseSheet("Apps", "Apps sugeridos; a TV real pode ocultar ou bloquear nao instalados.", { fullscreenMobile: true });
    const grid = document.createElement("div");
    grid.className = "apps-grid";
    for (const app of this.#catalog.getVisibleApps()) {
      const button = new RemoteButton({
        label: app.label,
        icon: app.icon,
        iconUrl: app.iconUrl,
        command: "OPEN_APP",
        ariaLabel: `Abrir ${app.label}`,
        variant: "app-button",
        onPress: ({ element }) => onPress({ command: "OPEN_APP", parameters: { appId: app.id }, element })
      });
      button.element.dataset.iconKind = app.iconKind;
      this.#buttons.push(button);
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
