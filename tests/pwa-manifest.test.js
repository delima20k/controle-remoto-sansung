const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

describe("Manifest PWA", () => {
  it("deve declarar icones PNG de 192 e 512 pixels para Android", () => {
    const publicDirectory = path.join(__dirname, "..", "public");
    const manifest = JSON.parse(fs.readFileSync(path.join(publicDirectory, "manifest.webmanifest"), "utf8"));
    const sizes = new Set(manifest.icons.filter((icon) => icon.type === "image/png").map((icon) => icon.sizes));

    assert.equal(sizes.has("192x192"), true);
    assert.equal(sizes.has("512x512"), true);
    assert.equal(fs.existsSync(path.join(publicDirectory, "assets", "icon-192.png")), true);
    assert.equal(fs.existsSync(path.join(publicDirectory, "assets", "icon-512.png")), true);
  });
});
