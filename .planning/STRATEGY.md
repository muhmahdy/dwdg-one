# DWDG’ONE delivery strategy

5 October 2026. Read this before taking any task. The planning source of truth remains `.planning/dwdg-one-prd/state/planning-workspace.json` (see `.planning/dwdg-one-prd/AI_EDITING.md`).

## Roles

| Who | Owns |
|---|---|
| Product owner (the user) | Scope approval, organization/policy decisions, go/no-go |
| Claude (Opus) — lead | Architecture, data model, security design, all UI/UX and the design system, iteration specs, reviewing every delegated result before a card reaches Done |
| ChatGPT (desktop, delegate) | Only tasks handed over in a written brief: implementation from a spec, repetitive edits, Indonesian strings, fixtures, test runs, data clean-up |

**UI/UX is never delegated** (product-owner rule): no screen design, layout, styling, CSS, component markup, design tokens, copy tone or interaction behavior goes to the delegate — not even "from a spec". The delegate may wire data/logic behind UI that Claude has built.

The delegate never changes scope, priorities, architecture, design tokens or card decisions on its own. When a brief is ambiguous it stops and reports instead of guessing.

## The loop (one iteration at a time)

1. **Decide** — the product owner answers a short ranked list of questions.
2. **Spec** — Claude writes the spec and acceptance for one thin slice.
3. **Build** — Claude or the delegate implements it.
4. **Review** — Claude reviews code and rendered UI.
5. **Record** — cards move via `planner-cli.mjs` with evidence. The delegate may move cards to `review` only; Claude/product owner move them to `done`.

## Token rules

- Never read the 1.2 MB workspace JSON whole; use `planner-cli.mjs list …` or small node queries for the cards in scope.
- Touch only the current iteration's cards and files.
- Decisions are recorded in the workspace once and not re-argued.
- Every write goes through `planner-cli.mjs` with an actor label (`Claude`, `ChatGPT`) and a summary.

## Iterations

| # | Goal | Lead |
|---|---|---|
| 0 | Scope triage: define the top-level first version, rank open decisions, sync board with reality | Claude |
| 1 | UX foundations: information architecture, key user flows, low-fidelity wireframes of the first-version screens (from `.planning/REFERENCE_DIGEST.md`) | Claude |
| 2 | Visual design: 3 directions → chosen direction → design system v2 → high-fidelity key screens | Claude |
| 2b | Architecture decision record (in parallel with 2): stack within Rp35k/month, data model, auth/permission boundary | Claude |
| 3+ | Build slices of the top-level version, each verified before the next | Claude + delegate |

## Top-level first version (approved 5 Oct 2026 — see `DECISIONS.md`)

A thin but real app for ~40 members, before any division-specific workflow.

**In:** invite-only Google sign-in with Admin/Director/Member roles; persistent shell and navigation; My Work with own tasks; projects register and project page; resources (notes + external links, no uploads); **meeting scheduler with member availability**; English/Indonesian and light/dark; minimal export/backup; free-tier hosting with separate test and production.

**Mapped WBS:** W001, W010–W013, W015–W018, W020, W021, W022–W024, W028, W031, W033, W035, W036, W040 (minimal), W067, W069, W071 (minimal), W074 (minimal), W078, W084 (re-scoped: prototype review, not a live pilot).

**Division coverage:** division workflows are later scope, but `ux/DIVISION_PATTERNS.md` lists the 15 patterns the design system must already contain so they slot in without redesign.

**Milestone order:** (1) clickable front-end prototype with demo data for ~40 members → product-owner review → (2) real build of the same slice. No deployment to the organization until the owner decides.

**Later (re-prioritized, not deleted):** division workflows W044–W066, shared-task consent W029–W030, scheduling W018/W035–W036, updates W037, Changes W038, search W039, import/restore W041, metrics W042, and the remaining operations/verification gates scaled to the slice.
