const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

describe("Service worker PWA", () => {
  it("deve deixar recursos externos seguirem pela politica CSP do navegador", () => {
    const source = readFileSync(join(process.cwd(), "public", "service-worker.js"), "utf8");

    assert.match(source, /const CACHE_NAME = "controle-tv-pwa-v7"/);
    assert.match(source, /const requestUrl = new URL\(event\.request\.url\);[\s\S]*requestUrl\.origin !== self\.location\.origin/);
  });
});
