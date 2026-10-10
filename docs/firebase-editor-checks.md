# Spark editor validation — 2026-10-10

The active editor uses Authentication and Firestore only. The operator reports creating Iowa Firestore, saving the manager role, opening the local Windows app and signing in after email verification. The app still denies editor access; the exact role document ID has not been confirmed. Real project billing status, deployed rules, role correctness and remote edits have not been independently verified. No hosting, rules, billing, Functions or Storage were deployed/activated by the agent. Tests use only the isolated `demo-nexori` project.

## Passed

- Production Vite build and both legacy standalone HTML previews.
- Catalog: 7 tests. Content: 4 tests. Spark validation: 2 tests for permitted references, UID restrictions, private-field stripping and invalid input rejection.
- **Seven actual Auth/Firestore emulator integration tests, zero failures/skips**, using the real modular Web SDK and `createSparkStore`. Coverage includes anonymous/non-owner/unverified-owner/verified-owner access, self-grant denial, image privacy/immutability/size/mime, saved draft isolation, release/image copying and private-field stripping, revision recovery, stale conflicts, unreleased-document privacy, unknown schema/field denial, every one of the 81 cards with image references, and revoked-manager access. Both pages schema chunks are exercised within Firestore rule budgets.
- **Real-service browser check passed again for the authorization diagnostics change**: actual demo Auth sign-in; missing, wrong-type and inactive admin documents; all six world edit dialogs; compressed WebP upload and private save/reload; visitor draft isolation; public image release; independent card/page titles; logout preserving public images; revision restore/load-public; four widths; zero Functions/Storage requests. Browser image decoding completed without page exceptions. Role checks read from the server, with no authorization bypass.
- Mocked-service browser regression passed again: setup state, denied account, owner login, all six worlds' edit dialogs, independent titles, save/conflict feedback, preservation of typed login fields during late public snapshots, release/logout/recovery and 320/390/768/1440px widths. New cases distinguish failed role, draft and history reads, retain error details across public snapshots, remove partially mounted editing controls and prevent narrow-screen overflow. This is UI validation, not server authorization.

## Run locally in the prepared cloud workspace

```sh
npm run firebase:sync
npm run test:catalog
npm run test:content
npm run test:firebase-validation
XDG_CONFIG_HOME=/tmp/nexori-firebase-cli-config \
FIREBASE_EMULATORS_PATH=/tmp/nexori-firebase-emulators \
NODE_OPTIONS='--require=/workspace/nexori/.firebase/local-loopback.cjs' \
npm run test:firebase
npm run build
```

Java 21+ is required. Official Firestore emulator downloads use `storage.googleapis.com`. The ignored loopback preload removes Firebase CLI 15.33's explicit external dispatcher only for HTTP localhost/127.0.0.1/[::1]. External proxy/network restrictions remain unchanged. The environment install script prepares that helper and only the root dependencies.

For browser checks, start Vite on 5173. The real Spark browser check also needs Auth/Firestore emulators running on 9099/8080 with `demo-nexori`:

```sh
PLAYWRIGHT_MODULE=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node tests/browser/firebase-spark.cjs
PLAYWRIGHT_MODULE=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node tests/browser/firebase-editor.cjs
```

The real browser test intercepts only public configuration to select local demo emulators; it does not mock the Firebase service. It seeds and clears only demo users/data. Do not run it alongside another suite that clears the same demo project. Tests never use the operator's real password or grant a real UID.

## Scope and remaining work

The Windows ZIP includes production assets and a Node-only loopback server. `npm run test:windows` passed again after rebuilding the diagnostics update: one test, zero failures/skips. It extracts the real archive into a path containing spaces and Hebrew, checks its integrity and absence of environment/source-map/dependency/command-launcher files, and verifies SPA routes, JS/image MIME types, missing-file responses, private/path traversal denial, HEAD, method restrictions and local Host validation. An earlier Chromium check of the extracted production package passed configured login-form rendering, 390/1440px layouts, world navigation and deep-link reload without page exceptions; Firestore network traffic was blocked and no actual sign-in was attempted. Automated checks run on Linux; the operator now reports manually starting the Node server and reaching sign-in on Windows. The package has public Web config, never a password/admin key, and does not deploy Hosting.

The old four Functions/Storage integration tests and their server/Sharp schema tests are historical and no longer the active test commands. Their prior results are not evidence for this Spark implementation. Existing site/legacy-editor browser checks remain recorded in earlier commits.

Rules enforce ownership, approved record/field shapes, image reference paths, immutable versions, byte size/mime and release consistency. Text semantics and image decoding/reencoding are client checks. Firestore image documents use Spark quotas; old or abandoned versions/images are retained until privileged cleanup. Define retention/backups before launch and verify actual Usage and project plan. No unlimited-free-capacity claim is made.

The operator has since reported publishing the generated `firestore.rules` in Console; their actual contents have not been verified remotely. Resolve the current editor-access failure by comparing the actual role document ID and checking the new stage/code diagnostics, then test real edits and visitor isolation on the development HTTP app. A `file://` HTML preview does not include this integrated manager. No public website launch is authorized. Product onboarding, actual privacy/hosting details and launch checks remain outstanding. Environment draft saving is separate from runtime application/publication.

## Operator antivirus warning — 2026-10-10

The operator reports the computer deletes the repair download as a virus. The threat name, scanner and affected file are pending; there is no evidence to classify this as a false positive. Source review found the supplied repair launcher runs PowerShell to locate/extract a downloaded ZIP and execute the local Node app. The launcher and repair archive were withdrawn. The replacement removes CMD/BAT launchers, automatic extraction and child-process/browser spawning; users explicitly run the local Node server after extraction. Frontend assets and Firebase permissions are unchanged. Protection must remain enabled; blocked files must not be restored or excluded. Local package/server tests do not constitute an antivirus scan or real Windows verification.
