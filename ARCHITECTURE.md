# Architecture Note

## What I Prioritized and Why

### Core Thesis

Given a 4-hour timebox, I optimized for **depth in the core flow** (create → edit → share) over breadth. Every decision below reflects that constraint.

---

## Stack Choices

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 App Router | Collocates frontend + API in one repo; zero separate backend to deploy |
| Editor | Tiptap | Battle-tested, extensible, React-native; covers all required formatting in ~10 lines |
| Database | PostgreSQL via Prisma | Relational model fits documents + shares naturally; Prisma removes boilerplate |
| Deployment | Vercel | One `git push` deploy; free tier; native Next.js support |
| Auth | Seeded users + localStorage | Fastest path to demonstrate multi-user behavior without OAuth complexity |

---

## Data Model

```
User (id, email, name)
  └── Document (id, title, content [HTML], ownerId, timestamps)
        └── DocumentShare (documentId, userId)  ← junction table
```

**Why HTML for content?** Tiptap serializes/deserializes HTML natively. Storing JSON (Tiptap's native format) would require a migration layer for every query. HTML is readable, portable, and simpler to debug.

**Why not localStorage for persistence?** Sharing between users requires a shared data store. localStorage is per-browser — it cannot demonstrate the sharing flow across "users."

---

## API Design

All API routes follow a consistent pattern:
1. Read `x-user-email` header for identity
2. Resolve the user from the database
3. Enforce access control (owner vs shared)
4. Return minimal, typed payloads

```
GET    /api/documents          → { owned[], shared[] }
POST   /api/documents          → Document
GET    /api/documents/[id]     → Document + shares + isOwner flag
PUT    /api/documents/[id]     → Updated document
DELETE /api/documents/[id]     → Owner only
POST   /api/documents/[id]/share  → Grant access
DELETE /api/documents/[id]/share  → Revoke access
POST   /api/upload             → Create doc from file
```

---

## Deliberate Scope Cuts

| Feature | Decision | Reason |
|---------|----------|--------|
| Real-time collaboration | Cut | Requires WebSockets/CRDT (Yjs); adds hours of complexity |
| `.docx` upload | Cut | `mammoth.js` parsing adds dep + edge cases; `.txt`/`.md` covers the concept |
| JWT / session auth | Cut | Seeded accounts + header identity is sufficient to demonstrate multi-user behavior |
| Role-based permissions | Cut | Owner/shared distinction is sufficient; viewer vs editor roles are a natural next step |
| Version history | Cut | Would need a snapshots table and diff logic; stretch goal territory |

---

## What I'd Build Next (2–4 Hours)

1. **`.docx` upload** via `mammoth.js` — converts to clean HTML
2. **Viewer vs editor roles** on shares — simple enum on `DocumentShare`
3. **Optimistic UI** on save — replace the 1s debounce with a more responsive feel
4. **Export to Markdown** — Tiptap → Markdown via `@tiptap/extension-markdown`
5. **Real-time presence indicators** — Liveblocks or PartyKit for low-lift WebSocket layer
