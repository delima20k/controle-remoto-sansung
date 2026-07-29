const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

describe("CSP da Vercel", () => {
  it("deve permitir somente os endpoints oficiais necessarios ao App Check Enterprise", () => {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "vercel.json"), "utf8"));
    const csp = config.headers[0].headers.find((header) => header.key === "Content-Security-Policy").value;

    assert.equal(csp.includes("script-src 'self' https://www.gstatic.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/"), true);
    assert.equal(csp.includes("connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://api.smartthings.com https://www.google.com/recaptcha/"), true);
    assert.equal(csp.includes("frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/"), true);
  });
});
