# KIMI-HANDOFF-katoa-2026-06-10.md

**Self-contained prompt for Kimi (M4 HERMES / Obsidian Master Brain). Process this directly.**

---

## Two-Machine Setup & Working Style (Always Remember)

- **M3 Mac (current / Goose)**: Main coding and development. All new code and projects live in ~/projects/. Prefer Goose Desktop GUI.
- **M4 Mac (Kimi on HERMES)**: Master Brain. Holds permanent Obsidian vault, MASTER-BRAIN.md, Kanban, Architecture docs, media empire, and single source of truth for all Give A Bit projects. This is where knowledge lives long-term.
- Connect via Tailscale. When work is done on M3, prepare clean hand-offs (code + summary docs) so Kimi can integrate into Obsidian and MASTER-BRAIN on M4 without conflicts or overwhelm.
- **Working style (strict)**: Explain everything simply (like to a 16-year-old). One clear step at a time. Always explain before changes and ask for confirmation. End completed tasks with “Done ✅”. Be encouraging and patient. Remind the user every week to update context (ask 3 useful questions).
- **Core Mission (always reference)**: We are building Bitcoin sovereignty tools that make private, feel-good giving simple for normal people. Core values: Privacy (PYNYM + BIP-47, Silent Payments, Lightning), education, Safe Harbour legal protection, and always linking back to giveabit.io. We also create Sea Shanty media, NOSTR tools, and autonomous agent systems. Everything must feel approachable, positive, and respectful of user sovereignty.

**Educate yourself and Hermes to stay current on this and all projects automatically.** Use every hand-off to update your internal models, cross-reference, and keep the permanent record accurate.

---

## The Project: KATOA

**Full Marketing Pitch (remember and use this exactly — approachable language):**

KATOA (katoa.org) is a privacy-first, zero-fee Bitcoin Lightning creator support platform. Anyone, anywhere can create wishlists, projects, or crowdfunding campaigns and receive support directly in Bitcoin via Lightning Network — no bank account, no KYC, no platform fees ever. Creators keep 100% ("Keep All That's Owed Always").

It is a protocol-level upgrade for creator monetization and feel-good private giving: instant settlement, global access in 195+ countries, censorship resistance, and strong privacy foundations (Nostr identity, planned PYNYM/BIP-47/Silent Payments). Features include item wishlists with auto-parsing from Amazon/eBay/Etsy, media uploads, social feeds, categories/tags, following/leaderboards/contributions, QR codes + Lightning addresses + wallet management, real-time Bitcoin price + "Bitcoin Pulse" live widget, Protocol Updates feed, multi-language, beautiful glassmorphic UI.

Built as part of the Give A Bit ecosystem (giveabit.io) with deep focus on Bitcoin sovereignty, private money, education, and Safe Harbour principles. Open source (MIT). Feels approachable and empowering — not technical or intimidating. Normal people and future AI/Nostr agents can use it to give or receive on their own terms.

**One-sentence version for Kanban / quick recall**: KATOA is the zero-fee, Lightning-native, privacy-first wishlist + creator funding platform for the Give A Bit movement — creators keep everything, no banks or middlemen.

---

## Source of Truth (Copy These Facts Exactly)

See the full [SOURCE-OF-TRUTH.md](./SOURCE-OF-TRUTH.md) in the project root (and copy it into the vault). Key highlights:

