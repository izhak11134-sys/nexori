import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';
import { isIP } from 'node:net';

const folder = dirname(fileURLToPath(import.meta.url));
const site = resolve(folder, 'site');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2'};
const fail = message => { console.error(`\n${message}\n`); process.exitCode = 1; };
const inside = path => { const part=relative(site,path); return part!== '..'&&!part.startsWith(`..${sep}`)&&!isAbsolute(part); };
const privateIPv4 = address => {
  if(isIP(address)!==4)return false;
  const [a,b]=address.split('.').map(Number);
  return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168);
};
const ipNumber = address => address.split('.').reduce((result,part)=>(result*256+Number(part))>>>0,0);

function previewInterface(argument) {
  const choices=Object.entries(networkInterfaces()).flatMap(([name,addresses])=>
    (addresses??[]).filter(item=>!item.internal&&item.family==='IPv4'&&privateIPv4(item.address)&&isIP(item.netmask)===4&&ipNumber(item.netmask)!==0)
      .map(item=>({...item,name}))
  ).sort((a,b)=>Number(/wi.?fi|wlan|wireless/i.test(b.name))-Number(/wi.?fi|wlan|wireless/i.test(a.name)));
  const preferred=argument.slice('--lan'.length).replace(/^=/,'');
  if(preferred&&!privateIPv4(preferred))throw new Error('Use a private IPv4 address assigned to this computer, for example --lan=192.168.1.20.');
  const selected=preferred?choices.find(item=>item.address===preferred):choices[0];
  if(!selected)throw new Error('No matching home-network IPv4 address was found. Connect this computer to your home Wi-Fi, then try again.');
  return {selected,choices};
}

async function start() {
  if(Number(process.versions.node.split('.')[0])<22)throw new Error('Install Node.js LTS (22 or newer) from https://nodejs.org, then run node start-local.mjs.');
  const args=process.argv.slice(2);
  if(args.length>1||(args[0]&&!/^--lan(?:=.+)?$/.test(args[0])))throw new Error('Usage: node start-local.mjs [--lan or --lan=PRIVATE_IP]');
  const phoneMode=Boolean(args[0]);
  const preview=phoneMode?previewInterface(args[0]):null;
  const bindAddress=preview?.selected.address??'127.0.0.1';
  await readFile(resolve(site,'index.html'));
  const requested=Number(process.env.NEXORI_LOCAL_PORT??(phoneMode?5174:5173));
  if(!Number.isInteger(requested)||requested<0||requested>65535)throw new Error('Invalid local port.');
  const server=http.createServer(async (request,response)=>{
    const send=(status,body,type='text/plain; charset=utf-8')=>{
      response.writeHead(status,{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
      response.end(request.method==='HEAD'?undefined:body);
    };
    try {
      const host=request.headers.host??'';
      if(phoneMode) {
        if(host!==`${bindAddress}:${server.address().port}`)return send(403,'Home-network access only.');
        const peer=request.socket.remoteAddress??'';
        const mask=ipNumber(preview.selected.netmask);
        if(isIP(peer)!==4||!privateIPv4(peer)||(ipNumber(peer)&mask)!==(ipNumber(bindAddress)&mask))return send(403,'Home-network access only.');
      }else if(!/^(localhost|127\.0\.0\.1):\d+$/.test(host))return send(403,'Local access only.');
      if(!['GET','HEAD'].includes(request.method))return send(405,'Method not allowed.');
      const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
      if(pathname==='/__nexori_local_health')return send(200,JSON.stringify(phoneMode?{app:'NEXORI',local:true,mode:'home-network-preview'}:{app:'NEXORI',local:true}),'application/json; charset=utf-8');
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
    ?`Port ${requested} is already in use. Stop the other server using that port, then start again.`
    :`Local server could not start: ${error.message}`));
  server.listen(requested,bindAddress,()=>{
    if(phoneMode) {
      const url=`http://${bindAddress}:${server.address().port}`;
      console.log(`\nNEXORI home Wi-Fi preview\nOn your iPhone, open: ${url}\nUse the same home Wi-Fi on both devices. Keep this computer and this window running.\nThis does not deploy a website. Other devices on this local network can view the site while this mode runs.\nIf Windows asks for firewall permission, allow Node.js only on your trusted Private network.\nPress Ctrl+C to stop the preview.\n`);
      for(const item of preview.choices)if(item.address!==bindAddress)console.log(`If this is the wrong network adapter, stop and use: node start-local.mjs --lan=${item.address}`);
    }else {
      const url=`http://localhost:${server.address().port}/admin`;
      console.log(`\nNEXORI is running on your computer.\nOpen: ${url}\nKeep this window open while editing. Press Ctrl+C to stop.\n`);
    }
  });
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>process.exit(0)));
}
start().catch(error=>fail(error.code==='ENOENT'?'The site folder is missing. Extract the complete ZIP before starting.':error.message));
