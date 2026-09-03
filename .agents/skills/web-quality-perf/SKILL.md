---
name: web-quality-perf
description: Web performance and Core Web Vitals optimization skill based on Addy Osmani (Google Chrome Team) standards. Use when optimizing page load speed, LCP, INP, CLS, smooth video iframe rendering, and DOM efficiency in MyEdu.
---

# Web Quality & Performance Optimization Guide (MyEdu)
*Standards based on Addy Osmani (Google Chrome Team) & Web Vitals guidelines.*

## 1. Core Principles for MyEdu
- **Fast First Paint & Instant Resume:** Homepage and Studio must render within <100ms.
- **Zero Layout Shift (CLS < 0.05):** Always provide explicit aspect ratio placeholders (`aspect-video`, fixed skeleton heights) for video iframe players and thumbnails before assets load.
- **Smooth Interaction (INP < 100ms):** Heavy computations (e.g. link parsing, bulk list filtering) must never block the UI thread.
- **Lean Runtime:** Avoid heavy third-party dependencies, bloated state managers, or unmemoized object recreations in React loops.

---

## 2. Video Player & Iframe Performance Rules
1. **Aspect Ratio Preservation:**
   ```tsx
   {/* Prevent CLS during iframe initialization */}
   <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
     {/* Skeleton placeholder while loading */}
     {isLoading && (
       <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
         <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
       </div>
     )}
     <iframe
       src={embedUrl}
       loading="lazy"
       className="w-full h-full border-0"
       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
       allowFullScreen
       sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
     />
   </div>
   ```

2. **Lazy Loading & DOM Virtualization:**
   - Use `loading="lazy"` on thumbnails and deferred video embeds.
   - For long course lesson lists (>50 lessons), memoize item components (`React.memo`) to avoid redundant re-renders when active lesson changes.

---

## 3. State & Memory Management
- **Avoid Object Recreation:** Wrap handlers in `useCallback` and expensive list derivations (filtering, sorting) in `useMemo`.
- **Timer & Stream Cleanup:** Always clear active `setInterval`, `setTimeout`, and abort uncompleted `fetch` requests inside `useEffect` cleanup returns.
- **Storage Hygiene:** Cache course structures in LocalStorage / IndexedDB with compression or structured keys to avoid exceeding quota limits.

---

## 4. Performance Audit Checklist
- [ ] LCP: Hero banner & active video container visible in < 1.2s.
- [ ] CLS: 0 layout jumping during video player or thumbnail image load.
- [ ] INP: Fast responsive tap/click feedback with active CSS state transitions (`active:scale-[0.98]`).
- [ ] Memory: No detached DOM nodes or zombie intervals when switching between courses.
