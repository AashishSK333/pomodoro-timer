---
name: pomodoro-design
description: Use this skill to generate well-branded interfaces and assets for the Pomodoro timer app, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, and component patterns.
user-invocable: true
---

# Pomodoro Design Skill

Read `DESIGN.md` in the repo root for full product context, visual foundations, and iconography rules.

Design tokens (dark + light themes) live in `frontend/src/index.css` as CSS custom properties.
Production components live in `frontend/src/components/` and `frontend/src/hooks/`.

## What's in this skill

- `DESIGN.md` (repo root) — product context, content fundamentals, visual foundations, iconography
- `frontend/src/index.css` — design tokens (dark + light themes, per-mode color cascade)
- `frontend/src/components/` — Timer, SessionForm, SessionHistory
- `frontend/src/hooks/useTimer.ts` — timer logic, completion chime, justCompleted state

## How to use it

1. **Always start from `frontend/src/index.css`** — use the CSS variables. Don't redefine tokens.
2. **For new screens**, copy and adapt components from `frontend/src/components/` rather than redrawing them.
3. **For icons**, use inline SVGs styled with `currentColor` (Lucide stroke style: 24×24, 2px stroke, round caps). Flag any substitution to the user.
4. **Theme switching** is via `data-theme="light"` on `<html>`. Default is dark.
5. **Mode color shifting** is via `data-mode="focus|shortBreak|longBreak"` on `<html>`. Use `var(--mode-current)` for ring, tabs, play button, and pom dots.
6. **Voice** is calm, second-person, lowercase-ish, no marketing speak. See `DESIGN.md → Content Fundamentals`.

## Quick visual rules

- Single terracotta accent: `#e8621a` dark, `#d85a14` light
- Per-mode ring/button color: focus=terracotta, short break=sage green, long break=blue
- Mono `Azeret Mono` for all numerals/timer; sans `Inter`/system for everything else
- Labels are UPPERCASE · 700 · `letter-spacing: 0.13em`
- Borders are translucent (`rgba(255,255,255,0.08)`), no `box-shadow`
- Radii: 4 / 6 / 8 / 10 / 13 / 20 (pill) / 50% (circle)
- Tomato 🍅 is brand mark AND unit of work (`4 🍅` = four pomodoros)
- No marketing illustration; the SVG ring is the only "image" in the app
