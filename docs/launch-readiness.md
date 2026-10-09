# NEXORI: work tracked before public launch

Updated 10 October 2026. The owner has confirmed that the site is not publicly launched and will be launched only when the project is ready. Uploading source to GitHub is not a deployment.

This document tracks every topic raised in the legal readiness review. Completion of copy or code does not establish legal compliance or clear intellectual property rights.

| Topic | Implemented in this update | Remaining work / trigger |
| --- | --- | --- |
| Contact | Owner-supplied email `nexoriofficialon@gmail.com` linked on contact and information pages; privacy/accessibility/rights inquiries described | Mailbox operation is owner-confirmed, not tested by sending a message. Add actual legal operator identification and any additional required public details before launch. |
| Privacy | Current saved data, motion preference, local search, email handling, choices and future service changes described | Select production hosting; inspect actual logs, recipients, purposes, retention, international processing and security. Review applicable Israeli privacy requirements and any additional jurisdictions actually triggered. Establish a correspondence handling/deletion process. |
| Saved data | Individual favorites already removable; new bulk removal on privacy page with accessible confirmation and storage-failure message | Keep disclosure in sync if data is ever sent to a backend. |
| Cookies / storage | No tracking or consent banner added; current local preference storage disclosed | Assess non-essential storage, pixels, analytics, embeds and consent before enabling them; do not deploy a cosmetic banner that does not enforce choices. |
| Affiliate disclosure | Current no-affiliate status explained; future commission and sponsorship disclosures described; unverified “no extra cost” assurance removed | Add a prominent disclosure near each actual recommendation/link and program-specific wording after acceptance. Verify every permitted marketing channel. |
| Retail purchases | External retailer role explained without promising refunds or delivery on its behalf, or excluding mandatory rights | Confirm retailer/seller, full product details, delivery, taxes/import fees and returns for each listing. There is no checkout or sale by NEXORI in this version. |
| Product authenticity | Visible concept notices on home collection, catalog and detail pages; franchise independence clarified | Verify actual products/SKUs and licensing before authenticity claims. Review the preserved “Authentic” headline alongside final product content before launch. |
| Terms | Current use, concepts, corrections, commercial relationships, rights and external purchases described; no blanket exclusion of mandatory rights | Legal review against actual operator, services and relevant jurisdictions. |
| Copyright / trademarks | Dedicated content-and-franchise page; AI illustration disclosure and reporting channel; no exclusive ownership claim | Inspect banner and illustrations for third-party issues, retain creation/licence evidence, clear retail image/text permissions and check NEXORI branding. Disclaimers are not licences. |
| Accessibility | Information page describing present capabilities and limits; persistent pause control; keyboard dialog handling and specific contrast corrections | Manual screen-reader, contrast on complex/image backgrounds, zoom/reflow and full conformance assessment. Determine Israeli obligations/exemptions based on facts; update statement without inventing a coordinator or exemption. |
| Email / newsletter | Contact is a native mailto link; no fake form or newsletter; no marketing subscription implied | Before marketing mail, review applicable consent, records and unsubscribe requirements, including Israeli section 30A as relevant. |
| Accounts / forms / tracking | No accounts, checkout, web contact form, advertising pixel or analytics added | Assess privacy, security and consent before introducing new services; update all notices together. |
| Business and taxes | Israel is recorded as owner's operating country | Owner and qualified professionals determine business registration, payment eligibility, tax forms/reporting and accounting obligations. No classification has been invented. |
| Legal source verification | Preliminary research and audit preserved in `docs/` | Official legal sources could not be read due to network proxy 403. Current law and exact requirements need verification; an internet/privacy/consumer-law professional should review before commercial launch. |

## Checks for this implementation

- Production build and self-contained HTML generation.
- Information routes: privacy, terms, disclosure, contact, accessibility and rights.
- Email links, dated content and current-page navigation.
- Responsive layouts at 320, 390, 768 and 1440 pixels for all six information pages.
- Keyboard skip link, search dialog focus containment and Escape focus restoration.
- Manual motion reduction persists on reload; system reduced motion continues to take priority.
- Saved data can be removed; unavailable browser storage produces an honest message.
- Standalone version works with external requests blocked.

Automated accessibility details are recorded separately in `accessibility-checks.md`. These checks are scoped functional validation, not legal certification.
