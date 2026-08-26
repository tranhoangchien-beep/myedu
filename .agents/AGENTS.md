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

---

## 5. Quy Trình Vận Hành 5 Team & Kiểm Soát Chất Lượng (5-Team Governance)
- **1. Thư Ký / Trợ Lý Trưởng:** Tiếp nhận chỉ đạo của Chủ dự án, phân bổ nhiệm vụ, duy trì nhật ký `CONVERSATIONS.md` và kiểm soát tiến độ.
- **2. Team Phát Triển:** Chịu trách nhiệm mã nguồn React, Vite, Tailwind CSS, Player đa nền tảng và Cloud Sync. Mọi hàm CRUD bắt buộc gắn cờ đồng bộ Cloud Firestore tức thì.
- **3. Team Dữ Liệu:** Chuẩn hóa cấu trúc khóa học TypeScript, Schema validation, bóc tách link Abyss. Tuyệt đối KHÔNG hardcode tự nhồi dữ liệu mẫu khi người dùng đã xóa.
- **4. Team Bảo Mật:** Thực thi mã hóa PBKDF2 100,000 vòng, chống Brute-force rate limiting 60s, kiểm soát Firestore Security Rules và quyền riêng tư (Zero-bot / Noindex).
- **5. Team Kiểm Thử QA & Trải Nghiệm UX:** 
  - **QA:** Chốt chặn kiểm định độc lập. Bắt buộc test thực tế: *Thêm/Sửa/Xóa ➔ F5 ➔ Ẩn danh ➔ Mobile* trước khi xuất xưởng.
  - **UX:** Đảm bảo công thái học 1 chạm, chống xao nhãng, theme nền tối `#0b0f19` êm mắt khi học đêm.

---

## 6. Danh Mục Kỹ Năng Agent Tinh Hoa (Awesome Agent Skills Integrated)
Dự án được trang bị hệ thống kỹ năng tiêu chuẩn quốc tế tại `.agents/skills/`:
1. **`ui-ux-pro-max`** *(NextLevelBuilder)*: Kho tri thức 84 styles UI, 192 bảng màu, 98 quy tắc UX, hiệu ứng mượt mà & công cụ tra cứu tự động. (Giao cho **Team UX & Phát Triển**).
2. **`ui-styling`** *(NextLevelBuilder)*: Chuẩn hóa linh kiện Radix/shadcn, dark mode & Tailwind CSS utility. (Giao cho **Team Phát Triển**).
3. **`web-quality-perf`** *(Google Chrome Team - Addy Osmani)*: Tối ưu Core Web Vitals (LCP, INP, CLS), render Iframe mượt mà, chống giật layout & tối ưu hóa bộ nhớ. (Giao cho **Team Phát Triển & UX**).
4. **`a11y-debugging`** *(Google Chrome Team - Addy Osmani)*: Kiểm tra khả năng tiếp cận, độ tương phản text trên nền tối `#0b0f19`, phím tắt và công thái học chạm. (Giao cho **Team QA & UX**).
5. **`app-security-hardening`** *(Trail of Bits)*: Iframe Sandboxing nghiêm ngặt, bảo vệ API keys/tokens, mã hóa PBKDF2 100k vòng và chống XSS. (Giao cho **Team Bảo Mật**).
6. **`vitest-qa-automation`** *(TestMu AI / LambdaTest)*: Quy chuẩn viết và chạy Unit Test/Integration Test cho link parser, cloud sync & schema validation. (Giao cho **Team QA**).
7. **`pwa-offline-resilience`** *(Google Web Standards)*: Cấu hình Service Worker, IndexedDB caching ngoại tuyến và công thái học chạm trên iPad/Mobile. (Giao cho **Team Phát Triển**).



