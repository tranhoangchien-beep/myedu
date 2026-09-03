---
tokens:
  colors:
    background: "#09090b"
    foreground: "#fafafa"
    card: "#121215"
    cardForeground: "#fafafa"
    primary: "#3b82f6"
    primaryForeground: "#ffffff"
    secondary: "#27272a"
    secondaryForeground: "#fafafa"
    muted: "#27272a"
    mutedForeground: "#a1a1aa"
    accent: "#3b82f6"
    border: "#27272a"
  typography:
    fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontMono: "'SF Mono', Monaco, Consolas, monospace"
  spacing:
    container: "max-w-7xl"
    radius: "0.75rem"
---

# Design Specification: Personal E-Learning Platform

## 1. Rationale & Philosophy
- **Anti-Slop, High-Performance UI**: Phù hợp cho việc học tập trung dài giờ (chống mỏi mắt với Dark Mode Zinc/Slate chuẩn mực).
- **Zero-CLS Video Containers**: Khung player cố định tỷ lệ 16:9 chống giật nhảy màn hình.
- **Tabular Figures**: Toàn bộ mốc thời gian (vd: `04:15 / 28:30`) sử dụng `font-variant-numeric: tabular-nums` để số không bị rung lắc khi video chạy.

## 2. Color Palette
- Background: `#09090b` (Deep Dark Zinc)
- Cards & Surfaces: `#121215` (Elevated Surface)
- Primary Action: `#3b82f6` (Vibrant Electric Blue)
- Success State: `#10b981` (Emerald Green for completed lessons)
- Warning / Transferring: `#f59e0b` (Amber for sync queue)

## 3. Responsive Breakpoints
- **Mobile (< 768px)**: Stacked single column, full-width player, swipeable tabs.
- **Tablet (768px - 1024px)**: Optimized split-view for iPad landscape.
- **Desktop (> 1024px)**: 2:1 Split Grid (Player & Timeline Notes on left, Curriculum Sidebar on right).
