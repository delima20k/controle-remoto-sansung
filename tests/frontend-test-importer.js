const { pathToFileURL } = require("node:url");
const path = require("node:path");

class FrontendTestImporter {
  static import(relativePath) {
    return import(pathToFileURL(path.join(__dirname, "..", "public", "js", relativePath)).href);
  }
}

module.exports = { FrontendTestImporter };
