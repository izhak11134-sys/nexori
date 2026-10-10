import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { cloudDraft, expectedRevision } from './validation.js';
initializeApp();
const db=getFirestore(), bucket=getStorage().bucket();
const options={region:'europe-west1',maxInstances:3,memory:'512MiB',timeoutSeconds:120};
const empty=()=>({version:1,changes:{}});
async function owner(request) {
  if(!request.auth)throw new HttpsError('unauthenticated','Sign in to edit.');
  const role=await db.doc(`admins/${request.auth.uid}`).get();
  if(request.auth.token.email_verified!==true||role.data()?.active!==true)throw new HttpsError('permission-denied','An approved, verified owner account is required.');
  return request.auth.uid;
}
function validated(input,uid,published=false) {
  try{return cloudDraft(input,{uid,bucket:bucket.name,published});}catch(error){throw new HttpsError('invalid-argument',error.message);}
}
function revision(value) {try{return expectedRevision(value);}catch(error){throw new HttpsError('invalid-argument',error.message);}}
function checkVersion(snapshot,expected) {
  if((snapshot.data()?.revision??0)!==expected)throw new HttpsError('aborted','Another session changed this content. Reload before saving.');
}
export const saveOwnerDraft=onCall(options,async request=>{
  const uid=await owner(request), payload=validated(request.data?.payload,uid), expected=revision(request.data?.expectedRevision);
  return db.runTransaction(async tx=>{
    const ref=db.doc('cms/draft'),snapshot=await tx.get(ref);checkVersion(snapshot,expected);
    const next=expected+1;tx.set(ref,{payload,revision:next,updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});return {revision:next};
  });
});
async function publicImages(payload,uid,id) {
  const next=structuredClone(payload),images=new Map();
  for(const records of Object.values(next.changes)) for(const patch of Object.values(records)) for(const [field,value] of Object.entries(patch)) {
    if(!/image$/i.test(field)||!value.startsWith('storage:'))continue;
    if(!images.has(value)) {
      const file=bucket.file(value.slice(8));
      let bytes,metadata;
      try{[metadata]=await file.getMetadata();if(Number(metadata.size)>2*1024*1024||!['image/png','image/jpeg','image/webp'].includes(metadata.contentType))throw new Error('Invalid image.');[bytes]=await file.download();}
      catch{throw new HttpsError('failed-precondition','A draft image is missing or invalid. Upload it again.');}
      let output;
      try{
        const image=sharp(bytes,{limitInputPixels:64000000}),meta=await image.metadata();
        if(!['png','jpeg','webp'].includes(meta.format)||meta.width>8000||meta.height>8000||meta.pages>1)throw new Error('Unsupported image.');
        output=await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:90}).toBuffer();
      }catch{throw new HttpsError('invalid-argument','An uploaded file is not a supported image.');}
      const path=`published/${id}/${randomUUID()}.webp`;
      await bucket.file(path).save(output,{resumable:false,metadata:{contentType:'image/webp',cacheControl:'public,max-age=31536000,immutable'}});
      images.set(value,`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`);
    }
    patch[field]=images.get(value);
  }
  return validated(next,uid,true);
}
export const publishOwnerDraft=onCall(options,async request=>{
  const uid=await owner(request),draftExpected=revision(request.data?.draftRevision),publicExpected=revision(request.data?.publishedRevision);
  const snapshot=await db.doc('cms/draft').get();checkVersion(snapshot,draftExpected);
  if(!snapshot.exists)throw new HttpsError('failed-precondition','Save a draft before applying changes.');
  const id=randomUUID(),payload=await publicImages(validated(snapshot.data().payload,uid),uid,id);
  // Recheck ownership and both revisions after processing images and before changing the public head.
  await owner(request);
  return db.runTransaction(async tx=>{
    const draft=await tx.get(db.doc('cms/draft')),current=await tx.get(db.doc('public/site'));
    checkVersion(draft,draftExpected);checkVersion(current,publicExpected);
    if(!current.exists)tx.set(db.doc('revisions/initial'),{payload:empty(),revision:0,createdAt:FieldValue.serverTimestamp(),label:'Original website'});
    const record={payload,revision:publicExpected+1,revisionId:id,createdBy:uid,createdAt:FieldValue.serverTimestamp()};
    tx.set(db.doc(`mediaReleases/${id}`),{createdAt:FieldValue.serverTimestamp()});
    tx.set(db.doc(`revisions/${id}`),record);tx.set(db.doc('public/site'),{payload,revision:record.revision,revisionId:id,createdAt:FieldValue.serverTimestamp()});return {revision:record.revision,revisionId:id};
  });
});
export const restorePublishedRevision=onCall(options,async request=>{
  const uid=await owner(request),expected=revision(request.data?.publishedRevision),target=request.data?.revisionId;
  if(typeof target!=='string'||!(/^[a-f0-9-]{36}$/.test(target)||target==='initial'))throw new HttpsError('invalid-argument','Invalid revision.');
  const id=randomUUID();
  return db.runTransaction(async tx=>{
    const old=await tx.get(db.doc(`revisions/${target}`)),current=await tx.get(db.doc('public/site'));checkVersion(current,expected);
    if(!old.exists)throw new HttpsError('not-found','The selected revision is unavailable.');
    const payload=validated(old.data().payload,uid,true),record={payload,revision:expected+1,revisionId:id,restoredFrom:target,createdBy:uid,createdAt:FieldValue.serverTimestamp()};
    tx.set(db.doc(`revisions/${id}`),record);tx.set(db.doc('public/site'),{payload,revision:record.revision,revisionId:id,createdAt:FieldValue.serverTimestamp()});return {revision:record.revision,revisionId:id};
  });
});
