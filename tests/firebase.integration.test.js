import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { createRequire } from 'node:module';
const require=createRequire(new URL('../functions/package.json',import.meta.url));
const {initializeApp:adminApp,deleteApp:deleteAdminApp}=require('firebase-admin/app');
const {getAuth:adminAuth}=require('firebase-admin/auth');
const {getFirestore:adminFirestore}=require('firebase-admin/firestore');
const {getStorage:adminStorage}=require('firebase-admin/storage');
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, ref, uploadBytes, getBytes } from 'firebase/storage';
const sharp=require('sharp');
const projectId='demo-nexori',bucket=`${projectId}.appspot.com`;
const admin=adminApp({projectId,storageBucket:bucket},'tests'),adb=adminFirestore(admin);
const env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:await readFile('firestore.rules','utf8')},storage:{host:'127.0.0.1',port:9199,rules:await readFile('storage.rules','utf8')}});
const apps=[];
async function account(email,verified=false){
  const app=initializeApp({projectId,apiKey:'demo-key',storageBucket:bucket},email);apps.push(app);
  const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
  const {user}=await createUserWithEmailAndPassword(auth,email,'Test-password-123!');
  if(verified){await adminAuth(admin).updateUser(user.uid,{emailVerified:true});await user.reload();await user.getIdToken(true);}
  const functions=getFunctions(app,'europe-west1');connectFunctionsEmulator(functions,'127.0.0.1',5001);
  const db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',8080);
  const storage=getStorage(app);connectStorageEmulator(storage,'127.0.0.1',9199);
  return {user,db,storage,call:async(name,data)=>(await httpsCallable(functions,name)(data)).data};
}
const owner=await account('owner@nexori.test',true),outsider=await account('outsider@nexori.test',true),unverified=await account('unverified@nexori.test');
await adb.doc(`admins/${owner.user.uid}`).set({active:true});await adb.doc(`admins/${unverified.user.uid}`).set({active:true});
const png=await sharp({create:{width:4,height:4,channels:3,background:'#bb55ff'}}).png().toBuffer();
const empty={version:1,changes:{}};
test('verified owner permissions; visitors cannot read drafts or grant roles',async()=>{
  await adb.doc('cms/draft').set({payload:empty,revision:0});
  await assertSucceeds(getDoc(doc(owner.db,'cms','draft')));
  for(const session of [outsider,unverified]){
    await assertFails(getDoc(doc(session.db,'cms','draft')));
    await assert.rejects(session.call('saveOwnerDraft',{payload:empty,expectedRevision:0}),{code:'functions/permission-denied'});
    await assert.rejects(session.call('publishOwnerDraft',{draftRevision:0,publishedRevision:0}),{code:'functions/permission-denied'});
    await assert.rejects(session.call('restorePublishedRevision',{revisionId:'initial',publishedRevision:0}),{code:'functions/permission-denied'});
  }
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'cms','draft')));
  await assertFails(setDoc(doc(outsider.db,'admins',outsider.user.uid),{active:true}));
  await assertFails(setDoc(doc(owner.db,'public','site'),{payload:empty,revision:99}));
  await assertFails(setDoc(doc(owner.db,'cms','draft'),{payload:empty,revision:99}));
});
test('private upload rules prevent public access, cross-owner writes and replacement',async()=>{
  const path=`drafts/${owner.user.uid}/${randomUUID()}.png`;globalThis.imagePath=path;
  await assertSucceeds(uploadBytes(ref(owner.storage,path),png,{contentType:'image/png'}));
  await assertSucceeds(getBytes(ref(owner.storage,path)));
  await assertFails(getBytes(ref(outsider.storage,path)));
  await assertFails(getBytes(ref(env.unauthenticatedContext().storage('gs://'+bucket),path)));
  await assertFails(uploadBytes(ref(owner.storage,path),png,{contentType:'image/png'}));
  await assertFails(uploadBytes(ref(outsider.storage,`drafts/${owner.user.uid}/${randomUUID()}.png`),png,{contentType:'image/png'}));
  await assertFails(uploadBytes(ref(owner.storage,`drafts/${owner.user.uid}/${randomUUID()}.svg`),png,{contentType:'image/svg+xml'}));
  await assertFails(uploadBytes(ref(owner.storage,`published/${randomUUID()}/${randomUUID()}.webp`),png,{contentType:'image/webp'}));
  const unreleased=`published/${randomUUID()}/${randomUUID()}.webp`;
  await adminStorage(admin).bucket().file(unreleased).save(png,{metadata:{contentType:'image/webp'}});
  await assertFails(getBytes(ref(env.unauthenticatedContext().storage('gs://'+bucket),unreleased)));
});
test('draft save, conflict detection, publication, private field stripping and rollback',async()=>{
  const payload={version:1,changes:{worlds:{'dragon-ball':{pageTitle:'Dragon Ball Universe',pageImage:`storage:${globalThis.imagePath}`},'naruto':{cardTitle:'Naruto Collection'}},products:{'midnight-ronin':{editorNotes:'PRIVATE-NOTE',retailerUrl:'https://example.com/preparation'}}}};
  const saved=await owner.call('saveOwnerDraft',{payload,expectedRevision:0});assert.equal(saved.revision,1);
  await assert.rejects(owner.call('saveOwnerDraft',{payload,expectedRevision:0}),{code:'functions/aborted'});
  await assert.rejects(owner.call('saveOwnerDraft',{payload:{version:1,changes:{worlds:{unknown:{pageTitle:'x'}}}},expectedRevision:1}),{code:'functions/invalid-argument'});
  const result=await owner.call('publishOwnerDraft',{draftRevision:1,publishedRevision:0});assert.equal(result.revision,1);
  const current=(await getDoc(doc(env.unauthenticatedContext().firestore(),'public','site'))).data();
  assert.equal(current.payload.changes.worlds['dragon-ball'].pageTitle,'Dragon Ball Universe');
  assert.equal(current.payload.changes.worlds['dragon-ball'].cardTitle,undefined);
  assert.equal(current.payload.changes.worlds.naruto.cardTitle,'Naruto Collection');
  assert.doesNotMatch(JSON.stringify(current),/PRIVATE-NOTE|preparation|storage:drafts/);
  const image=current.payload.changes.worlds['dragon-ball'].pageImage;
  assert.ok(image.includes('published%2F'));
  const response=await fetch(image.replace('https://firebasestorage.googleapis.com','http://127.0.0.1:9199'));assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/webp');
  await assert.rejects(owner.call('publishOwnerDraft',{draftRevision:1,publishedRevision:0}),{code:'functions/aborted'});
  const restored=await owner.call('restorePublishedRevision',{revisionId:'initial',publishedRevision:1});assert.equal(restored.revision,2);
  assert.deepEqual((await getDoc(doc(outsider.db,'public','site'))).data().payload,empty);
  assert.equal((await getDoc(doc(owner.db,'cms','draft'))).data().revision,1);
});
test('fake images cannot be published and revoked owners lose server access',async()=>{
  const path=`drafts/${owner.user.uid}/${randomUUID()}.png`;
  await uploadBytes(ref(owner.storage,path),new TextEncoder().encode('not an image'),{contentType:'image/png'});
  await owner.call('saveOwnerDraft',{payload:{version:1,changes:{worlds:{'one-piece':{pageImage:`storage:${path}`}}}},expectedRevision:1});
  await assert.rejects(owner.call('publishOwnerDraft',{draftRevision:2,publishedRevision:2}),{code:'functions/invalid-argument'});
  assert.equal((await getDoc(doc(outsider.db,'public','site'))).data().revision,2);
  await adb.doc(`admins/${owner.user.uid}`).update({active:false});
  await assert.rejects(owner.call('saveOwnerDraft',{payload:empty,expectedRevision:2}),{code:'functions/permission-denied'});
  await assertFails(getDoc(doc(owner.db,'cms','draft')));
});
test.after(async()=>{await env.cleanup();await Promise.all(apps.map(deleteApp));await adb.terminate();await deleteAdminApp(admin);});
