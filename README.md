# MyEdu - Nền Tảng E-Learning Cá Nhân Tinh Gọn (Lean Personal E-Learning)

**MyEdu** là hệ thống học tập cá nhân được thiết kế để xem và quản lý hàng trăm khóa học lưu trữ trên **Abyss Video Cloud** một cách mượt mà, tiện lợi trên mọi thiết bị (Laptop, iPad, Smartphone).

---

## 🎯 Điểm Nổi Bật
- **Universal Abyss Embedder:** Tự động chuẩn hóa link `abyssplayer.com/{ID}` và chặn mã độc / popup chuyển hướng rác.
- **Bulk Ingestion:** Dán hàng loạt link Abyss để tự động sinh mục lục khóa học từ bài 1 đến bài N trong 3 giây.
- **1-Click Continue:** Vừa vào web là xem tiếp ngay bài học đang học dở.
- **Học tập không xao nhãng (Distraction-Free):** Phím tắt chuẩn YouTube (`Space`, `J/L`, `F`, `N/P`), chế độ Theater Mode.
- **Đa thiết bị (PWA Ready):** Cài đặt thành app trên iOS/Android, giao diện co giãn thông minh.

---

## 📂 Cấu Trúc Dự Án & Antigravity 2.0 Config

```text
MyEdu/
├── .agents/
│   ├── AGENTS.md                              # Rules quy chuẩn cho Antigravity 2.0
│   └── skills/
│       ├── abyss-media-embedder/SKILL.md      # Skill bóc tách và nhúng video Abyss
│       └── course-data-manager/SKILL.md       # Skill nạp dữ liệu & quản lý tiến độ
├── CONVERSATIONS.md                           # Toàn bộ nhật ký thảo luận & kiến trúc đã thống nhất
└── README.md                                  # Tài liệu tổng quan dự án
```

---

## 💡 Hướng dẫn phát triển tiếp theo
Dự án được xây dựng và hỗ trợ bởi **Google Antigravity 2.0**. Bạn có thể yêu cầu Antigravity khởi tạo source code hoàn chỉnh hoặc nạp danh sách khóa học thực tế bất cứ lúc nào!
