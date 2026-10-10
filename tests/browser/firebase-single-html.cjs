const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const {spawn}=require('node:child_process');
const {tmpdir}=require('node:os');
const {join}=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

(async()=>{
  const directory=await fs.mkdtemp(join(tmpdir(),'nexori single HTML בדיקה '));let server;
  try {
    const {buildFirebaseHtml,embeddedArtwork}=await import('../../scripts/build-firebase-html.mjs');
    const config={apiKey:'demo-key',projectId:'demo-nexori',authDomain:'demo-nexori.firebaseapp.com',appId:'demo-app',useEmulators:true};
    const html=await buildFirebaseHtml(await fs.readFile('index.html','utf8'),await embeddedArtwork(),{demoConfiguration:config});
    assert.doesNotMatch(html,/<script[^>]+src=/i);assert.doesNotMatch(html,/<link[^>]+rel="stylesheet"/i);
    const filename=join(directory,'NEXORI.html');await fs.writeFile(filename,html);
    server=http.createServer((req,res)=>{
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
      res.end(req.url==='/opaque'?`<!doctype html><iframe title="Opaque-origin editor" sandbox="allow-scripts allow-forms allow-modals allow-downloads" style="border:0;width:100vw;height:100vh" src="/NEXORI.html#/admin"></iframe>`:html);
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=`http://127.0.0.1:${server.address().port}`;
    const url=process.argv.includes('--file')?pathToFileURL(filename).href:`${base}/NEXORI.html`;
    await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,['tests/browser/firebase-spark.cjs'],{env:{...process.env,NEXORI_SINGLE_HTML_URL:url},stdio:'inherit'});
      child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`Single HTML browser check exited ${code}.`)));
    });
    // HTTP sandbox gives the page an opaque origin and denies browser storage.
    // This tests null-origin SDK requests and memory fallback without relaxing
    // browser policy. It is not evidence of a successful file:// navigation.
    const email='opaque-owner@nexori.test',password='Demo-opaque-123!';
    const account=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});assert.equal(account.status,200);
    const {localId}=await account.json();
    const verified=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({localId,emailVerified:true})});assert.equal(verified.status,200);
    const {initializeTestEnvironment}=await import('@firebase/rules-unit-testing');const {doc,setDoc}=await import('firebase/firestore');
    const env=await initializeTestEnvironment({projectId:'demo-nexori',firestore:{host:'127.0.0.1',port:8080,rules:await fs.readFile('firestore.rules','utf8')}});
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try {
      await env.withSecurityRulesDisabled(ctx=>setDoc(doc(ctx.firestore(),'admins',localId),{active:true}));
      const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`${base}/opaque`);
      let frame;await p.waitForSelector('iframe');frame=p.frames().find(f=>f.url().includes('NEXORI.html'));
      await frame.locator('#admin-login-form').waitFor();assert.equal(await frame.evaluate(()=>globalThis.origin),'null');
      assert.equal(await frame.evaluate(()=>{try{sessionStorage.setItem('probe','1');return false;}catch{return true;}}),true);
      const login=async()=>{await frame.locator('[name=email]').fill(email);await frame.locator('[name=password]').fill(password);await frame.locator('#admin-login-form [type=submit]').click();await frame.getByRole('heading',{name:'מצב עריכה פעיל'}).waitFor();};
      await login();await frame.getByRole('link',{name:'Anime worlds',exact:true}).first().click();await frame.locator('[data-content-id="dragon-ball"]').click();await frame.locator('.franchise-banner>.owner-edit-button').click();await frame.locator('[name=pageTitle]').fill('Opaque origin Dragon Ball');await frame.locator('#owner-editor-dialog [type=submit]').click();await frame.locator('#owner-editor-dialog').waitFor({state:'hidden'});assert.equal(await frame.locator('h1').textContent(),'Opaque origin Dragon Ball');
      await p.reload();frame=p.frames().find(f=>f.url().includes('NEXORI.html'));await frame.locator('#admin-login-form').waitFor();await login();await frame.getByRole('link',{name:'Anime worlds',exact:true}).first().click();await frame.locator('[data-content-id="dragon-ball"]').click();assert.equal(await frame.locator('h1').textContent(),'Opaque origin Dragon Ball');
      await frame.locator('[data-admin-logout]').click();await frame.locator('.owner-toolbar').waitFor({state:'detached'});assert.equal(await frame.locator('.owner-edit-button').count(),0);assert.deepEqual(errors,[]);
      console.log('PASS: opaque-origin sign-in and cloud save across fresh sessions with browser storage unavailable. file:// and actual Windows/real-project access are separate checks.');
    } finally {await browser.close();await env.cleanup();}
  } finally {if(server)await new Promise(resolve=>server.close(resolve));await fs.rm(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exit(1);});
