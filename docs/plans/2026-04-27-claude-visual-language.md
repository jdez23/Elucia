# Claude Visual Language Restyle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply Claude.ai's visual language (cooler neutral bg, white cards with shadows, Inter font, unified blue/indigo accent) to all Elucia pages while keeping the existing layout structure.

**Architecture:** Token-first — update CSS variables in `globals.css` so most components update automatically, then do targeted sweeps for hardcoded inline styles that tokens can't reach. Font swap in `layout.tsx` adds Inter alongside existing fonts.

**Tech Stack:** Next.js 14, Tailwind CSS, `next/font/google` (Inter), inline React styles + CSS variables.

**Design doc:** `docs/plans/2026-04-27-claude-visual-language-design.md`

---

## Task 1: Add Inter font + update design tokens

**Files:**
- Modify: `frontend/app/layout.tsx`
- Modify: `frontend/app/globals.css`

**Step 1: Add Inter to layout.tsx**

Replace the font imports section (lines 2–18):

```tsx
import { Instrument_Serif, DM_Mono, Inter } from 'next/font/google'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-mono',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
})
```

Update the `<html>` className to include `inter.variable`:

```tsx
<html lang="en" className={`${instrumentSerif.variable} ${dmMono.variable} ${inter.variable}`}>
```

**Step 2: Update design tokens in globals.css**

In the `:root` block, replace the following:

```css
/* Background — cooler neutral, less parchment yellow */
--cream: #F5F4F1;
--cream-dark: #EEEDEA;
--cream-deep: #E4E3DF;

/* Accent — blue/indigo gradient system */
--bio-teal: #0ea5e9;
--bio-teal-bright: #6366f1;
--bio-cyan: #0ea5e9;
--bio-green: #0ea5e9;
--bio-blue: #6366f1;
--bio-gradient: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
--bio-gradient-soft: linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(99,102,241,0.12) 100%);

--bio-teal-soft: rgba(14, 165, 233, 0.10);
--bio-teal-glow: rgba(99, 102, 241, 0.20);
--bio-teal-luminous: rgba(14, 165, 233, 0.35);
--bio-blue-soft: rgba(14, 165, 233, 0.08);
--bio-cyan-soft: rgba(99, 102, 241, 0.08);
```

Update the body font-family in the `body` rule:

```css
body {
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-sans), system-ui, sans-serif;
  font-weight: 400;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}
```

**Step 3: Verify in browser**

Run the dev server: `cd frontend && npm run dev`

Open `http://localhost:3000`. You should see:
- Background is a cooler, less yellow white
- Body text renders in Inter (rounded, humanist — not monospace)
- DM Mono still applies wherever `font-mono` class is present (micro-labels, hints)

**Step 4: Commit**

```bash
git add frontend/app/layout.tsx frontend/app/globals.css
git commit -m "feat: add Inter font and update design tokens to Claude visual language"
```

---

## Task 2: White card treatment — InstrumentCarousel

**Files:**
- Modify: `frontend/components/InstrumentCarousel.tsx`

**Step 1: Update the card Link style**

Find the `<Link>` element inside the carousel map (around line 113). Replace its `style` prop:

```tsx
style={{
  background: '#ffffff',
  boxShadow: isCenter
    ? '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
    : '0 1px 4px rgba(0,0,0,0.04)',
  cursor: 'pointer',
  transition: 'box-shadow 0.3s',
}}
```

Remove the `border: '1px solid rgba(26,23,20,0.08)'` line — white cards with shadow don't need a border.

**Step 2: Update the active dot color**

The active dot uses `'var(--ink)'` — change to `'var(--bio-teal)'`:

```tsx
background: i === active ? 'var(--bio-teal)' : 'var(--ink-whisper)',
```

**Step 3: Verify in browser**

The center card should look like a clean white card with a soft shadow. Side cards should have a very faint shadow. The active dot should be sky blue.

**Step 4: Commit**

```bash
git add frontend/components/InstrumentCarousel.tsx
git commit -m "feat: white card treatment + blue accent dot in carousel"
```

---

## Task 3: Accent unification — ChatPanel send button + user bubble

