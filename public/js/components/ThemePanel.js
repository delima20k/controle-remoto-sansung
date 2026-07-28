import { BaseSheet } from "./BaseSheet.js";
import { RemoteButton } from "./RemoteButton.js";

export class ThemePanel {
  #sheet;
  #themeService;
  #buttons = [];

  constructor(themeService, onThemeChanged) {
    this.#themeService = themeService;
    this.#sheet = new BaseSheet("Tema", "Escolha Claro, Escuro ou AMOLED.");
    const grid = document.createElement("div");
    grid.className = "theme-grid";
    for (const theme of themeService.getAvailableThemes()) {
      const button = new RemoteButton({
        label: theme.toUpperCase(),
        command: null,
        ariaLabel: `Tema ${theme}`,
        onPress: () => {
          this.#themeService.setTheme(theme);
          this.#syncPressed();
          onThemeChanged(theme);
        }
      });
      this.#buttons.push({ theme, button });
      grid.append(button.element);
    }
    this.#sheet.content.append(grid);
    this.#syncPressed();
  }

  open() {
    this.#syncPressed();
    this.#sheet.open();
  }

  #syncPressed() {
    const current = this.#themeService.getTheme();
    for (const item of this.#buttons) {
      item.button.element.setAttribute("aria-pressed", item.theme === current ? "true" : "false");
    }
  }
}
