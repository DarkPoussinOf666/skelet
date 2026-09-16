const fs = require('fs');
let css = fs.readFileSync('dist/style.css', 'utf-8');

// First, restore to a clean state by replacing the main blocks
css = css.replace(/main\s*\{[\s\S]*?min-width:\s*0;\s*\}/, `main {
  display: grid;
  grid-template-columns: minmax(240px, 2fr) minmax(300px, 6fr) minmax(280px, 3fr);
  height: calc(100dvh - 78px);
}
main > * {
  min-width: 0;
  min-height: 0;
}`);

// Ensure the viewer is flexible
css = css.replace(/\.viewer\s*\{[\s\S]*?position:\s*sticky;/, `.viewer {
  display: flex;
  flex-direction: column;
  position: relative;`);

fs.writeFileSync('dist/style.css', css);
