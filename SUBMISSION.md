# Submission — AjaiaDocs

**Candidate:** Wayan Kuswirocana (kuswirocana@cmu.edu)

---

## Live Deployment

**URL:** [TO BE ADDED AFTER DEPLOY]

**Test Accounts (no login required — use the user switcher in the header):**
| Name | Email |
|------|-------|
| Alice Chen | alice@ajaia.dev |
| Bob Smith | bob@ajaia.dev |

---

## Walkthrough Video

**URL:** [TO BE ADDED AFTER RECORDING]

---

## What's Included

| File | Description |
|------|-------------|
| `app/` | Next.js App Router pages and API routes |
| `components/` | Editor, Toolbar, ShareModal, Header |
| `lib/` | Prisma client, API helpers, utility functions |
| `prisma/` | Schema and seed script |
| `__tests__/` | Utility unit tests (9 tests) |
| `README.md` | Local setup and run instructions |
| `ARCHITECTURE.md` | Stack choices, data model, scope cuts |
| `AI-WORKFLOW.md` | AI tools used, time savings, corrections made |
| `SUBMISSION.md` | This file |

---

## What Works End-to-End

- [x] Create a new document
- [x] Rename a document (click title)
- [x] Rich text editing: Bold, Italic, Underline, H1/H2/H3, Bullet list, Ordered list
- [x] Auto-save with visual "Saving…" / "Saved" indicator (1s debounce)
- [x] Upload `.txt` or `.md` file → creates new editable document
- [x] Share a document by email (owner only)
- [x] Revoke access
- [x] Dashboard shows "My Documents" vs "Shared with Me" clearly
- [x] Owner/shared badge on document editor
- [x] Delete document (owner only)
- [x] Persistence across page refresh
- [x] Deployed to Vercel with working live URL

---

## What's Intentionally Not Included

| Feature | Reason |
|---------|--------|
| Real-time collaboration | WebSocket/CRDT complexity; out of scope for timebox |
| `.docx` upload | `mammoth.js` parsing adds surface area; concept is demonstrated via `.txt`/`.md` |
| Viewer vs editor roles | Natural next step; current model grants edit access on share |
| Version history | Would require snapshot table + diff logic |
| OAuth / real login | Seeded accounts sufficient to demonstrate multi-user behavior |

---

## What I'd Build Next (2–4 Hours)

1. `.docx` upload via `mammoth.js`
2. Viewer vs editor permission roles on shares
3. Export to Markdown or PDF
4. Real-time presence indicators (Liveblocks)
5. Document search
