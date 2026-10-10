import { copyFile, mkdir } from 'node:fs/promises';
await mkdir(new URL('../functions/shared/',import.meta.url),{recursive:true});
for (const name of ['content.js','data.js','policies.js']) await copyFile(new URL(`../src/${name}`,import.meta.url),new URL(`../functions/shared/${name}`,import.meta.url));
console.log('Synchronized server content schema with website.');
