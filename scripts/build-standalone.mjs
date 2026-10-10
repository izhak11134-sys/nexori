import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { products } from '../src/data.js';
import { validateCatalog } from '../src/catalog.js';
import { buildFirebaseHtml, embeddedArtwork } from './build-firebase-html.mjs';

validateCatalog(products);

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root, name), 'utf8');
const assets = await embeddedArtwork();
const css = [await read('src/style.css'), await read('src/enhancements.css')].join('\n');
const data = (await read('src/data.js')).replace(/^export /gm, '');
const catalog = (await read('src/catalog.js')).replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
const content = (await read('src/content.js')).replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
const policy = (await read('src/policies.js')).replace(/^export /gm, '');
const main = (await read('src/main.js')).replace(/^import .*;\r?\n/gm, '');
const script = `window.NEXORI_ART = ${JSON.stringify(assets)};\n${data}\n${catalog}\n${policy}\n${content}\nconst info = policies;\n${main}`.replace(/<\/script/gi, '<\\/script');
const entryHtml = await read('index.html');
let html = entryHtml;
html = html.replace('href="/assets/mark.svg"', `href="${assets.mark}"`)
  .replace('</head>', `<style>\n${css}\n</style>\n<script id="nexori-content-data" type="application/json">{"version":1,"changes":{}}</script>\n</head>`)
  .replace('<script type="module" src="/src/site-entry.js"></script>', `<script type="module">\n${script}\n</script>`);
const cloudHtml=await buildFirebaseHtml(entryHtml,assets);
await writeFile(path.join(root, 'NEXORI.html'), cloudHtml);
console.log(`Created standalone NEXORI.html (${Buffer.byteLength(cloudHtml)} bytes), including the Firebase sign-in/editor and ${Object.keys(assets).length} embedded images.`);
const editorCss = await read('src/owner-editor.css');
const editorJs = (await read('src/owner-editor.js')).replace(/^import .*;\r?\n/gm, '').replace(/<\/script/gi, '<\\/script');
const template = JSON.stringify(html).replace(/</g,'\\u003c');
const ownerHtml = html.replace('</head>',`<meta name="robots" content="noindex,nofollow"><style>${editorCss}</style><script>window.NEXORI_OWNER_MODE = true;</script></head>`)
  .replace(`<script type="module">\n${script}\n</script>`,`<script type="module">\n${script}\n${editorJs}\nmountOwnerEditor();\n</script>`)
  .replace('</body>',`<script id="nexori-export-template" type="application/json">${template}</script></body>`);
await writeFile(path.join(root,'NEXORI-editor.html'),ownerHtml);
console.log(`Created separate NEXORI-editor.html (${Buffer.byteLength(ownerHtml)} bytes), with local draft editing and clean visitor export.`);
