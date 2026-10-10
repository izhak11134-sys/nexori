import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserSessionPersistence, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, ref, uploadBytes, getBlob } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { validateContentDraft, contentImageBlobs } from './content.js';
export async function createFirebaseService(config) {
  const app=initializeApp(config),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app),functions=getFunctions(app,import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION||'europe-west1');
  if(import.meta.env.VITE_FIREBASE_USE_EMULATORS==='true') {
    if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname))throw new Error('Emulators are only permitted on localhost.');
    connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8080);connectStorageEmulator(storage,'127.0.0.1',9199);connectFunctionsEmulator(functions,'127.0.0.1',5001);
  }
  await setPersistence(auth,browserSessionPersistence);
  let draftRevision=0,publishedRevision=0,operation=false;
  const images=new Map(),privatePreviews=new Map(),empty=()=>({version:1,changes:{}});
  const dataUrl=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
  function preview(path,blob) {
    if(!privatePreviews.has(path)){const url=URL.createObjectURL(blob);privatePreviews.set(path,url);contentImageBlobs.add(url);images.set(url,path);}
    return privatePreviews.get(path);
  }
  const call=async(name,data)=>(await httpsCallable(functions,name)(data)).data;
  async function exclusive(fn) {
    if(operation)throw new Error('יש פעולה בתהליך. המתן לסיומה.');operation=true;
    try{return await fn();}finally{operation=false;}
  }
  async function normalize(payload) {
    const next=validateContentDraft(payload,{bucket:config.storageBucket});
    for(const records of Object.values(next.changes))for(const patch of Object.values(records))for(const [field,value] of Object.entries(patch)) {
      if(!/image$/i.test(field))continue;
      if(value.startsWith('blob:')){patch[field]=images.get(value);if(!patch[field])throw new Error('התמונה הפרטית אינה זמינה. טען את הטיוטה מחדש.');continue;}
      if(!value.startsWith('data:'))continue;
      if(!images.has(value)) {
        const blob=await(await fetch(value)).blob();if(blob.size>2*1024*1024)throw new Error('תמונה גדולה מ־2MB.');
        const extension={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[blob.type];if(!extension)throw new Error('פורמט תמונה לא נתמך.');
        const path=`drafts/${auth.currentUser.uid}/${crypto.randomUUID()}.${extension}`;
        await uploadBytes(ref(storage,path),blob,{contentType:blob.type});images.set(value,`storage:${path}`);preview(`storage:${path}`,blob);
      }
      patch[field]=images.get(value);
    }
    return next;
  }
  async function materialize(payload) {
    const next=validateContentDraft(payload,{bucket:config.storageBucket,ownerUid:auth.currentUser.uid});
    for(const records of Object.values(next.changes))for(const patch of Object.values(records))for(const [field,value] of Object.entries(patch)) {
      if(!/image$/i.test(field)||!value.startsWith('storage:'))continue;
      patch[field]=privatePreviews.get(value)||preview(value,await getBlob(ref(storage,value.slice(8)),2*1024*1024));
    }
    return next;
  }
  return {
    bucket:config.storageBucket,
    observeAuth:fn=>onAuthStateChanged(auth,fn),
    login:(email,password)=>signInWithEmailAndPassword(auth,email,password),
    logout:()=>signOut(auth),
    resetPassword:email=>sendPasswordResetEmail(auth,email),
    verifyEmail:()=>sendEmailVerification(auth.currentUser),
    async isOwner(user){const role=await getDoc(doc(db,'admins',user.uid));return user.emailVerified&&role.data()?.active===true;},
    subscribePublic(fn,onError){return onSnapshot(doc(db,'public','site'),snapshot=>{publishedRevision=snapshot.data()?.revision??0;fn(snapshot.data()?.payload??empty());},onError);},
    async loadDraft(){const snapshot=await getDoc(doc(db,'cms','draft'));draftRevision=snapshot.data()?.revision??0;if(snapshot.exists())return materialize(snapshot.data().payload);const current=await getDoc(doc(db,'public','site'));return current.data()?.payload??empty();},
    save:payload=>exclusive(async()=>{const normalized=await normalize(payload),result=await call('saveOwnerDraft',{payload:normalized,expectedRevision:draftRevision});draftRevision=result.revision;return materialize(normalized);}),
    async backup(payload){const next=structuredClone(payload);for(const records of Object.values(next.changes))for(const patch of Object.values(records))for(const [field,value] of Object.entries(patch))if(/image$/i.test(field)&&value.startsWith('blob:'))patch[field]=await dataUrl(await(await fetch(value)).blob());return next;},
    publish:()=>exclusive(()=>call('publishOwnerDraft',{draftRevision,publishedRevision})),
    restore:revisionId=>exclusive(()=>call('restorePublishedRevision',{revisionId,publishedRevision})),
    async revisions(){const snapshots=await getDocs(query(collection(db,'revisions'),orderBy('createdAt','desc'),limit(20)));return snapshots.docs.map(snapshot=>({id:snapshot.id,...snapshot.data()}));},
    async published(){const snapshot=await getDoc(doc(db,'public','site'));return snapshot.data()?.payload??empty();},
    clear(){for(const url of privatePreviews.values()){URL.revokeObjectURL(url);contentImageBlobs.delete(url);}privatePreviews.clear();images.clear();draftRevision=0;},
  };
}
