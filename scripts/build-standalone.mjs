import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root, name), 'utf8');
const assets = {};
for (const name of await readdir(path.join(root, 'public/assets'))) {
  const extension = path.extname(name);
  const mime = {'.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp'}[extension];
  if (mime) {
    const bytes = await readFile(path.join(root, 'public/assets', name));
    assets[path.basename(name, extension)] = `data:${mime};base64,${bytes.toString('base64')}`;
  }
}
const css = [await read('src/style.css'), await read('src/enhancements.css')].join('\n');
const data = (await read('src/data.js')).replace(/^export /gm, '');
const policy = (await read('src/policies.js')).replace(/^export /gm, '');
const main = (await read('src/main.js')).replace(/^import .*;\r?\n/gm, '');
const script = `window.NEXORI_ART = ${JSON.stringify(assets)};\n${data}\n${policy}\nconst info = policies;\n${main}`.replace(/<\/script/gi, '<\\/script');
let html = await read('index.html');
html = html.replace('href="/assets/mark.svg"', `href="${assets.mark}"`)
  .replace('</head>', `<style>\n${css}\n</style>\n</head>`)
  .replace('<script type="module" src="/src/main.js"></script>', `<script type="module">\n${script}\n</script>`);
await writeFile(path.join(root, 'NEXORI.html'), html);
console.log(`Created standalone NEXORI.html (${Buffer.byteLength(html)} bytes); styles, logic, and ${Object.keys(assets).length} images embedded.`);
