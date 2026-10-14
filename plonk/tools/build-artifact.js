// Bouwt één zelfstandige pagina (alles inline) voor publicatie als artifact.
// Gebruik: node tools/build-artifact.js  → dist/plonk.html
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8').replace(/<\/script/gi, '<\\/script');
const scripts = ['lib/matter.min.js', 'js/sim.js', 'js/levels.js', 'js/audio.js', 'js/poki.js', 'js/game.js'];
const html = `<title>PLONK!</title>
<style>
  :root { color-scheme: dark; }
  html, body { margin: 0; height: 100%; background: #1A1446; overflow: hidden; touch-action: none; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; }
  canvas { display: block; touch-action: none; }
  #loader { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; color: #FFE66B; background: #1A1446; font: 800 32px 'Arial Rounded MT Bold', 'Trebuchet MS', system-ui, sans-serif; }
</style>
<div id="loader">PLONK!</div>
<canvas id="game"></canvas>
${scripts.map(s => `<script>\n${R(s)}\n</script>`).join('\n')}
`;
fs.mkdirSync(path.join(__dirname, '..', 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'plonk.html'), html);
// muziek naast de pagina (wordt als los bestand meegepubliceerd)
fs.mkdirSync(path.join(__dirname, '..', 'dist', 'music'), { recursive: true });
for (const f of fs.readdirSync(path.join(__dirname, '..', 'music'))) fs.copyFileSync(path.join(__dirname, '..', 'music', f), path.join(__dirname, '..', 'dist', 'music', f));
console.log('dist/plonk.html', (html.length / 1024).toFixed(0) + ' KB');
