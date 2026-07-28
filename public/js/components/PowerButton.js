import { RemoteButton } from "./RemoteButton.js";

export class PowerButton {
  #button;

  constructor(onPress) {
    this.#button = new RemoteButton({
      label: "",
      icon: "PWR",
      command: "POWER_OFF",
      ariaLabel: "Power",
      variant: "remote-button--circle remote-button--power",
      onPress
    });
  }

  get element() {
    return this.#button.element;
  }

  get command() {
    return this.#button.command;
  }

  setAvailability(availability) {
    this.#button.setAvailability(availability);
  }
}
