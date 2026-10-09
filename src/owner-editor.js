import { categories } from './data.js';
import { contentGroups, contentDraft, contentStorageKey, contentRecord, originalContentRecord, validateContentDraft, applyContentDraft, isContentImage } from './content.js';

const ownerEscape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ownerFields = {
  products:[['name','שם הכרטיס והמוצר'],['description','תיאור','textarea'],['type','תווית סוג המוצר'],['category','קטגוריה ראשית','category'],['typeId','תת־סוג','type'],['tipsText','בדיקות לפני קנייה — שורה לכל סעיף','textarea'],['image','תמונת המוצר','image'],['imageAlt','תיאור התמונה לנגישות'],['retailerUrl','קישור לחנות — להכנה בלבד','url'],['editorNotes','הערות פרטיות לבחירת המוצר','textarea']],
  categories:[['label','כותרת הקטגוריה'],['short','שם קצר בכפתורי הסינון'],['description','תיאור','textarea'],['image','רקע הכרטיסייה','image'],['imageAlt','תיאור התמונה']],
  types:[['name','כותרת תת־הסוג'],['examples','דוגמאות והסבר','textarea'],['image','רקע הכרטיסייה','image'],['imageAlt','תיאור התמונה']],
  worlds:[['cardTitle','כותרת הכרטיסייה'],['subtitle','תיאור קצר בכרטיסייה'],['cardImage','רקע הכרטיסייה','image'],['pageTitle','כותרת העמוד הפנימי'],['pageDescription','תיאור בעמוד הפנימי','textarea'],['pageImage','רקע העמוד הפנימי','image'],['imageAlt','תיאור התמונה']],
  guides:[['title','כותרת המדריך והכרטיסייה'],['description','תקציר','textarea'],['eyebrow','תווית הנושא'],['time','זמן קריאה'],['image','תמונת המדריך','image'],['imageAlt','תיאור התמונה לנגישות']],
  blocks:[['title','כותרת הכרטיסייה','optional-title'],['lead','שורה ראשונה בכותרת','hero'],['accent','השורה הזוהרת','hero'],['ending','שורה אחרונה בכותרת','hero'],['description','תיאור','textarea'],['image','תמונה או רקע','image'],['imageAlt','תיאור התמונה לנגישות']],
  pages:[['title','כותרת הכרטיסייה','textarea'],['description','תוכן הכרטיסייה','textarea'],['image','רקע הכרטיסייה','image'],['imageAlt','תיאור התמונה']],
};
let ownerPreview=false, ownerSelection=null, ownerWorking={}, ownerInitial={}, ownerSession=0, ownerTrigger=null, ownerUploads=0;
const ownerToolbar=document.createElement('aside');
ownerToolbar.className='owner-toolbar';ownerToolbar.dir='rtl';ownerToolbar.lang='he';ownerToolbar.setAttribute('aria-label','כלי עריכה לבעל האתר');
ownerToolbar.innerHTML=`<strong>עריכת NEXORI</strong><button type="button" data-owner-preview aria-pressed="false">תצוגה מקדימה</button><select aria-label="בחירת כרטיסייה לעריכה" id="owner-record-list"><option value="">כל הכרטיסיות…</option></select><button type="button" data-owner-open>עריכת הבחירה</button><button type="button" data-owner-export>הורדת אתר מעודכן</button><button type="button" data-owner-backup>גיבוי טיוטה</button><button type="button" data-owner-import>טעינת גיבוי</button><input type="file" id="owner-import-file" accept=".json,application/json" hidden><span class="owner-status" role="status">השמירה מקומית בדפדפן. הורד גיבוי כדי לשמור עותק; ייצוא אינו פרסום לאינטרנט.</span>`;
document.body.append(ownerToolbar);document.body.classList.add('owner-workspace');
const ownerDialog=document.createElement('dialog');ownerDialog.className='owner-dialog';ownerDialog.id='owner-editor-dialog';ownerDialog.dir='rtl';ownerDialog.lang='he';ownerDialog.setAttribute('aria-labelledby','owner-dialog-title');document.body.append(ownerDialog);
function ownerStatus(message) {ownerToolbar.querySelector('.owner-status').textContent=message;}
function ownerRecordLabel(group,record) {return record.name || record.label || record.title || record.id;}
function ownerList() {
  const list=ownerToolbar.querySelector('select'),current=list.value;
  list.innerHTML='<option value="">כל הכרטיסיות…</option>'+Object.entries(contentGroups).map(([group,definition])=>`<optgroup label="${ownerEscape(definition.label)}">${definition.records.map(record=>`<option value="${group}:${record.id}">${ownerEscape(ownerRecordLabel(group,record))}</option>`).join('')}</optgroup>`).join('');
  list.value=current;
}
function ownerDecorate() {
  document.querySelectorAll('[data-content-kind]').forEach(element=>{
    if(element.querySelector(':scope > .owner-edit-button') || element.parentElement?.classList.contains('owner-card-shell'))return;
    const group=element.dataset.contentKind,id=element.dataset.contentId;
    if(!contentRecord(group,id))return;
    let host=element;
    if(element.tagName==='A'){host=document.createElement('div');host.className='owner-card-shell';element.replaceWith(host);host.append(element);}
    else element.classList.add('owner-edit-target');
    const button=document.createElement('button');button.type='button';button.lang='he';button.className='owner-edit-button';button.dataset.ownerGroup=group;button.dataset.ownerId=id;button.textContent='עריכה';button.setAttribute('aria-label',`עריכת ${ownerRecordLabel(group,contentRecord(group,id))}`);host.append(button);
  });
}
function ownerVisibleFields(group,id) {return ownerFields[group].filter(([key,,kind])=>kind!=='hero'||id==='hero').filter(([key,,kind])=>kind!=='optional-title'||id!=='hero');}
function ownerForm(record) {
  const {group,id}=ownerSelection;
  ownerInitial=structuredClone(record);
  const controls=ownerVisibleFields(group,id).map(([key,label,kind])=>{
    const value=record[key] || '';
    if(kind==='image')return `<div class="owner-image-field"><label>${label}<input type="file" data-owner-image="${key}" accept="image/png,image/jpeg,image/webp"></label><img class="owner-image-preview" data-owner-image-preview="${key}" ${value ? `src="${ownerEscape(value)}"` : 'hidden'} alt="תצוגה מקדימה של התמונה שנבחרה"><button type="button" data-owner-remove-image="${key}">החזרת תמונת ברירת המחדל</button></div>`;
    if(kind==='category')return `<label>${label}<select name="${key}">${categories.map(c=>`<option value="${c.id}" ${value===c.id?'selected':''}>${ownerEscape(c.label)}</option>`).join('')}</select></label>`;
    if(kind==='type')return `<label>${label}<select name="${key}">${categories.find(c=>c.id===record.category)?.types.map(t=>`<option value="${t.id}" ${value===t.id?'selected':''}>${ownerEscape(t.name)}</option>`).join('')}</select></label>`;
    return `<label>${label}${(kind==='textarea'||kind==='optional-title')?`<textarea dir="auto" name="${key}" maxlength="5000">${ownerEscape(value)}</textarea>`:`<input dir="auto" name="${key}" type="${kind==='url'?'url':'text'}" value="${ownerEscape(value)}" maxlength="500" ${['name','label','short','title','cardTitle','pageTitle','lead'].includes(key)?'required':''}>`}</label>`;
  }).join('');
  ownerDialog.innerHTML=`<form id="owner-edit-form"><div class="owner-dialog-header"><h2 id="owner-dialog-title">עריכת ${ownerEscape(ownerRecordLabel(group,record))}</h2><button type="button" data-owner-cancel aria-label="סגירת חלון העריכה">✕</button></div><p class="owner-dialog-note">הכותרות והתמונות ניתנות לשינוי בנפרד. תמונות: PNG, JPEG או WebP, עד 2MB. העלה רק תמונות שיש לך רשות להשתמש בהן. השינויים יופיעו לאחר שמירת הטיוטה.</p>${group==='products'?'<p class="owner-dialog-note">הכרטיס נשאר קונספט עד שנוסיף יחד מוצר מאומת. הקישור וההערות הם להכנה בלבד, ואינם נכללים בייצוא למבקרים.</p>':''}${controls}<p class="owner-dialog-error" role="alert"></p><div class="owner-dialog-actions"><button type="submit">שמירת טיוטה</button><button type="button" data-owner-cancel>ביטול</button><button type="button" data-owner-reset>איפוס הכרטיס לברירת המחדל</button></div></form>`;
}
function ownerOpen(group,id,trigger) {
  const record=contentRecord(group,id);if(!record)return;
  ownerSession++;ownerUploads=0;ownerSelection={group,id};ownerTrigger=trigger;
  ownerWorking={...(contentDraft.changes[group]?.[id]||{})};ownerForm(record);ownerDialog.showModal();ownerDialog.querySelector('input:not([type=file]),textarea,select')?.focus();
}
function ownerApply(input) {
  applyContentDraft(input);
  let stored=true;try{localStorage.setItem(contentStorageKey,JSON.stringify(contentDraft));}catch{stored=false;}
  window.dispatchEvent(new Event('nexori:content-update'));ownerList();ownerDecorate();
  ownerStatus(stored?'הטיוטה נשמרה בדפדפן. הורד גיבוי או אתר מעודכן כדי לשמור עותק מחוץ לדפדפן.':'השינוי מוצג אך לא נשמר בדפדפן — ייתכן שהאחסון מלא או חסום. הורד גיבוי עכשיו.');
}
function ownerDownload(name,type,body) {
  const url=URL.createObjectURL(new Blob([body],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function ownerSerialize(input) {return JSON.stringify(input).replace(/</g,'\\u003c');}
function ownerExport() {
  const template=document.getElementById('nexori-export-template');
  if(!template){ownerStatus('ייצוא HTML זמין בקובץ NEXORI-editor.html. בסביבת הפיתוח ניתן להוריד גיבוי טיוטה.');return;}
  const payload=structuredClone(contentDraft);
  for(const patch of Object.values(payload.changes.products || {})){delete patch.editorNotes;delete patch.retailerUrl;}
  const html=JSON.parse(template.textContent).replace('<script id="nexori-content-data" type="application/json">{"version":1,"changes":{}}</script>',`<script id="nexori-content-data" type="application/json">${ownerSerialize(payload)}</script>`);
  ownerDownload('NEXORI.html','text/html;charset=utf-8',html);ownerStatus('קובץ האתר המעודכן הורד, ללא כלי עריכה. הוא אינו מחליף אוטומטית קבצים ב־GitHub או אתר חי.');
}
document.addEventListener('nexori:render',ownerDecorate);
document.addEventListener('click',event=>{
  const edit=event.target.closest('[data-owner-group]');if(edit){event.preventDefault();ownerOpen(edit.dataset.ownerGroup,edit.dataset.ownerId,edit);return;}
  if(event.target.closest('[data-owner-open]')){const selection=ownerToolbar.querySelector('select').value;if(selection){const [group,id]=selection.split(':');ownerOpen(group,id,event.target);}return;}
  if(event.target.closest('[data-owner-preview]')){ownerPreview=!ownerPreview;document.body.classList.toggle('owner-preview',ownerPreview);event.target.setAttribute('aria-pressed',String(ownerPreview));event.target.textContent=ownerPreview?'חזרה לעריכה':'תצוגה מקדימה';return;}
  if(event.target.closest('[data-owner-export]')){ownerExport();return;}
  if(event.target.closest('[data-owner-backup]')){ownerDownload('NEXORI-draft.json','application/json',JSON.stringify(contentDraft,null,2));ownerStatus('גיבוי הטיוטה הורד. שמור אותו כדי להעביר עריכות לדפדפן אחר או לשלוח לנו לשילוב בקוד.');return;}
  if(event.target.closest('[data-owner-import]')){ownerToolbar.querySelector('input').click();return;}
  if(event.target.closest('[data-owner-cancel]')){ownerDialog.close();return;}
  if(event.target.closest('[data-owner-reset]')){ownerSession++;ownerUploads=0;ownerWorking={};ownerForm(originalContentRecord(ownerSelection.group,ownerSelection.id));return;}
  const remove=event.target.closest('[data-owner-remove-image]');if(remove){ownerWorking[remove.dataset.ownerRemoveImage]='';const preview=ownerDialog.querySelector(`[data-owner-image-preview="${remove.dataset.ownerRemoveImage}"]`);preview.removeAttribute('src');preview.hidden=true;}
});
ownerDialog.addEventListener('close',()=>{ownerSession++;ownerUploads=0;if(ownerTrigger?.isConnected)ownerTrigger.focus();else ownerToolbar.querySelector('[data-owner-open]').focus();});
ownerDialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;const elements=[...ownerDialog.querySelectorAll('button:not([disabled]),input,textarea,select')].filter(el=>el.getClientRects().length);const first=elements[0],last=elements.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
ownerDialog.addEventListener('submit',event=>{
  event.preventDefault();if(ownerUploads)return;
  try{const patch={...ownerWorking};for(const [key,value] of new FormData(event.target))if(value !== String(ownerInitial[key] || ''))patch[key]=value;const next=structuredClone(contentDraft);next.changes[ownerSelection.group]??={};next.changes[ownerSelection.group][ownerSelection.id]=patch;validateContentDraft(next);ownerApply(next);ownerDialog.close();}catch(error){ownerDialog.querySelector('.owner-dialog-error').textContent=error.message;}
});
ownerDialog.addEventListener('change',async event=>{
  if(event.target.name==='category'){
    const types=categories.find(c=>c.id===event.target.value).types;ownerDialog.querySelector('[name=typeId]').innerHTML=types.map(t=>`<option value="${t.id}">${ownerEscape(t.name)}</option>`).join('');ownerDialog.querySelector('[name=type]').value=types[0].name;
  }
  const field=event.target.dataset.ownerImage;if(!field)return;const file=event.target.files[0];if(!file)return;
  const session=ownerSession;ownerUploads++;ownerDialog.querySelector('[type=submit]').disabled=true;
  try{
    if(file.size>2*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('יש לבחור PNG, JPEG או WebP בגודל עד 2MB.');
    const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('לא ניתן לקרוא את התמונה.'));reader.readAsDataURL(file);});
    if(!isContentImage(data))throw new Error('פורמט התמונה אינו נתמך.');
    const image=new Image();image.src=data;await image.decode();if(image.width>8000||image.height>8000)throw new Error('ממדי התמונה גדולים מדי.');
    if(session!==ownerSession)return;ownerWorking[field]=data;const preview=ownerDialog.querySelector(`[data-owner-image-preview="${field}"]`);preview.src=data;preview.hidden=false;ownerDialog.querySelector('.owner-dialog-error').textContent='';
  }catch(error){if(session===ownerSession)ownerDialog.querySelector('.owner-dialog-error').textContent=error.message;}
  finally{if(session===ownerSession){ownerUploads--;ownerDialog.querySelector('[type=submit]').disabled=ownerUploads>0;}}
});
ownerToolbar.querySelector('#owner-import-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>23000000)throw new Error('קובץ הגיבוי גדול מדי.');const input=validateContentDraft(JSON.parse(await file.text()));
    const images=new Set(Object.values(input.changes).flatMap(records=>Object.values(records).flatMap(patch=>Object.entries(patch).filter(([key,value])=>/image$/i.test(key)&&value).map(([,value])=>value))));
    for(const data of images){const image=new Image();image.src=data;await image.decode();if(image.width>8000||image.height>8000)throw new Error('ממדי תמונה בגיבוי גדולים מדי.');}
    ownerApply(input);
  }catch(error){ownerStatus(`הגיבוי לא נטען: ${error.message}`);}finally{event.target.value='';}
});
ownerList();ownerDecorate();if(window.NEXORI_DRAFT_ERROR)ownerStatus(window.NEXORI_DRAFT_ERROR);