**Files:**
- Modify: `frontend/components/ChatPanel.tsx`
- Modify: `frontend/components/MessageBubble.tsx`

**Step 1: Update ChatPanel send button**

Find the send `<button>` (around line 189). Replace its `style`:

```tsx
style={{
  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  color: '#ffffff',
  boxShadow: '0 0 14px rgba(14,165,233,0.40), 0 0 28px rgba(99,102,241,0.20)',
}}
```

Add hover handlers:

```tsx
onMouseEnter={(e) => {
  e.currentTarget.style.boxShadow = '0 0 22px rgba(14,165,233,0.60), 0 0 44px rgba(99,102,241,0.30)'
  e.currentTarget.style.transform = 'scale(1.05)'
}}
onMouseLeave={(e) => {
  e.currentTarget.style.boxShadow = '0 0 14px rgba(14,165,233,0.40), 0 0 28px rgba(99,102,241,0.20)'
  e.currentTarget.style.transform = 'scale(1)'
}}
```

**Step 2: Update ChatPanel textarea focus ring**

Find the `onFocus` handler on the textarea. Replace:

```tsx
onFocus={(e) => {
  e.currentTarget.style.borderColor = '#0ea5e9'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'
}}
onBlur={(e) => {
  e.currentTarget.style.borderColor = 'rgba(26,23,20,0.1)'
  e.currentTarget.style.boxShadow = 'none'
}}
```

**Step 3: Update user chat bubble in MessageBubble.tsx**

Find the user bubble style (the `isUser` branch, around line 25). Replace:

```tsx
{
  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  color: '#ffffff',
  borderBottomRightRadius: '4px',
}
```

**Step 4: Verify in browser**

Navigate to an instrument chat page. Send a message. Your bubble should be the blue/indigo gradient. The send button should glow the same blue/indigo on hover.

**Step 5: Commit**

```bash
git add frontend/components/ChatPanel.tsx frontend/components/MessageBubble.tsx
git commit -m "feat: unify blue/indigo accent on chat send button and user bubbles"
```

---

## Task 4: White card treatment — HomeQuickChat + InstrumentHub

**Files:**
- Modify: `frontend/components/HomeQuickChat.tsx`
- Modify: `frontend/components/InstrumentHub.tsx`

**Step 1: Update HomeQuickChat chat box**

Find the outer chat box `<div>` (around line 88). Replace its `style`:

```tsx
style={{
  background: '#ffffff',
  boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
}}
```

Remove the `border: '1px solid rgba(26,23,20,0.1)'` line.

Find the instrument selector border-bottom `<div>` (around line 97). Keep the `borderBottom` but update the color:

```tsx
style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
```

Find the textarea inside the input row. Update its style:

```tsx
style={{
  fontSize: '14px',
  color: 'var(--ink)',
  background: 'var(--cream-dark)',
  border: '1px solid rgba(0,0,0,0.07)',
}}
```

Update textarea focus/blur handlers:

```tsx
onFocus={(e) => {
  e.currentTarget.style.borderColor = '#0ea5e9'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.12)'
}}
onBlur={(e) => {
  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'
  e.currentTarget.style.boxShadow = 'none'
}}
```

**Step 2: Update InstrumentHub feature bullet box**

Find the feature bullet container `<div>` (around line 200). Replace its `style`:

```tsx
style={{
  background: '#ffffff',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)',
}}
```

Remove the `border: '1px solid rgba(26,23,20,0.07)'` line.

**Step 3: Update InstrumentHub suggested prompt cards**

Find the `<motion.button>` for suggested prompts (around line 141). Update its base style:

```tsx
style={{
  fontSize: '13px',
  color: 'var(--ink-soft)',
  background: '#ffffff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  cursor: 'pointer',
  borderLeft: '2px solid transparent',
}}
```

Update hover handlers:

```tsx
onMouseEnter={(e) => {
  e.currentTarget.style.borderLeftColor = 'var(--bio-teal)'
  e.currentTarget.style.boxShadow = '0 2px 8px rgba(14,165,233,0.12)'
}}
onMouseLeave={(e) => {
  e.currentTarget.style.borderLeftColor = 'transparent'
  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
}}
```

