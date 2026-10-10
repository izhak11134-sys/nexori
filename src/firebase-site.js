import { firebaseConfiguration } from './firebase-config.js';
import { applyContentDraft } from './content.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let service=null,user=null,authorized=false,authReady=false,authGeneration=0,editor=null,publicPayload={version:1,changes:{}},busy=false,connectionError='';
function updateSite(payload,preserveLogin=false){
  applyContentDraft(payload,{bucket:service?.bucket});
  // A late public snapshot must not clear credentials while the owner types.
  if(preserveLogin&&document.querySelector('#admin-login-form'))return;
  window.dispatchEvent(new Event('nexori:content-update'));
}
function panel() {
  const host=document.querySelector('#firebase-admin-page');if(!host)return;
  let body;
  if(!firebaseConfiguration())body='<h1>ניהול NEXORI</h1><p>מסך הניהול מוכן לחיבור, אך עדיין לא חיברנו פרויקט Firebase שלך. האתר מציג כרגע את התוכן המקורי.</p><p>ניצור יחד חשבון ופרויקט ונגדיר אותם בסביבת הפיתוח. אין צורך להוריד קובץ עריכה נפרד.</p>';
  else if(connectionError)body=`<h1>לא ניתן להתחבר לניהול</h1><p role="alert">${escape(connectionError)}</p><button type="button" data-admin-retry>ניסיון נוסף</button>`;
  else if(!authReady)body='<h1>ניהול NEXORI</h1><p role="status">בודק התחברות והרשאות…</p>';
  else if(!user)body='<h1>כניסה לניהול NEXORI</h1><p>התחבר לחשבון המנהל שלך כדי לערוך את האתר במקום.</p><form id="admin-login-form"><label>כתובת דוא״ל<input name="email" type="email" required autocomplete="username" maxlength="254"></label><label>סיסמה<input name="password" type="password" required autocomplete="current-password" maxlength="256"></label><button type="submit">כניסה לניהול</button><button type="button" data-admin-reset>איפוס סיסמה</button></form>';
  else if(!authorized)body=`<h1>החשבון אינו מורשה לעריכה</h1><p>${escape(user.email)}${!user.emailVerified?' — יש לאמת את הדוא״ל ולהיכנס שוב.':' — יש להגדיר לחשבון הרשאת מנהל ב־Firebase Console.'}</p>${!user.emailVerified?'<button type="button" data-admin-verify>שליחת הודעת אימות</button>':''}<button type="button" data-admin-logout>התנתקות</button>`;
  else body='<h1>מצב עריכה פעיל</h1><p>אפשר לעבור לכל עמוד באתר וללחוץ על ״עריכה״ ליד הכרטיסייה. שינוי כותרת ותמונה נעשה בשדות נפרדים.</p><p>״שמירת טיוטה״ שומרת ב־Firebase. ״החלת השינויים באתר״ מעדכנת את הגרסה המוצגת למבקרים. אפשר לשחזר גרסה קודמת מסרגל העריכה.</p><a href="/" data-link>מעבר לאתר ולכפתורי העריכה</a><button type="button" data-admin-logout>התנתקות</button>';
  host.innerHTML=`<section class="admin-panel" lang="he" dir="rtl">${body}<p class="admin-status" role="status"></p></section>`;
  host.querySelectorAll('button').forEach(button=>button.disabled=busy);
}
function status(message){const target=document.querySelector('.admin-status');if(target)target.textContent=message;}
function message(error){
  if(error.code?.includes('aborted'))return 'הטיוטה או הגרסה באתר השתנתה ממכשיר אחר. הורד גיבוי של העבודה שלך, ואז רענן לפני המשך העריכה.';
  if(/invalid-credential|wrong-password|user-not-found/.test(error.code||''))return 'לא ניתן להתחבר עם הפרטים האלה. בדוק את הדוא״ל והסיסמה.';
  if(/too-many-requests/.test(error.code||''))return 'בוצעו ניסיונות רבים מדי. נסה שוב מאוחר יותר.';
  if(/network|unavailable/.test(error.code||''))return 'לא ניתן להשלים את הפעולה כרגע. בדוק את החיבור ונסה שוב.';
  if(/permission-denied|unauthenticated/.test(error.code||''))return 'הפעולה דורשת חשבון מנהל מאומת. התחבר מחדש ובדוק הרשאות.';
  return error.message||'הפעולה לא הושלמה.';
}
async function enterEditor(generation) {
  const draft=await service.loadDraft();if(generation!==authGeneration)return;
  const {mountOwnerEditor}=await import('./owner-editor.js');await import('./owner-editor.css');if(generation!==authGeneration)return;
  updateSite(draft);
  editor=mountOwnerEditor({bucket:service.bucket,imageNote:service.imageNote,save:input=>service.save(input),backup:input=>service.backup(input),error:message});
  const toolbar=document.querySelector('.owner-toolbar');toolbar.classList.add('owner-cloud-toolbar');
  toolbar.querySelector('[data-owner-export]').hidden=true;
  toolbar.querySelector('[data-owner-import]').hidden=true;
  toolbar.querySelector('[data-owner-preview]').textContent='תצוגת הטיוטה';
  const controls=document.createElement('div');controls.className='owner-cloud-actions';
  controls.innerHTML='<button type="button" data-cloud-publish>החלת השינויים באתר</button><button type="button" data-cloud-load-public>טעינת הגרסה המוצגת</button><select aria-label="גרסה קודמת לשחזור" data-cloud-revisions><option value="">בחר גרסה קודמת…</option></select><button type="button" data-cloud-restore>שחזור גרסה</button><button type="button" data-admin-logout>התנתקות</button><span class="owner-cloud-hint">טיוטות נשמרות ב־Firebase. החלת שינויים כאן אינה משיקה אתר שטרם פורסם.</span>';
  toolbar.append(controls);editor.status('מצב מנהל פעיל. ערוך כרטיסיות ושמור טיוטה; המבקרים רואים רק שינויים שהחלת באתר.');
  await revisions();
}
async function revisions(){
  const target=document.querySelector('[data-cloud-revisions]');if(!target)return;
  const records=await service.revisions();if(!target.isConnected)return;
  target.innerHTML='<option value="">בחר גרסה קודמת…</option>'+records.map(record=>`<option value="${escape(record.id)}">${record.revision===0?'האתר המקורי':`גרסה ${record.revision}`} — ${escape(record.createdAt?.toDate().toLocaleString('he-IL')||'')}</option>`).join('');
}
async function authChanged(next) {
  const generation=++authGeneration;editor?.dispose();editor=null;service.clear();user=next;authorized=false;authReady=false;
  updateSite(publicPayload);panel();
  try{
    if(next)authorized=await service.isOwner(next);if(generation!==authGeneration)return;
    if(authorized)await enterEditor(generation);if(generation!==authGeneration)return;
    authReady=true;panel();
  }catch(error){if(generation!==authGeneration)return;authorized=false;editor?.dispose();editor=null;authReady=true;updateSite(publicPayload);panel();status(message(error));}
}
document.addEventListener('nexori:render',panel);
document.addEventListener('submit',async event=>{
  if(event.target.id!=='admin-login-form')return;event.preventDefault();if(busy||!service)return;
  const form=event.target,data=new FormData(form);busy=true;form.querySelectorAll('button').forEach(button=>button.disabled=true);status('מתחבר…');
  try{await service.login(String(data.get('email')).trim(),String(data.get('password')));}catch(error){status(message(error));}
  finally{busy=false;const password=form.querySelector('[name=password]');if(password)password.value='';document.querySelectorAll('#firebase-admin-page button').forEach(button=>button.disabled=false);}
});
document.addEventListener('click',async event=>{
  if(event.target.closest('[data-admin-retry]')){location.reload();return;}
  const action=event.target.closest('[data-admin-logout],[data-admin-reset],[data-admin-verify],[data-cloud-publish],[data-cloud-restore],[data-cloud-load-public]');
  if(!action||busy||!service)return;
  if(action.hasAttribute('data-cloud-publish')&&!confirm('להחיל את הטיוטה השמורה על הגרסה שמוצגת למבקרים? שינויים שלא נשמרו בחלון עריכה אינם נכללים.'))return;
  if(action.hasAttribute('data-cloud-load-public')&&!confirm('להחליף את הטיוטה בגרסה שמוצגת כרגע למבקרים? מומלץ להוריד גיבוי קודם.'))return;
  const revisionId=document.querySelector('[data-cloud-revisions]')?.value;
  if(action.hasAttribute('data-cloud-restore')&&(!revisionId||!confirm('לשחזר את הגרסה שנבחרה באתר? הטיוטה הנוכחית תישאר כפי שהיא.')))return;
  const generation=authGeneration;busy=true;action.disabled=true;
  try{
    if(action.hasAttribute('data-admin-logout'))await service.logout();
    if(action.hasAttribute('data-admin-reset')){const email=document.querySelector('#admin-login-form [name=email]');if(!email?.reportValidity())return;await service.resetPassword(email.value.trim());status('אם הכתובת רשומה וזכאית לאיפוס, תישלח אליה הודעה.');}
    if(action.hasAttribute('data-admin-verify')){await service.verifyEmail();status('הודעת אימות נשלחה. לאחר האימות, התנתק והתחבר שוב.');}
    if(action.hasAttribute('data-cloud-publish')){await service.publish();if(generation===authGeneration){editor?.status('השינויים השמורים הוחלו באתר.');await revisions();}}
    if(action.hasAttribute('data-cloud-restore')){await service.restore(revisionId);if(generation===authGeneration){editor?.status('הגרסה באתר שוחזרה. הטיוטה שלך נשארה ללא שינוי.');await revisions();}}
    if(action.hasAttribute('data-cloud-load-public')){const payload=await service.published();await service.save(payload);if(generation===authGeneration){updateSite(payload);editor?.refresh();editor?.status('הגרסה המוצגת נטענה ונשמרה כטיוטה חדשה.');}}
  }catch(error){if(generation===authGeneration){if(editor)editor.status(message(error));else status(message(error));}}
  finally{busy=false;if(action.isConnected)action.disabled=false;document.querySelectorAll('#firebase-admin-page button').forEach(button=>button.disabled=false);}
});
async function start(){
  panel();const config=firebaseConfiguration();if(!config){authReady=true;return;}
  try{
    const {createFirebaseService}=await import('./firebase-service.js');
    service=await createFirebaseService(config);
    service.subscribePublic(payload=>{
      try{validatePublic(payload);publicPayload=payload;if(!editor)updateSite(payload,true);}
      catch{console.error('Published content failed validation; keeping the last valid website.');}
    },error=>{console.error('Published content is unavailable.',error.code);});
    service.observeAuth(authChanged);
  }catch(error){connectionError=message(error);panel();}
}
function validatePublic(payload){
  // Validate without applying: the manager may currently be viewing a private draft.
  if(Object.values(payload.changes?.products||{}).some(patch=>Object.hasOwn(patch,'editorNotes')||Object.hasOwn(patch,'retailerUrl')))throw new Error('Private fields in public content.');
  return validateContentDraft(payload,{bucket:service.bucket});
}
import { validateContentDraft } from './content.js';
start();
