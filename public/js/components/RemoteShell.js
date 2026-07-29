import { DomBuilder } from "../utils/DomBuilder.js";
import { AppsBottomSheet } from "./AppsBottomSheet.js";
import { ChannelRail } from "./ChannelRail.js";
import { DPad } from "./DPad.js";
import { ExtrasSheet } from "./ExtrasSheet.js";
import { NumericKeypadSheet } from "./NumericKeypadSheet.js";
import { PowerButton } from "./PowerButton.js";
import { RemoteButton } from "./RemoteButton.js";
import { StatusHeader } from "./StatusHeader.js";
import { ThemePanel } from "./ThemePanel.js";
import { ToastPresenter } from "./ToastPresenter.js";
import { VolumeRail } from "./VolumeRail.js";

export class RemoteShell {
  #builder = new DomBuilder();
  #root;
  #controller;
  #themeService;
  #statusHeader;
  #toast;
  #buttons = [];
  #statusLine;
  #appsSheet;
  #numericSheet;
  #extrasSheet;
  #themePanel;
  #onSmartThingsConnect;
  #setupPanel;

  constructor(root, controller, themeService, onSmartThingsConnect = async () => undefined) {
    this.#root = root;
    this.#controller = controller;
    this.#themeService = themeService;
    this.#onSmartThingsConnect = onSmartThingsConnect;
  }

  render() {
    const shell = this.#builder.element("section", { className: "remote-shell", attributes: { "aria-label": "Controle remoto" } });
    this.#statusHeader = new StatusHeader(() => this.#themePanel.open());
    const topControls = this.#topControls();
    const main = this.#mainControls();
    const footer = this.#footerControls();
    this.#statusLine = this.#builder.element("div", { className: "remote-status-line", text: "Metodo: aguardando conexao" });
    this.#setupPanel = this.#smartThingsSetupPanel();
    shell.append(this.#statusHeader.element, this.#setupPanel, topControls, main, footer, this.#statusLine);
    this.#root.replaceChildren(shell);
    this.#toast = new ToastPresenter(shell);
    this.#appsSheet = new AppsBottomSheet((action) => this.#handleCommand(action));
    this.#numericSheet = new NumericKeypadSheet((action) => this.#handleCommand(action));
    this.#extrasSheet = new ExtrasSheet((action) => this.#handleCommand(action));
    this.#buttons.push(...this.#appsSheet.buttons, ...this.#numericSheet.buttons, ...this.#extrasSheet.buttons);
    this.#themePanel = new ThemePanel(this.#themeService, (theme) => this.#toast.show(`Tema ${theme} aplicado.`));
    return this;
  }

  updateConnection(connection) {
    this.#statusHeader.update(connection);
    if (connection?.connected && connection.method === "SmartThings") {
      this.#setupPanel.replaceChildren(this.#builder.element("span", { text: "TV conectada por SmartThings" }));
    }
    this.refreshAvailability();
  }

  refreshAvailability() {
    for (const item of this.#buttons) {
      if (item.command) {
        item.setAvailability(this.#controller.getAvailability(item.command));
      }
    }
  }

  showMessage(message) {
    this.#toast.show(message);
  }

  showSmartThingsDeviceSelection(devices, onSelect) {
    this.#setupPanel.replaceChildren();
    const title = this.#builder.element("strong", { text: "Escolha sua TV SmartThings" });
    const description = this.#builder.element("span", { text: devices.length ? "Selecione a TV que este celular vai controlar." : "Nenhuma TV compativel foi encontrada na sua conta SmartThings." });
    this.#setupPanel.append(title, description);
    for (const device of devices) {
      const button = this.#builder.element("button", {
        className: "smartthings-setup__device",
        text: device.label ?? "Samsung TV",
        attributes: { type: "button" }
      });
      button.addEventListener("click", () => onSelect(device));
      this.#setupPanel.append(button);
    }
  }

  #smartThingsSetupPanel() {
    const panel = this.#builder.element("section", { className: "smartthings-setup", attributes: { "aria-label": "Conexao SmartThings" } });
    const button = this.#builder.element("button", { className: "smartthings-setup__button", text: "CONECTAR TV", attributes: { type: "button" } });
    button.addEventListener("click", async () => {
      button.setAttribute("aria-busy", "true");
      await this.#onSmartThingsConnect();
      button.setAttribute("aria-busy", "false");
    });
    panel.append(this.#builder.element("span", { text: "SmartThings" }), button);
    return panel;
  }

