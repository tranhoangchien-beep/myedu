---
name: pwa-offline-resilience
description: Progressive Web App (PWA), Service Worker, offline caching, and cross-device ergonomics skill based on Google Web Standards. Use when enhancing offline persistence, PWA manifest configs, iPad/mobile touch controls, or background sync in MyEdu.
---

# PWA & Offline Resilience Guide (MyEdu)
*Standards based on Google Web App standards & PWA best practices.*

## 1. PWA Essentials for MyEdu
MyEdu is designed for seamless cross-device personal learning (Mac, PC, iPad, iPhone, Android):
- **Web App Manifest (`manifest.json`):**
  - `display: "standalone"`
  - `background_color: "#0b0f19"`
  - `theme_color: "#0b0f19"`
  - Responsive icons (192x192, 512x512 with `maskable` support).
- **Service Worker Strategy:**
  - **Cache First / Stale While Revalidate** for static assets (Vite JS bundles, CSS, fonts, SVG icons).
  - **Network First** with fallback to LocalStorage/IndexedDB for course structures and metadata.

---

## 2. Offline Progress Synchronization Pattern
1. When offline, all course progress updates (`lastWatchedLesson`, `completedLessonIds`, playback timestamp) are written immediately to `IndexedDB / LocalStorage`.
2. When the browser fires the `online` event, trigger background synchronization to push pending changes to Cloud Firestore:
```ts
window.addEventListener('online', () => {
  console.log('[PWA Sync] Network restored. Syncing pending course updates to Cloud...');
  syncPendingProgressToCloud();
});
```

---

## 3. Mobile & Tablet Ergonomics
- **Touch Targets:** Ensure interactive buttons (Play/Pause, Next, Prev, Chapter items) have minimum **44x44px** hit area.
- **Safe Area Insets:** Apply `pt-[env(safe-area-inset-top)]` and `pb-[env(safe-area-inset-bottom)]` for notched devices.
- **Orientation:** Video container automatically switches to full width/height when device enters landscape mode.

---

## 4. PWA Quality Checklist
- [ ] Valid web manifest linked in `index.html`.
- [ ] Theme color `#0b0f19` matches dark mode background.
- [ ] Course data browsable even when network is disconnected.
- [ ] Smooth 60fps scrolling on touch screens without rubber-banding glitches.
