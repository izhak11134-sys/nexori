# Spark editor validation — 2026-10-10

The active editor uses Authentication and Firestore only. The operator reports creating Iowa Firestore, saving the manager role, opening the local Windows app and signing in after email verification. A screenshot showed the collection was named `admin`; after guidance to use `admins`, the operator confirmed access works. Real project billing status, deployed rules and remote edits have not been independently inspected. No hosting, rules, billing, Functions or Storage were deployed/activated by the agent. Tests use only the isolated `demo-nexori` project.

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

The Windows ZIP includes production assets and a Node-only loopback server. `npm run test:windows` passed again after the single-HTML change: two tests, zero failures/skips. The server test extracts the real archive into a path containing spaces and Hebrew, checks its integrity and absence of environment/source-map/dependency/command-launcher files, and verifies SPA routes, JS/image MIME types, missing-file responses, private/path traversal denial, HEAD, method restrictions and local Host validation. The HTML-only archive test checks its exact two-file contents, verifies the HTML matches the current built artifact and embeds the real public configuration with no external script/stylesheet loading. An earlier Chromium check of the extracted production server package passed configured login-form rendering, 390/1440px layouts, world navigation and deep-link reload without page exceptions; Firestore network traffic was blocked and no actual sign-in was attempted. Automated checks run on Linux; the operator reports manually starting the Node server and reaching authorized editing on Windows. Both packages have public Web config, never a password/admin key, and do not deploy Hosting.

The old four Functions/Storage integration tests and their server/Sharp schema tests are historical and no longer the active test commands. Their prior results are not evidence for this Spark implementation. Existing site/legacy-editor browser checks remain recorded in earlier commits.

Rules enforce ownership, approved record/field shapes, image reference paths, immutable versions, byte size/mime and release consistency. Text semantics and image decoding/reencoding are client checks. Firestore image documents use Spark quotas; old or abandoned versions/images are retained until privileged cleanup. Define retention/backups before launch and verify actual Usage and project plan. No unlimited-free-capacity claim is made.

The operator has since reported publishing the generated `firestore.rules` in Console; their actual contents have not been verified remotely. Test real edits and visitor isolation using the existing account. The updated `NEXORI.html` now includes the integrated manager; older downloaded HTML and the legacy `NEXORI-editor.html` do not. No public website launch is authorized. Product onboarding, actual privacy/hosting details and launch checks remain outstanding. Environment draft saving is separate from runtime application/publication.

## Single HTML — 2026-10-11

`npm run build:html` now bundles the actual cloud entry with Vite's `inlineDynamicImports`, embeds all artwork and CSS, and preserves hash navigation. It includes the same owner-role checks and Firestore store; it does not export drafts, credentials or admin permissions. The legacy local editor still exports a cloud-free preview. Inline insertion uses replacement callbacks so dollar expressions in bundled SDK code remain literal.

The new `tests/browser/firebase-single-html.cjs` builds an isolated demo HTML and runs the complete existing real-SDK browser scenario against it over loopback HTTP. **Passed**: missing/wrong-type/inactive roles, owner sign-in, all six worlds, compressed image save/reload, visitor isolation, publication, title independence, logout, recovery and four widths. A second check runs the bundle in a sandboxed HTTP iframe with an opaque origin and unavailable session storage: sign-in, private save, fresh-session sign-in/load and removal of editing controls on logout all **passed**. Auth initializes with session persistence and memory fallback. The original Vite app's real-SDK browser scenario also passed again after this change.

```sh
PLAYWRIGHT_MODULE=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node tests/browser/firebase-single-html.cjs
```

The script requires the demo Auth/Firestore emulators and temporarily builds/serves only demo configuration. It must not overlap with another suite clearing `demo-nexori`. On a machine permitting local-file browsing, `--file` selects actual file navigation instead of HTTP. **Not verified here:** direct `file://` navigation failed with `ERR_BLOCKED_BY_ADMINISTRATOR` under the managed Chromium URL policy; no policy or browser security was weakened. HTTP/opaque-origin results are not a successful file-opening check. Actual Windows double-click and real-project sign-in from the HTML require the operator's check. Public production HTML and both downloadable ZIPs were rebuilt; deployment/billing was not activated.

## Management-entry visibility — 2026-10-11

The operator confirmed opening the latest HTML archive and then finding the footer login link too small to notice. The single HTML now has a permanent entry strip above the app, with an 18px Hebrew management button and 44px minimum height, plus a visibly outlined 16px footer entry. These styles and the strip apply only to the bundled development HTML. The entry opens `#/admin`; Firebase owner-role checks remain unchanged.

The bundled real-SDK browser check passed again. New assertions verify the top button is within the initial viewport, opens the login form without scrolling, has readable computed font size and causes no horizontal overflow at 320/390/1440px. The footer's computed font size is also checked. Full edit/save/image/recovery and opaque-origin checks passed again. The HTML/archive were regenerated; actual real-project login from the user's local file remains a separate verification.

## Operator antivirus warning — 2026-10-10

The operator reports the computer deletes the repair download as a virus. The threat name, scanner and affected file are pending; there is no evidence to classify this as a false positive. Source review found the supplied repair launcher runs PowerShell to locate/extract a downloaded ZIP and execute the local Node app. The launcher and repair archive were withdrawn. The replacement removes CMD/BAT launchers, automatic extraction and child-process/browser spawning; users explicitly run the local Node server after extraction. Frontend assets and Firebase permissions are unchanged. Protection must remain enabled; blocked files must not be restored or excluded. Local package/server tests do not constitute an antivirus scan or real Windows verification.
