export class DomBuilder {
  element(tagName, options = {}) {
    const element = document.createElement(tagName);
    if (options.className) {
      element.className = options.className;
    }
    if (options.text !== undefined) {
      element.textContent = options.text;
    }
    for (const [name, value] of Object.entries(options.attributes ?? {})) {
      if (value !== undefined && value !== null) {
        element.setAttribute(name, String(value));
      }
    }
    return element;
  }
}
