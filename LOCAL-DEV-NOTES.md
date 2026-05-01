> Scratch notes — canonical plan lives in [QA_PLAN.md §7 PHASE PLAN](QA_PLAN.md#7-phase-plan).

## Local-dev environment quirks (from Phase 1 investigation)

1. middleware.ts does not execute in local dev
   (.next/server/middleware-manifest.json is empty). Legacy
   numeric slug redirects still work because the same logic is
   duplicated in getStaticProps inside src/pages/uxcore/[slug].tsx
   and src/pages/uxcg/[slug].tsx.

   Worth investigating someday: is the duplication intentional
   belt-and-suspenders, or did middleware silently stop working
   and nobody noticed because the duplicate covered for it? If
   middleware is truly broken everywhere, you have one active
   implementation instead of two.

2. / returns 404 in yarn dev because no pages/index.tsx exists
   and middleware's / branch doesn't fire locally. Production
   serves / via deployment infrastructure (reverse proxy or
   similar). Not an app bug — but the local dev experience is
   broken. Consider creating a minimal pages/index.tsx that
   renders a home page so local dev mirrors production.
