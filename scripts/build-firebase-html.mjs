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
  const script=chunks[0].code.replace(/<\/script/gi,'<\\/script');
  return html.replace('href="/assets/mark.svg"',`href="${assets.mark}"`)
    .replace('</head>',()=>`<meta name="robots" content="noindex,nofollow"><style>${css.replace(/<\/style/gi,'<\\/style')}</style><script>window.NEXORI_ART=${JSON.stringify(assets).replace(/</g,'\\u003c')};</script></head>`)
    .replace('<script type="module" src="/src/site-entry.js"></script>',()=>`<script type="module">${script}</script>`);
}
