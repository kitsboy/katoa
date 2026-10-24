# katoa — Last Updated 2026-10-23 by Buffy (M3)
Brief: Wrapped /demo in the same <article className="lp-page"> route-context fingerprint HomePage already owns (with its own sr-only heading), guard-tested in the existing PageModeHome test file; and added a SW CACHE_NAME-from-build guard — public/sw.js now uses a @BUILD_COMMIT@ placeholder replaced with the deploy git sha by scripts/write-version.mjs, with a test that asserts the shipped sw.js has katoa-static-<current-sha> and no leftover placeholder.
Commit: ea1af19
