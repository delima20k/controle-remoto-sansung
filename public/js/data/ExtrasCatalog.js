export class ExtrasCatalog {
  static #EXTRAS = [
    ["Sleep", null],
    ["Picture Mode", null],
    ["Sound Mode", null],
    ["Caption", null],
    ["Input", "SOURCE"],
    ["HDMI 1", null],
    ["HDMI 2", null],
    ["HDMI 3", null],
    ["HDMI 4", null],
    ["USB", null],
    ["Game Mode", null],
    ["Ambient Mode", null],
    ["Energy Saving", null],
    ["Multi View", null],
    ["Screen Mirroring", null]
  ];

  getAll() {
    return ExtrasCatalog.#EXTRAS.map(([label, command]) => ({ label, command, availableByDefault: Boolean(command) }));
  }
}
