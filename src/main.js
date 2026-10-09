import './style.css';
import './enhancements.css';
import { categories, products, franchises, guides } from './data.js';

const icons = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  up: '<path d="M12 20V5m-6 6 6-6 6 6"/>',
  external: '<path d="M14 4h6v6m0-6L10 14m-3-9H4v15h15v-3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  heart: '<path d="M20.5 5.5a5 5 0 0 0-7 0L12 7l-1.5-1.5a5 5 0 0 0-7 7L12 21l8.5-8.5a5 5 0 0 0 0-7Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>',
  chevron: '<path d="m8 10 4 4 4-4"/>', check: '<path d="m5 12 4 4L19 6"/>',
  cube: '<path d="m12 3 9 5v9l-9 5-9-5V8Zm0 9v10M3 8l9 4 9-4M7.5 5.5l9 5v5"/>',
  shirt: '<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4a4 4 0 0 1-8 0Z"/>',
  monitor: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  sword: '<path d="m6 18 12-12 3-3v5L9 20m-4-5 5 5m-4-2-3 3"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  spark: '<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/>',
  book: '<path d="M12 6C8 3 3 4 3 4v15s5-1 9 2c4-3 9-2 9-2V4s-5-1-9 2Zm0 0v15"/>',
  filter: '<path d="M4 6h16M7 12h10m-7 6h4"/>', back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const standalone = Boolean(window.NEXORI_ART);
const currentUrl = () => standalone
  ? new URL(location.hash.startsWith('#/') ? location.hash.slice(1) : '/', 'https://nexori.example')
  : new URL(location.href);
const pageHref = href => standalone ? `#${href}` : href;
const setPageUrl = (href, replace = false) => history[replace ? 'replaceState' : 'pushState']({}, '', pageHref(href));
const assetUrl = name => window.NEXORI_ART?.[name] || `/assets/${name}.${name === 'hero-banner' ? 'png' : 'svg'}`;
const storageKey = 'nexori.saved.v1';
let saved = [];
try { const value = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(value)) saved = value.filter(id => products.some(p => p.id === id)); } catch {}
let filters = { category: 'all', query: '', sort: 'featured' };
let searchTrigger;
const link = (href, text, cls = '', label = '') => `<a href="${pageHref(href)}" class="${cls}" ${cls.split(' ').includes('active') ? 'aria-current="page"' : ''} ${label ? `aria-label="${escape(label)}"` : ''} data-link>${text}</a>`;
const categoryName = id => categories.find(c => c.id === id)?.label || 'Collection';
const artwork = (product, cls = '', eager = false) => `<img class="${cls}" src="${assetUrl(product.art)}" alt="Original illustration of ${escape(product.name || product.title)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} width="600" height="640" />`;
const brand = () => `<a class="brand" href="${pageHref('/')}" aria-label="NEXORI home" data-link><img src="${assetUrl('mark')}" alt="" width="30" height="30"/><span>NEXORI<span class="brand-dot">.</span></span></a>`;

function header() {
  const active = currentUrl().pathname;
  return `<div class="announcement"><span>For the fans. For the collection.</span><span class="announcement-right">An independent anime discovery platform ${icon('spark')}</span></div>
  <header class="header"><div class="container header-inner">${brand()}
    <nav class="desktop-nav" aria-label="Main navigation">
      ${link('/collection', 'Explore collection', active.startsWith('/collection') || active.startsWith('/product') ? 'active' : '')}
      ${link('/worlds', 'Anime worlds', active.startsWith('/worlds') ? 'active' : '')}
      ${link('/guides', 'The journal', active.startsWith('/guides') ? 'active' : '')}
      ${link('/about', 'Our story', active === '/about' ? 'active' : '')}
    </nav>
    <div class="header-actions"><button class="icon-button" data-search aria-label="Search collection">${icon('search')}</button>${link('/saved', `${icon('heart')}<span class="saved-count" ${saved.length ? '' : 'hidden'}>${saved.length}</span>`, 'icon-button saved-link', 'Your saved finds')}
    <button class="icon-button menu-button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav" data-menu>${icon('menu')}</button></div>
  </div><nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden>${link('/collection', 'Explore collection', active.startsWith('/collection') || active.startsWith('/product') ? 'active' : '')}${link('/worlds', 'Anime worlds', active.startsWith('/worlds') ? 'active' : '')}${link('/guides', 'The journal', active.startsWith('/guides') ? 'active' : '')}${link('/about', 'Our story', active === '/about' ? 'active' : '')}${link('/saved', 'Your saved finds', active === '/saved' ? 'active' : '')}</nav></header>`;
}

