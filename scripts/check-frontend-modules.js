const { execFileSync } = require("node:child_process");
const { readdirSync, statSync } = require("node:fs");
const { join } = require("node:path");

class FrontendModuleSyntaxChecker {
  static #ROOT = join(process.cwd(), "public", "js");

  run() {
    for (const filePath of this.#javascriptFiles(FrontendModuleSyntaxChecker.#ROOT)) {
      execFileSync(process.execPath, ["--check", filePath], { stdio: "inherit" });
    }
    execFileSync(process.execPath, ["--check", join(process.cwd(), "public", "service-worker.js")], { stdio: "inherit" });
  }

  *#javascriptFiles(directory) {
    for (const entry of readdirSync(directory)) {
      const filePath = join(directory, entry);
      const stats = statSync(filePath);
      if (stats.isDirectory()) {
        yield* this.#javascriptFiles(filePath);
      }
      if (stats.isFile() && entry.endsWith(".js")) {
        yield filePath;
      }
    }
  }
}

new FrontendModuleSyntaxChecker().run();
