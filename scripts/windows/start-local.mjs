import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';

const folder = dirname(fileURLToPath(import.meta.url));
const site = resolve(folder, 'site');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2'};
const fail = message => { console.error(`\n${message}\n`); process.exitCode = 1; };
const inside = path => { const part=relative(site,path); return part!== '..'&&!part.startsWith(`..${sep}`)&&!isAbsolute(part); };

async function start() {
  if(Number(process.versions.node.split('.')[0])<22)throw new Error('Install Node.js LTS (22 or newer) from https://nodejs.org and reopen START-NEXORI.cmd.');
  await readFile(resolve(site,'index.html'));
  const requested=Number(process.env.NEXORI_LOCAL_PORT??5173);
  if(!Number.isInteger(requested)||requested<0||requested>65535)throw new Error('Invalid local port.');
  const server=http.createServer(async (request,response)=>{
    const send=(status,body,type='text/plain; charset=utf-8')=>{
      response.writeHead(status,{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
      response.end(request.method==='HEAD'?undefined:body);
    };
    try {
      const host=request.headers.host??'';
      if(!/^(localhost|127\.0\.0\.1):\d+$/.test(host))return send(403,'Local access only.');
      if(!['GET','HEAD'].includes(request.method))return send(405,'Method not allowed.');
      const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
      if(pathname==='/__nexori_local_health')return send(200,JSON.stringify({app:'NEXORI',local:true}),'application/json; charset=utf-8');
      if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(part=>part.startsWith('.')))return send(404,'Not found.');
      const candidate=resolve(site,`.${pathname}`);
      if(!inside(candidate))return send(404,'Not found.');
      let filename=candidate;
      try {
        const canonical=await realpath(filename);
        if(!inside(canonical))return send(404,'Not found.');
        const info=await stat(canonical);
        if(!info.isFile())throw Object.assign(new Error('Not a file.'),{code:'ENOENT'});
        filename=canonical;
      }catch(error){
        if(!['ENOENT','ENOTDIR'].includes(error.code))throw error;
        // Routes like /admin and /worlds/dragon-ball use the application entry.
        // Missing assets must stay 404 instead of returning HTML as JavaScript.
        if(pathname.startsWith('/assets/')||extname(pathname))return send(404,'Not found.');
        filename=resolve(site,'index.html');
      }
      return send(200,await readFile(filename),mime[extname(filename)]??'application/octet-stream');
    }catch(error){return send(error instanceof URIError?400:500,'Request could not be completed.');}
  });
  server.on('error',error=>fail(error.code==='EADDRINUSE'
    ?'Port 5173 is already in use. Close the other NEXORI window, then start again.'
    :`Local server could not start: ${error.message}`));
  server.listen(requested,'127.0.0.1',()=>{
    const url=`http://localhost:${server.address().port}/admin`;
    console.log(`\nNEXORI is running on your computer.\nOpen: ${url}\nKeep this window open while editing. Press Ctrl+C to stop.\n`);
    if(process.platform==='win32'&&process.env.NEXORI_NO_OPEN!=='true'){
      execFile('cmd.exe',['/d','/s','/c',`start "" "${url}"`],{windowsHide:true},error=>{
        if(error)console.log('Open the address above in your browser.');
      });
    }
  });
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>process.exit(0)));
}
start().catch(error=>fail(error.code==='ENOENT'?'The site folder is missing. Extract the complete ZIP before starting.':error.message));
