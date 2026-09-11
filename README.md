Mobile-first app where a parent creates a short adventure for their kids, and an AI Game Master runs it.

## Local development

Setup the environment:

Make a copy of `.env.example` to `.env` and update the values.

```bash
ANTHROPIC=anthropic_api_key

SUPABASE_URL=supabase_project_url
SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

Install dependencies:
```bash
pnpm install
```

Run the development server:
```bash
pnpm dev
```