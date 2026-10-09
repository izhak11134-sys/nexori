import { categories, franchises } from './data.js';

export const catalogTypes = categories.flatMap(category => category.types.map(type => Object.assign(type,{category:category.id})));
export const catalogWorlds = [...franchises.map(world => ({id:world.id, name:world.name})), {id:'original', name:'Original concepts'}];
export const catalogDefaults = {category:'all', world:'all', type:'all', query:'', sort:'featured'};

export function readCatalogFilters(params) {
  const category = categories.some(item => item.id === params.get('category')) ? params.get('category') : 'all';
  const world = catalogWorlds.some(item => item.id === params.get('world')) ? params.get('world') : 'all';
  const type = catalogTypes.some(item => item.id === params.get('type') && (category === 'all' || item.category === category)) ? params.get('type') : 'all';
  return {category, world, type, query:(params.get('q') || '').slice(0,100), sort:params.get('sort') === 'az' ? 'az' : 'featured'};
}

export function catalogHref(selection = {}) {
  const filters = {...catalogDefaults,...selection};
  const params = new URLSearchParams();
  for (const key of ['category','world','type']) if (filters[key] !== 'all') params.set(key,filters[key]);
  if (filters.query) params.set('q',filters.query);
  if (filters.sort === 'az') params.set('sort','az');
  return `/collection${params.size ? `?${params}` : ''}`;
}

export function selectCatalogProducts(items, filters) {
  const query = filters.query.trim().toLowerCase();
  const result = items.filter(item =>
    (filters.category === 'all' || item.category === filters.category) &&
    (filters.world === 'all' || item.worldId === filters.world) &&
    (filters.type === 'all' || item.typeId === filters.type) &&
    `${item.name} ${item.type} ${categories.find(category => category.id === item.category)?.label || ''} ${catalogWorlds.find(world => world.id === item.worldId)?.name || ''}`.toLowerCase().includes(query)
  );
  return filters.sort === 'az' ? [...result].sort((a,b) => a.name.localeCompare(b.name)) : result;
}

export function validateCatalog(items) {
  const seen = new Set();
  for (const item of items) {
    if (!item.id || seen.has(item.id)) throw new Error(`Missing or duplicate catalog ID: ${item.id}`);
    seen.add(item.id);
    if (!catalogTypes.some(type => type.id === item.typeId && type.category === item.category)) throw new Error(`Invalid category/type for ${item.id}`);
    if (!catalogWorlds.some(world => world.id === item.worldId)) throw new Error(`Unknown world for ${item.id}`);
    if (item.status === 'concept' && item.worldId !== 'original') throw new Error(`Unverified concept must not be assigned to a franchise: ${item.id}`);
  }
  return true;
}
