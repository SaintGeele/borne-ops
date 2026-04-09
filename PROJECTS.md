# Borne Systems — Projects Inventory

## Active Products

| Project | Path | Status | Notes |
|---------|------|--------|-------|
| AI Co-pilot | `projects/ai-copilot/` | In progress | SaaS landing page, LLC guide, Idea Validator. Design spec in `docs/design-spec.md` |
| CostPilot | `projects/costpilot-plan.md` | Planned | Token tracking + spend optimization skill |
| QuoteHook | `quotehook/` | Planned | AI quote follow-up agent for home service businesses |

## Agent Infrastructure

| Project | Path | Status | Notes |
|---------|------|--------|-------|
| borne-ops | `borne-ops/` | Active | Main working repo. All agent scripts, ops layer, Supabase schema. Git origin |
| agents | `agents/` | Active | 25+ agent scripts organized by department |
| ops layer | `agents/ops/` | Active | `discord-reporter.js` + `OPS_LAYER.md` |

## Web Properties

| Project | Path | Status | Notes |
|---------|------|--------|-------|
| borne-systems-website-v2 | `borne-systems-website-v2/` | Live | Main marketing site |
| borne-systems-website-v2-react | `borne-systems-website-v2-react/` | Old | Archived |
| borne-systems-website | `borne-systems-website/` | Old | Archived |
| borne-products | `borne-products/` | Stale | Needs review |
| borne-social | `borne-social/` | Stale | Needs review |
| borne-premium | `borne-premium/` | Stale | Needs review |

## Client Work

| Project | Path | Status | Notes |
|---------|------|--------|-------|
| Carson Aesthetics | `carson-aesthetics-lead-form.html` | Pending | Medspa, SMS + voice, $297/mo Gold tier |
| Client Portal | `client-portal/` | Stale | Needs review |

## Scattered / Needs Organization

| Project | Path | Status | Notes |
|---------|------|--------|-------|
| saint-ai-command-center | `saint-ai-command-center/` | Unknown | Needs review |
| ai_business-main | `ai_business-main/` | Unknown | Needs review |
| ai_business-prod | `ai_business-prod/` | Unknown | Needs review |
| quotehook | `quotehook/` | Planned | AI quote follow-up agent |
| quotehook-plan | `quotehook-plan.md` | Planned | Spec for QuoteHook |
| ralph-loops | `ralph-loops/` | Unknown | Loops email setup? |
| security | `security/` | Active | Security configs, audits |
| incidents | `incidents/` | Active | Incident reports |
| research | `research/` | Active | Market research |

## Git Repos

| Repo | Remote | Status |
|------|--------|--------|
| borne-ops | origin | Active — main working repo |
| borne-ai-copilot | borne-ai-copilot | Active — AI Co-pilot SaaS |
| openclaw-scripts | openclaw-scripts | Active — published scripts |
| borne-systems | borne-systems | Archived — moved to borne-ops |

## Needs Cleanup

- [ ] Consolidate scattered project folders into `projects/`
- [ ] Review and archive stale website folders (v0-redesign, v2-react, etc.)
- [ ] Consolidate all website code into one location
- [ ] Review `ai_business-main` and `ai_business-prod` — what are these?
- [ ] Review `ralph-loops` — active or stale?
- [ ] Review `saint-ai-command-center`
- [ ] Consolidate all skill code into `skills/` or `borne-ops/skills/`
- [ ] Review `mc-schema.sql` vs `supabase/` — potential duplication
