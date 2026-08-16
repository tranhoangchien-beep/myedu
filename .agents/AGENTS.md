# Antigravity 2.0 Project Rules - MyEdu (Lean E-Learning Platform)

## 1. Project Overview & Philosophy
- **Name:** MyEdu
- **Target Audience:** Personal use (1 user) - Lean, high-performance, distraction-free.
- **Core Focus:** Seamless Abyss video streaming, course hierarchy organization, progress tracking, cross-device responsiveness (PWA), and simple resource linking.
- **Strict Constraint:** NO unnecessary bloatware (no built-in compiler, no heavy terminal emulators, no bloated journaling canvases). Every pixel must serve the video learning experience.

---

## 2. Technology Stack & Standards
- **Framework:** Next.js (App Router), React, TypeScript/JavaScript.
- **Styling:** Tailwind CSS + Lucide React Icons.
- **State Management & Persistence:** LocalStorage / IndexedDB with automated JSON Export/Import backup (optional Supabase sync).
- **Video Player:** Custom Responsive Video Container wrapping Abyssplayer iframes with `sandbox` protection.

---

## 3. Abyss Video Embedding & Security Rules
- **Base Embed Pattern:**
  - Raw formats supported:
    1. Direct URL: `https://abyssplayer.com/{VIDEO_ID}`
    2. Short ID: `{VIDEO_ID}` (e.g. `Ld3tfGRGA`, `bGOgQoLE0`)
    3. Full Iframe tag: `<iframe ... src="https://abyssplayer.com/{VIDEO_ID}" ...></iframe>`
- **Iframe Sandboxing Requirement:**
  ```html
  <iframe
    src="https://abyssplayer.com/{VIDEO_ID}"
    className="w-full h-full border-0 rounded-xl"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
    sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
  />
  ```

---

## 4. UI & UX Standards
- **Dark/Light Mode:** Default to modern sleek Dark Theme with clean neutral contrast.
- **1-Click Continue Watching:** Top hero banner / quick resume card right on homepage.
- **Keyboard Shortcuts:** Space (Play/Pause), Left/Right Arrow (Seek), F (Fullscreen), N (Next), P (Prev).
- **PWA Ready:** Manifest and responsive touch support for iPad and Smartphone.
