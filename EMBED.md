# Embedding the Cost Savings Calculator

Two lines of HTML, wherever the calculator should appear on the page:

```html
<div id="eastern-calculator"></div>
<script src="https://YOUR-APP-DOMAIN/embed.js" async></script>
```

Replace `YOUR-APP-DOMAIN` with the calculator's live domain. The exact snippet,
with the domain already filled in, is on the **Sessions** tab of `/admin`.

That is the whole integration — no keys, no API set-up, nothing to configure on
the website side.

## What it does

`embed.js` inserts an iframe into `#eastern-calculator` and keeps its height in
step with the content, so the calculator never scrolls inside its own box and
never leaves a gap underneath. It is plain JavaScript with no dependencies and
does not touch anything else on the page.

The calculator inherits the page width, so put the `<div>` inside whatever
container the page layout already uses. It is responsive down to mobile.

## Options

Set these on the `<script>` tag:

| Attribute | Effect |
| --- | --- |
| `data-target="#my-container"` | Mount somewhere other than `#eastern-calculator` |
| `data-heading="0"` | Hide the calculator's own title and intro line, if the page already has its own heading |

Example:

```html
<div class="page-section"></div>
<script src="https://YOUR-APP-DOMAIN/embed.js"
        data-target=".page-section"
        data-heading="0"
        async></script>
```

## What the visitor sees

1. Company name and industry. Choosing an industry pre-fills a typical
   inventory for that sector.
2. Their current extinguisher quantities. The matching P50 quantities are
   calculated automatically and shown alongside, read-only.
3. Their savings, defaulting to a 10-year comparison, with a chart, a
   break-even point and the CO2 reduction. A short form offers a full report,
   which is what captures the lead.

## Where the leads go

Every submission from the embedded calculator is filed under the **Website**
session, visible in the Sessions tab of `/admin` with a running lead count.
Leads also appear in **All Leads** with `Website` in the Session column, and in
the CSV export.

Pricing, lifespans, service charges and CO2 figures stay editable in the
**Settings** tab after the calculator is embedded. Changes take effect on the
website immediately — no code change and no redeploy.

## Security

- The website page contains only the two lines above. No database URL, no keys,
  no credentials of any kind.
- The browser never talks to Supabase. Every read and write goes through this
  app's server-side API routes using the service role key, which stays on the
  server.
- The lead endpoints reject cross-origin requests, rate-limit by IP, and
  validate and cap every field before it reaches the database.
- Row-level security is on for all tables and the anon role has no policies, so
  the tables are unreachable except through the service role.

### Restricting who can embed it

By default any site can iframe `/embed`. To lock it to Eastern's domains, set
this environment variable in Vercel and redeploy:

```
EMBED_ALLOWED_ORIGINS=https://easternextinguishers.co.uk,https://www.easternextinguishers.co.uk
```

Include any staging domain the site is built on, or embedding will be blocked
there. The calculator holds no visitor-specific data, so leaving this unset is
not a data risk — it only stops other sites from putting it on their pages.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (server-side only) |
| `SUPABASE_SERVICE_KEY` | Service role key — must never be exposed to the browser |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `EXPORT_SECRET` | Token issued after admin login, used by the admin API routes |
| `EMBED_ALLOWED_ORIGINS` | Optional. Domains allowed to iframe the calculator |

The old `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
variables are no longer used by the app and can be deleted from Vercel.
`SUPABASE_URL` falls back to `NEXT_PUBLIC_SUPABASE_URL` if it is not set, so
deploys keep working either way.

## Database set-up

Run `supabase/migrations/20260726_website_embed.sql` once in the Supabase SQL
editor. It seeds the Website session, adds the indexes the session queries
need, and enables row-level security on all three tables.
