This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Assistant

The site has two Claude-powered tools for recruiters, both answering only from `src/content/profile.ts`:

- `POST /api/chat` streams short answers to questions about Jonathan (Claude Haiku 5.5, low effort).
- `POST /api/fit` reads a pasted job description and returns a structured fit report (Claude Sonnet 5.5, medium effort, structured output, server-side refusal fallback).

Request and response shapes live in `src/lib/assistant/contract.ts`; model settings are in `src/lib/assistant/models.ts`. The system prompt is generated from the profile file, so updating the profile updates what the assistant knows.

Setup: copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`. Without a key both endpoints return 503 and the rest of the site still works.

Cost protection: requests are capped at 32 KB, and each client IP gets 20 chat turns per 5 minutes and 5 fit checks per 10 minutes. The limiter is in memory per server instance, so it is best-effort; add platform firewall rules or a shared store if the endpoints get abused.