function footer() {
  return `<footer class="footer"><div class="container footer-top"><div class="footer-brand">${brand()}<p>A little fandom. A lot of possibility.<br>Your next obsession starts here.</p><span class="footer-note">Made for the love of anime.</span></div>
  <div><h3>Discover</h3>${link('/collection', 'The collection')}${link('/worlds', 'Anime worlds')}${link('/guides', 'Buying guides')}${link('/saved', 'Saved finds')}</div>
  <div><h3>Get to know us</h3>${link('/about', 'Our story')}${link('/about#selection', 'How we select')}${link('/disclosure', 'Affiliate disclosure')}${link('/contact', 'Contact')}</div>
  <div class="footer-transparency"><span class="tiny-label">A NOTE ON TRANSPARENCY</span><p>When retailer links are added, we may earn a commission from qualifying purchases, at no extra cost to you.</p>${link('/disclosure', `Learn more ${icon('arrow')}`, 'text-link')}</div></div>
  <div class="container footer-bottom"><span>© ${new Date().getFullYear()} NEXORI</span><span>Independent. Fan-inspired. Thoughtfully selected.</span><div>${link('/privacy', 'Privacy')}${link('/terms', 'Terms')}</div></div></footer>`;
}

function floatingTools() {
  return `<nav id="floating-tools" class="floating-tools" aria-label="Quick actions" hidden>
    ${link('/saved', `${icon('heart')}<span class="floating-count saved-count" ${saved.length ? '' : 'hidden'}>${saved.length}</span><span class="floating-tooltip">Saved finds</span>`, 'floating-button floating-saved', 'Open your saved finds')}
    <button class="floating-button floating-surprise" data-surprise aria-label="Discover a surprise concept">${icon('spark')}<span class="floating-tooltip">Surprise me</span></button>
    <button class="floating-button floating-top" data-top aria-label="Back to top">${icon('up')}<span class="floating-tooltip">Back to top</span></button>
  </nav>`;
}

function productCard(p) {
  const isSaved = saved.includes(p.id);
  return `<article class="product-card"><div class="product-art" style="--art-color:${p.color}">${link(`/product/${p.id}`, artwork(p), 'art-link')}<span class="concept-badge">CONCEPT</span><button class="save-button ${isSaved ? 'is-saved' : ''}" data-save="${p.id}" aria-label="${isSaved ? 'Unsave' : 'Save'} ${escape(p.name)}" aria-pressed="${isSaved}">${icon('heart')}</button></div>
  <div class="product-card-info"><span class="tiny-label">${p.type}</span><h3>${link(`/product/${p.id}`, p.name)}</h3><div class="product-card-bottom"><span>Collection preview</span>${link(`/product/${p.id}`, icon('arrow'), 'card-arrow', `View ${p.name}`)}</div></div></article>`;
}
function guideCard(g) {
  return `<article class="guide-card">${link(`/guides/${g.id}`, `${artwork(g)}<span class="guide-art-label">NEXORI / JOURNAL</span>`, 'guide-art')}<div class="guide-card-content"><div class="guide-meta"><span>${g.eyebrow}</span><span>${g.time}</span></div><h3>${link(`/guides/${g.id}`, g.title)}</h3><p>${g.description}</p>${link(`/guides/${g.id}`, `Read the story ${icon('arrow')}`, 'text-link')}</div></article>`;
}
function sectionHeading(eyebrow, title, subtitle, href, cta) {
  return `<div class="section-heading"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div>${href ? link(href, `${cta} ${icon('arrow')}`, 'text-link') : ''}</div>`;
}
function worldsGrid() {
  return `<div class="worlds-grid">${franchises.map(f => link(`/worlds/${f.id}`, `<span class="world-symbol" style="--world-color:${f.color}" aria-hidden="true">${f.symbol}</span><div><h3>${f.name}</h3><p>${f.subtitle}</p></div>${icon('arrow')}`, 'world-card')).join('')}</div>`;
}

