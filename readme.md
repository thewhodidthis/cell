## about

Declaratively generate [Vera Molnár](http://www.veramolnar.com) inspired images using the [CSS Paint API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API).

## setup

Fetch latest from GitHub,

```sh
# Includes ES and CJS versions
npm i thewhodidthis/cell
```

## usage

Load JS first,

```js
// Load worklet
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('cell.js').catch(console.log)
}
```

Then in CSS for example,

```css
@supports (background: paint(_)) {
  :host {
    background: whitesmoke;
    border: 0.20625rem solid transparent;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(9, 1fr);
  }

  div {
    --cell-fill-style: transparent;

    background-image: paint(quad), paint(quad), paint(quad), paint(quad), paint(quad), paint(quad);
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100%, 88%, 76%, 64%, 52%, 40%;
    margin: -0.4125rem;
  }

  div:nth-child(2n + 1) {
    background-size: 100%, 88%, 64%, 52%, 24%, 12%;
  }

  div:nth-child(3n + 2) {
    background-size: 100%, 88%, 76%, 0, 52%, 40%;
  }

  div:nth-child(5n + 3) {
    background-size: 100%, 88%, 76%, 64%, 40%, 12%;
  }
}
```

## see also

- [Pattern making with CSS Paint](https://thewhodidthis.com/pattern-making-with-css-paint/)
- [Quick sketches &rarr;](https://sketches.thewhodidthis.com/pattern-making/)
