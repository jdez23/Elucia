# Elucia — Claude Visual Language Restyle

**Date:** 2026-04-27  
**Scope:** Visual language only — layout/structure unchanged  
**Approach:** Token-first (Option A)

---

## Goal

Apply Claude.ai's visual language to Elucia: cooler neutral background, white card treatment with subtle shadows, Inter replacing DM Mono as the body font, and a unified blue/indigo gradient accent replacing the current monochrome ink accents.

---

## Design Tokens (`globals.css`)

### Background palette
| Token | Old | New | Notes |
|---|---|---|---|
| `--cream` | `#f5f0e8` | `#F5F4F1` | Less yellow, Claude's bg feel |
| `--cream-dark` | `#ebe4d8` | `#EEEDEA` | Subtle fills, chips |
| `--cream-deep` | `#ddd5c5` | `#E4E3DF` | Hover states |

### Accent system
| Token | Old | New |
|---|---|---|
| `--bio-teal` | `#1a1714` (ink) | `#0ea5e9` (sky blue) |
| `--bio-gradient` | ink→ink | `linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)` |
| `--bio-teal-soft` | `rgba(26,23,20,0.08)` | `rgba(14,165,233,0.10)` |
| `--bio-teal-glow` | `rgba(26,23,20,0.15)` | `rgba(99,102,241,0.20)` |
| `--bio-teal-luminous` | `rgba(26,23,20,0.3)` | `rgba(14,165,233,0.35)` |

### Font
- Import `Inter` via `next/font/google` in `layout.tsx`
- Inject as `--font-sans` CSS variable
- `body` font-family → `var(--font-sans), system-ui, sans-serif`
- `font-mono` (DM Mono) retained only for: micro-labels (all-caps), keyboard hints, code blocks in chat

---

## Card Treatment

All cards switch from cream fills to white with shadow:

```
background: #ffffff
box-shadow: 0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)
border: none  (remove existing 1px border where applicable)
```

Affected: instrument carousel cards, quick chat box, suggested prompt cards, feature bullet box.

---

## Accent Unification Sweep

Components that need hardcoded accent updates (tokens alone won't reach):

| Component | Change |
|---|---|
| `ChatPanel` send button | `background: var(--bio-gradient)` (was `var(--bio-teal)` = ink) |
| User chat bubble | `background: var(--bio-gradient)` (was solid `var(--bio-teal)` = ink) |
| All input focus rings | `box-shadow: 0 0 0 3px rgba(14,165,233,0.20)` |
| Active instrument selector pill | `background: var(--bio-teal)` (now sky blue) |
| `HomeQuickChat` send button | Already uses gradient — verify shadow tokens update |
| `ChatPanel` textarea focus | Update to blue glow |

---

## Font Sweep

Components using `font-mono` for body/interactive text that should switch to Inter (body default):

- `ChatPanel`: prompt chip labels, empty state description
- `HomeQuickChat`: textarea placeholder (inherits), instrument selector labels
- `InstrumentHub`: suggested prompt body text, feature bullet text, description
- `InstrumentCarousel`: info strip manufacturer/name (already display font for name)

`font-mono` stays on: "GROUNDED IN THE OFFICIAL MANUAL", micro-caps labels, letter-spaced category badges.

---

## Files Changed

1. `frontend/app/globals.css` — token updates + body font-family
2. `frontend/app/layout.tsx` — Inter import via next/font/google
3. `frontend/components/ChatPanel.tsx` — send button gradient, user bubble gradient, focus ring, font-mono → default sweep
4. `frontend/components/MessageBubble.tsx` — user bubble gradient
5. `frontend/components/HomeQuickChat.tsx` — verify gradient tokens reach send button, font sweep
6. `frontend/components/InstrumentCarousel.tsx` — card white+shadow, active accent
7. `frontend/components/InstrumentHub.tsx` — card/box white+shadow, font sweep

---

## Out of Scope

- Layout restructuring (panels, carousel, navigation)
- Claude's terracotta accent color (user keeping own palette)
- Auth page changes (login/signup)
- Any new components or features
