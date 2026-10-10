import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));

export async function embeddedArtwork() {
  const assets={};
  for(const name of await readdir(path.join(root,'public/assets'))) {
    const extension=path.extname(name),mime={'.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'}[extension];
    if(mime)assets[path.basename(name,extension)]=`data:${mime};base64,${(await readFile(path.join(root,'public/assets',name))).toString('base64')}`;
  }
  return assets;
}

// Bundle the actual cloud app, including lazy Firebase/editor modules, into one
// inline script. No CDN imports or local module fetches are needed on file://.
export async function buildFirebaseHtml(html,assets,{demoConfiguration}={}) {
  if(demoConfiguration&&!demoConfiguration.projectId?.startsWith('demo-'))throw new Error('HTML test configuration must use an isolated demo project.');
  const result=await build({
    root,configFile:false,
    plugins:demoConfiguration?[{name:'nexori-demo-html',transform(source,id){
      if(id.endsWith('/src/firebase-config.js'))return `export function firebaseConfiguration(){return ${JSON.stringify(demoConfiguration)};}`;
    }}]:[],
    build:{write:false,minify:true,modulePreload:false,chunkSizeWarningLimit:1024,
      rollupOptions:{input:fileURLToPath(new URL('../src/site-entry.js',import.meta.url)),output:{inlineDynamicImports:true,entryFileNames:'site.js'}}},
  });
  const chunks=result.output.filter(item=>item.type==='chunk');
  if(chunks.length!==1)throw new Error('Standalone Firebase HTML must contain exactly one JavaScript bundle.');
  const css=result.output.filter(item=>item.type==='asset'&&item.fileName.endsWith('.css')).map(item=>item.source).join('\n');
  const accessCss='.local-owner-access{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:10px 24px;background:#1b1028;border-bottom:1px solid #b58aff66;color:#eadbff;font:14px/1.5 system-ui,sans-serif}.local-owner-access a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 18px;border:1px solid #bd91f1;border-radius:9px;background:#342047;color:#fff;font-size:18px;font-weight:700;box-shadow:0 0 18px #b58aff22}.local-owner-access a:focus-visible{outline:2px solid #ed9acb;outline-offset:4px}.footer-bottom a[href="#/admin"]{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border:1px solid #bd91f1;border-radius:9px;background:#342047;color:#fff;font-size:16px;font-weight:700}.local-owner-access span{font-size:13px;color:#c5b2db}@media(max-width:480px){.local-owner-access{padding:8px 16px;gap:8px}.local-owner-access a{padding:8px 13px}}';
  const script=chunks[0].code.replace(/<\/script/gi,'<\\/script');
  return html.replace('href="/assets/mark.svg"',`href="${assets.mark}"`)
    .replace('</head>',()=>`<meta name="robots" content="noindex,nofollow"><style>${css.replace(/<\/style/gi,'<\\/style')}${accessCss}</style><script>window.NEXORI_ART=${JSON.stringify(assets).replace(/</g,'\\u003c')};</script></head>`)
    .replace('<body>',()=>'<body><aside class="local-owner-access" lang="he" dir="rtl" aria-label="גישה לניהול האתר"><a href="#/admin" data-link>כניסה לניהול האתר</a><span>NEXORI — הקובץ המחובר לניהול</span></aside>')
    .replace('<script type="module" src="/src/site-entry.js"></script>',()=>`<script type="module">${script}</script>`);
}
