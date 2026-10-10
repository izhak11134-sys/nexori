import { validateContentDraft, contentGroups } from './content.js';

export const sparkImageLimit = 192 * 1024;
export const sparkPayloadLimit = 600 * 1024;
export const emptyContent = () => ({version:1,changes:{}});
// Eight bounded schema checks avoid Firestore's 1,000-expression limit.
export const schemaChunks=Object.entries(contentGroups).flatMap(([group,{records}])=>
  Array.from({length:Math.ceil(records.length/21)},(_,index)=>({group,id:`${group}-${index}`,ids:records.slice(index*21,(index+1)*21).map(record=>record.id)})));
export function sparkContent(input, uid, published = false) {
  const next = validateContentDraft(input, {spark:true,ownerUid:published?undefined:uid});
  if (new TextEncoder().encode(JSON.stringify(next)).length > sparkPayloadLimit) throw new Error('הטקסט בטיוטה גדול מדי. התמונות נשמרות בנפרד; קצר את התוכן.');
  for (const records of Object.values(next.changes)) for (const patch of Object.values(records)) for (const [field,value] of Object.entries(patch)) {
    if (/image$/i.test(field) && value && !value.startsWith('spark:')) throw new Error('יש לשמור את התמונה במערכת לפני שמירת הטיוטה.');
  }
  if (published && Object.values(next.changes.products||{}).some(patch=>'editorNotes' in patch || 'retailerUrl' in patch)) throw new Error('אין לכלול שדות פרטיים בתוכן המוצג למבקרים.');
  return next;
}
export function publicContent(input) {
  const next = structuredClone(input);
  for (const patch of Object.values(next.changes.products||{})) {delete patch.editorNotes;delete patch.retailerUrl;}
  return next;
}
export function imageEntries(payload) {
  return Object.values(payload.changes).flatMap(records=>Object.values(records).flatMap(patch=>Object.entries(patch).filter(([field,value])=>/image$/i.test(field)&&value).map(([field,value])=>({patch,field,value}))));
}
export function sparkImagePath(value) {
  if (/^spark:published\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(value)) return `publishedImages/${value.slice(16).split('/')[0]}/images/${value.split('/').at(-1)}`;
  if (/^spark:drafts\/[A-Za-z0-9_-]{1,128}\/[a-f0-9-]{36}$/.test(value)) return `draftImages/${value.split('/')[1]}/images/${value.split('/')[2]}`;
  throw new Error('הפניה לתמונה אינה תקינה.');
}
