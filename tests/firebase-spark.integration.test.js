import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, getDoc, setDoc, doc, serverTimestamp, writeBatch, Bytes } from 'firebase/firestore';
import { createSparkStore } from '../src/firebase-spark-store.js';
import { sparkImagePath, emptyContent } from '../src/spark-content.js';
import { contentGroups } from '../src/content.js';

const projectId='demo-nexori',apps=[];
const env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:await readFile('firestore.rules','utf8')}});
await env.clearFirestore();
await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${projectId}/accounts`,{method:'DELETE'});
async function account(email,verified=false){
  const app=initializeApp({projectId,apiKey:'demo-key'},email);apps.push(app);
  const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
  const {user}=await createUserWithEmailAndPassword(auth,email,'Test-password-123!');
  if(verified){const response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({localId:user.uid,emailVerified:true})});assert.equal(response.status,200);await user.reload();await user.getIdToken(true);}
  const db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',8080);
  return {user,db,store:createSparkStore(db,()=>auth.currentUser?.uid)};
}
const owner=await account('owner@nexori.test',true),outsider=await account('outsider@nexori.test',true),unverified=await account('unverified@nexori.test');
await env.withSecurityRulesDisabled(async context=>{await setDoc(doc(context.firestore(),'admins',owner.user.uid),{active:true});await setDoc(doc(context.firestore(),'admins',unverified.user.uid),{active:true});});
const guest=env.unauthenticatedContext().firestore();
const bytes=new Uint8Array(Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA','base64'));
let imageRef;
test('verified manager alone can edit; no role escalation or private visitor access',async()=>{
  await owner.store.save(emptyContent());
  await assertSucceeds(getDoc(doc(owner.db,'cms','draft')));
  for(const session of [outsider,unverified]){await assertFails(getDoc(doc(session.db,'cms','draft')));await assertFails(session.store.save(emptyContent()));}
  await assertFails(getDoc(doc(guest,'cms','draft')));
  await assertFails(setDoc(doc(outsider.db,'admins',outsider.user.uid),{active:true}));
  await assertFails(setDoc(doc(owner.db,'public','site'),{payload:emptyContent(),revision:1,revisionId:randomUUID(),updatedAt:serverTimestamp()}));
});
test('private images, owner isolation, immutability and size limits',async()=>{
  imageRef=await owner.store.uploadImage(bytes);const imageDoc=doc(owner.db,sparkImagePath(imageRef));
  await assertSucceeds(getDoc(imageDoc));
  await assertFails(getDoc(doc(guest,sparkImagePath(imageRef))));
  await assertFails(getDoc(doc(outsider.db,sparkImagePath(imageRef))));
  await assertFails(setDoc(imageDoc,{bytes:Bytes.fromUint8Array(bytes),mime:'image/webp',createdAt:serverTimestamp()}));
  await assertFails(setDoc(doc(outsider.db,`draftImages/${owner.user.uid}/images/${randomUUID()}`),{bytes:Bytes.fromUint8Array(bytes),mime:'image/webp',createdAt:serverTimestamp()}));
  await assertFails(setDoc(doc(owner.db,`draftImages/${owner.user.uid}/images/${randomUUID()}`),{bytes:Bytes.fromUint8Array(new Uint8Array(196609)),mime:'image/webp',createdAt:serverTimestamp()}));
  await assertFails(setDoc(doc(owner.db,`draftImages/${owner.user.uid}/images/${randomUUID()}`),{bytes:Bytes.fromUint8Array(bytes),mime:'image/svg+xml',createdAt:serverTimestamp()}));
});
test('actual client store saves and publishes images atomically, strips notes, and restores',async()=>{
  const payload={version:1,changes:{worlds:{'dragon-ball':{pageTitle:'Dragon Ball Universe',pageImage:imageRef},naruto:{cardTitle:'Naruto Collection'}},products:{'midnight-ronin':{editorNotes:'PRIVATE-NOTE',retailerUrl:'https://example.com/preparation'}}}};
  await owner.store.save(payload);await owner.store.published();
  const result=await owner.store.publish();assert.equal(result.revision,1);
  const publicData=(await getDoc(doc(guest,'public','site'))).data();
  assert.equal(publicData.payload.changes.worlds['dragon-ball'].pageTitle,'Dragon Ball Universe');
  assert.equal(publicData.payload.changes.worlds['dragon-ball'].cardTitle,undefined);
  assert.doesNotMatch(JSON.stringify(publicData),/PRIVATE-NOTE|preparation|spark:drafts|updatedBy/);
  const publicImage=doc(guest,sparkImagePath(publicData.payload.changes.worlds['dragon-ball'].pageImage));
  const publishedBytes=(await getDoc(publicImage)).data().bytes.toUint8Array();assert.deepEqual(publishedBytes,bytes);
  await owner.store.published();const restored=await owner.store.restore('initial');assert.equal(restored.revision,2);
  assert.deepEqual((await getDoc(doc(guest,'public','site'))).data().payload,emptyContent());
  assert.equal((await getDoc(doc(owner.db,'cms','draft'))).data().revision,2);
  await assertSucceeds(getDoc(publicImage)); // Earlier immutable images remain released for recovery.
});
test('stale sessions cannot overwrite a draft',async()=>{
  const stale=createSparkStore(owner.db,()=>owner.user.uid);await stale.loadDraft();
  await owner.store.save({version:1,changes:{worlds:{naruto:{pageTitle:'New title'}}}});
  await assert.rejects(stale.save(emptyContent()),{code:'firestore/aborted'});
});
test('unreleased copies are private and cannot be exposed without an atomic publication',async()=>{
  const release=randomUUID(),imageId=randomUUID();
  const path=`publishedImages/${release}/images/${imageId}`;
  const copy={bytes:Bytes.fromUint8Array(bytes),mime:'image/webp',sourceId:imageRef.split('/').at(-1),createdAt:serverTimestamp()};
  await assertSucceeds(setDoc(doc(owner.db,path),copy));await assertFails(getDoc(doc(guest,path)));
  await assertFails(setDoc(doc(owner.db,path),copy));
  await assertFails(setDoc(doc(owner.db,'mediaReleases',release),{revision:3,createdAt:serverTimestamp()}));
  await assertFails(setDoc(doc(owner.db,'revisions',release),{payload:emptyContent(),revision:3,createdAt:serverTimestamp(),kind:'publish'}));
});
test('rules reject unknown cards, unsafe image references and private fields in a public transaction',async()=>{
  for(const records of [{unknown:{pageTitle:'x'}},{naruto:{pageImage:'javascript:alert(1)'}}])await assertFails(setDoc(doc(owner.db,`draftContent/${owner.user.uid}/versions/${randomUUID()}/groups/worlds-0`),{records,createdAt:serverTimestamp()}));
  await assertFails(setDoc(doc(owner.db,`publishedContent/${randomUUID()}/groups/products-0`),{records:{'midnight-ronin':{editorNotes:'PRIVATE'}},createdAt:serverTimestamp()}));
  const revision=(await getDoc(doc(owner.db,'cms','draft'))).data().revision+1;
  for(const payload of [{version:1,changes:{worlds:{unknown:{pageTitle:'x'}}}},{version:1,changes:{worlds:{naruto:{pageImage:'javascript:alert(1)'}}}}])await assertFails(setDoc(doc(owner.db,'cms','draft'),{payload,revision,updatedBy:owner.user.uid,updatedAt:serverTimestamp()}));
  const id=randomUUID(),payload={version:1,changes:{products:{'midnight-ronin':{editorNotes:'PRIVATE'}}}};
  const batch=writeBatch(owner.db);
  batch.set(doc(owner.db,'public','site'),{payload,revision:3,revisionId:id,updatedAt:serverTimestamp()});
  batch.set(doc(owner.db,'revisions',id),{payload,revision:3,createdAt:serverTimestamp(),kind:'publish'});
  batch.set(doc(owner.db,'mediaReleases',id),{revision:3,createdAt:serverTimestamp()});
  await assertFails(batch.commit());
});
test('all existing cards fit rule evaluation limits; revoked managers lose access',async()=>{
  const changes={};for(const [group,{records}] of Object.entries(contentGroups)){changes[group]={};for(const record of records)changes[group][record.id]=group==='worlds'?{imageAlt:'Accessible description',cardImage:imageRef,pageImage:imageRef}:{imageAlt:'Accessible description',image:imageRef};}
  await owner.store.save({version:1,changes});await owner.store.published();await owner.store.publish();
  await env.withSecurityRulesDisabled(context=>setDoc(doc(context.firestore(),'admins',owner.user.uid),{active:false}));
  await assertFails(getDoc(doc(owner.db,'cms','draft')));await assertFails(owner.store.save(emptyContent()));
});
test.after(async()=>{await env.cleanup();await Promise.all(apps.map(deleteApp));});
