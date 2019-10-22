class Grid extends HTMLDivElement {
  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
  }

  get size() {
    const v = this.hasAttribute('size') ? this.getAttribute('size') : 24

    return parseInt(v, 10)
  }

  set size(v) {
    if (v) {
      this.setAttribute('size', v)
    }
  }

  connectedCallback() {
    if (this.isConnected) {
      // Create a `size` attr total of empty `<div>` cells
      Array.from({ length: this.size })
        .map(() => document.createElement('div'))
        .forEach((x) => {
          this.shadowRoot.appendChild(x)
        })
    }
  }
}

// Register custom elements, load cell.js worklet
window.customElements.define('simple-grid', Grid, { extends: 'div' })
window.customElements.whenDefined('simple-grid').then(() => {
  if ('paintWorklet' in CSS) {
    CSS.paintWorklet.addModule('cell.js')
      .then(() => {
        // Extract css filename from title, attach inline import with each element's shadow DOM
        const list = document.querySelectorAll('div')

        for (const host of list) {
          const style = document.createElement('style')
          const filename = host.getAttribute('title')
            .trim()
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
  }
})
