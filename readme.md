> Declaratively generate Vera Molnár inspired images using the CSS Paint API

### Setup
```sh
# Fetch latest from github
npm i thewhodidthis/cell
```

### Usage
```js
// Load worklet
if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('cell.js').catch(console.log)
}
```
