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
      Array.from({ length: this.size })
        .map(() => document.createElement('div'))
        .forEach((node) => {
          this.shadowRoot.appendChild(node)
        })
    }
  }
}

window.customElements.define('simple-grid', Grid, { extends: 'div' })
window.customElements.whenDefined('simple-grid').then(() => {
  const listMaybe = document.querySelectorAll('div')
  const list = Array.from(listMaybe)
    .filter(o => o.hasAttribute('title'))
    .filter(o => o.hasAttribute('id'))

  const seed = Math.floor(Math.random() * list.length)
  const mark = list[seed]

  document.location.hash = mark.id

  for (const node of list) {
    const link = document.createElement('link')
    const path = node.getAttribute('title')
      .trim()
      .toLowerCase()
      .split(' ')
      .join('-')
      .replace(/[()]/g, '')
      .replace('é', 'e')

    link.setAttribute('href', `${path}.css`)
    link.setAttribute('rel', 'stylesheet')

    node.shadowRoot.appendChild(link)
  }
})
