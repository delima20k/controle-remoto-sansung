export class Haptics {
  pulse(duration = 12) {
    if (globalThis.navigator?.vibrate) {
      globalThis.navigator.vibrate(duration);
    }
  }
}
