const fs = require('fs');
let css = fs.readFileSync('dist/style.css', 'utf-8');

// Use a regex to replace the main { ... } block
css = css.replace(
  /main\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*270px minmax\(300px, 1fr\) 340px;\s*min-height:\s*calc\(100dvh - 78px\);\s*\}/,
  `main {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(300px, 3fr) minmax(280px, 1.5fr);
  height: calc(100dvh - 78px);
}
main > * {
  min-width: 0;
}`
);

// Remove the hardcoded sizes in media queries to let the flex grid handle it
css = css.replace(
  /@media \(min-width: 1500px\) \{[\s\S]*?\n\}/g,
  ``
);

css = css.replace(
  /grid-template-columns: 225px minmax\(270px, 1fr\) 300px;/g,
  `grid-template-columns: minmax(200px, 1fr) minmax(300px, 3fr) minmax(250px, 1.5fr);`
);

css = css.replace(
  /grid-template-columns: 210px 1fr;/g,
  `grid-template-columns: minmax(200px, 1fr) minmax(300px, 3fr);`
);

// We should also make sure viewer canvas resizes
css = css.replace(
  /#canvas canvas\s*\{/g,
  `#canvas canvas {\n  width: 100% !important;\n  height: 100% !important;\n`
);

fs.writeFileSync('dist/style.css', css);
