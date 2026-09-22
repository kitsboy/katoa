# katoa — Last Updated 2026-09-22 by Buffy

**Brief:** Added a local sample-data control center for switching demo stories, changing presentation detail, and safely resetting preview state.

**Done:**
- Added Demo controls to the demo banner.
- Added Community impact, Creator studio, and Independent music sample scenarios.
- Added Rich walkthrough and Quick skim modes.
- Added selected-story shortcut and local-only reset.
- Reset preserves theme preferences and never touches Supabase, live accounts, payment nodes, or credentials.

**Verification:** 303 tests passed across 43 files; typecheck and lint passed; build passed with 26/26 prerendered routes; source/dist asset-reference guards passed.

**Git state:** Tip `7550b09` plus final handoff stamp; no production hosting deployment was run.
