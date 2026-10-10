import { validateContentDraft } from './shared/content.js';
export function cloudDraft(input, {uid,bucket,published=false}) {
  const payload=validateContentDraft(input,{bucket,ownerUid:published?undefined:uid});
  if (Buffer.byteLength(JSON.stringify(payload))>600000) throw new Error('The content draft is too large. Store images in Firebase Storage.');
  for (const [group,records] of Object.entries(payload.changes)) for(const patch of Object.values(records)) {
    for(const [key,value] of Object.entries(patch)) {
      if (/image$/i.test(key) && value.startsWith('data:')) throw new Error('Inline images must be uploaded before saving.');
      if (published && /image$/i.test(key) && value.startsWith('storage:')) throw new Error('Private images cannot appear in published content.');
    }
    if(published&&group==='products'){delete patch.editorNotes;delete patch.retailerUrl;}
  }
  return payload;
}
export function expectedRevision(value) {
  if(!Number.isSafeInteger(value)||value<0)throw new Error('A valid expected revision is required.');
  return value;
}
