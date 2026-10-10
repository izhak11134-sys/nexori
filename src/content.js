import { categories, products, franchises, guides } from './data.js';
import { policies } from './policies.js';

export const contentStorageKey = 'nexori.owner-draft.v1';
// Only object URLs created from authorized private image downloads may be rendered.
// The server never registers any object URLs, so they cannot be saved as cloud content.
export const contentImageBlobs = new Set();
export const contentBlocks = {
  hero: {label:'הבאנר הראשי', lead:'Your Portal to', accent:'Authentic Anime', ending:'Culture & Collectibles', description:'For the stories you live in.\nThe characters you carry with you.\nAnd the pieces that make it all real.', image:''},
  editorial: {label:'כרטיס מדריך האספנים', title:'Your first figure.\nYour next chapter.', description:'From choosing a figure format to checking a seller, our beginner’s guide helps you start a collection with a little more confidence.', image:''},
  afterhours: {label:'כרטיס שולחן וחדר', title:'Make room\nfor your world.', description:'A quieter corner. A favorite character. A setup that feels like you. Start with one detail and make it yours.', image:''},
  closing: {label:'כרטיס המועדפים', title:'Just a place to call home.', description:'Keep the ideas you love. Build your collection at your own pace.', image:''},
};
export const contentGroups = {
  products:{label:'כרטיסי מוצרים וקונספטים',records:products},
  categories:{label:'קטגוריות',records:categories},
  types:{label:'תתי־סוגי מוצרים',records:categories.flatMap(c=>c.types)},
  worlds:{label:'עולמות אנימה',records:franchises},
  guides:{label:'כרטיסי מדריכים',records:guides},
  blocks:{label:'כרטיסי דף הבית',records:Object.entries(contentBlocks).map(([id,value])=>({id,...value}))},
  pages:{label:'כרטיסי מידע ואודות',records:[
    {id:'about-story',title:'Not just more stuff.\nMore of what you love.',description:'From a figure on your shelf to an art print above your desk, the right piece can make a space feel like yours. We’re building a collection around that feeling — with useful information, a clear editorial point of view, and room for different budgets.'},
    {id:'about-research',title:'Research the listing',description:'Check manufacturer information, seller details, specifications, and available licensing evidence.'},
    {id:'about-explain',title:'Explain the choice',description:'Tell you what makes a piece interesting, who it might suit, and which details to check.'},
    {id:'about-links',title:'Be clear about links',description:'Identify affiliate links and keep purchasing, shipping, and returns with the retailer.'},
    {id:'about-honesty',title:'Keep it honest',description:'No invented reviews, inflated statistics, or claims of hands-on testing we haven’t done.'},
    ...Object.entries(policies).flatMap(([key,page])=>page.sections.map(([title,body],index)=>({id:`${key}-${index}`,title,description:body.replace(/<[^>]*>/g,'')}))),
  ]},
};
const baseContent = Object.fromEntries(Object.entries(contentGroups).map(([group,value])=>[group,Object.fromEntries(value.records.map(record=>[record.id,structuredClone(record)]))]));
export let contentDraft = {version:1,changes:{}};
const contentFields = {
  products:['name','description','type','tipsText','image','imageAlt','category','typeId','retailerUrl','editorNotes'],
  categories:['label','short','description','image','imageAlt'],
  types:['name','examples','image','imageAlt'],
  worlds:['cardTitle','subtitle','cardImage','pageTitle','pageDescription','pageImage','imageAlt'],
  guides:['title','description','eyebrow','time','image','imageAlt'],
  blocks:['title','lead','accent','ending','description','image','imageAlt'],
  pages:['title','description','image','imageAlt'],
};
export function isContentImage(value, options = {}) {
  if (options.bucket && contentImageBlobs.has(value)) return true;
  if (value === '' || (typeof value === 'string' && value.length <= 2800000 && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))) return true;
  if (options.ownerUid && typeof value === 'string' && value.startsWith(`storage:drafts/${options.ownerUid}/`) && /^storage:drafts\/[A-Za-z0-9_-]{1,128}\/[a-f0-9-]{36}\.(?:png|jpg|webp)$/.test(value)) return true;
  if (!options.bucket || typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    const prefix = `/v0/b/${options.bucket}/o/`;
    return url.origin === 'https://firebasestorage.googleapis.com' && !url.username && !url.password && !url.hash && url.pathname.startsWith(prefix) && /^published\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(decodeURIComponent(url.pathname.slice(prefix.length))) && url.search === '?alt=media';
  } catch { return false; }
}
export function validateContentDraft(input, options = {}) {
  if (!input || input.version !== 1 || !input.changes || Array.isArray(input.changes) || typeof input.changes !== 'object') throw new Error('קובץ הטיוטה אינו בפורמט נתמך.');
  if (Object.keys(input).some(key=>!['version','changes'].includes(key))) throw new Error('קובץ הטיוטה כולל שדות ראשיים לא מוכרים.');
  if (JSON.stringify(input).length > 22000000) throw new Error('הטיוטה גדולה מדי. השתמש בתמונות קטנות יותר.');
  for (const [group,records] of Object.entries(input.changes)) {
    if (!Object.hasOwn(contentGroups,group) || !records || typeof records !== 'object' || Array.isArray(records)) throw new Error('קבוצת כרטיסיות לא מוכרת.');
    for (const [id,patch] of Object.entries(records)) {
      if (!Object.hasOwn(baseContent[group],id) || !patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('כרטיסייה לא מוכרת בטיוטה.');
      for (const [field,value] of Object.entries(patch)) {
        if (!contentFields[group].includes(field) || typeof value !== 'string') throw new Error('שדה עריכה לא מוכר.');
        if (['name','label','short','title','cardTitle','pageTitle','lead'].includes(field) && !value.trim()) throw new Error('אין להשאיר כותרת ריקה.');
        if (/image$/i.test(field)) {if (!isContentImage(value, options)) throw new Error('נדרשת תמונת PNG, JPEG או WebP תקינה ממקור מורשה.');}
        else if (value.length > (['description','editorNotes','tipsText'].includes(field) ? 5000 : 500)) throw new Error('הטקסט ארוך מדי.');
        if(field === 'tipsText' && value.split('\n').filter(line=>line.trim()).length>12) throw new Error('רשימת הבדיקות מוגבלת ל־12 סעיפים.');
        if (field === 'retailerUrl' && value) { const url=new URL(value);if(url.protocol !== 'https:' || url.username || url.password) throw new Error('קישור החנות חייב להיות כתובת HTTPS תקינה.'); }
      }
      if (group === 'products') {
        const merged={...baseContent[group][id],...patch};
        if (!categories.some(c=>c.id === merged.category && c.types.some(t=>t.id === merged.typeId))) throw new Error('תת־הסוג אינו מתאים לקטגוריה.');
        if (!merged.name.trim()) throw new Error('יש להזין שם לכרטיס המוצר.');
      }
    }
  }
  return structuredClone(input);
}
export function applyContentDraft(input, options = {}) {
  const validated=validateContentDraft(input, options);
  for(const [group,value] of Object.entries(contentGroups)) for(const record of value.records) {
    const id=record.id;
    for(const field of contentFields[group]) {
      if(Object.hasOwn(baseContent[group][id],field)) record[field]=structuredClone(baseContent[group][id][field]);
      else delete record[field];
    }
    Object.assign(record,validated.changes[group]?.[id] || {});
    if(group === 'products') record.tips=record.tipsText === undefined ? [...baseContent[group][id].tips] : record.tipsText.split('\n').map(line=>line.trim()).filter(Boolean);
    if(group === 'blocks') Object.assign(contentBlocks[id],record);
  }
  contentDraft=validated;
  return validated;
}
export function contentRecord(group,id) {
  const record=contentGroups[group]?.records.find(item=>item.id === id);
  if (!record) return null;
  if(group === 'worlds') return {...record,cardTitle:record.cardTitle ?? record.name,pageTitle:record.pageTitle ?? record.name,pageDescription:record.pageDescription ?? `${record.subtitle}. Browse by the kind of product you are looking for.`};
  if(group === 'products') return {...record,tipsText:record.tipsText ?? record.tips.join('\n')};
  return record;
}
export function originalContentRecord(group,id) {
  const record=structuredClone(baseContent[group]?.[id]);
  if(group === 'worlds') return {...record,cardTitle:record.name,pageTitle:record.name,pageDescription:`${record.subtitle}. Browse by the kind of product you are looking for.`};
  if(group === 'products') return {...record,tipsText:record.tips.join('\n')};
  return record;
}
export function initialiseContent() {
  let embedded={version:1,changes:{}};
  try {const data=document.getElementById('nexori-content-data');if(data)embedded=JSON.parse(data.textContent);} catch {}
  if (window.NEXORI_OWNER_MODE) {
    try {const stored=localStorage.getItem(contentStorageKey);if(stored)embedded=JSON.parse(stored);} catch {}
  }
  try {applyContentDraft(embedded);} catch {applyContentDraft({version:1,changes:{}});window.NEXORI_DRAFT_ERROR='לא ניתן לטעון את הטיוטה השמורה. הקובץ המקורי מוצג; אפשר לייבא גיבוי תקין.';}
}
