import { doc, getDoc, setDoc, runTransaction, serverTimestamp, onSnapshot, collection, query, orderBy, limit, getDocs, Bytes } from 'firebase/firestore';
import { sparkContent, publicContent, imageEntries, sparkImagePath, sparkImageLimit, emptyContent, schemaChunks } from './spark-content.js';

function conflict() {return Object.assign(new Error('התוכן השתנה במכשיר אחר. רענן את הטיוטה לפני שמירה.'),{code:'firestore/aborted'});}
function sameRevision(snapshot, expected) {if ((snapshot.data()?.revision??0)!==expected) throw conflict();}
export function createSparkStore(db, currentUid) {
  const draftRef=doc(db,'cms','draft'),publicRef=doc(db,'public','site');
  let draftRevision=0,publishedRevision=0;
  const uid=()=>{const value=currentUid();if(!value)throw Object.assign(new Error('יש להתחבר למנהל.'),{code:'firestore/unauthenticated'});return value;};
  async function image(value) {
    const snapshot=await getDoc(doc(db,sparkImagePath(value)));
    if (!snapshot.exists()) throw new Error('תמונה חסרה. העלה אותה מחדש.');
    const data=snapshot.data();
    if (data.mime!=='image/webp' || !(data.bytes instanceof Bytes) || data.bytes.toUint8Array().length>sparkImageLimit) throw new Error('תמונה אינה בפורמט הנתמך.');
    const bytes=data.bytes.toUint8Array();
    if (bytes.length<12 || String.fromCharCode(...bytes.slice(0,4))!=='RIFF' || String.fromCharCode(...bytes.slice(8,12))!=='WEBP') throw new Error('קובץ התמונה אינו תקין.');
    return data;
  }
  async function commitRelease(payload,revisionId,expected,draftExpected=null) {
    for(const chunk of schemaChunks)await setDoc(doc(db,`publishedContent/${revisionId}/groups/${chunk.id}`),{records:payload.changes[chunk.group]??{},createdAt:serverTimestamp()});
    return runTransaction(db,async tx=>{
      const current=await tx.get(publicRef);
      sameRevision(current,expected);
      if (draftExpected!==null) {const draft=await tx.get(draftRef);sameRevision(draft,draftExpected);if(!draft.exists())throw new Error('שמור טיוטה לפני החלת שינויים.');}
      const revision=expected+1;
      if(!current.exists())tx.set(doc(db,'revisions','initial'),{payload:emptyContent(),revision:0,createdAt:serverTimestamp(),kind:'initial'});
      tx.set(doc(db,'revisions',revisionId),{payload,revision,createdAt:serverTimestamp(),kind:draftExpected===null?'restore':'publish'});
      tx.set(doc(db,'mediaReleases',revisionId),{revision,createdAt:serverTimestamp()});
      tx.set(publicRef,{payload,revision,revisionId,updatedAt:serverTimestamp()});
      return {revision,revisionId};
    });
  }
  return {
    subscribePublic(fn,onError) {return onSnapshot(publicRef,snapshot=>{publishedRevision=snapshot.data()?.revision??0;fn(snapshot.data()?.payload??emptyContent());},onError);},
    async loadDraft() {const snapshot=await getDoc(draftRef);draftRevision=snapshot.data()?.revision??0;return sparkContent(snapshot.exists()?snapshot.data().payload:await this.published(),uid());},
    async save(input) {
      const ownerUid=uid(),payload=sparkContent(input,ownerUid),expected=draftRevision,draftId=crypto.randomUUID();
      for(const chunk of schemaChunks){try{await setDoc(doc(db,`draftContent/${ownerUid}/versions/${draftId}/groups/${chunk.id}`),{records:payload.changes[chunk.group]??{},createdAt:serverTimestamp()});}catch(error){error.sparkChunk=chunk.id;throw error;}}
      const revision=await runTransaction(db,async tx=>{
        const snapshot=await tx.get(draftRef);sameRevision(snapshot,expected);
        tx.set(draftRef,{payload,revision:expected+1,draftId,updatedBy:ownerUid,updatedAt:serverTimestamp()});return expected+1;
      });
      draftRevision=revision;return payload;
    },
    async uploadImage(bytes) {
      if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>sparkImageLimit)throw new Error('התמונה גדולה מדי לאחר הקטנה.');
      const ownerUid=uid(),id=crypto.randomUUID();
      await setDoc(doc(db,`draftImages/${ownerUid}/images/${id}`),{bytes:Bytes.fromUint8Array(bytes),mime:'image/webp',createdAt:serverTimestamp()});
      return `spark:drafts/${ownerUid}/${id}`;
    },
    image,
    async publish() {
      const ownerUid=uid(),draftExpected=draftRevision,expected=publishedRevision;
      const [draft,current]=await Promise.all([getDoc(draftRef),getDoc(publicRef)]);
      sameRevision(draft,draftExpected);sameRevision(current,expected);
      if(!draft.exists())throw new Error('שמור טיוטה לפני החלת שינויים.');
      const payload=publicContent(sparkContent(draft.data().payload,ownerUid)),id=crypto.randomUUID(),copies=new Map();
      for(const entry of imageEntries(payload)) {
        if(entry.value.startsWith('spark:published/'))continue;
        if(!copies.has(entry.value)) {
          const source=await image(entry.value),imageId=crypto.randomUUID();
          await setDoc(doc(db,`publishedImages/${id}/images/${imageId}`),{bytes:source.bytes,mime:source.mime,sourceId:entry.value.split('/').at(-1),createdAt:serverTimestamp()});
          copies.set(entry.value,`spark:published/${id}/${imageId}`);
        }
        entry.patch[entry.field]=copies.get(entry.value);
      }
      return commitRelease(sparkContent(payload,undefined,true),id,expected,draftExpected);
    },
    async restore(revisionId) {
      uid();const expected=publishedRevision;
      if(revisionId!=='initial'&&!/^[a-f0-9-]{36}$/.test(revisionId))throw new Error('גרסה אינה תקינה.');
      const snapshot=await getDoc(doc(db,'revisions',revisionId));if(!snapshot.exists())throw new Error('הגרסה לא נמצאה.');
      return commitRelease(sparkContent(snapshot.data().payload,undefined,true),crypto.randomUUID(),expected);
    },
    async revisions(){const result=await getDocs(query(collection(db,'revisions'),orderBy('createdAt','desc'),limit(20)));return result.docs.map(snapshot=>({id:snapshot.id,...snapshot.data()}));},
    async published(){const current=await getDoc(publicRef);publishedRevision=current.data()?.revision??0;return sparkContent(current.data()?.payload??emptyContent(),undefined,true);},
    clear(){draftRevision=0;},
  };
}
