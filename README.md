# AjaiaDocs

A lightweight collaborative document editor. Create, edit, upload, and share documents in the browser.

## Tech Stack

- **Next.js 14** (App Router) — full-stack framework
- **Tiptap** — rich text editor (Bold, Italic, Underline, H1–H3, Bullet/Ordered Lists)
- **Prisma** + **PostgreSQL** — persistence
- **Tailwind CSS** — styling
- **Vercel** — deployment

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd ajaia-docs
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

> Use [Neon](https://neon.tech) or Vercel Postgres for a free hosted Postgres instance.

### 3. Set up the database

```bash
npm run db:push    # push schema to database
npm run db:seed    # create seeded users
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test Accounts

No login required. Use the user switcher in the top-right header.

| Name | Email |
|------|-------|
| Alice Chen | alice@ajaia.dev |
| Bob Smith | bob@ajaia.dev |

**To test sharing:** Log in as Alice, create a document, click Share, enter `bob@ajaia.dev`. Switch to Bob in the header — the document appears in "Shared with Me."

## File Upload

Supported: `.txt` and `.md` only. Files are converted to editable documents — each line becomes a paragraph. `.docx` and `.pdf` are not supported.

## Run Tests

```bash
npm test
```

## Deployment

Push to GitHub and import to [Vercel](https://vercel.com). Add `DATABASE_URL` as an environment variable. After first deploy, run seed via Vercel CLI:

```bash
npx vercel env pull .env.local
npm run db:seed
```

## What's Not Included

- Real-time collaboration (WebSockets) — out of scope for timebox
- `.docx` parsing — would require a library (mammoth.js); noted as next priority
- Role-based permissions (viewer vs editor) — sharing currently grants edit access
- Document version history
