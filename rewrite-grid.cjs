const fs = require('fs');
let css = fs.readFileSync('dist/style.css', 'utf-8');

// Strip out the old grid layout media queries
css = css.replace(/@media\s*\(min-width:\s*1500px\)\s*\{[\s\S]*?\n\}/g, '');
css = css.replace(/@media\s*\(max-width:\s*1100px\)\s*\{[\s\S]*?\n\}/g, '');
css = css.replace(/@media\s*\(max-width:\s*850px\)\s*\{[\s\S]*?\n\}/g, '');
css = css.replace(/@media\s*\(max-width:\s*550px\)\s*\{[\s\S]*?\n\}/g, '');

// Clean up existing main layout styles
css = css.replace(/main\s*\{[\s\S]*?min-height:\s*0;\n\}/, '/* MAIN_PLACEHOLDER */');

const newGrid = `main {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(320px, 2.5fr) minmax(300px, 1.5fr);
  height: calc(100dvh - 78px);
}
main > * {
  min-width: 0;
  min-height: 0;
}

@media (max-width: 1100px) {
  main {
    grid-template-columns: minmax(220px, 1fr) minmax(300px, 2.5fr);
    grid-template-rows: calc(100dvh - 78px) auto;
    height: auto;
  }
  .anatomy {
    grid-column: 1;
    grid-row: 1;
  }
  .viewer {
    grid-column: 2;
    grid-row: 1;
    height: 100%;
  }
  .observations {
    grid-column: 1 / -1;
    grid-row: 2;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    height: auto;
    max-height: none;
  }
  .brand span {
    display: none;
  }
}

@media (max-width: 768px) {
  main {
    grid-template-columns: 1fr;
    grid-template-rows: auto 60vh auto;
    height: auto;
  }
  .anatomy {
    grid-column: 1;
    grid-row: 1;
    max-height: 40vh;
  }
  .viewer {
    grid-column: 1;
    grid-row: 2;
    height: 60vh;
  }
  .observations {
    grid-column: 1;
    grid-row: 3;
    display: flex;
    flex-direction: column;
  }
  header {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 18px;
  }
  .quiet {
    display: none;
  }
  .section-label, .structures-head, .anatomy > .eyebrow {
    display: none;
  }
}`;

css = css.replace('/* MAIN_PLACEHOLDER */', newGrid);

// Ensure viewer behaves properly in the new grid
css = css.replace(/\.viewer\s*\{[\s\S]*?position:\s*relative;/g, `.viewer {
  display: flex;
  flex-direction: column;
  position: relative;`);
  
// Remove hardcoded height in viewer to let Grid layout handle it
css = css.replace(/height:\s*calc\(100dvh\s*-\s*78px\);\s*min-height:\s*580px;/g, '');

fs.writeFileSync('dist/style.css', css);
