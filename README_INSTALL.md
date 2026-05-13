# README_INSTALL.md — Setup Guide
# Run this once when starting any new website project with this system.

---

## What This Kit Contains

```
CLAUDE.md                              ← Master orchestration (read first, always)
WEBSITE_CONTEXT.md                     ← Fill per project before building
product-marketing-context.md          ← Fill per project for copy & marketing skills
SECURITY.md                           ← Security checklist (review before every commit)
README_INSTALL.md                     ← This file

.claude/skills/
├── luxury-highticket/SKILL.md        ← Luxury design patterns (auto-activates)
├── security-guard/SKILL.md           ← Security patterns (auto-activates on API routes)
├── stack-config/SKILL.md             ← Stack setup & config (auto-activates on setup tasks)
└── conversion-engine/SKILL.md        ← Copy & CRO patterns (auto-activates on copy tasks)
```

---

## Step 1 — Install External Skills via Claude Code

Open Claude Code in your project directory and run:

```bash
# Official Anthropic marketplace
/plugin marketplace add anthropics/skills

# Install official Anthropic skills
/plugin install example-skills@anthropic-agent-skills

# Then install individual skills via CLI:
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/anthropics/skills --skill webapp-testing

# Vercel quality layer
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add https://github.com/vercel-labs/agent-skills --skill composition-patterns

# Build methodology
npx skills add obra/superpowers

# Marketing & conversion (selective install)
npx skills add coreyhaines31/marketingskills --skill copywriting page-cro email-sequence cold-email seo-audit ai-seo

# Research (optional — requires free Firecrawl API key)
npx -y firecrawl-cli@latest init --all --browser
```

---

## Step 2 — Copy Custom Skills to Claude's Skills Directory

The `.claude/skills/` folder in this kit are your project-level skills.
They are automatically picked up by Claude Code when you're in this project directory.

No additional installation needed — they activate when relevant.

To make them available across ALL your projects (personal scope):

```bash
cp -r .claude/skills/luxury-highticket ~/.claude/skills/
cp -r .claude/skills/security-guard ~/.claude/skills/
cp -r .claude/skills/stack-config ~/.claude/skills/
cp -r .claude/skills/conversion-engine ~/.claude/skills/
```

---

## Step 3 — Fill in the Context Files

Before starting any website build:

1. **Open `WEBSITE_CONTEXT.md`**
   Fill in every section. The more detail, the better the output.
   Claude will not build without this file completed.

2. **Open `product-marketing-context.md`**
   Fill in the product, customer, positioning, and messaging sections.
   This drives all copy and marketing skill outputs.

---

## Step 4 — Start the Build

With Claude Code open in the project directory, start with:

```
Read WEBSITE_CONTEXT.md and product-marketing-context.md completely.
Then run /brainstorm to confirm your understanding before we start building.
```

Claude will confirm understanding, surface any ambiguities, then run `/write-plan`
to produce the full build plan before touching any code.

---

## Skill Activation Reference

You don't need to explicitly invoke skills — they activate automatically.
But you can also trigger them manually if needed:

| Task | Auto-activates | Manual trigger |
|---|---|---|
| Any UI component or page | `frontend-design`, `luxury-highticket` | "Use the luxury-highticket skill" |
| Any API route | `security-guard` | "Apply security patterns" |
| Project setup | `stack-config` | "Set up the project stack" |
| Any copy section | `conversion-engine`, `marketingskills` | "Apply conversion copy patterns" |
| Code review | `web-design-guidelines`, `react-best-practices` | "Review this component" |
| Browser QA | `webapp-testing` | "Test the booking flow" |
| Planning | `superpowers` | "/brainstorm or /write-plan" |

---

## Folder Structure After Init

After running `pnpm create next-app` with the stack-config skill, you should have:

```
/
├── CLAUDE.md
├── WEBSITE_CONTEXT.md
├── product-marketing-context.md
├── SECURITY.md
├── README_INSTALL.md
├── .claude/skills/          ← Custom skills
├── .env.local               ← Your secrets (never commit)
├── .env.example             ← Committed template (no values)
├── .gitignore
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── store/
│   ├── types/
│   ├── hooks/
│   └── styles/
├── sanity/
├── public/
│   └── fonts/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Per-Project Workflow

For every new website:

1. Copy this entire kit to the new project folder
2. Fill in `WEBSITE_CONTEXT.md` and `product-marketing-context.md`
3. Run Step 1 (external skills) if on a new machine
4. Run `pnpm create next-app` → Claude's `stack-config` skill handles the rest
5. Tell Claude: "Read the context files and start the build with /brainstorm"
6. Review SECURITY.md before every commit
7. Run webapp-testing skill before every deployment

---

## Quick Reference — Key Commands

```bash
# Start fresh session
"Read WEBSITE_CONTEXT.md and product-marketing-context.md, then /brainstorm"

# Build a specific section
"Build the hero section using the luxury-highticket and conversion-engine skills"

# Security check before commit  
"Run a security review against SECURITY.md before I commit"

# QA a flow
"Use webapp-testing to test the booking and contact form flows"

# Copy review
"Review all page copy using the conversion-engine skill checklist"

# Performance check
"Review this component against vercel-react-best-practices"
```
