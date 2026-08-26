---
name: a11y-debugging
description: Uses Chrome DevTools MCP for accessibility (a11y) debugging and auditing based on web.dev guidelines. Use when testing semantic HTML, ARIA labels, focus states, keyboard navigation, tap targets, and color contrast.
---

# Accessibility & Dark Mode Ergonomics Guide (MyEdu)
*Standards based on Addy Osmani (Google Chrome Team) & WCAG 2.1 AA.*

## 1. Key Verification Pillars
1. **Keyboard Accessibility:**
   - Global shortcuts: Space (Play/Pause), Left/Right Arrow (Seek 5s), F (Fullscreen), N (Next), P (Prev).
   - Ensure all modal dialogs trap focus and can be dismissed via `Escape`.
2. **Dark Theme Contrast (#0b0f19):**
   - High-contrast text: Primary text `text-slate-100` / `text-white` (contrast ratio > 7:1).
   - Secondary text: `text-slate-400` (contrast ratio > 4.5:1).
   - Interactive focus states: `focus:ring-2 focus:ring-cyan-400 focus:outline-none`.
3. **Touch Targets for iPad / Mobile:**
   - Minimum tap area of 44x44 CSS pixels for all video player buttons and chapter navigation icons.
4. **ARIA & Screen Readers:**
   - All icon-only buttons must have `aria-label` or `title` tags (e.g. `aria-label="Đóng cửa sổ"`, `aria-label="Thử lại nạp video"`).
