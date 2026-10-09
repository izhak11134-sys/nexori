# Scoped accessibility checks

Date: 10 October 2026.

Automated checks used axe-core 4.10.3 in Chromium, with the WCAG 2 A/AA and WCAG 2.1 A/AA rule tags. Twelve routes were checked at 390 and 1440 pixels (24 scans): home, collection, one concept detail, privacy, terms, disclosure, contact, accessibility, rights, worlds, the first-figure guide and about.

After correcting identified footer, reading-time, storage-note and article-number contrast, and naming the inspiration/category control groups semantically, the scans reported **zero confirmed automated violations**. All 24 scans still included contrast checks that the tool could not determine automatically, including text on complex backgrounds. These remain manual-review work, not passes. No WCAG conformance or legal certification is claimed.

Functional keyboard checks verified the skip link, focus inside the search dialog through repeated Tab presses, Escape closure and focus restoration. The standalone skip action also preserves its hash-routed page. Other checks covered the manual animation pause, persistence on reload, operating-system reduced motion and accessible saved-data removal feedback.

The six information pages were checked for horizontal overflow at 320, 390, 768 and 1440 pixels. The existing smoke checks also exercised the catalog, favorites, search, route history, images and mobile menu. These are scoped browser checks; they are not a substitute for testing zoom, a full screen-reader session, every component state or all applicable accessibility requirements.

Remaining assessment: screen-reader order and announcements; manual contrast against image/gradient backgrounds and in all states; high zoom and reflow; broader keyboard/control coverage; applicable Israeli obligations and exemptions; and a final assessment before public launch. The public accessibility page describes these limits and offers the owner's email for feedback.

## Catalog structure update

The updated catalog, desk category, empty accessories category, One Piece figure selection, One Piece world page and hoodie detail page were checked at both 390 and 1440 pixels (12 additional axe scans using the same rules). No confirmed automated violations were reported; indeterminate contrast checks still require manual review. Catalog-specific functional checks covered 45 layouts across five widths, filter persistence and history, incompatible-type reset, product classification links and the standalone version.
