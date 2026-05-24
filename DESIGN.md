# Pomodoro Design System

A focused, warm, mac-native design system for a desktop Pomodoro timer with local-first session storage and on-demand Notion sync via Claude MCP.

## Product

A single-window Pomodoro timer for macOS, built as a web app (React + Vite + TypeScript on the front; FastAPI + SQLite on the back). The product is built around three core surfaces inside one window:

- **The Ring** — a large circular SVG timer with three modes (Focus 25m, Short Break 5m, Long Break 15m). Click-to-edit duration. Pom dots underneath count completed cycles. Ring color shifts per mode.
- **The Session Form** — what are you working on? Tag a category (Work · Study · Creative · Personal · Other), add notes, save when done.
- **The History Panel** — a live, scrollable list of past sessions on the right side, with time-ago labels, pomodoro counts, and a quiet **N** badge on rows already synced to Notion.

The whole thing fits in one viewport, never scrolls beyond the history panel, and ships with both a dark and a light theme.

## Content Fundamentals

The product's voice is **quiet, calm, second-person, and lower-case-ish**. It treats the user as a focused adult who knows what a pomodoro is and doesn't need to be sold on focus.

**Voice characteristics**

- **Second person, never "we"** — the app talks _to_ you, never about itself. `"What are you working on?"`, `"No sessions yet. Complete your first pomodoro!"`.
- **Short. Declarative.** — labels are 1–3 words. Sentences are short. Periods are rare except in inline copy.
- **Imperative for hints** — `CLICK TO EDIT`, `SET`, `CANCEL`, `Save Session`. No "please".
- **All-caps for labels, sentence-case for prose** — section labels (`CURRENT SESSION`, `SESSION HISTORY`, `DONE`, `FOCUS`, `SHORT BREAK`) are uppercase with wide tracking. Body copy is sentence case.
- **Status copy is single words** — `Completed`, `Interrupted`, `Saving…`, `Saved`. Never `"Your session was saved successfully!"`.
- **Error copy is direct, not apologetic** — `Backend offline. Start the FastAPI server.` `✗ Save failed — retry`. No "Oops!", no "Something went wrong".
- **Numbers and units stay tight** — `25m`, `4 🍅`, `2h ago`, `100m`. No spaces between number and unit; never "minutes" written out.

**Copy samples**

| Surface | Copy |
|---|---|
| Logo wordmark | `POMODORO` |
| Status pill | `Notion sync active` |
| Mode tabs | `FOCUS` · `SHORT BREAK` · `LONG BREAK` |
| Timer hint (hover) | `CLICK TO EDIT` |
| Form section label | `CURRENT SESSION` |
| Task input placeholder | `What are you working on?` |
| Notes placeholder | `Notes (optional)` |
| Primary CTA | `Save Session` |
| Disabled CTA | `Pause timer to save` |
| Save success | `✓ Session saved` |
| Save error | `✗ Save failed — retry` |
| Empty history | `No sessions yet.\nComplete your first pomodoro!` |
| Sync hint | `3 unsynced — ask Claude: "Sync my sessions to Notion"` |
| Counter label | `DONE` |
| Backend error | `Backend offline.\nStart the FastAPI server.` |

## Visual Foundations

The aesthetic is **warm-industrial**: cream-paper light theme, deep-charcoal dark theme, a single saturated terracotta accent, and monospaced numerals that feel like a kitchen timer's LCD readout. No gradients, no glassmorphism, no soft shadows. Edges are crisp.

### Color

All tokens are CSS custom properties defined in `frontend/src/index.css`.

- **Single global accent** — terracotta orange. `#d85a14` in light, `#e8621a` in dark. Used for the form, save button, focus borders, and the history-item left edge stripe.
- **Per-mode timer colors** — the ring, active mode tab, play button, and pom dots read `--mode-current`, which is set by `data-mode` on `<html>`:

  | Mode | Dark | Light | Vibe |
  |---|---|---|---|
  | Focus (25m) | `#e8621a` | `#d85a14` | terracotta — energetic, work |
  | Short Break (5m) | `#3aa674` | `#2d8f5f` | sage green — restful |
  | Long Break (15m) | `#3b82f6` | `#2563eb` | calm blue — deep rest |

- **Warm neutrals, not gray** — light theme backgrounds are `#f5f2ee` (paper) and `#ece8e3` (sidebar). Dark theme is near-black (`#0c0c0c`, `#141414`, `#1c1c1c`).
- **Borders are translucent** — `rgba(255,255,255,0.08)` in dark, `rgba(0,0,0,0.08)` in light.
- **Category palette** — Work `#ff6b35`, Study `#9575cd`, Creative `#f7934c`, Personal `#4caf50`, Other `#78909c`.
- **Status colors** — completed `#22c55e`, interrupted `#e57373`, sync-pending `#f59e0b`.

### Type

- **Two families.** `Azeret Mono` (Google Fonts) for all numerals and the timer; system sans (`-apple-system`, `Inter`, `SF Pro Text`) for everything else.
- **Tabular nums everywhere** — `font-variant-numeric: tabular-nums` on counters and the ring.
- **Labels are uppercase + tracked + 700** — `10–11px`, `letter-spacing: 0.10–0.13em`, weight 700.
- **Timer is `52px / weight 200`** with `0.03em` tracking — loudest thing on screen.

### Layout

- **Two-column, fixed.** Left panel grows; right panel is `340px` of session history.
- **The window does not scroll.** Body is `overflow: hidden`. Only the left panel and history list scroll internally.
- **Cards span their column.** Session form is `max-width: 580px`.

### Corner Radii

| Use | Value |
|---|---|
| Badges, SET/CANCEL buttons | 4–5px |
| Inputs, textareas, save button | 6–8px |
| History items, mode-tabs container | 9–10px |
| Session-form card | 13px |
| Category tag pills | 20px (capsule) |
| Icon buttons, theme toggle, ring dots, play button | 50% |

### Borders, Shadows, Surfaces

- **No `box-shadow`** except the badge dot's `0 0 6px rgba(34,197,94,0.6)` halo.
- **History items have a 3px terracotta left edge** — the visual signature of the panel.
- **Inputs darken on focus with the accent.** `border-color: var(--accent)` on `:focus`. No glow.

### Motion

- **Universal 250ms ease transitions** on `background-color`, `border-color`, `color`, and `opacity`.
- **Ring arc**: `transition: stroke-dashoffset 0.6s ease` — slightly longer so it feels deliberate.
- **Session completion**: 5-second two-tone chime (A5 + E6, 5 cycles) via Web Audio API; ring pulses with `complete-flash` animation for the same 5 seconds, then auto-resets.
- **Badge dot blink**: `@keyframes blink` — opacity 1 → 0.35 → 1 over 2.4s.
- **Buttons scale on press**: `transform: scale(1.04)` hover, `scale(0.97)` active on the play button.

## Iconography

- **Inline SVGs, `currentColor`.** Reset (circular arrow), play (solid triangle), pause (two rounded bars) — all drawn inline, `stroke-width: 2`, Lucide stroke style.
- **No icon font, no sprite, no third-party library.**
- **Emoji as content** — 🍅 is the brand mark and pomodoro counter. 🌙/☀️ on the theme toggle. ⚠ flags backend errors.
- **For new icons**, match Lucide style (24×24 viewBox, 2px stroke, round caps, `currentColor` only).
