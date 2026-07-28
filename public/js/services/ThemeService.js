export class ThemeService {
  static #KEY = "controle-tv-theme";
  static #THEMES = new Set(["light", "dark", "amoled"]);
  #storage;
  #documentElement;

  constructor(storage = globalThis.localStorage, documentElement = globalThis.document?.documentElement) {
    this.#storage = storage;
    this.#documentElement = documentElement;
  }

  getAvailableThemes() {
    return ["dark", "light", "amoled"];
  }

  getTheme() {
    const saved = this.#storage?.getItem(ThemeService.#KEY);
    return ThemeService.#THEMES.has(saved) ? saved : "dark";
  }

  setTheme(theme) {
    if (!ThemeService.#THEMES.has(theme)) {
      throw new Error(`Tema invalido: ${theme}`);
    }
    this.#storage?.setItem(ThemeService.#KEY, theme);
    this.applyTheme(theme);
    return theme;
  }

  applySavedTheme() {
    return this.applyTheme(this.getTheme());
  }

  applyTheme(theme) {
    if (this.#documentElement) {
      this.#documentElement.dataset.theme = theme;
    }
    return theme;
  }
}
