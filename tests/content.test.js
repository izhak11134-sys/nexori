import test from 'node:test';
import assert from 'node:assert/strict';
import { categories, products } from '../src/data.js';
import { catalogTypes } from '../src/catalog.js';
import { applyContentDraft, contentRecord, originalContentRecord, validateContentDraft } from '../src/content.js';
const empty=()=>({version:1,changes:{}});

test('world card, page heading and background are independent fields',()=>{
  applyContentDraft({version:1,changes:{worlds:{'dragon-ball':{pageTitle:'Dragon Ball Universe',pageImage:'data:image/png;base64,aGVsbG8='}}}});
  assert.equal(contentRecord('worlds','dragon-ball').cardTitle,'Dragon Ball');
  assert.equal(contentRecord('worlds','dragon-ball').pageTitle,'Dragon Ball Universe');
  assert.equal(contentRecord('worlds','dragon-ball').cardImage,undefined);
  applyContentDraft(empty());
});

test('repeated editing/reset preserves category-type references and original records',()=>{
  const before=categories[0].types[0];
  applyContentDraft({version:1,changes:{categories:{figures:{label:'My figures'}},types:{'display-figures':{name:'Display pieces'}}}});
  assert.equal(categories[0].label,'My figures');
  assert.equal(categories[0].types[0],before);
  assert.equal(catalogTypes.find(t=>t.id==='display-figures').name,'Display pieces');
  applyContentDraft(empty());
  assert.equal(categories[0].label,'Figures & collectibles');
  assert.equal(before.name,'Display figures');
  assert.equal(originalContentRecord('worlds','dragon-ball').pageTitle,'Dragon Ball');
});

test('unknown IDs, fields, prototype keys and unsafe image/URL schemes are rejected',()=>{
  for(const input of [
    {version:1,changes:{products:{unknown:{name:'x'}}}},
    {version:1,changes:{products:{'midnight-ronin':{id:'new-id'}}}},
    JSON.parse('{"version":1,"changes":{"__proto__":{}}}'),
    {version:1,changes:{products:{'midnight-ronin':{image:'https://outside.example/image.jpg'}}}},
    {version:1,changes:{products:{'midnight-ronin':{image:'data:image/svg+xml;base64,PHN2Zz4='}}}},
    {version:1,changes:{products:{'midnight-ronin':{retailerUrl:'javascript:alert(1)'}}}},
    {version:1,changes:{worlds:{'dragon-ball':{pageTitle:''}}}},
  ]) assert.throws(()=>validateContentDraft(input));
});

test('invalid category/type changes fail atomically',()=>{
  const oldName=products[0].name;
  assert.throws(()=>applyContentDraft({version:1,changes:{products:{'midnight-ronin':{name:'Changed',category:'style'}}}}));
  assert.equal(products[0].name,oldName);
});
