export class PressRepeater {
  #callback;
  #initialDelay;
  #intervalDelay;
  #timeoutId = null;
  #intervalId = null;
  #active = false;

  constructor(callback, options = {}) {
    this.#callback = callback;
    this.#initialDelay = options.initialDelay ?? 420;
    this.#intervalDelay = options.intervalDelay ?? 140;
  }

  start() {
    if (this.#active) {
      return false;
    }
    this.#active = true;
    this.#callback();
    this.#timeoutId = globalThis.setTimeout(() => {
      this.#intervalId = globalThis.setInterval(() => this.#callback(), this.#intervalDelay);
    }, this.#initialDelay);
    return true;
  }

  stop() {
    if (this.#timeoutId !== null) {
      globalThis.clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }
    if (this.#intervalId !== null) {
      globalThis.clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
    this.#active = false;
  }

  isActive() {
    return this.#active;
  }
}
