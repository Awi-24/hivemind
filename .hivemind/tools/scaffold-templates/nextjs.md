# Scaffold Template: Next.js 14+ (App Router)

> Triggered by `/scaffold nextjs --name <name>`

## Directory Structure

```
<name>/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── (routes)/
│       └── [feature]/
│           ├── page.tsx
│           └── loading.tsx
├── components/
│   ├── ui/              ← shadcn/ui or custom primitives
│   └── features/        ← feature-specific components
├── lib/
│   ├── api.ts           ← API client (fetch wrapper)
│   ├── auth.ts          ← auth helpers
│   └── utils.ts
├── hooks/               ← custom React hooks
├── types/               ← shared TypeScript types
├── public/
├── .env.example
├── .env.local           ← gitignored
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

## Key Files

### `app/layout.tsx`
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "<name>",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### `.env.example`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
AUTH_SECRET=
DATABASE_URL=
```

## Conventions
- Use Server Components by default; add `"use client"` only when needed
- Route handlers in `app/api/<route>/route.ts`
- Data fetching in Server Components, not in client hooks
- Forms use Server Actions or API routes — not direct client fetch
