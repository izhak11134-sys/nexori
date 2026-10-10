> These checks describe the optional legacy local HTML editor. Integrated Firebase management and its pending server verification are documented in [firebase-editor-checks.md](firebase-editor-checks.md).

# Owner editor checks

Date: 10 October 2026.

The owner workspace is a separate standalone HTML and a separate development entry. The production visitor build does not include the toolbar, edit-dialog code or editor stylesheet. Content rendering is shared so exported edits work without the editor.

Validated behavior:

- Dragon Ball inner-page background changes without changing its heading or outer card.
- Inner-page heading edits do not rename the outer card. Changes survive a reload in the tested browser.
- Cancel discards unsaved edits. Per-card reset is staged until save.
- Product names/descriptions and images use the same record across cards and detail pages.
- Uploaded raster images are embedded; imports are checked before applying. Remote image URLs, SVG uploads, unknown fields and unsafe retailer URL schemes are rejected.
- Literal HTML in an edited name renders as text and does not execute.
- Draft backup includes preparation notes; visitor HTML export excludes those notes and preparation-only retailer URLs, and contains no editor controls.
- Exported visitor HTML shows saved heading/background changes.
- Visitor HTML ignores local owner drafts even when both run under the same origin.
- Preview hides edit buttons. The workspace and dialog fit 320, 390, 768 and 1440 pixel widths.
- Valid backup import restores content; invalid imports leave the current draft unchanged.
- A browser-storage error is reported honestly while the in-memory edit remains available for backup/export.

Automated unit checks cover independent fields, stable category/type references through reset, rejected identifiers/fields/schemes and atomic category/type validation. Existing catalog and policy browser checks continue to pass.

Standalone browser tests served the generated files directly from test fixtures with no external dependencies; the same-origin isolation fixture blocked external requests. Direct `file://` navigation could not be tested in the managed browser because it returned `ERR_BLOCKED_BY_ADMINISTRATOR`. Local-file storage behavior therefore remains browser-dependent, as explained in the owner guide. No browser security policy was disabled.

This is functional validation, not an authentication system, image-rights review or legal certification. No shared backend, remote upload, deployment or real merchant integration was introduced.