function bannerEffects() {
  return `<svg class="banner-effects" viewBox="0 0 1672 941" fill="none" aria-hidden="true">
    <defs>
      <filter id="blade-soft-light" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="12" /></filter>
      <linearGradient id="shard-face" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#443248"/><stop offset=".48" stop-color="#18121e"/><stop offset="1" stop-color="#070711"/></linearGradient>
      <linearGradient id="shard-edge"><stop stop-color="#dec0ff"/><stop offset=".5" stop-color="#8d4cb0"/><stop offset="1" stop-color="#35233d"/></linearGradient>
    </defs>
    <g class="blade-glow"><path d="M1320 476 1494 803" stroke="#cb82ff" stroke-width="19" stroke-linecap="round" filter="url(#blade-soft-light)"/><path d="M1320 476 1494 803" stroke="#eac5ff" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/></g>
    <g transform="translate(890 245)"><g class="floating-shard shard-one"><path d="m0-68 32 27-6 71-22 55-23-38-11-82Z" fill="url(#shard-face)" stroke="#775084" stroke-width="1.5"/><path d="m0-68 9 50-5 103 22-55 6-71Z" fill="#30213b"/><path d="m-30-35 30-33 9 50-23 32m23-32 23-23m-46 55 18 71" stroke="url(#shard-edge)" stroke-width="2"/><path d="m-12-31 15 16-7 23m18 7-8 22" stroke="#aa69c3" stroke-opacity=".5"/></g></g>
    <g transform="translate(1530 528)"><g class="floating-shard shard-two"><path d="m-31-42 43-14 22 43-11 59-40 14-22-55Z" fill="url(#shard-face)" stroke="#805884"/><path d="m12-56-9 58 20 44 11-59Z" fill="#39283e"/><path d="m-31-42 43-14-9 58-20 58m20-58 31-15" stroke="url(#shard-edge)" stroke-width="2"/></g></g>
    <g transform="translate(963 689)"><g class="floating-shard shard-three"><path d="m-18-27 31-13 25 19-15 43-35 20-17-41Z" fill="url(#shard-face)" stroke="#886995"/><path d="m13-40-6 39 16 23 15-43Z" fill="#382b43"/><path d="m-18-27 31-13-6 39-19 43m19-43 31-20" stroke="url(#shard-edge)" stroke-width="1.5"/></g></g>
  </svg>`;
}

function home() {
  return `<section class="hero cinematic-hero"><div class="banner-scene"><img class="cinematic-background" src="${assetUrl('hero-banner')}" alt="Original anime artwork: a swordsman surrounded by a violet halo, floating temples, and cherry blossoms" width="1672" height="941" fetchpriority="high" />${bannerEffects()}</div><div class="cinematic-shade" aria-hidden="true"></div><div class="hero-grain" aria-hidden="true"></div><div class="ambient-sparks" aria-hidden="true"><span>✧</span><span>✦</span><span>✧</span></div><div class="container hero-inner"><div class="hero-copy"><span class="hero-eyebrow"><span></span> A WORLD WORTH COLLECTING</span><h1 class="neon-title">Your Portal to <br><em>Authentic Anime</em> <br><span>Culture &amp; Collectibles</span></h1><p>For the stories you live in.<br>The characters you carry with you.<br>And the pieces that make it all real.</p><div class="hero-buttons">${link('/collection', `Explore the collection ${icon('arrow')}`, 'button button-primary')}${link('/guides', `${icon('book')} Find your inspiration`, 'button button-secondary')}</div><div class="hero-footnote"><span class="small-stars">✧</span> Your fandom. Thoughtfully found.</div></div><div class="cinematic-art-label"><span class="art-label-cross" aria-hidden="true">✦</span><div><span class="tiny-label">THE NEXORI UNIVERSE</span><strong>Beyond the ordinary.</strong><span>Original artwork / Chapter 01</span></div></div><div class="hero-coordinate" aria-hidden="true">N / 001 <span>DISCOVER YOUR WORLD</span></div></div>
  <div class="hero-series"><div class="container"><span class="tiny-label">FIND YOUR UNIVERSE</span><div>${franchises.slice(0, 5).map(f => link(`/worlds/${f.id}`, f.name)).join('<span class="series-star" aria-hidden="true">✦</span>')}</div></div></div></section>
  <section class="trust-strip container" aria-label="Our approach"><div>${icon('spark')}<span>Independent editorial picks</span></div><div>${icon('shield')}<span>Transparency comes first</span></div><div>${icon('heart')}<span>Made with fans in mind</span></div></section>
  <section class="section container collection-edit">${sectionHeading('THE COLLECTION EDIT', 'Good taste. Great fandom.', 'Original concepts for your next chapter. Real product picks are coming next.', '/collection', 'Explore all concepts')}<div class="edit-controls"><div class="edit-tabs" aria-label="Choose your collection inspiration"><button class="edit-tab selected" data-edit="all" aria-pressed="true">The full picture</button><button class="edit-tab" data-edit="figures" aria-pressed="false">Shelf statements</button><button class="edit-tab" data-edit="style" aria-pressed="false">Off-duty style</button><button class="edit-tab" data-edit="desk" aria-pressed="false">After-hours setup</button></div><button class="surprise-button" data-surprise>${icon('spark')} Surprise me</button></div><p id="edit-status" class="sr-only" role="status"></p><div class="product-grid" id="home-edit-grid">${products.slice(0,4).map(productCard).join('')}</div></section>
  <section class="section container categories-section">${sectionHeading('PICK YOUR KIND OF FANDOM', 'More than a shelf.', '', '', '')}<div class="category-grid">${categories.map((c,i) => link(`/collection?category=${c.id}`, `<span class="category-number">0${i+1}</span><span class="category-icon ${c.color}">${icon(c.icon)}</span><h3>${c.label}</h3><p>${c.description}</p><span class="category-link">Explore ${icon('arrow')}</span>`, 'category-card')).join('')}</div></section>
  <section class="editorial-banner container"><div class="editorial-art">${artwork(products[0])}<span class="editorial-art-word" aria-hidden="true">COLLECT.</span></div><div class="editorial-copy"><span class="eyebrow">LESS GUESSWORK. MORE GOOD FINDS.</span><h2>Your first figure.<br>Your next chapter.</h2><p>From choosing a figure format to checking a seller, our beginner’s guide helps you start a collection with a little more confidence.</p>${link('/guides/first-figure', `Read the collector’s guide ${icon('arrow')}`, 'button button-primary')}<span class="editorial-bottom">THE NEXORI JOURNAL <span> / </span> 4 MIN READ</span></div></section>
  <section class="section container worlds-section">${sectionHeading('STORIES THAT STAY WITH YOU', 'Which world is yours?', 'Find inspiration in the series you keep coming back to.', '/worlds', 'Explore the worlds')}${worldsGrid()}</section>
  <section class="after-hours container"><div class="after-hours-copy"><span class="eyebrow">THE AFTER-HOURS EDIT</span><h2>Make room<br>for <em>your world.</em></h2><p>A quieter corner. A favorite character. A setup that feels like you. Start with one detail and make it yours.</p>${link('/collection?category=desk', `Discover desk & room ${icon('arrow')}`, 'button button-secondary')}<span class="after-hours-note">SPACE INSPIRATION / ORIGINAL CONCEPTS</span></div><div class="setup-scene"><div class="setup-orb" aria-hidden="true"></div>${artwork(products[2], 'setup-mat')}<span class="setup-caption"><span class="live-dot" aria-hidden="true"></span> PERSONAL SPACE. MAIN-CHARACTER ENERGY.</span><span class="setup-star" aria-hidden="true">✧</span></div></section>
  <section class="section container">${sectionHeading('THE NEXORI JOURNAL', 'A good collection starts with a good story.', 'Ideas, practical guides, and a little inspiration for your next find.', '/guides', 'Visit the journal')}<div class="guides-grid">${guides.map(guideCard).join('')}</div></section>
  <section class="closing-card container"><span class="closing-spark" aria-hidden="true">✦</span><span class="eyebrow">YOUR FANDOM DOESN’T NEED A REASON.</span><h2>Just a place to call home.</h2><p>Keep the ideas you love. Build your collection at your own pace.</p>${link('/saved', `Your saved finds ${icon('heart')}`, 'button button-secondary')}<span class="closing-watermark" aria-hidden="true">NEXORI</span></section>`;
}