  #topControls() {
    const wrapper = this.#builder.element("section", { className: "top-controls" });
    wrapper.append(this.#builder.element("div"));
    const power = new PowerButton((action) => this.#handleCommand(action));
    this.#buttons.push(power);
    const mic = new RemoteButton({ icon: "MIC", command: null, ariaLabel: "Microfone", variant: "remote-button--circle remote-button--microphone", disabled: true, disabledReason: "Comando de voz aguardando integracao segura." });
    const right = this.#builder.element("div", { className: "top-controls__right" });
    right.append(mic.element);
    wrapper.append(power.element, right);
    return wrapper;
  }

  #mainControls() {
    const main = this.#builder.element("section", { className: "remote-main" });
    const volume = new VolumeRail((action) => this.#handleCommand(action));
    const channel = new ChannelRail((action) => this.#handleCommand(action));
    this.#buttons.push(...volume.buttons, ...channel.buttons);
    const center = this.#builder.element("div", { className: "remote-center" });
    const dpad = new DPad((action) => this.#handleCommand(action));
    this.#buttons.push(...dpad.buttons);
    center.append(dpad.element, this.#primaryRow(), this.#shortcutGrid());
    main.append(volume.element, center, channel.element);
    return main;
  }

  #primaryRow() {
    const row = this.#builder.element("section", { className: "shortcut-grid primary-row" });
    const buttons = [
      new RemoteButton({ label: "BACK", command: "BACK", ariaLabel: "Voltar", onPress: (action) => this.#handleCommand(action) }),
      new RemoteButton({ label: "HOME", command: "HOME", ariaLabel: "Home", onPress: (action) => this.#handleCommand(action) }),
      new RemoteButton({ label: "PLAY", command: "PLAY_PAUSE", ariaLabel: "Play Pause", onPress: (action) => this.#handleCommand(action) })
    ];
    this.#buttons.push(...buttons);
    row.append(...buttons.map((button) => button.element));
    return row;
  }

  #shortcutGrid() {
    const grid = this.#builder.element("section", { className: "shortcut-grid" });
    const buttons = [
      new RemoteButton({ label: "SOURCE", command: "SOURCE", ariaLabel: "Source", onPress: (action) => this.#handleCommand(action) }),
      new RemoteButton({ label: "MENU", command: "MENU", ariaLabel: "Menu", onPress: (action) => this.#handleCommand(action) }),
      new RemoteButton({ label: "SETTINGS", command: null, ariaLabel: "Settings", disabled: true, disabledReason: "Indisponivel ate a TV confirmar suporte." }),
      new RemoteButton({ label: "INFO", command: null, ariaLabel: "Info", disabled: true, disabledReason: "Indisponivel ate a TV confirmar suporte." }),
      new RemoteButton({ label: "EXIT", command: null, ariaLabel: "Exit", disabled: true, disabledReason: "Indisponivel ate a TV confirmar suporte." }),
      new RemoteButton({ label: "APPS", command: null, ariaLabel: "Apps", onPress: () => this.#appsSheet.open() }),
      new RemoteButton({ label: "123", command: null, ariaLabel: "Teclado numerico", onPress: () => this.#numericSheet.open() }),
      new RemoteButton({ label: "EXTRA", command: null, ariaLabel: "Extras", onPress: () => this.#extrasSheet.open() })
    ];
    this.#buttons.push(...buttons.filter((button) => button.command));
    grid.append(...buttons.map((button) => button.element));
    return grid;
  }

  #footerControls() {
    const footer = this.#builder.element("footer", { className: "remote-footer" });
    const buttons = [
      new RemoteButton({ label: "REW", command: "REWIND", ariaLabel: "Retroceder", onPress: (action) => this.#handleCommand(action) }),
      new RemoteButton({ label: "PAUSE", command: "PAUSE", ariaLabel: "Pause", onPress: (action) => this.#handleCommand(action) }),
      new RemoteButton({ label: "FF", command: "FAST_FORWARD", ariaLabel: "Avancar", onPress: (action) => this.#handleCommand(action) })
    ];
    this.#buttons.push(...buttons);
    footer.append(...buttons.map((button) => button.element));
    return footer;
  }

  async #handleCommand(action) {
    if (!action.command) {
      return;
    }
    action.element?.setAttribute("aria-busy", "true");
    const result = await this.#controller.send(action.command, action.parameters ?? {});
    action.element?.setAttribute("aria-busy", "false");
    this.#statusLine.textContent = `Metodo: ${result.method}`;
    this.#toast.show(result.status === "unsupported" || result.status === "error" ? result.message : `${action.command} via ${result.method}`);
  }
}
