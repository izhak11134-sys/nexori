import test from 'node:test';
import assert from 'node:assert/strict';
import { sparkContent, publicContent, sparkImagePath } from '../src/spark-content.js';
const id='12345678-1234-1234-1234-123456789abc';
const draft=(image)=>({version:1,changes:{worlds:{'dragon-ball':{pageImage:image}}}});
test('Spark images are private to the owning UID or use a published version reference',()=>{
  assert.equal(sparkImagePath(`spark:drafts/owner/${id}`),`draftImages/owner/images/${id}`);
  assert.equal(sparkImagePath(`spark:published/${id}/${id}`),`publishedImages/${id}/images/${id}`);
  sparkContent(draft(`spark:drafts/owner/${id}`),'owner');
  assert.throws(()=>sparkContent(draft(`spark:drafts/other/${id}`),'owner'));
  assert.throws(()=>sparkContent(draft(`spark:drafts/owner/${id}`),undefined,true));
  assert.throws(()=>sparkContent(draft('data:image/png;base64,aGVsbG8='),'owner'));
  assert.throws(()=>sparkImagePath('spark:published/../../private'));
});
test('public payload strips preparation fields and refuses accidentally private content',()=>{
  const input={version:1,changes:{products:{'midnight-ronin':{name:'Display figure',editorNotes:'PRIVATE',retailerUrl:'https://example.com/'}}}};
  assert.throws(()=>sparkContent(input,undefined,true));
  const clean=publicContent(input);sparkContent(clean,undefined,true);
  assert.doesNotMatch(JSON.stringify(clean),/PRIVATE|retailerUrl/);
  assert.equal(input.changes.products['midnight-ronin'].editorNotes,'PRIVATE');
});
