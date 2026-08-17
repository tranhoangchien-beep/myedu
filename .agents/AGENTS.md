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

