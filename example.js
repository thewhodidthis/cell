class Grid extends HTMLDivElement {
  constructor() {
    super()

    this.attachShadow({ mode: "open" })
  }
  connectedCallback() {
    if (this.isConnected) {
      // Create a `data-size` total of empty `<div>` cells.
      Array.from({ length: this.dataset.size })
        .map(() => document.createElement("div"))
        .forEach((x) => {
          this.shadowRoot.appendChild(x)
        })
    }
  }
}

// Register custom elements, load worklet.
if ("paintWorklet" in CSS) {
  customElements.define("simple-grid", Grid, { extends: "div" })
  customElements.whenDefined("simple-grid")
    .then(() => {
      CSS.paintWorklet.addModule("cell.js")
        .then(() => {
          const style = document.createRange().createContextualFragment(`
            <style>
              @import "dialog-between-emotion-and-method.css"
            </style>
          `)

          document.querySelector("div")
            .shadowRoot
            .append(style)
        })
        .catch(console.log)
    })
}