**Step 4: Verify in browser**

Home page quick chat box and instrument hub prompt cards should be clean white with soft shadows. No visible borders.

**Step 5: Commit**

```bash
git add frontend/components/HomeQuickChat.tsx frontend/components/InstrumentHub.tsx
git commit -m "feat: white card treatment for quick chat and instrument hub"
```

---

## Task 5: Font sweep — remove font-mono from body text

**Files:**
- Modify: `frontend/components/ChatPanel.tsx`
- Modify: `frontend/components/HomeQuickChat.tsx`
- Modify: `frontend/components/InstrumentHub.tsx`

**Context:** `font-mono` (DM Mono) should ONLY remain on:
- All-caps micro-labels (`font-mono uppercase`)
- The "GROUNDED IN THE OFFICIAL MANUAL" footer hint
- Code blocks in chat (`<code>` elements)
- Keyboard shortcut hints
- Category badges, manufacturer labels

It should be REMOVED from body/interactive text like prompt descriptions, placeholder text (inherits body), button labels, and feature bullets.

**Step 1: ChatPanel.tsx — empty state description**

Find the empty state `<p>` that says "about the {instrumentName}". Remove `font-mono` from its className. It should inherit Inter from the body.

Find the empty state suggestion prompt buttons. Remove `font-mono` from their className. Keep `font-mono uppercase` only on the label `<span>` inside each button.

**Step 2: HomeQuickChat.tsx — suggestion chips**

Find the suggestion chip `<button>`. Remove `font-mono` from its className.
Keep `font-mono uppercase` on the inner `<span>` with the instrument name prefix.

**Step 3: InstrumentHub.tsx — descriptions and bullets**

Find the `<p>` "Click a question to open the chat..." Remove `font-mono` from className.

Find the suggested prompt `<motion.button>`. Remove `font-mono` from className. Keep `font-mono uppercase` only on the inner label `<span>`.

Find the feature bullet `<p>` elements. Remove `font-mono` from className.

Find the "Start chatting →" fallback button. Remove `font-mono` from className.

Find the mobile sticky "Open Chat →" button. Remove `font-mono uppercase` from className — use regular weight Inter instead.

**Step 4: Verify in browser**

All button labels, descriptions, and body text should render in Inter. Only labels in ALL-CAPS with letter-spacing should remain in DM Mono. The contrast between the two fonts should feel intentional: monospace for metadata/labels, Inter for everything readable.

**Step 5: Commit**

```bash
git add frontend/components/ChatPanel.tsx frontend/components/HomeQuickChat.tsx frontend/components/InstrumentHub.tsx
git commit -m "feat: font sweep — Inter for body/interactive text, DM Mono for micro-labels only"
```

---

## Task 6: Final verification pass

**No file changes — visual QA only.**

**Step 1: Check home page (`/`)**
- [ ] Background is cool warm white (not yellow parchment)
- [ ] Carousel cards are white with shadow, no border
- [ ] Active dot is sky blue
- [ ] Quick chat box is white with shadow
- [ ] Body text (chip labels, textarea placeholder) renders in Inter
- [ ] ALL-CAPS labels (manufacturer prefix, "ASK ABOUT") still in DM Mono

**Step 2: Check instrument detail page (`/instruments/[slug]`)**
- [ ] Feature bullet box is white with shadow
- [ ] Suggested prompt cards are white with shadow, blue left-border on hover
- [ ] Body text renders in Inter
- [ ] Section titles (Instrument Serif italic) unchanged

**Step 3: Check chat page (`/instruments/[slug]/chat`)**
- [ ] User message bubbles are blue/indigo gradient
- [ ] Send button is blue/indigo gradient with glow
- [ ] Textarea focus ring is blue
- [ ] "GROUNDED IN THE OFFICIAL MANUAL" footer hint still DM Mono

**Step 4: Mobile check (Chrome DevTools → iPhone 14 Pro)**
- [ ] Home page carousel cards not clipped
- [ ] Quick chat box full-width, no horizontal scroll
- [ ] Chat page scrolls correctly, send button accessible

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Claude visual language restyle complete"
```
