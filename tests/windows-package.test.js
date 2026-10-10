import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { once } from 'node:events';
import http from 'node:http';

test('Windows download contains the configured main app and serves only built files over loopback',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'nexori Windows בדיקה '));
  let server;
  try {
    execFileSync('python3',['-c','import zipfile,sys; a=zipfile.ZipFile(sys.argv[1]); assert a.testzip() is None; assert not any(".env" in n or "node_modules" in n or n.endswith(".map") for n in a.namelist()); a.extractall(sys.argv[2])',resolve('downloads/NEXORI-Windows.zip'),directory]);
    const folder=join(directory,'NEXORI-Windows');
    const cmd=await readFile(join(folder,'START-NEXORI.cmd'),'utf8');
    execFileSync('python3',['-c','import zipfile,sys; fix=zipfile.ZipFile(sys.argv[1]); assert fix.testzip() is None; assert fix.namelist()==["START-NEXORI-FIX.cmd"]; assert fix.read("START-NEXORI-FIX.cmd")==open(sys.argv[2],"rb").read()',resolve('downloads/NEXORI-Start-Fix.zip'),join(folder,'START-NEXORI.cmd')]);
    assert.match(cmd,/cd \/d "%~dp0"/);assert.match(cmd,/node start-local\.mjs/);assert.ok(cmd.includes('\r\n'));
    const info=JSON.parse(await readFile(join(folder,'package-info.json'),'utf8'));assert.equal(info.mode,'local-only');assert.equal(info.projectId,'nexori-development');
    server=spawn(process.execPath,[join(folder,'start-local.mjs')],{env:{...process.env,NEXORI_LOCAL_PORT:'0',NEXORI_NO_OPEN:'true'},stdio:['ignore','pipe','pipe']});
    let output='',errors='';server.stderr.on('data',data=>{errors+=data;});
    const port=await new Promise((accept,reject)=>{
      const timeout=setTimeout(()=>reject(new Error(`Server did not start: ${errors}`)),5000);
      server.stdout.on('data',data=>{output+=data;const match=output.match(/http:\/\/localhost:(\d+)\/admin/);if(match){clearTimeout(timeout);accept(Number(match[1]));}});
      server.once('exit',()=>{clearTimeout(timeout);reject(new Error(`Server stopped early: ${errors}`));});
    });
    const base=`http://127.0.0.1:${port}`;
    const health=await(await fetch(`${base}/__nexori_local_health`)).json();assert.deepEqual(health,{app:'NEXORI',local:true});
    const html=await(await fetch(`${base}/`)).text();assert.match(html,/src="\/assets\//);
    for(const route of ['/admin','/worlds/dragon-ball','/collection?category=figures']){
      const response=await fetch(`${base}${route}`);assert.equal(response.status,200);assert.equal(await response.text(),html);
    }
    const entry=html.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
    const js=await fetch(`${base}${entry}`);assert.equal(js.status,200);assert.match(js.headers.get('content-type'),/javascript/);
    const image=await fetch(`${base}/assets/hero-banner.png`);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');
    for(const path of ['/assets/missing.js','/missing.png','/.env.local','/%2e%2e%2fSTART-NEXORI.cmd','/%5c..%5cREADME-Windows-he.txt'])assert.equal((await fetch(`${base}${path}`)).status,404,path);
    assert.equal((await fetch(`${base}/%broken`)).status,400);
    const head=await fetch(`${base}/admin`,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
    assert.equal((await fetch(`${base}/admin`,{method:'POST'})).status,405);
    const foreignHost=await new Promise((accept,reject)=>{http.get(`${base}/admin`,{headers:{host:'external.example'}},response=>{response.resume();accept(response.statusCode);}).on('error',reject);});assert.equal(foreignHost,403);
    assert.equal(errors,'');
  }finally{
    if(server&&server.exitCode===null){const stopped=once(server,'exit');server.kill('SIGTERM');await stopped;}
    await rm(directory,{recursive:true,force:true});
  }
});
