# Firebase editor validation — 2026-10-10

No real Firebase account/project is connected. No hosting, rules, functions or billing were deployed or activated. The website was tested locally, and Web SDK production bundling was checked with an explicitly fake demo configuration.

## Passed

- `npm run build`: production assets and both legacy self-contained HTML previews generate successfully. Firebase code loads conditionally and is split into separate chunks; the original public design remains available without Firebase configuration.
- `npm run test:catalog`: 7 tests covering existing taxonomy, filters and concept placement.
- `npm run test:content`: 4 tests covering independent world fields, reset/reference preservation, unsafe content rejection and atomic validation.
- `npm run test:firebase-validation`: 2 server-schema tests covering bucket-restricted public image URLs, owner-restricted private references, inline image rejection and stripping private product fields from public payloads.
- Production Firebase Web SDK initialization with a fake localhost emulator configuration: real split modules load and the owner login form renders without page exceptions. Actual emulator/server connections remain unverified.
- Production dependency audits report zero known vulnerabilities in both the website and Functions packages. The website uses a targeted `@grpc/grpc-js` override to 1.13.6 because Firebase's Node dependency otherwise resolves an affected 1.9.x version; this is not a general security certification.
- Existing browser smoke: saved finds, search, category filtering, sorting, image loading, 22 routes, 30 layout checks over five widths, mobile navigation/history, no page exceptions or failed HTTP responses in the unconfigured public app.
- Legacy owner browser check: local card/page independence, save/reload, cancel, preview, backup/export, input escaping, storage failure, reset and four widths still work.
- Integrated owner browser check (`tests/browser/firebase-editor.cjs`) with a **mocked Firebase service module**: setup state, non-owner UI, owner login, inline edit fields for all six worlds, independent inner heading, draft-save callbacks, conflict feedback, publication/sign-out UI, rollback/load-public actions and four widths. This verifies the application flow, **not Firebase server authorization**. The mock is supplied by Playwright request interception and is absent from production code.

For that browser check start Vite on port 5173 and use a supported Playwright/Chromium installation. In the prepared environment:

```sh
PLAYWRIGHT_MODULE=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node tests/browser/firebase-editor.cjs
```

## Blocked / not passed

`FIREBASE_EMULATORS_PATH=/tmp/nexori-firebase-emulators npm run test:firebase` stopped before tests ran. The platform egress proxy rejected the official Firestore emulator artifact at `storage.googleapis.com` with HTTP 403. The first invocation also exposed a cache path outside the writable sandbox; Firebase's supported `FIREBASE_EMULATORS_PATH` fixed that path, then the distinct network denial remained.

Required network additions (`storage.googleapis.com`, Firebase CLI metadata and Firebase official documentation), complete install instructions and startup instructions were saved in the cloud environment configuration draft, preserving the known permitted destinations. A draft save does not apply runtime network access or publish anything. These changes still need to be applied through environment settings, followed by the full emulator suite.

`tests/firebase.integration.test.js` is written to exercise actual Auth, Firestore, Storage and callable Function emulators: verified owner versus unauthenticated/unverified/non-owner access, role escalation denial, direct content-write denial, private image isolation/immutability, save conflicts, publication/image conversion/private-field removal, rollback, invalid image denial and revoked access. These checks **have not run** and must pass before claiming server permissions are verified.

Official Firebase documentation was also blocked by the same platform proxy. Console steps and billing notes are preparation guidance, not a claim of real-time Console verification. Current service requirements/pricing must be confirmed before activating a real project.

Cloud IAM, Storage CORS, email delivery, actual project rules and real upload/publication remain unverified until the operator creates the development project. A direct `file://` preview is not the supported way to use this integrated manager. The site is not launch-ready; product onboarding, retention/backups, actual privacy details and launch checks remain outstanding.
