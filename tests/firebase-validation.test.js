import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudDraft } from '../functions/validation.js';
const options={uid:'owner',bucket:'demo-nexori.appspot.com'};
const draft=image=>({version:1,changes:{worlds:{'one-piece':{pageImage:image}}}});
const id='12345678-1234-1234-1234-123456789abc';
test('cloud drafts accept only own private uploads or published images in their bucket',()=>{
  assert.doesNotThrow(()=>cloudDraft(draft(`storage:drafts/owner/${id}.png`),options));
  const published=`https://firebasestorage.googleapis.com/v0/b/${options.bucket}/o/${encodeURIComponent(`published/${id}/${id}.webp`)}?alt=media`;
  assert.doesNotThrow(()=>cloudDraft(draft(published),options));
  for(const image of [`storage:drafts/other/${id}.png`,published.replace(options.bucket,'other.appspot.com'),published+'&token=secret',published.replace('published%2F','drafts%2F'),'data:image/png;base64,aGVsbG8=','javascript:alert(1)','blob:https://nexori.example/unregistered'])assert.throws(()=>cloudDraft(draft(image),options));
  assert.throws(()=>cloudDraft(draft(`storage:drafts/owner/${id}.png`),{...options,published:true}));
});
test('published payload strips private product preparation fields',()=>{
  const payload=cloudDraft({version:1,changes:{products:{'midnight-ronin':{name:'Updated figure',editorNotes:'PRIVATE',retailerUrl:'https://example.com'}}}},{...options,published:true});
  assert.deepEqual(payload.changes.products['midnight-ronin'],{name:'Updated figure'});
});
