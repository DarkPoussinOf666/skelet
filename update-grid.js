const fs = require('fs');
let css = fs.readFileSync('dist/style.css', 'utf-8');

// Replace the main grid and media queries
css = css.replace(
  /main\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*270px minmax\(300px, 1fr\) 340px;/g,
  `main {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) minmax(0, 5fr) minmax(280px, 3fr);`
);

css = css.replace(
  /min-height:\s*calc\(100dvh\s*-\s*78px\);/g,
  `height: calc(100dvh - 78px);
  min-height: calc(100dvh - 78px);`
);

// We need to also add min-width: 0 and min-height: 0 to the children so they can shrink
css = css.replace(
  /\.anatomy\s*\{/g,
  `.anatomy {
  min-width: 0; min-height: 0; overflow-y: auto; overflow-x: hidden;`
);

css = css.replace(
  /\.viewer\s*\{/g,
  `.viewer {
  min-width: 0; min-height: 0;`
);

css = css.replace(
  /\.observations\s*\{/g,
  `.observations {
  min-width: 0; min-height: 0;`
);

fs.writeFileSync('dist/style.css', css);