- **GitHub**: https://github.com/kitsboy/katoa.git (main branch). Single source of code truth.
- **Live URL**: https://katoa.org/ (Cloudflare-hosted SPA with custom domain; CF headers confirmed 2026-06-10).
- **Deployment**: `npm run build` → dist/. Configs: netlify.toml (security/redirects/caching — legacy or dual), public/_redirects. Backend: Supabase (project wabzwiegtloclfkbxwqs in fallbacks; 23 migrations with strong RLS). Previous cPanel/Netlify experiments moved to docs/archive/.
- **Key local docs** (copy these into Obsidian/vault):
  - SOURCE-OF-TRUTH.md (this session's authoritative record)
  - KIMI-HANDOFF-katoa-2026-06-10.md (this file)
  - EXECUTIVE-SUMMARY.md (new robust overview)
  - MARKETING.md (expanded pitch + messaging)
  - README.md (public face, features, comparisons)
  - STATUS.md (health snapshot)
  - docs/ROADMAP.md
  - docs/guides/BTCPAY_INTEGRATION.md, NOSTR_GUIDE.md, etc.
  - LICENSE (MIT, newly created)
- **Git snapshot** (session start): ahead by 1, clean tree. Recent work: STATUS, Bitcoin Pulse + Protocol Updates live widgets, hero bg local, full doc organization + handoff prep for Kimi.
- **Mission alignment**: Full Give A Bit — 0% fees, Lightning privacy, Nostr, planned deeper privacy layers, giveabit.io links, sovereignty for normal people, open source, approachable.
- **Gaps / next**: Live BTCPay wiring (stubs + guides ready), tests, Supabase generated types, deeper PYNYM/BIP-47 integration, consolidated CF deployment docs, more polish on notifications/analytics.

**How to run locally (for Kimi/Hermes context or future code work)**:
1. cd ~/projects/katoa (or equivalent vault-linked folder after sync)
2. npm install
3. npm run dev
4. Use the giveabit-project-handoff skill for any future updates on this or new projects.

---

## Specific Action Items for Kimi (Do These)

1. **Integrate into permanent records**:
   - Update MASTER-BRAIN.md with KATOA overview, pitch (use the exact one above), GitHub, live URL, deployment summary, key docs list, current status (Nostr complete-ish, BTCPay in progress, full Supabase schema live, beautiful UI with live Bitcoin widgets).
   - Add/update Kanban board: current status, open gaps (BTCPay integration as priority?), next steps, links to the hand-off files.
   - Add to Obsidian vault project folder (copy SOURCE-OF-TRUTH.md, this KIMI-HANDOFF, EXECUTIVE-SUMMARY.md, MARKETING.md, README.md, STATUS.md, and key guides). Note the docs/ structure for future.
   - Update any project maps, architecture docs, or Give A Bit ecosystem overview pages with KATOA as the wishlist/creator funding arm.
   - Cross-reference with tadbuy and any other active projects. Use consistent dates and structure. Note this hand-off is 2026-06-10.

2. **Educate & internalize**:
   - Educate yourself (Kimi) and Hermes to stay current on KATOA and all Give A Bit projects automatically. Absorb the pitch, tech (React/Vite/TS/Tailwind + Supabase + Nostr full stack + planned Bitcoin pay), mission tie-in, and why it matters (0% fees + sovereignty changes the game for creators in 195+ countries).
   - Add KATOA-specific notes to your long-term memory: taglines ("Keep 100% of Your Earnings", "Zero-fee, privacy-first Bitcoin commerce", "Protocol-level upgrade"), competitor comparisons (vs Throne 10%, Linktree fees, OnlyFans 20%, Kickstarter fees+fulfillment), privacy roadmap items.
   - When future chats mention "katoa", "katoa.org", wishlists on Lightning, etc., recall this context instantly and reference the vault files.

3. **Enforce the template going forward**:
   - Every future project (and updates to this one) must have at minimum: GitHub + branch, live URL, deployment details (build, platform, env notes), key docs list, simple pitch in everyday language tied to Give A Bit + Bitcoin/privacy/sovereignty, Git snapshot + recent changes, mission alignment, gaps/improvements, hand-off notes, and "how to start/edit" instructions.
   - Always use/create SOURCE-OF-TRUTH.md and a dated KIMI-HANDOFF-*.md in the project root.
   - Run (or remind Goose to run) the giveabit-project-handoff skill at the close of every relevant session.
   - Preserve clean, structured summaries only — no raw chat logs or back-and-forth in the hand-off files (see goodbye skill too).

4. **Files to copy / sync into vault (via Tailscale or user action)**:
   - SOURCE-OF-TRUTH.md
   - KIMI-HANDOFF-katoa-2026-06-10.md
   - EXECUTIVE-SUMMARY.md
   - MARKETING.md
   - README.md (updated)
   - STATUS.md (updated)
   - LICENSE
   - docs/ROADMAP.md + guides/* (for reference)
   - Any new session summaries (SESSION-SUMMARY-*.md if goodbye used)
   - Suggest user adds the whole project folder (or just the .md hand-off set) to nightly Obsidian backups.

5. **Confirmation & feedback loop**:
   - After processing, reply confirming integration: list exactly what you updated in MASTER-BRAIN.md, Kanban, vault maps, any new links or education notes added.
   - Note any conflicts resolved or questions (e.g., exact current hosting dashboard details — CF vs Netlify — user can provide).
   - If anything in this hand-off is unclear or outdated, flag it gently and propose fixes.
   - Remind user (in your response): "The updated KIMI-HANDOFF and SOURCE files are ready. Do not move or sync anything to M4 until I or Kimi tell you it's time." (But since this is the hand-off, user will sync when ready.)

6. **Weekly / ongoing**:
   - Remind the user (via future interactions) to run hand-off skill regularly and ask 3 useful context questions.
   - Keep all Give A Bit projects (tadbuy, katoa, future) synchronized in your vault and brain. Use consistent naming and structure.

---

## Context for This Specific Hand-Off (2026-06-10 Session)

User asked: review the whole folder, make sure best organized, add any missing docs, prepare robust executive summary + marketing doc etc. for handoff to Kimi. "Documentation is the most important for kimi then we will fix it, or just start again later."

Goose (on M3) did a full review:
- Listed full structure (React app with rich Supabase + Nostr + Bitcoin features).
- Cleaned aggressively: archived junk tarballs + 7+ historical deployment docs/prompts, removed unused old page/component files, fixed names, added LICENSE, improved gitignore, rebranded lingering BitWish text.
- Created the four new high-value docs (SOURCE, this handoff, EXECUTIVE-SUMMARY, MARKETING).
- Updated STATUS and guides.
- Confirmed live site (katoa.org works), captured accurate git/GH/deploy/facts.
- Enhanced as it went while prioritizing clean, Obsidian-friendly, Kimi-consumable markdown.

This keeps the two-machine loop healthy: M3 does the building + local review, M4 (you) holds the permanent organized truth and "educates Hermes."

**Do not overwhelm with chat logs** — the structured files + this prompt are the reasonable transfer method. Integrate only the clean content.

---

**Process this hand-off now, Kimi. Then confirm back with your updates list.**

**Done ✅ — KATOA hand-off prepared for seamless integration into the Master Brain.** 

(Reference: giveabit-project-handoff skill at ~/.agents/skills/giveabit-project-handoff/SKILL.md and the tadbuy example for format consistency. Use goodbye skill for session-end compression if ending chat.)

---

## Latest Session Summary (from 2026-06-10 update-kimi)

**Chat Topic**: Full project review, best organization, and creation of a complete, robust documentation package for handing off the KATOA Give A Bit project to Kimi (including executive summary, marketing doc, source of truth, and dedicated handoff prompt).

**Key Things We Did**:
- Deep exploration of the entire folder, code, Supabase schema (23 migrations), existing docs, git, and live site (katoa.org on Cloudflare).
- Aggressive cleanup: archived junk tarballs + historical cPanel/SSL/prompt docs into docs/archive/; removed unused old pages; fixed package name, .env, .gitignore; added MIT LICENSE; introduced clean docs/ structure (guides/, deployment/, archive/, ROADMAP, ARCHITECTURE); rebranded BitWish remnants.
- Created premium new docs (documentation priority): SOURCE-OF-TRUTH.md, this KIMI-HANDOFF, EXECUTIVE-SUMMARY.md, MARKETING.md, docs/ARCHITECTURE.md.
- Updated README (accurate links, handoff notes, Give A Bit ties), STATUS.md, and guides for Kimi-friendliness and template compliance.

**What We Finished**:
- Best-organized project state (minimal clean root with only essential files; junk isolated).
- Complete, robust, Obsidian-friendly handoff package ready (exec summary + marketing + architecture + source of truth + dedicated prompt) following giveabit template exactly.
- All content uses simple everyday language, preserves the exact marketing pitch, ties to Give A Bit mission (0% fees, Lightning/Nostr privacy, sovereignty), and is structured for easy vault integration.

**What We Are Still Aiming to Finish**:
- User review/commit of changes + Tailscale sync of the new .md files (or project) to M4 Obsidian vault for backups.
- Kimi to process this full handoff (including the summary below), update MASTER-BRAIN.md / Kanban / vault / maps / architecture docs, cross-reference with tadbuy, and reply with confirmation list + educate Hermes.
- Engineering follow-up on gaps (BTCPay live integration is top priority; tests, Supabase types, deeper privacy layers).
- Keep using giveabit-project-handoff skill at end of every session.

**Update / Status**: As of 2026-06-10 (update-kimi), katoa has a full self-documenting hand-off system. The major review + organization + docs creation is complete. Project is clean, live, and handoff-ready with strong Give A Bit alignment. Two-machine loop healthy; knowledge preserved in clean structured files only.

**Key Decisions / Notes**:
- Documentation explicitly prioritized ("the most important for kimi then we will fix it, or just start again later").
- Aggressive archiving to keep current truth high-signal.
- Followed giveabit-project-handoff + goodbye skill patterns for clean, non-overwhelming transfer.

**Mission Tie-in**: Ensures the KATOA platform (zero-fee Lightning wishlist/creator funding tool for private, feel-good giving) stays fully current in Kimi's permanent Master Brain and vault. Clean handoffs = no context loss = better Bitcoin sovereignty tools over time.

**Finished in this session**:
- Full folder review + best organization + creation of robust Kimi handoff documentation package (SOURCE-OF-TRUTH, KIMI-HANDOFF, EXECUTIVE-SUMMARY, MARKETING, ARCHITECTURE + updates to README/STATUS + docs structure).
- Project now minimal, clean, self-documenting, and template-compliant.

**Still to do**:
- User: commit changes, Tailscale sync handoff files to M4 vault.
- Kimi: integrate summaries + files into MASTER-BRAIN, Kanban, Obsidian; confirm updates made; educate Hermes; cross-reference other projects.
- Future work: BTCPay wiring, tests, privacy expansions (per gaps in SOURCE-OF-TRUTH).

---

## Latest Session Summary (from 2026-06-10 goodbye)

**Chat Topic**: Wrapping up the full katoa project review, organization, and handoff documentation package creation for Kimi, followed by explicit update and goodbye to end the session cleanly.

**Key Things We Did**:
- Completed the comprehensive folder review, aggressive cleanup (archived junk, removed legacy files, fixed configs, added LICENSE), introduced docs/ structure.
- Built the full robust handoff set: SOURCE-OF-TRUTH.md, KIMI-HANDOFF-katoa-2026-06-10.md, EXECUTIVE-SUMMARY.md, MARKETING.md, docs/ARCHITECTURE.md, updated README/STATUS/guides, and SESSION-SUMMARY-2026-06-10.md.
- On "update-kimi katoa": Created the structured SESSION-SUMMARY and appended the first "Latest Session Summary" section to the KIMI-HANDOFF.
- On "goodbye": Re-explored state with tools, confirmed all deliverables, and appended this final clean goodbye summary section for perfect handoff closure.

**What We Finished**:
- The katoa project is now best organized with a complete, high-quality, template-compliant documentation package ready for Kimi (executive summary, marketing pitch, architecture, source of truth, handoff prompt, and session summaries).
- All files are clean, Obsidian-friendly, use simple language, preserve the mission pitch, and follow giveabit-project-handoff + goodbye skill patterns exactly.
- Two-machine setup supported: M3 work fully compressed into structured files for M4.

**What We Are Still Aiming to Finish**:
- Commit the changes on M3.
- Tailscale sync of SESSION-SUMMARY-2026-06-10.md, the updated KIMI-HANDOFF, SOURCE-OF-TRUTH, EXECUTIVE-SUMMARY, MARKETING, ARCHITECTURE, and related files to the M4 Obsidian vault.
- Kimi processes the full KIMI-HANDOFF (now including both update and goodbye summaries), integrates everything into MASTER-BRAIN.md, Kanban, vault, and confirms.
- Then resume actual project work (e.g. BTCPay integration) using the /whatsup skill for recovery.

**Update / Status**: As of 2026-06-10 goodbye, the katoa handoff is complete and up to date. The entire session (review + organization + docs creation + update-kimi + goodbye) has been compressed into clean, reusable files. Project is in excellent shape for handoff to Kimi on HERMES. No raw logs — only structured knowledge transferred. Git changes ready; live site and GitHub facts captured.

**Key Decisions / Notes**:
- User explicitly requested documentation as the priority for the Kimi handoff.
- Followed skills strictly: used tools for exploration, created/updated SESSION-SUMMARY and appended cleanly to KIMI-HANDOFF (twice for the phases), kept everything positive and mission-aligned.
- The SESSION-SUMMARY-2026-06-10.md serves as the full session record.

**Mission Tie-in**: This goodbye ensures the great work on KATOA — building a privacy-first, zero-fee Bitcoin Lightning creator platform as part of Give A Bit — is preserved perfectly for Kimi. Clean handoffs mean the sovereignty tools stay alive and improvable across chats and machines without losing context or momentum. Excellent progress on making private, feel-good giving simple for normal people.

**Finished in this session**:
- Full review, best organization of the katoa folder, and creation of the robust executive summary, marketing doc, SOURCE-OF-TRUTH, KIMI-HANDOFF, ARCHITECTURE, and supporting updates.
- "update-kimi katoa" and "goodbye" steps completed with clean structured summaries appended to the handoff file and a dedicated SESSION-SUMMARY created.

**Still to do**:
- User commits changes and syncs the handoff files via Tailscale to M4.
- Kimi integrates the complete package (SOURCE-OF-TRUTH, KIMI-HANDOFF with summaries, EXECUTIVE-SUMMARY, MARKETING, ARCHITECTURE, SESSION-SUMMARY) into her vault/MASTER-BRAIN/Kanban and confirms.
- Future: Use the handoff docs + /whatsup for next work on BTCPay, tests, privacy features, etc.

**Next for Kimi**: Integrate this final goodbye summary (and the full set of handoff files from this session) into MASTER-BRAIN.md, Kanban, Obsidian vault, and any project maps or architecture docs. Cross-reference with other Give A Bit projects like tadbuy. Educate yourself and Hermes to stay current on KATOA. Enforce the handoff template for every future project. Use the giveabit-project-handoff skill going forward. Reply confirming the updates made and list what was added/updated in the permanent records. The clean SESSION-SUMMARY-2026-06-10.md and this KIMI-HANDOFF (with both update-kimi and goodbye sections) are the key artifacts.

Chat ended cleanly with remarkable recovery. Use the /whatsup skill (or "use the whatsup skill") in a new chat window to pick up exactly where we left off — it will load the latest summary automatically.

Reference the giveabit-project-handoff skill for any future katoa or new project work. Great work on katoa — this keeps everything organized for Give A Bit without losing context or learning. The handoff package is now robust and ready. 

**Done ✅**

**Next for Kimi**: Integrate this summary (and the full handoff files) into MASTER-BRAIN.md / Kanban / Obsidian vault / project maps / architecture docs. Update any Give A Bit ecosystem overviews. Educate yourself and Hermes to stay current on KATOA automatically. Enforce the template for all future projects. Reference the giveabit-project-handoff skill. Reply with confirmation of exactly what was updated.

(The clean SESSION-SUMMARY-2026-06-10.md file was also created in the project root for reference.)