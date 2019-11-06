class Grid extends HTMLDivElement {
  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    if (this.isConnected) {
      // Create a `data-size` total of empty `<div>` cells
      Array.from({ length: this.dataset.size })
        .map(() => document.createElement('div'))
        .forEach((x) => {
          this.shadowRoot.appendChild(x)
        })
    }
  }
}

// Register custom elements, load cell.js worklet
if ('paintWorklet' in CSS) {
  customElements.define('simple-grid', Grid, { extends: 'div' })
  customElements.whenDefined('simple-grid')
    .then(() => {
      CSS.paintWorklet.addModule('cell.js')
        .then(() => {
          // Extract css filename from title, attach inline import with each element's shadow DOM
          const list = document.querySelectorAll('div')

          for (const host of list) {
            const style = document.createElement('style')
            const filename = host.dataset.name.trim()
              .toLowerCase()
              .split(' ')
              .join('-')
              .replace(/[()]/g, '')
              .replace('é', 'e')

            style.textContent = `@import '${filename}.css';`

            host.shadowRoot.appendChild(style)
          }
        })
        .catch(console.log)
    })
}
