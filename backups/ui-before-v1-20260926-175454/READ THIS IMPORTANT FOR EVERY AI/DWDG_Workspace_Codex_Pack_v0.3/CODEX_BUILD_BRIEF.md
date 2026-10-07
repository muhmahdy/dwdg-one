# CODEX BUILD BRIEF — v0.3 — READ THIS FIRST

You are implementing **DWDG Workspace**, the internal operating system for DWDG UII.

## Required inputs

Read in this order:

1. `DWDG_Workspace_PRD_Design_System_v0.3.md`
2. `dwdg_design_tokens_v0.3.json`
3. `REFERENCE_MANIFEST.md`
4. inspect the relevant images inside `/references`

## Critical v0.3 architecture decision

There is **one stable DWDG application shell** plus **contextual division workspaces**.

Do not create six unrelated apps.

A member can belong to one division and still inspect other divisions subject to permissions.

Mahdy's primary division is Strategy & Growth, but other workspaces remain visible.

## Personal Home is not a command center

The first viewport should be calm and focused on:

- Needs You
- Today
- My Work

The page may scroll.

Do not force:
- organization map;
- activity heatmap;
- focus donut;
- project pulse;
- calendar;
- dependencies;
- recent activity;

all into the same 1440×900 viewport.

Secondary division context may appear below the fold.

## Division Home is separate

Strategy & Growth gets its own Overview with division-specific information and navigation.

Do not assume an Impact × Certainty matrix is the correct default chart.

First model the real Strategy & Growth workflow, then choose among:
- initiative horizon;
- strategy tree;
- experiment/opportunity pipeline;
- portfolio matrix where genuinely useful.

## Visual ratio

Target normal work screens at approximately:

- 70% restrained operational UI
- 20% useful information visualization
- 10% tactile/material expression

## Material system

### Operational Surface
Plain, warm-neutral, highly legible.

### Tactile Surface
For primary controls. Raised physical depth, subtle specular highlight, pressed compression.

### Prism / Shader Surface
For selected high-value objects only.

Shader requirements:
- soft spectral refraction;
- low-opacity noise/grain;
- subtle rim/specular light;
- optional low-amplitude cursor response;
- no dense text directly over active shader;
- max 2 live shader surfaces per normal desktop viewport;
- max 1 live shader surface per normal mobile viewport;
- pause offscreen;
- respect reduced motion;
- static fallback required;
- WebGL/WebGPU is optional, not mandatory.

The whole app must NOT become glassmorphism or liquid wallpaper.

## Background

Do not use stale pure white.

Use a warm near-white base with very subtle sage/warm radial atmosphere and 1–2% grain.

## Absolute prohibitions

- no generic four-KPI dashboard;
- no card soup;
- no motivational quote/image cards;
- no decorative slogan cards wasting operational space;
- no large generic Quick Access panel;
- no page-wide green wash;
- no stale pure-white-only background;
- no six-rainbow-division scheme;
- no cyberpunk HUD;
- no shader on every card;
- no chart just because it looks visually interesting;
- no default Impact × Certainty chart unless S&G actually uses it;
- no permanent central AI pill;
- no emoji project icons.

## References 50–52

These are **negative/diagnostic references**.
Use them to understand failure modes.
Do not imitate them.

## Priority order

1. usability
2. information hierarchy
3. data legibility
4. design-system consistency
5. DWDG brand
6. interaction quality
7. useful visualization
8. shader/material polish
9. decoration
