# Spark editor validation — 2026-10-10

The active editor uses Authentication and Firestore only. The operator reports creating Iowa Firestore and saving the manager role. Real project billing status, deployed rules, email verification, sign-in and remote edits have not been verified. No hosting, rules, billing, Functions or Storage were deployed/activated by the agent. Tests use only the isolated `demo-nexori` project.

## Passed

- Production Vite build and both legacy standalone HTML previews.
- Catalog: 7 tests. Content: 4 tests. Spark validation: 2 tests for permitted references, UID restrictions, private-field stripping and invalid input rejection.
- **Seven actual Auth/Firestore emulator integration tests, zero failures/skips**, using the real modular Web SDK and `createSparkStore`. Coverage includes anonymous/non-owner/unverified-owner/verified-owner access, self-grant denial, image privacy/immutability/size/mime, saved draft isolation, release/image copying and private-field stripping, revision recovery, stale conflicts, unreleased-document privacy, unknown schema/field denial, every one of the 81 cards with image references, and revoked-manager access. Both pages schema chunks are exercised within Firestore rule budgets.
- **Real-service browser check passed**: actual demo Auth sign-in, all six world edit dialogs, compressed WebP upload and private save/reload, visitor draft isolation, public image release, independent card/page titles, logout preserving public images, revision restore/load-public, four widths and zero Functions/Storage requests. Browser image decoding completed without page exceptions.
- Mocked-service browser regression: setup state, denied account, owner login, all six worlds' edit dialogs, independent titles, save/conflict feedback, preservation of typed login fields during late public snapshots, release/logout/recovery and 320/390/768/1440px widths. This is UI validation, not server authorization.

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

The old four Functions/Storage integration tests and their server/Sharp schema tests are historical and no longer the active test commands. Their prior results are not evidence for this Spark implementation. Existing site/legacy-editor browser checks remain recorded in earlier commits.

Rules enforce ownership, approved record/field shapes, image reference paths, immutable versions, byte size/mime and release consistency. Text semantics and image decoding/reencoding are client checks. Firestore image documents use Spark quotas; old or abandoned versions/images are retained until privileged cleanup. Define retention/backups before launch and verify actual Usage and project plan. No unlimited-free-capacity claim is made.

The operator has since reported publishing the generated `firestore.rules` in Console; their actual contents have not been verified remotely. Verify the email, then test actual authorized-domain/sign-in/edit/visitor behavior on a development HTTP app. A `file://` HTML preview does not include this integrated manager. No public website launch is authorized. Product onboarding, actual privacy/hosting details and launch checks remain outstanding. Environment draft saving is separate from runtime application/publication.