function pageIntro(eyebrow, title, description) {
  return `<div class="page-intro"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div>`;
}
function collection() {
  const requested = currentUrl().searchParams.get('category');
  filters.category = categories.some(c => c.id === requested) ? requested : 'all';
  return `<div class="container page-container">${pageIntro('YOUR NEXT FIND STARTS HERE', 'The collection.', 'Explore original concepts for the future NEXORI collection. Save your favorites while we select real retailer listings.')}<div class="collection-toolbar"><div class="filter-tabs" aria-label="Product category"><button data-category="all" class="filter-tab ${filters.category === 'all' ? 'selected' : ''}" aria-pressed="${filters.category === 'all'}">All concepts</button>${categories.map(c => `<button data-category="${c.id}" class="filter-tab ${filters.category === c.id ? 'selected' : ''}" aria-pressed="${filters.category === c.id}">${c.short}</button>`).join('')}</div><div class="collection-controls"><label class="collection-search">${icon('search')}<input id="collection-search" type="search" placeholder="Search concepts" aria-label="Search concepts" value="${escape(filters.query)}" maxlength="100" /></label><label class="sort-control"><span class="sr-only">Sort concepts</span><select id="collection-sort"><option value="featured" ${filters.sort === 'featured' ? 'selected' : ''}>Editorial order</option><option value="az" ${filters.sort === 'az' ? 'selected' : ''}>Name: A–Z</option></select>${icon('chevron')}</label></div></div><div class="collection-result-bar"><p id="result-count" role="status"></p><span>${icon('spark')} Original illustrations · Inspiration only</span></div><div id="collection-grid" class="product-grid"></div></div>`;
}
function updateCollection() {
  const grid = document.querySelector('#collection-grid'); if (!grid) return;
  let matches = products.filter(p => (filters.category === 'all' || p.category === filters.category) && `${p.name} ${p.type} ${categoryName(p.category)}`.toLowerCase().includes(filters.query.toLowerCase().trim()));
  if (filters.sort === 'az') matches.sort((a,b) => a.name.localeCompare(b.name));
  grid.innerHTML = matches.length ? matches.map(productCard).join('') : `<div class="empty-state">${icon('search')}<h2>No concepts match just yet.</h2><p>Try another search or explore all categories.</p><button class="button button-secondary" data-reset>Clear filters</button></div>`;
  document.querySelector('#result-count').textContent = `${matches.length} ${matches.length === 1 ? 'concept' : 'concepts'}`;
}
function savedPage() {
  const matches = products.filter(p => saved.includes(p.id));
  return `<div class="container page-container">${pageIntro('A LITTLE INSPIRATION, KEPT CLOSE', 'Your saved finds.', 'Your ideas, all in one place. Saved on this browser — no account needed.')}<div class="product-grid">${matches.length ? matches.map(productCard).join('') : `<div class="empty-state">${icon('heart')}<h2>Something will catch your eye.</h2><p>Tap the heart on any concept to keep it here for later.</p>${link('/collection', `Explore the collection ${icon('arrow')}`, 'button button-primary')}</div>`}</div></div>`;
}
function breadcrumb(label, href = '/collection', parent = 'Collection') {
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${link('/', 'Home')}<span>/</span>${link(href, parent)}<span>/</span><span aria-current="page">${escape(label)}</span></nav>`;
}
function productPage(id) {
  const p = products.find(p => p.id === id); if (!p) return notFound();
  return `<div class="container page-container">${breadcrumb(p.name)}<div class="product-detail"><div class="detail-art">${artwork(p, '', true)}<span class="concept-badge">ORIGINAL CONCEPT ILLUSTRATION</span></div><div class="detail-info"><span class="eyebrow">${p.type.toUpperCase()}</span><h1>${p.name}</h1><p class="detail-description">${p.description}</p><div class="concept-notice">${icon('spark')}<div><strong>A direction, not a product listing.</strong><p>This illustration is an original design concept. Actual products, prices, and retailer links will be added after selection.</p></div></div><button class="button button-primary detail-save" data-save="${p.id}" aria-pressed="${saved.includes(p.id)}">${icon('heart')} ${saved.includes(p.id) ? 'Saved to your finds' : 'Save this inspiration'}</button><p class="detail-storage">Your saved finds stay on this browser.</p><div class="detail-checklist"><h2>When choosing a similar piece</h2><ul>${p.tips.map(t => `<li>${icon('check')} ${t}</li>`).join('')}</ul></div>${link('/about#selection', `How NEXORI selects products ${icon('arrow')}`, 'text-link')}</div></div><section class="related-section">${sectionHeading('FOLLOW YOUR CURIOSITY', 'A few more ideas.', '', '/collection', 'See the collection')}<div class="product-grid">${products.filter(x => x.id !== id).slice(0,4).map(productCard).join('')}</div></section></div>`;
}
function worldsPage(id) {
  if (!id) return `<div class="container page-container">${pageIntro('FOR THE STORIES YOU LOVE', 'Find your universe.', 'From the first episode to the final arc. Explore the worlds that inspire your collection.')}${worldsGrid()}<p class="muted world-disclaimer">Series names belong to their respective owners. NEXORI is an independent site and is not affiliated with these franchises.</p></div>`;
  const f = franchises.find(x => x.id === id); if (!f) return notFound();
  return `<div class="container page-container">${breadcrumb(f.name, '/worlds', 'Anime worlds')}<div class="franchise-banner" style="--world-color:${f.color}"><span class="world-symbol" aria-hidden="true">${f.symbol}</span>${pageIntro('YOUR ANIME WORLD', f.name, f.subtitle + '. A home for future merchandise picks and collector inspiration.')}</div><div class="empty-state world-upcoming">${icon('spark')}<h2>A collection worth waiting for.</h2><p>We haven’t selected verified ${f.name} products yet. Explore our buying guides while the collection takes shape.</p>${link('/guides', `Explore the journal ${icon('arrow')}`, 'button button-primary')}</div></div>`;
}
function guidesPage(id) {
  if (!id) return `<div class="container page-container">${pageIntro('A LITTLE KNOW-HOW. A LOT OF FANDOM.', 'The NEXORI journal.', 'Practical guides for thoughtful collecting, better spaces, and finding your own kind of fandom.')}<div class="guides-grid">${guides.map(guideCard).join('')}</div></div>`;
  const g = guides.find(x => x.id === id); if (!g) return notFound();
  return `<div class="container page-container">${breadcrumb(g.title, '/guides', 'The journal')}<article class="article"><header><span class="eyebrow">${g.eyebrow}</span><h1>${g.title}</h1><p class="article-intro">${g.description}</p><div class="article-byline"><span class="author-mark">N</span><span>NEXORI Editorial</span><span>·</span><span>${g.time}</span></div></header><div class="article-art">${artwork(g, '', true)}<span>THE NEXORI JOURNAL</span></div><div class="article-body">${g.sections.map(([h,p],i) => `<section><span class="article-number">0${i+1}</span><h2>${h}</h2><p>${p}</p></section>`).join('')}<aside class="article-note">${icon('shield')}<p>These guides offer general shopping advice. Check the current product details, seller terms, and local requirements before making a purchase.</p></aside>${link('/guides', `${icon('back')} Back to the journal`, 'text-link')}</div></article></div>`;
}
const info = {
  disclosure: { eyebrow: 'CLEAR FROM THE START', title: 'Affiliate disclosure.', intro: 'You should always know how recommendations are funded.', sections: [['How affiliate links work', 'When affiliate retailer links are added to NEXORI, we may earn a commission if you click a link and make a qualifying purchase. This comes at no additional cost to you. Commercial links will be identified near the recommendation.'], ['The current collection', 'The collection currently contains original illustrated concepts, not purchasable products. There are no live affiliate purchase links or verified prices in this version.'], ['Our editorial approach', 'Recommendations should explain why an item was selected and distinguish verified information from opinions. We will not claim that we tested a product unless we actually did. Purchases, shipping, returns, and customer support are handled by the retailer.']] },
  privacy: { eyebrow: 'YOUR SPACE. YOUR CHOICE.', title: 'Privacy, in plain language.', intro: 'This version keeps things simple.', sections: [['Saved finds', 'When you save a concept, its identifier is stored in this browser’s local storage. The saved list is not sent to a server. You can remove items using the heart buttons or clear your browser’s site data.'], ['Search and analytics', 'Search runs locally over the collection. This version does not include analytics, advertising trackers, newsletter subscriptions, or account registration. The site’s hosting provider may process technical request information under its own policies.'], ['Illustrations and future services', 'The artwork is hosted with the site. If retailer links, analytics, accounts, or contact forms are introduced, this policy must be updated to reflect their actual behavior before launch.']] },
  terms: { eyebrow: 'A FEW THINGS TO KNOW', title: 'Terms of use.', intro: 'NEXORI is an independent discovery and editorial site.', sections: [['Concepts and information', 'Illustrations in the current collection represent original concepts rather than products available for purchase. Editorial content provides general information and should not be treated as a guarantee of authenticity, suitability, price, or stock.'], ['Franchise references', 'Anime series names and related trademarks belong to their respective owners. Their mention does not imply endorsement, partnership, or official affiliation.'], ['Retailer purchases', 'When retailer links are introduced, purchases will take place on the retailer’s website under its terms. Confirm the listing, shipping, returns, and any local restrictions before ordering.']] },
  contact: { eyebrow: 'LET’S KEEP IT REAL', title: 'Get in touch.', intro: 'A good discovery platform makes room for feedback.', sections: [['Contact details are coming', 'NEXORI’s public contact channel has not been configured yet. A verified contact address or working form will be added before public launch. This page does not collect or send messages.'], ['Future inquiries', 'The contact channel will support editorial feedback, listing corrections, and partnership inquiries. For purchases made at external retailers, the retailer handles order support and returns.']] },
};
function infoPage(name) {
  const p = info[name];
  return `<div class="container page-container info-page">${pageIntro(p.eyebrow, p.title, p.intro)}<div class="info-content">${p.sections.map(([h,t]) => `<section><h2>${h}</h2><p>${t}</p></section>`).join('')}</div></div>`;
}
function about() {
  return `<div class="container page-container about-page">${pageIntro('FOR THE LOVE OF THE STORY', 'Fandom, thoughtfully found.', 'NEXORI is a place to discover the things that make your favorite stories part of everyday life.')}<div class="about-feature"><span class="about-spark" aria-hidden="true">✦</span><div><span class="eyebrow">OUR STARTING POINT</span><h2>Not just more stuff.<br>More of what you love.</h2><p>From a figure on your shelf to an art print above your desk, the right piece can make a space feel like yours. We’re building a collection around that feeling — with useful information, a clear editorial point of view, and room for different budgets.</p></div></div><div id="selection" class="about-principles"><h2>How we’ll select the collection.</h2><div class="category-grid"><article>${icon('search')}<h3>Research the listing</h3><p>Check manufacturer information, seller details, specifications, and available licensing evidence.</p></article><article>${icon('book')}<h3>Explain the choice</h3><p>Tell you what makes a piece interesting, who it might suit, and which details to check.</p></article><article>${icon('shield')}<h3>Be clear about links</h3><p>Identify affiliate links and keep purchasing, shipping, and returns with the retailer.</p></article><article>${icon('heart')}<h3>Keep it honest</h3><p>No invented reviews, inflated statistics, or claims of hands-on testing we haven’t done.</p></article></div></div><aside class="article-note">${icon('spark')}<p>NEXORI is currently taking shape. The illustrated collection is a design preview; real product selection is the next step.</p></aside></div>`;
}
function notFound() { return `<div class="container page-container"><div class="empty-state">${icon('spark')}<span class="eyebrow">404 / A DIFFERENT UNIVERSE</span><h1>This page wandered off.</h1><p>Let’s get you back to something worth discovering.</p>${link('/', `Back to NEXORI ${icon('arrow')}`, 'button button-primary')}</div></div>`; }
function route() {
  const parts = currentUrl().pathname.split('/').filter(Boolean);
  let content, title;
  if (!parts.length) { content = home(); title = 'Your Portal to Authentic Anime Culture & Collectibles'; }
  else if (parts[0] === 'collection' && parts.length === 1) { content = collection(); title = 'The collection'; }
  else if (parts[0] === 'saved' && parts.length === 1) { content = savedPage(); title = 'Your saved finds'; }
  else if (parts[0] === 'product' && parts.length === 2) { content = productPage(parts[1]); title = products.find(p => p.id === parts[1])?.name || 'Page not found'; }
  else if (parts[0] === 'worlds' && parts.length <= 2) { content = worldsPage(parts[1]); title = franchises.find(f => f.id === parts[1])?.name || 'Anime worlds'; }
  else if (parts[0] === 'guides' && parts.length <= 2) { content = guidesPage(parts[1]); title = guides.find(g => g.id === parts[1])?.title || 'The journal'; }
  else if (parts[0] === 'about' && parts.length === 1) { content = about(); title = 'Our story'; }
  else if (info[parts[0]] && parts.length === 1) { content = infoPage(parts[0]); title = info[parts[0]].title.replace(/\.$/, ''); }
  else { content = notFound(); title = 'Page not found'; }
  document.title = `NEXORI — ${title}`;
  document.querySelector('#app').innerHTML = `${header()}<main id="main" tabindex="-1">${content}</main>${footer()}${floatingTools()}<dialog id="search-dialog" class="search-dialog" aria-labelledby="search-title"><div class="search-dialog-header"><h2 id="search-title">Find your next obsession.</h2><button class="icon-button" data-close-search aria-label="Close search">${icon('close')}</button></div><label class="dialog-search-input">${icon('search')}<input id="global-search" type="search" placeholder="Try figures, hoodie, desk…" aria-label="Search concepts" maxlength="100" autocomplete="off" /></label><p class="search-hint">Search the original concept collection</p><div id="search-results" class="search-results" aria-live="polite"></div></dialog>`;
  updateCollection();
  alignBannerEffects();
  scheduleScrollEffects();
  if (currentUrl().hash) requestAnimationFrame(() => document.getElementById(currentUrl().hash.slice(1))?.scrollIntoView());
}
function navigate(href, push = true) {
  if (standalone && href.startsWith('#/')) href = href.slice(1);
  document.querySelector('#search-dialog')?.close();
  if (push) setPageUrl(href);
  route();
  if (!currentUrl().hash) window.scrollTo({top:0, behavior:'instant'});
  document.querySelector('#main').focus({preventScroll:true});
}
let toastTimer;
function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2800); }
function toggleSaved(id) {
  if (!products.some(p => p.id === id)) return;
  const adding = !saved.includes(id);
  saved = adding ? [...saved,id] : saved.filter(x => x !== id);
  let persistent = true;
  try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { persistent = false; }
  if (currentUrl().pathname === '/saved') { const pos=scrollY; route(); window.scrollTo(0,pos); }
  else {
    document.querySelectorAll(`[data-save="${id}"]`).forEach(btn => { btn.classList.toggle('is-saved', adding); btn.setAttribute('aria-pressed', String(adding)); if (btn.classList.contains('detail-save')) btn.innerHTML = `${icon('heart')} ${adding ? 'Saved to your finds' : 'Save this inspiration'}`; else btn.setAttribute('aria-label', `${adding ? 'Unsave' : 'Save'} ${products.find(p => p.id === id).name}`); });
    document.querySelectorAll('.saved-count').forEach(count => { count.textContent = saved.length; count.hidden = !saved.length; });
  }
  toast(adding ? persistent ? 'Saved to your finds.' : 'Saved for this visit. Browser storage is unavailable.' : 'Removed from your saved finds.');
}
function searchResults(query) {
  const matches = products.filter(p => `${p.name} ${p.type} ${categoryName(p.category)}`.toLowerCase().includes(query.toLowerCase().trim()));
  document.querySelector('#search-results').innerHTML = matches.length ? matches.map(p => link(`/product/${p.id}`, `${artwork(p)}<div><strong>${p.name}</strong><span>${p.type} · Concept</span></div>${icon('arrow')}`, 'search-result')).join('') : '<p class="search-no-results">No matching concepts. Try “figure” or “desk”.</p>';
}
document.addEventListener('click', e => {
  const anchor = e.target.closest('a[data-link]');
  if (anchor && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); navigate(anchor.getAttribute('href')); return; }
  const save = e.target.closest('[data-save]'); if (save) { toggleSaved(save.dataset.save); return; }
  if (e.target.closest('[data-top]')) { window.scrollTo({top:0, behavior:reducedMotion.matches ? 'instant' : 'smooth'}); document.querySelector('#main').focus({preventScroll:true}); return; }
  if (e.target.closest('[data-surprise]')) { navigate(`/product/${products[Math.floor(Math.random() * products.length)].id}`); return; }
  const edit = e.target.closest('[data-edit]');
  if (edit) {
    const selection = edit.dataset.edit;
    const matches = selection === 'all' ? products.slice(0,4) : products.filter(p => p.category === selection);
    document.querySelector('#home-edit-grid').innerHTML = matches.map(productCard).join('');
    document.querySelectorAll('[data-edit]').forEach(btn => {const active = btn.dataset.edit === selection; btn.classList.toggle('selected',active); btn.setAttribute('aria-pressed',String(active));});
    document.querySelector('#edit-status').textContent = `Showing ${matches.length} inspiration ${matches.length === 1 ? 'concept' : 'concepts'}.`;
  }
  const menu = e.target.closest('[data-menu]'); if (menu) { const nav = document.querySelector('#mobile-nav'); nav.hidden = !nav.hidden; menu.setAttribute('aria-expanded', String(!nav.hidden)); menu.setAttribute('aria-label', nav.hidden ? 'Open navigation' : 'Close navigation'); menu.innerHTML = icon(nav.hidden ? 'menu' : 'close'); }
  if (e.target.closest('[data-search]')) { searchTrigger = e.target.closest('[data-search]'); const dialog = document.querySelector('#search-dialog'); searchResults(''); dialog.showModal(); document.querySelector('#global-search').focus(); }
  if (e.target.closest('[data-close-search]')) { document.querySelector('#search-dialog').close(); searchTrigger?.focus(); }
  if (e.target.id === 'search-dialog') { const rect = e.target.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) e.target.close(); }
  const category = e.target.closest('[data-category]'); if (category) {
    filters.category = category.dataset.category;
    setPageUrl(filters.category === 'all' ? '/collection' : `/collection?category=${filters.category}`, true);
    document.querySelectorAll('[data-category]').forEach(btn => { const selected = btn.dataset.category === filters.category; btn.classList.toggle('selected',selected); btn.setAttribute('aria-pressed',String(selected)); }); updateCollection();
  }
  if (e.target.closest('[data-reset]')) { filters = {category:'all', query:'', sort:'featured'}; navigate('/collection'); }
});
document.addEventListener('input', e => { if (e.target.id === 'global-search') searchResults(e.target.value); if (e.target.id === 'collection-search') {filters.query = e.target.value; updateCollection();} });
document.addEventListener('change', e => {if (e.target.id === 'collection-sort') {filters.sort = e.target.value; updateCollection();} });
document.addEventListener('keydown', e => {if (e.key === 'Escape') {const nav = document.querySelector('#mobile-nav'); if (!nav.hidden) document.querySelector('[data-menu]').click();} });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollFrame;
function scheduleScrollEffects() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    const tools = document.querySelector('#floating-tools');
    if (tools) tools.hidden = window.scrollY < 420;
    const hero = document.querySelector('.cinematic-hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const mobile = window.innerWidth <= 700;
    const travel = reducedMotion.matches ? 0 : Math.min(mobile ? 620 : 280, Math.max(0, -rect.top) * (mobile ? .66 : .38));
    hero.style.setProperty('--banner-drift', `${travel}px`);
    hero.classList.toggle('is-carrying', travel > 0);
  });
}
function alignBannerEffects() {
  const scene = document.querySelector('.banner-scene');
  const image = scene?.querySelector('.cinematic-background');
  const effects = scene?.querySelector('.banner-effects');
  if (!scene || !image || !effects) return;
  const width = scene.clientWidth, height = scene.clientHeight;
  const scale = Math.max(width / 1672, height / 941);
  const [px, py] = getComputedStyle(image).objectPosition.split(' ').map(value => value === 'top' ? 0 : value === 'center' ? .5 : parseFloat(value) / 100);
  Object.assign(effects.style, {width:`${1672 * scale}px`,height:`${941 * scale}px`,left:`${(width - 1672 * scale) * px}px`,top:`${(height - 941 * scale) * py}px`});
}
window.addEventListener('scroll', scheduleScrollEffects, {passive:true});
window.addEventListener('resize', () => { alignBannerEffects(); scheduleScrollEffects(); }, {passive:true});
reducedMotion.addEventListener('change', scheduleScrollEffects);
window.addEventListener('popstate', () => {const url = currentUrl(); navigate(url.pathname+url.search+url.hash,false);});
window.addEventListener('storage', e => {if (e.key !== storageKey) return; try {const value=JSON.parse(e.newValue || '[]'); saved=Array.isArray(value)?value.filter(id=>products.some(p=>p.id===id)):[];} catch {saved=[];} const pos=scrollY; route(); window.scrollTo(0,pos);});
route();
