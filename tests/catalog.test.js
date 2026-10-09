import test from 'node:test';
import assert from 'node:assert/strict';
import { categories, franchises, products } from '../src/data.js';
import { catalogDefaults, readCatalogFilters, catalogHref, selectCatalogProducts, validateCatalog } from '../src/catalog.js';

test('all preview records have a unique place and cannot appear as franchise merchandise', () => {
  assert.equal(validateCatalog(products),true);
  for (const world of franchises) assert.equal(selectCatalogProducts(products,{...catalogDefaults,world:world.id}).length,0);
  assert.equal(selectCatalogProducts(products,{...catalogDefaults,world:'original'}).length,products.length);
});

test('combined category, type and world filters keep one record per result', () => {
  // Synthetic records test future classification; these are not retail listings.
  const records = [
    {id:'fixture-a',name:'Figure A',category:'figures',typeId:'display-figures',worldId:'one-piece',type:'Figure'},
    {id:'fixture-b',name:'Figure B',category:'figures',typeId:'display-figures',worldId:'naruto',type:'Figure'},
    {id:'fixture-c',name:'Shirt A',category:'style',typeId:'t-shirts',worldId:'one-piece',type:'T-shirt'},
  ];
  assert.equal(validateCatalog(records),true);
  assert.deepEqual(selectCatalogProducts(records,{...catalogDefaults,world:'one-piece'}).map(x=>x.id),['fixture-a','fixture-c']);
  assert.deepEqual(selectCatalogProducts(records,{...catalogDefaults,world:'one-piece',category:'figures',type:'display-figures'}).map(x=>x.id),['fixture-a']);
  assert.deepEqual(selectCatalogProducts(records,{...catalogDefaults,world:'one-piece',category:'desk'}),[]);
});

test('filters round-trip through a shareable URL including literal search characters', () => {
  const filters={category:'desk',world:'original',type:'desk-mats',query:'desk & <room>',sort:'az'};
  assert.deepEqual(readCatalogFilters(new URL(catalogHref(filters),'https://example.test').searchParams),filters);
});

test('unknown filters and incompatible category/type combinations are normalized', () => {
  assert.deepEqual(readCatalogFilters(new URLSearchParams('category=unknown&world=unknown&type=unknown&sort=unknown')),catalogDefaults);
  assert.equal(readCatalogFilters(new URLSearchParams('category=style&type=desk-mats')).type,'all');
  assert.equal(readCatalogFilters(new URLSearchParams({q:'x'.repeat(300)})).query.length,100);
});

test('records with duplicate IDs, invalid placement or mislabelled concepts are rejected', () => {
  assert.throws(()=>validateCatalog([products[0],products[0]]),/duplicate/);
  assert.throws(()=>validateCatalog([{...products[0],typeId:'hoodies'}]),/Invalid category/);
  assert.throws(()=>validateCatalog([{...products[0],worldId:'unknown'}]),/Unknown world/);
  assert.throws(()=>validateCatalog([{...products[0],worldId:'one-piece'}]),/Unverified concept/);
});

test('search and alphabetical sorting do not mutate the original catalog order', () => {
  const before=products.map(p=>p.id);
  const result=selectCatalogProducts(products,{...catalogDefaults,query:'desk',sort:'az'});
  assert.equal(result.length,2);
  assert.equal(result[0].id,'after-hours-desk');
  assert.deepEqual(products.map(p=>p.id),before);
});

test('every category has a unique set of usable product types', () => {
  const ids=categories.flatMap(c=>c.types.map(t=>t.id));
  assert.equal(new Set(ids).size,ids.length);
  for (const category of categories) assert(category.types.length>0);
});
