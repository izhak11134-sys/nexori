# NEXORI

A new, responsive anime discovery website, built from scratch with vanilla JavaScript and Vite. The site keeps the dark violet, pink, and cyan direction of the supplied visual reference.

## Visual preview

These screenshots show the running application. The repository stores source code; it is not a publicly hosted website.

![NEXORI desktop preview](docs/desktop-preview.png)

[View the mobile screenshot](docs/mobile-preview.png)

## Develop

Requires Node.js 20.19+ or 22.12+ (validated with Node.js 24).

```sh
cd /workspace/nexori
npm ci
npm run dev -- --port 5173 --strictPort
```

## Production build

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Deploy `dist/` to a static host configured to serve `index.html` for application routes such as `/collection`, `/product/midnight-ronin`, and `/guides/first-figure`. The hosting platform must also handle genuine HTTP 404s appropriately; the app supplies a not-found view for unknown paths.

## What works

- Responsive home, collection, concept details, anime worlds, journal articles, saved finds, and information pages.
- Local collection search, category filtering, alphabetical sorting, and browser history.
- Accessible search dialog and mobile navigation.
- Favorites stored locally in the browser; no account or server required.
- Original local SVG concept artwork, with no external image or font dependencies.

## Content and launch status

The collection in `src/data.js` contains clearly marked original design concepts, **not real product listings**. No verified prices, retailer URLs, stock claims, fabricated reviews, or affiliate purchase links are presented. Real products and approved affiliate URLs must be researched and added separately. Anime franchise names are references, not a claim of licensing or affiliation.

The contact page explains that a verified public contact channel has not yet been configured. There is no form that pretends to send a message. This version has no analytics, newsletter service, database, or administrator authentication; it does not reuse Firebase configuration from the old files.

Before a public launch, provide real listings, verified contact information, appropriate legal policies, real domain/SEO metadata, and host route handling. Do not introduce claims of authenticity or product testing without evidence. `public/assets/` contains original concept illustrations.

Keep the existing checkout: cloud tasks already use isolated environments and do not need additional Git worktrees unless requested.
