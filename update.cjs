const fs = require('fs');
let css = fs.readFileSync('dist/style.css', 'utf-8');

// 1. Update the base main rule
css = css.replace(
  /main \{\n  display: grid;\n  grid-template-columns: 270px minmax\(300px, 1fr\) 340px;\n  min-height: calc\(100dvh - 78px\);\n\}/,
  `main {
  display: grid;
  grid-template-columns: minmax(260px, 1.2fr) minmax(320px, 3fr) minmax(300px, 1.5fr);
  height: calc(100dvh - 78px);
}
main > * {
  min-width: 0;
  min-height: 0;
}`
);

// 2. Ensure .viewer resizes properly by making it flex and height 100%
css = css.replace(
  /\.viewer \{\n  position: sticky;\n  top: 0;\n  height: calc\(100dvh - 78px\);\n  min-height: 580px;/,
  `.viewer {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;`
);

css = css.replace(
  /#canvas canvas \{\n  display: block;\n  touch-action: none;\n\}/,
  `#canvas canvas {
  display: block;
  touch-action: none;
  width: 100% !important;
  height: 100% !important;
}`
);

// 3. Update the max-width: 1500px breakpoint
css = css.replace(
  /  main \{\n    grid-template-columns: 295px minmax\(300px, 1fr\) 375px;\n  \}/,
  `  main {
    grid-template-columns: minmax(280px, 1.2fr) minmax(300px, 3fr) minmax(340px, 1.5fr);
  }`
);

// 4. Update the max-width: 1100px breakpoint
css = css.replace(
  /  main \{\n    grid-template-columns: 225px minmax\(270px, 1fr\) 300px;\n  \}/,
  `  main {
    grid-template-columns: minmax(220px, 1fr) minmax(300px, 2.5fr) minmax(280px, 1.5fr);
  }`
);

// 5. Update the max-width: 850px breakpoint
css = css.replace(
  /  main \{\n    grid-template-columns: 210px 1fr;\n  \}/,
  `  main {
    grid-template-columns: minmax(210px, 1fr) minmax(300px, 3fr);
    grid-template-rows: calc(100dvh - 65px) auto;
    height: auto;
  }`
);

css = css.replace(
  /  \.viewer \{\n    height: 690px;\n    position: relative;\n    grid-column: 2;\n  \}/,
  `  .viewer {
    height: 100%;
    grid-column: 2;
    grid-row: 1;
  }`
);

css = css.replace(
  /  \.observations \{\n    grid-column: 1\/-1;\n    max-height: none;\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 0 28px;\n  \}/,
  `  .observations {
    grid-column: 1 / -1;
    grid-row: 2;
    max-height: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    height: auto;
  }`
);

// 6. Update the max-width: 550px breakpoint (mobile)
css = css.replace(
  /  main \{\n    display: flex;\n    flex-direction: column;\n  \}/,
  `  main {
    display: flex;
    flex-direction: column;
    height: auto;
  }`
);

css = css.replace(
  /  \.viewer \{\n    height: 620px;\n    min-height: 620px;\n    width: 100%;\n  \}/,
  `  .viewer {
    height: 60vh;
    min-height: 400px;
    width: 100%;
  }`
);

fs.writeFileSync('dist/style.css', css);
