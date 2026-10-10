import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserSessionPersistence, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDoc } from 'firebase/firestore';
import { validateContentDraft, contentImageBlobs } from './content.js';
import { createSparkStore } from './firebase-spark-store.js';
import { imageEntries } from './spark-content.js';
import { compressSparkImage } from './spark-images.js';

export async function createFirebaseService(config) {
  const app=initializeApp(config),auth=getAuth(app),db=getFirestore(app);
  if(import.meta.env.VITE_FIREBASE_USE_EMULATORS==='true'||config.useEmulators===true) {
    if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname))throw new Error('Emulators are only permitted on localhost.');
    connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8080);
  }
  await setPersistence(auth,browserSessionPersistence);
  const store=createSparkStore(db,()=>auth.currentUser?.uid),bucket='spark-firestore';
  let operation=false,generation=0,publicSequence=0;
  const privatePreviews=new Map(),publicPreviews=new Map(),references=new Map();
  const dataUrl=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
  async function preview(reference,expectedGeneration) {
    const isPrivate=reference.startsWith('spark:drafts/'),cache=isPrivate?privatePreviews:publicPreviews;
    if(cache.has(reference))return cache.get(reference);
    const data=await store.image(reference);
    const url=URL.createObjectURL(new Blob([data.bytes.toUint8Array()],{type:data.mime}));
    try {
      const image=new Image();image.src=url;await image.decode();
      if(isPrivate&&generation!==expectedGeneration)throw new Error('התחברות המנהל השתנתה.');
      // Concurrent loads may have already prepared this immutable image.
      if(cache.has(reference)){URL.revokeObjectURL(url);return cache.get(reference);}
      cache.set(reference,url);references.set(url,reference);contentImageBlobs.add(url);return url;
    }catch(error){URL.revokeObjectURL(url);throw error;}
  }
  async function materialize(payload,expectedGeneration=generation,publicOnly=false) {
    const next=validateContentDraft(payload,{spark:true,ownerUid:publicOnly?undefined:auth.currentUser?.uid});
    await Promise.all(imageEntries(next).map(async entry=>{entry.patch[entry.field]=await preview(entry.value,expectedGeneration);}));
    if(!publicOnly&&generation!==expectedGeneration)throw new Error('התחברות המנהל השתנתה.');
    return next;
  }
  async function exclusive(fn) {
    if(operation)throw new Error('יש פעולה בתהליך. המתן לסיומה.');operation=true;
    try{return await fn();}finally{operation=false;}
  }
  async function normalize(input,expectedGeneration) {
    const next=validateContentDraft(input,{spark:true,ownerUid:auth.currentUser?.uid,bucket});
    const uploads=new Map();
    for(const entry of imageEntries(next)) {
      if(entry.value.startsWith('blob:')) {
        const reference=references.get(entry.value);if(!reference)throw new Error('התמונה אינה זמינה. טען את הטיוטה מחדש.');
        entry.patch[entry.field]=reference;continue;
      }
      if(!entry.value.startsWith('data:'))continue;
      if(!uploads.has(entry.value))uploads.set(entry.value,await store.uploadImage(await compressSparkImage(entry.value)));
      if(generation!==expectedGeneration)throw new Error('התחברות המנהל השתנתה.');
      entry.patch[entry.field]=uploads.get(entry.value);
    }
    return next;
  }
  return {
    bucket,
    imageNote:'תמונות חדשות מוקטנות לעד 1600 פיקסלים ומומרות ל־WebP לצורך שמירה במסלול החינמי. תמונות וגרסאות משתמשות במכסת Firestore.',
    observeAuth:fn=>onAuthStateChanged(auth,fn),
    login:(email,password)=>signInWithEmailAndPassword(auth,email,password),
    logout:()=>signOut(auth),
    resetPassword:email=>sendPasswordResetEmail(auth,email),
    verifyEmail:()=>sendEmailVerification(auth.currentUser),
    async isOwner(user){const role=await getDoc(doc(db,'admins',user.uid));return user.emailVerified&&role.data()?.active===true;},
    subscribePublic(fn,onError) {return store.subscribePublic(async payload=>{
      const sequence=++publicSequence;
      try{const display=await materialize(payload,generation,true);if(sequence===publicSequence)fn(display);}catch(error){if(sequence===publicSequence)onError?.(error);}
    },onError);},
    async loadDraft(){const expectedGeneration=generation;return materialize(await store.loadDraft(),expectedGeneration);},
    save:input=>exclusive(async()=>{const expectedGeneration=generation;const normalized=await normalize(input,expectedGeneration);const saved=await store.save(normalized);return materialize(saved,expectedGeneration);}),
    async backup(input){const next=structuredClone(input);for(const entry of imageEntries(next))if(entry.value.startsWith('blob:'))entry.patch[entry.field]=await dataUrl(await(await fetch(entry.value)).blob());return next;},
    publish:()=>exclusive(()=>store.publish()),
    restore:revisionId=>exclusive(()=>store.restore(revisionId)),
    revisions:()=>store.revisions(),
    async published(){return materialize(await store.published(),generation,true);},
    clear(){generation++;for(const url of privatePreviews.values()){URL.revokeObjectURL(url);contentImageBlobs.delete(url);references.delete(url);}privatePreviews.clear();store.clear();},
  };
}
