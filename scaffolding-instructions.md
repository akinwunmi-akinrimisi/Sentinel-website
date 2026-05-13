Here's the complete scaffolding sequence — run in order:

---

## 1. Create the Project

```bash
pnpm create next-app@latest my-project \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

cd my-project
```

---

## 2. Install All Dependencies

```bash
# Core
pnpm add framer-motion gsap zustand

# Forms & Validation
pnpm add react-hook-form @hookform/resolvers zod

# Sanity CMS
pnpm add @sanity/client @sanity/image-url next-sanity

# Stripe & Payments
pnpm add stripe @stripe/stripe-js

# Rate Limiting
pnpm add @upstash/ratelimit @vercel/kv

# Email
pnpm add resend

# Analytics
pnpm add @next/third-parties

# Auth (if needed)
pnpm add next-auth@beta

# UI Utilities
pnpm add clsx tailwind-merge class-variance-authority lucide-react

# Dev
pnpm add -D prettier prettier-plugin-tailwindcss \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  tailwindcss-animate
```

---

## 3. Initialize shadcn/ui

```bash
pnpm dlx shadcn@latest init
# Choose: Default style, CSS variables: yes
```

```bash
# Install component set
pnpm dlx shadcn@latest add \
  button input textarea label select \
  dialog accordion card badge separator \
  form toast sonner sheet \
  navigation-menu dropdown-menu
```

---

## 4. Initialize Sanity

```bash
pnpm create sanity@latest -- \
  --template clean \
  --output-path sanity

# Follow prompts: login, create/select project, name dataset "production"
```

---

## 5. Set Up Folder Structure

```bash
# Create all needed directories
mkdir -p src/components/{ui,sections,forms,layout}
mkdir -p src/lib/{sanity,stripe,analytics}
mkdir -p src/store
mkdir -p src/types
mkdir -p src/hooks
mkdir -p public/fonts
mkdir -p sanity/schemas
```

---

## 6. Create .env.local

```bash
cp .env.example .env.local
# Then fill in your values from WEBSITE_CONTEXT.md
```

---

## 7. Install Claude Code Skills

```bash
# Add official Anthropic marketplace (run inside Claude Code)
/plugin marketplace add anthropics/skills

# Then in terminal:
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/anthropics/skills --skill webapp-testing
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add https://github.com/vercel-labs/agent-skills --skill composition-patterns
npx skills add obra/superpowers
npx skills add coreyhaines31/marketingskills --skill copywriting page-cro email-sequence seo-audit
```

---

## 8. Copy Kit Files Into Project

```bash
# From wherever you saved the kit
cp CLAUDE.md ./
cp WEBSITE_CONTEXT.md ./
cp product-marketing-context.md ./
cp SECURITY.md ./
cp README_INSTALL.md ./
cp -r .claude ./
```

---

## 9. Verify Everything

```bash
pnpm dev        # Should run on localhost:3000 with no errors
pnpm build      # Confirm clean build before writing any code
pnpm audit      # Zero high/critical vulnerabilities
```

---

## 10. Start the Build

Open Claude Code in the project directory:

```
Read WEBSITE_CONTEXT.md and product-marketing-context.md fully.
Then /brainstorm before writing any code.
```

---

That's it. Steps 1–9 take about 10–15 minutes. After that, Claude Code has full context and all skills loaded — every session from that point is just filling in `WEBSITE_CONTEXT.md` for the new site and saying go.