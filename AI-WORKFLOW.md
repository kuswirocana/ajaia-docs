# AI Workflow Note

## Tools Used

- **Claude Code (claude-sonnet-4-6)** — primary coding assistant for scaffolding, component generation, and documentation
- **Claude.ai** — used for reasoning about tradeoffs before starting (stack choice, scope cuts)

---

## Where AI Materially Sped Up Work

| Task | Time with AI | Estimated without |
|------|-------------|-------------------|
| Full project scaffold (30 files) | ~15 min | ~2–3 hrs |
| Tiptap toolbar + editor integration | ~5 min | ~30 min |
| Prisma schema + seed setup | ~3 min | ~20 min |
| API route boilerplate (CRUD + share) | ~10 min | ~60 min |
| ShareModal component | ~5 min | ~30 min |
| All documentation (README, ARCHITECTURE, SUBMISSION) | ~10 min | ~45 min |

**Total estimated time saved: ~4–5 hours.** This allowed the entire project to be completed in ~90 minutes instead of the full 4-hour timebox.

---

## What I Changed or Rejected from AI Output

1. **Editor initialization logic** — The initial AI-generated `useEffect` for setting Tiptap content ran on every render, causing cursor jumps during typing. I added a `initialized.current` ref to gate it to first load only.

2. **Toolbar button handlers** — AI used `onClick` for toolbar buttons, which caused the editor to lose focus before the command ran. I changed to `onMouseDown` with `e.preventDefault()` to preserve focus — a subtle but critical UX fix.

3. **`plainTextToHtml` utility** — AI's first version didn't handle empty lines (blank lines between paragraphs disappeared). I adjusted it to convert empty lines to `<p><br></p>` for proper paragraph spacing.

4. **Share revoke flow** — AI originally sent the DELETE body as a query param. I verified the Next.js App Router `req.json()` pattern for DELETE bodies and corrected accordingly.

5. **`apiFetch` error handling** — AI generated a generic catch that swallowed error messages. I rewrote it to surface the API's `error` field so users see meaningful feedback.

---

## How I Verified Correctness

- **Manual testing of the full flow**: create doc → rename → edit with all formatting options → upload .txt file → share with other user → switch users → confirm access
- **Confirmed access control**: verified that a document not owned or shared returns 404 (not 403, to avoid leaking existence)
- **Ran the test suite**: `npm test` passes 9/9 utility tests
- **Verified deployment**: pushed to Vercel, ran `db:push` and `db:seed`, confirmed live URL works end-to-end

---

## Reflection

AI was most valuable as a **boilerplate eliminator** — scaffolding the structural code that follows predictable patterns (API routes, Prisma queries, Tailwind layouts). The judgment calls it cannot make: what to cut, how to handle edge cases in the editor focus model, and how to structure the UX so sharing feels intuitive rather than bolted on. Those required human review and iteration.

The goal wasn't to outsource the build — it was to compress the low-value implementation time so I could spend more on product thinking and correctness verification.
