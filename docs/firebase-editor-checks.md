# Firebase editor validation — 2026-10-10

The operator created `nexori-development`, supplied its public Web configuration, enabled Email/Password Authentication and supplied a manager UID. Configuration is local and ignored by Git. No real sign-in or cloud authorization has been verified. No hosting, rules, functions or billing were deployed or activated. Firestore creation is paused pending the region decision. All integration tests below use only the isolated `demo-nexori` project.

## Passed

- `npm run build`: production assets and both legacy self-contained HTML previews generate successfully. Firebase code loads conditionally and is split into separate chunks; the original public design remains available without Firebase configuration.
- `npm run test:catalog`: 7 tests covering existing taxonomy, filters and concept placement.
- `npm run test:content`: 4 tests covering independent world fields, reset/reference preservation, unsafe content rejection and atomic validation.
- `npm run test:firebase-validation`: 2 server-schema tests covering bucket-restricted public image URLs, owner-restricted private references, inline image rejection and stripping private product fields from public payloads.
- Production Firebase Web SDK initialization with a fake localhost emulator configuration and, separately, the operator's public Web configuration: real split modules load and the owner login form renders without page exceptions. This does not verify real sign-in or deployed permissions.
- `npm run test:firebase`: **4 passed, 0 failed, 0 skipped**, using the real local Auth, Firestore, Storage and Functions emulators. Checks cover verified-owner versus unauthenticated/unverified/non-owner access, role escalation denial, direct content-write denial, private image isolation/immutability, save conflicts, publication/image conversion/private-field removal, rollback, invalid image denial and revoked access.
- Production dependency audits report zero known vulnerabilities in both the website and Functions packages. The website uses a targeted `@grpc/grpc-js` override to 1.13.6 because Firebase's Node dependency otherwise resolves an affected 1.9.x version; this is not a general security certification.
- Existing browser smoke: saved finds, search, category filtering, sorting, image loading, 22 routes, 30 layout checks over five widths, mobile navigation/history, no page exceptions or failed HTTP responses in the unconfigured public app.
- Legacy owner browser check: local card/page independence, save/reload, cancel, preview, backup/export, input escaping, storage failure, reset and four widths still work.
- Integrated owner browser check (`tests/browser/firebase-editor.cjs`) with a **mocked Firebase service module**: setup state, non-owner UI, owner login, inline edit fields for all six worlds, independent inner heading, draft-save callbacks, conflict feedback, publication/sign-out UI, rollback/load-public actions and four widths. This verifies the application flow, **not Firebase server authorization**. The mock is supplied by Playwright request interception and is absent from production code.

For that browser check start Vite on port 5173 and use a supported Playwright/Chromium installation. In the prepared environment:

```sh
PLAYWRIGHT_MODULE=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node tests/browser/firebase-editor.cjs
```

## Resolved environment blockers

Earlier runs stopped at the platform proxy's HTTP 403 for the official emulator download. After access became available, Firebase CLI downloaded and checksum-verified both official emulator artifacts. `FIREBASE_EMULATORS_PATH` and `XDG_CONFIG_HOME` keep emulator/cache configuration in writable locations.

Firebase CLI 15.33 also supplied an external ProxyAgent for local Firestore lookups despite the environment's loopback `NO_PROXY`. This caused Storage owner checks to fail. The environment's ignored `.firebase/local-loopback.cjs` preload removes that dispatcher **only for HTTP loopback destinations**. External requests retain the configured proxy and network restrictions. Its creation and startup use are saved in the environment draft:

```sh
XDG_CONFIG_HOME=/tmp/nexori-firebase-cli-config \
FIREBASE_EMULATORS_PATH=/tmp/nexori-firebase-emulators \
NODE_OPTIONS='--require=/workspace/nexori/.firebase/local-loopback.cjs' \
npm run test:firebase
```

Test harness corrections use the installed Sharp package entry point, assert the exact callable Function error codes, and target the same explicit Storage bucket for anonymous contexts. The Storage create rule additionally requires `resource == null`: the emulator classified replacement uploads as CREATE, so an explicit no-existing-object check now enforces image immutability even in that case. No authentication or role checks were relaxed.

Official Firebase documentation now reads successfully. Saved environment drafts do not execute scripts, apply runtime changes or publish anything; review/save and environment publication remain separate from website deployment.

## Remaining unverified / pre-launch

Cloud IAM, Storage CORS, email delivery, actual project rules, real sign-in and real upload/publication remain unverified until Console setup and deployment to the development project are completed. Passing emulator tests is not cloud verification. A direct `file://` preview is not the supported way to use this integrated manager. The site is not launch-ready; product onboarding, retention/backups, actual privacy details and launch checks remain outstanding.
