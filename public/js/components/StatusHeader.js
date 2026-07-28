import { DomBuilder } from "../utils/DomBuilder.js";

export class StatusHeader {
  #builder = new DomBuilder();
  #element;
  #statusDot;
  #statusText;
  #batteryText;
  #settingsButton;

  constructor(onSettings) {
    this.#element = this.#builder.element("header", { className: "status-header" });
    const textWrap = this.#builder.element("div");
    textWrap.append(this.#builder.element("h1", { className: "status-header__title", text: "Samsung Crystal UHD" }));
    textWrap.append(this.#builder.element("div", { className: "status-header__subtitle", text: "UN75CU7700GXZD" }));
    const meta = this.#builder.element("div", { className: "status-header__meta" });
    this.#statusDot = this.#builder.element("span", { className: "status-dot", attributes: { "aria-hidden": "true" } });
    this.#statusText = this.#builder.element("span", { text: "Conectando" });
    this.#batteryText = this.#builder.element("span", { text: "Wi-Fi | BT" });
    meta.append(this.#statusDot, this.#statusText, this.#batteryText);
    textWrap.append(meta);
    this.#settingsButton = this.#builder.element("button", { className: "icon-button", text: "SET", attributes: { type: "button", "aria-label": "Configuracoes" } });
    this.#settingsButton.addEventListener("click", onSettings);
    this.#element.append(textWrap, this.#settingsButton);
    this.#loadBattery();
  }

  get element() {
    return this.#element;
  }

  update(connection) {
    const connected = Boolean(connection?.connected);
    this.#statusDot.classList.toggle("status-dot--offline", !connected);
    this.#statusText.textContent = connected ? `${connection.method} conectado` : "Desconectado";
  }

  async #loadBattery() {
    if (!globalThis.navigator?.getBattery) {
      return;
    }
    const battery = await globalThis.navigator.getBattery();
    const level = Math.round(battery.level * 100);
    this.#batteryText.textContent = `Wi-Fi | BT | ${level}%`;
  }
}
