import { StreamingAppsCatalog } from "../data/StreamingAppsCatalog.js";
import { BaseSheet } from "./BaseSheet.js";
import { RemoteButton } from "./RemoteButton.js";
import { DomBuilder } from "../utils/DomBuilder.js";

export class AppsBottomSheet {
  #builder = new DomBuilder();
  #sheet;
  #catalog = new StreamingAppsCatalog();
  #buttons = [];
  #emptyState;

  constructor(onPress) {
    this.#sheet = new BaseSheet("Apps", "Apps sugeridos; a TV real pode ocultar ou bloquear nao instalados.", { fullscreenMobile: true });
    const search = this.#createSearch();
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
      button.element.dataset.appName = app.label.toLocaleLowerCase("pt-BR");
      this.#buttons.push(button);
      grid.append(button.element);
    }
    this.#emptyState = this.#builder.element("p", { className: "apps-empty", text: "Nenhum app encontrado.", attributes: { hidden: "hidden", "aria-live": "polite" } });
    this.#sheet.content.append(search, grid, this.#emptyState);
  }

  get buttons() {
    return this.#buttons;
  }

  open() {
    this.#sheet.open();
  }

  #createSearch() {
    const form = this.#builder.element("form", { className: "apps-search", attributes: { role: "search" } });
    const input = this.#builder.element("input", {
      className: "apps-search__input",
      attributes: {
        type: "search",
        name: "app-search",
        placeholder: "Buscar streaming",
        autocomplete: "off",
        "aria-label": "Buscar aplicativo de streaming"
      }
    });
    const submit = this.#builder.element("button", { className: "apps-search__submit", text: "Buscar", attributes: { type: "submit" } });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.#filter(input.value);
    });
    input.addEventListener("search", () => this.#filter(input.value));
    form.append(input, submit);
    return form;
  }

  #filter(query) {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    let matches = 0;
    for (const button of this.#buttons) {
      const visible = !normalizedQuery || button.element.dataset.appName.includes(normalizedQuery);
      button.element.hidden = !visible;
      matches += visible ? 1 : 0;
    }
    this.#emptyState.hidden = matches > 0;
  }
}
