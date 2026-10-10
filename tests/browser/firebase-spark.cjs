const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const base='http://127.0.0.1:5173';
const config={apiKey:'demo-key',projectId:'demo-nexori',authDomain:'demo-nexori.firebaseapp.com',appId:'demo-app',useEmulators:true};
async function emulatorAccount(email,verified){
  const response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'Demo-owner-123!',returnSecureToken:true})});assert.equal(response.status,200);
  const {localId}=await response.json();
  if(verified){const update=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({localId,emailVerified:true})});assert.equal(update.status,200);}
  return localId;
}
(async()=>{
  const {initializeTestEnvironment}=await import('@firebase/rules-unit-testing');
  const {doc,setDoc,getDoc}=await import('firebase/firestore');
  const env=await initializeTestEnvironment({projectId:'demo-nexori',firestore:{host:'127.0.0.1',port:8080,rules:await fs.readFile('firestore.rules','utf8')}});
  await env.clearFirestore();await fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-nexori/accounts',{method:'DELETE'});
  const uid=await emulatorAccount('owner@nexori.test',true);
  await env.withSecurityRulesDisabled(context=>setDoc(doc(context.firestore(),'admins',uid),{active:true}));
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const errors=[],network=[];
  async function context(){const ctx=await browser.newContext({viewport:{width:1440,height:1000}});await ctx.route('**/src/firebase-config.js*',r=>r.fulfill({contentType:'application/javascript',body:`export function firebaseConfiguration(){return ${JSON.stringify(config)};}`}));ctx.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>network.push(r.url()));p.on('dialog',d=>d.accept());});return ctx;}
  try{
    const ownerContext=await context(),visitorContext=await context(),p=await ownerContext.newPage(),visitor=await visitorContext.newPage();
    await p.goto(base+'/admin');await p.locator('#admin-login-form').waitFor();
    await p.locator('[name=email]').fill('owner@nexori.test');await p.locator('[name=password]').fill('Demo-owner-123!');await p.locator('#admin-login-form [type=submit]').click();
    await p.getByRole('heading',{name:'מצב עריכה פעיל'}).waitFor({timeout:10000}).catch(async error=>{throw new Error(error.message+'; admin: '+await p.locator('#firebase-admin-page').textContent()+'; errors: '+JSON.stringify(errors)+'; auth requests: '+JSON.stringify(network.filter(url=>url.includes('9099'))) );});console.log('Owner signed in.');
    await p.getByRole('link',{name:'Anime worlds',exact:true}).first().click();
    for(const id of ['one-piece','naruto','demon-slayer','jujutsu-kaisen','dragon-ball','attack-on-titan']){
      const card=p.locator(`[data-content-id="${id}"]`).locator('..');await card.locator('.owner-edit-button').click();
      assert.equal(await p.locator('[name=cardTitle]').count(),1);assert.equal(await p.locator('[name=pageTitle]').count(),1);await p.getByRole('button',{name:'ביטול',exact:true}).click();
    }
    await p.locator('[data-content-id="dragon-ball"]').click();await p.locator('.franchise-banner>.owner-edit-button').click();
    await p.locator('[name=pageTitle]').fill('Dragon Ball Spark Universe');
    const png=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=1800;c.height=1200;const g=c.getContext('2d');g.fillStyle='#9232ed';g.fillRect(0,0,1800,1200);g.fillStyle='#24dfea';g.fillRect(0,600,1800,600);return c.toDataURL('image/png').split(',')[1];});
    assert.ok(Buffer.from(png,'base64').length<=2*1024*1024);console.log('Uploading world image.');await p.locator('[data-owner-image=pageImage]').setInputFiles({name:'world.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
    await p.locator('[data-owner-image-preview=pageImage]').waitFor({state:'visible',timeout:10000}).catch(async error=>{throw new Error(error.message+'; upload: '+await p.locator('.owner-dialog-error').textContent());});
    await p.locator('#owner-editor-dialog [type=submit]').click();await p.locator('#owner-editor-dialog').waitFor({state:'hidden'});
    assert.equal(await p.locator('h1').textContent(),'Dragon Ball Spark Universe');assert.match(await p.locator('.franchise-banner').getAttribute('style'),/blob:/);
    await visitor.goto(base+'/worlds/dragon-ball');assert.equal(await visitor.locator('h1').textContent(),'Dragon Ball');assert.equal(await visitor.locator('.owner-edit-button').count(),0);
    await p.reload();await p.locator('.owner-toolbar').waitFor();assert.equal(await p.locator('h1').textContent(),'Dragon Ball Spark Universe');
    let draft;await env.withSecurityRulesDisabled(async context=>{draft=(await getDoc(doc(context.firestore(),'cms','draft'))).data();});
    const ref=draft.payload.changes.worlds['dragon-ball'].pageImage;assert.match(ref,new RegExp(`^spark:drafts/${uid}/`));
    let image;await env.withSecurityRulesDisabled(async context=>{image=(await getDoc(doc(context.firestore(),`draftImages/${uid}/images/${ref.split('/').at(-1)}`))).data();});
    assert.equal(image.mime,'image/webp');assert.ok(image.bytes.toUint8Array().length<=196608);
    await p.locator('[data-cloud-publish]').click();await p.locator('.owner-status').filter({hasText:'הוחלו באתר'}).waitFor();await visitor.getByRole('heading',{name:'Dragon Ball Spark Universe',exact:true}).waitFor();
    assert.match(await visitor.locator('.franchise-banner').getAttribute('style'),/blob:/);
    await p.getByRole('link',{name:'Anime worlds',exact:true}).first().click();assert.equal(await p.locator('[data-content-id="dragon-ball"] h3').textContent(),'Dragon Ball');await p.locator('[data-content-id="dragon-ball"]').click();
    for(const width of [320,390,768,1440]){await p.setViewportSize({width,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('.franchise-banner>.owner-edit-button').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.keyboard.press('Escape');}
    await p.locator('[data-admin-logout]').click();await p.locator('.owner-toolbar').waitFor({state:'detached'});assert.equal(await p.locator('h1').textContent(),'Dragon Ball Spark Universe');assert.match(await p.locator('.franchise-banner').getAttribute('style'),/blob:/);assert.equal(await p.evaluate(()=>localStorage.getItem('nexori.owner-draft.v1')),null);
    await p.getByRole('link',{name:'Owner sign-in',exact:true}).click();await p.locator('#admin-login-form').waitFor();await p.locator('[name=email]').fill('owner@nexori.test');await p.locator('[name=password]').fill('Demo-owner-123!');await p.locator('#admin-login-form [type=submit]').click();await p.locator('.owner-toolbar').waitFor();
    await p.locator('[data-cloud-revisions]').selectOption('initial');await p.locator('[data-cloud-restore]').click();await p.locator('.owner-status').filter({hasText:'שוחזרה'}).waitFor();await visitor.getByRole('heading',{name:'Dragon Ball',exact:true}).waitFor();
    await p.locator('[data-cloud-load-public]').click();await p.locator('.owner-status').filter({hasText:'כטיוטה חדשה'}).waitFor();await p.getByRole('link',{name:'Anime worlds',exact:true}).first().click();await p.locator('[data-content-id="dragon-ball"]').click();assert.equal(await p.locator('h1').textContent(),'Dragon Ball');
    assert.equal(network.filter(url=>/cloudfunctions\.net|firebasestorage\.googleapis\.com|127\.0\.0\.1:(5001|9199)/.test(url)).length,0);
    assert.deepEqual(errors,[]);await p.screenshot({path:'/tmp/nexori-spark-admin.png'});
    console.log('PASS: real Auth/Firestore emulator sign-in, all six world edit dialogs, private compressed-image save/reload, visitor isolation, image publication, title independence, logout, recovery, four widths and zero Functions/Storage requests.');
  }finally{await browser.close();await env.cleanup();}
})().catch(error=>{console.error(error);process.exit(1)});
