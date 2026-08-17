# MyEdu - Nhật Ký Thảo Luận & Kiến Trúc Dự Án (Conversation History)

> **Thời gian:** 16/08/2026  
> **Dự án:** MyEdu - Nền tảng Học tập Cá nhân Tinh gọn (Lean Personal E-Learning Platform)  
> **Nền tảng thực thi & phát triển:** Google Antigravity 2.0  

---

## 1. Bối cảnh & Yêu cầu Khởi tạo từ Người Dùng (User)

1. **Ý tưởng:** Xây dựng một website E-learning dành riêng cho cá nhân để học tập mọi lúc, mọi nơi, trên mọi thiết bị (Laptop, Tablet, Mobile).
2. **Kho nội dung:** Đã có sẵn số lượng lớn các khóa học bản quyền đa lĩnh vực (Kinh doanh, Marketing, Kỹ năng sống, Lập trình, Phân tích dữ liệu, AI...).
3. **Lưu trữ Video:** Lựa chọn **Abyss / Abyssplayer** (`https://abyssplayer.com/{VIDEO_ID}`) để lưu trữ và lấy mã nhúng.
4. **Mẫu mã nhúng thực tế:**
   ```html
   <iframe width="640" height="360" src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>
   <iframe width="640" height="360" src="https://abyssplayer.com/bGOgQoLE0" allowfullscreen></iframe>
   ```
5. **Định hướng Tinh gọn (Lean Focus):**
   * Cắt bỏ các tính năng thừa không cần thiết (không cần compiler, terminal, biểu mẫu phức tạp, nhật ký rườm rà).
   * Tập trung 100% vào: **Xem video mượt mà, quản lý mục lục khóa học trực quan, theo dõi tiến độ học tập và đồng bộ liên thiết bị**.

---

## 2. Các Trụ Cột Tính Năng Đã Thống Nhất

### Trụ cột 1: Trình phát Video Thông minh (Universal Abyss Player)
* **Chống popup & quảng cáo:** Nhúng Iframe với thuộc tính bảo mật `sandbox="allow-scripts allow-same-origin allow-presentation"`.
* **Phím tắt chuẩn YouTube:**
  * `Space`: Tạm dừng / Phát.
  * `Mũi tên Trái / Phải` hoặc `J / L`: Tua 5s / 10s.
  * `F`: Bật / tắt toàn màn hình (Full-screen).
  * `N / P`: Chuyển bài kế tiếp / bài trước.
* **1-Click Continue Watching:** Vừa vào web là hiển thị ngay bài học đang xem dở để bấm xem tiếp ngay.
* **Auto-Next Lesson:** Tùy chọn tự động chuyển sang bài tiếp theo.
* **Theater Mode (Chế độ rạp chiếu phim):** Mở rộng khung video tối đa để tập trung xem.

### Trụ cột 2: Quản trị Khóa học & Nhập Liệu Hàng Loạt (Bulk Ingestion)
* **Cấu trúc 3 cấp:** `Chủ đề (Category)` $\rightarrow$ `Khóa học (Course)` $\rightarrow$ `Danh sách bài học (Lessons)`.
* **Bulk Import:** Hỗ trợ dán hàng loạt link Abyss / mã iframe để tự động sinh danh mục bài học từ Bài 1 đến Bài N.
* **Gắn thẻ (Tags):** Lọc nhanh khóa học theo `#Marketing`, `#Data`, `#AI`, `#Business`, `#Tech`...
* **Tài liệu đính kèm (Resources):** Đính kèm link Drive/Slide/Github dưới mỗi bài để tải nhanh.

### Trụ cột 3: Theo dõi Tiến độ & Đánh dấu (Progress & Bookmarks)
* Checkmark hoàn thành bài học ($\checkmark$).
* Thanh tiến độ phần trăm (% hoàn thành).
* Ghim bài giảng cốt lõi (⭐ Star/Favorite) để gom các video quan trọng cần xem lại.

### Trụ cột 4: Trải nghiệm Đa Thiết Bị (Cross-Device PWA)
* Hỗ trợ cài đặt PWA (Progressive Web App) lên iPhone, iPad, Android để chạy toàn màn hình không có thanh địa chỉ trình duyệt.
* Giao diện Responsive tối ưu cho Mobile & Tablet.

---

## 3. Kiến Trúc Tùy Biến Antigravity 2.0 (Customization Ecosystem)

Hệ thống được vận hành và phát triển bằng Antigravity 2.0 với các thành phần:

1. **Rules (`.agents/AGENTS.md`):** Quy chuẩn React 18 + TypeScript + Tailwind CSS, quy chuẩn bảo mật Iframe Abyss, quy tắc thiết kế Lean UX.
2. **Skills (`.agents/skills/`):**
   * `abyss-media-embedder`: Bóc tách và chuẩn hóa ID/URL Abyss, sinh iframe an toàn.
   * `course-data-manager`: Quản lý cấu trúc dữ liệu JSON, import/export dữ liệu và tiến độ.
   * `ui-ux-pro-max` & `ui-styling`: Thiết kế giao diện Dark theme tối ưu học tập, vi chuyển động.
   * `a11y-debugging`: Quy chuẩn tiếp cận, điều hướng phím tắt.
   * `git-commit-formatter`: Quy chuẩn thông điệp Conventional Commits.

---

## 4. Nhật Ký Tiến Độ & Quyết Định Kỹ Thuật (Ngày 17/08/2026)

### A. Tinh gọn Trình phát & Trải nghiệm Học tập (2-Mode System)
* **Gộp chế độ xem**: Loại bỏ Theater Mode trùng lặp, chỉ giữ **2 chế độ rõ ràng**:
  1. *Chế độ Học tập Tiêu chuẩn (2 cột)*: Player + Ghi chú bên trái, Danh mục bài giảng Sidebar bên phải.
  2. *Chế độ Tập trung Cao độ (Zen Focus Mode - Phím `Z`)*: Ẩn 100% Navbar, Sidebar và Footer, đưa video ra trung tâm với kích thước lớn (`max-w-5xl`).
* **Ghi chú thông minh**: Hỗ trợ chèn mốc thời gian `[mm:ss]` dạng badge và xem trước Markdown nhẹ (tiêu đề, in đậm, danh sách).
* **Gamification Tinh gọn**: Widget chuỗi ngày học (`🔥 Streak`) và mục tiêu bài học hoàn thành trong ngày trên Navbar.

### B. Điều Hướng Phân Cấp (Breadcrumb) & Đồng Bộ URL (Routing)
* **Breadcrumb**: Hiển thị phân cấp `Trang Chủ > Danh Mục > Khóa Học > Chương > Bài Học` với khả năng click vào danh mục để lọc khóa học ngay tại trang chủ.
* **Deep Linking (Hash Routing)**:
  * Hỗ trợ lưu trữ vị trí học tập trên URL, F5/Reload không bị mất trang.
  * Hỗ trợ nút Back / Forward trên trình duyệt.

### C. Quyết Định Kỹ Thuật Mới Thống Nhất Cùng [Thư Ký](conversation://2b112e1a-1ba7-4289-a1ea-5d28083e9912)
1. **Chuẩn hóa Slug URL**: Chuyển toàn bộ cấu trúc slug và ID bài giảng sang chuẩn **Kebab-case (`-`)** thay vì Snake_case (`_`) để tuân thủ chuẩn Web/SEO quốc tế.
2. **Chuyển Trung tâm Quản trị thành Trang Độc Lập (`#/studio`)**:
   * Chuyển đổi từ dạng Popup Modal sang **Page View Toàn Màn Hình (`CourseStudioView`)** với link riêng `http://localhost:5500/#/studio`.
   * Tách bạch 100% giữa **Không Gian Học Tập (`#/`)** và **Xưởng Soạn Bài / Quản Trị (`#/studio`)**.
   * Navbar chỉ còn nút **`⚙️ Quản Trị`** chuyển sang `#/studio`, và ở Studio có nút **`⬅ Về Trang Học Tập`**.
3. **Đồng Bộ Searchable Combobox (`SearchableSelect.tsx`)**:
   * Tích hợp ô tìm kiếm tức thì và tạo nhanh (Creatable on the fly) cho Danh mục, Tác giả và Nguồn mua.
4. **Hệ Thống Bài Học Đa Định Dạng (Multi-Format Lessons)**:
   * Hỗ trợ 3 loại bài học: `🎬 Video Abyss`, `📝 Bài Viết / Tài Liệu Đọc (Markdown Reader)`, `🎬+📝 Cả Hai`.
   * Tích hợp giao diện **Article Reader** riêng biệt cho bài đọc lý thuyết.
5. **Khu Vực Quản Lý Tài Liệu Đính Kèm (Attachments Manager)**:
   * Quản lý không giới hạn Slide PDF, Drive, GitHub Repo, Link tài liệu kèm theo từng bài học trực tiếp trong modal tạo/sửa khóa học.
6. **Kéo Thả Sắp Xếp Giáo Trình (Drag & Drop Curriculum Reordering)**:
   * Tích hợp tay nắm `⠿` kéo thả HTML5 cho cả Chương và Bài học, kèm nút bấm nhanh `▲ Lên` / `▼ Xuống`.
7. **Thanh Công Cụ Soạn Thảo Bài Viết Trực Quan (`RichTextEditor.tsx`) & Parser `MarkdownRenderer.tsx`**:
   * Thanh công cụ hỗ trợ `H1-H3`, `In đậm`, `In nghiêng`, `Danh sách`, `Code Snippet`, `Trích dẫn`, `Đường kẻ ngang`, `Mẫu bài học chuẩn`.
   * Tăng kích thước font chữ Article Reader (`text-base` / `text-lg`), khoảng cách dòng thoáng đãng chuẩn Typography, định dạng in đậm/tiêu đề rõ ràng.
8. **Tái Thiết Kế Giao Diện Quản Trị / Soạn Thảo 2 Cột Chuyên Nghiệp (2-Column Curriculum Studio)**:
   * **Khắc phục lỗi bôi đen**: Thuộc tính `draggable` chỉ gán trực tiếp lên icon tay nắm `⠿`, cho phép chọn/bôi đen văn bản tự nhiên 100% trong khung soạn thảo mà không bị kéo card.
   * **Cột 1 (Bên Trái - Mục Lục)**: Danh sách Chương & Bài học trực quan dạng Treeview với tay nắm kéo thả `⠿`, nút thêm chương, thêm bài học nhanh.
   * **Cột 2 (Bên Phải - Soạn Thảo Chi Tiết)**: Không gian soạn thảo chuyên sâu cho bài học đang chọn (Tiêu đề, Switcher định dạng Video/Bài viết/Cả hai, Trình soạn thảo Rich Text Markdown toàn màn hình, Quản lý tài liệu đính kèm).
   * **Tự động ưu tiên Tab thông minh**: Khi bấm tạo mới khóa học -> Mặc định mở tab **`[Thông Tin]`** đầu tiên; Khi bấm sửa khóa học -> Mặc định mở tab **`[Giáo Trình]`**.
   * **Tối giản nhãn Tab**: Tinh gọn thành **`[Giáo Trình]`** và **`[Thông Tin]`**.
   * **Tính năng Thu Gọn / Mở Rộng (Collapse / Expand)**:
     - Cho phép thu gọn/mở rộng từng **Chương** ở cột mục lục.
     - Cho phép thu gọn **Toàn bộ Cột 1 Mục Lục** để chuyển sang chế độ soạn thảo bài viết toàn màn hình (`Fullscreen Workspace`).
9. **Hệ Thống Chống Mất Dữ Liệu & Cảnh Báo Thay Đổi Chưa Lưu (Unsaved Changes Guard)**:
   * Tự động theo dõi trạng thái chỉnh sửa (`isDirty`).
   * Hiển thị Badge trực quan nhấp nháy `● Chưa lưu thay đổi (Ctrl+S)` trên thanh tiêu đề.
   * **Chặn đóng cửa sổ bất ngờ**: Khi bấm nút Đóng `(X)`, popup cảnh báo xuất hiện để xác nhận `[Ở Lại Chỉnh Sửa]` hoặc `[Thoát & Hủy Bỏ]`.
   * **Chặn Reload / Đóng Tab Trình Duyệt (`beforeunload`)**: Kích hoạt hộp thoại cảnh báo của trình duyệt khi người dùng vô tình F5 hoặc tắt tab lúc đang soạn bài dở.
   * **Bảo toàn 100% dữ liệu khi chuyển giữa các bài học**: Cô lập vòng đời khởi tạo bằng `useRef`, đảm bảo sửa bài 1 -> chuyển qua bài 2 -> quay lại bài 1 mọi nội dung vẫn được giữ nguyên vẹn trong bộ nhớ form.
   * **Khắc phục lỗi cuộn chuột**: Khóa vị trí cuộn `scrollTop` và sử dụng `onMouseDown preventDefault` trên thanh công cụ Rich Text để khi bấm In đậm/Tiêu đề/Danh sách, con trỏ và màn hình không bao giờ bị nhảy lên trên cùng.
   * **Tối giản & Bố trí Nút Lưu Ngay Từng Bài Học (Zero Layout Shift)**:
     - **Thanh Header cố định**: Không còn các huy hiệu co giãn làm giật/nhảy nút bấm trên thanh tiêu đề.
     - **Nút `[💾 Lưu Bài Học]` trực tiếp trong khung soạn thảo**: Đặt ngay cạnh thời lượng & định dạng của bài học đang chọn. Bấm lưu (hoặc `Ctrl + S`) sẽ lưu ngay tức thì, nút chuyển sang `✓ Đã Lưu!` trong 2s, cửa sổ giữ nguyên vị trí, không gián đoạn mạch làm việc.

10. **Tự Động Nạp Bộ Dữ Liệu Kiểm Thử Vàng (Golden Test Suite - 20 Khóa Học Toàn Diện Đa Ngành)**:
    * Khởi tạo và tự động đồng bộ **20 khóa học mẫu cao cấp** bao phủ 100% các lĩnh vực: AI & Prompt, Fullstack Next.js, UI/UX Design, Growth Marketing, Machine Learning Scikit-Learn, Flutter Mobile, Tài chính Doanh nghiệp, Data Engineering PySpark, Branding Identity, Tiếng Nhật Thương mại JLPT, Kỹ năng Đàm phán Leadership, Performance Ads Facebook/TikTok, An ninh mạng Pentest, Triết học Khắc kỷ Stoicism...
    * Đầy đủ các định dạng: Video Abyss đa dạng (URL, Iframe, Short ID), bài viết Markdown chuyên sâu (bảng biểu, code block, công thức Math LaTeX), bài học hỗn hợp (Mixed), đầy đủ 4 loại tài liệu đính kèm (PDF, Google Drive, GitHub, Link Colab/Notion).

11. **Quản Trị Giảng Viên / Tác Giả & Bộ Lọc Liên Kết Hai Chiều (Cascading Linked Filters)**:
    * **Quản trị Giảng viên trong Course Studio**:
      - Bổ sung tab con thứ 3 `👨‍🏫 Tác Giả / Giảng Viên` trong Trung Tâm Quản Trị.
      - Hỗ trợ thêm giảng viên mới, sửa tên giảng viên (tự động đồng bộ hàng loạt vào tất cả khóa học liên quan), xóa giảng viên khỏi danh sách kèm cảnh báo số lượng khóa học.
12. **Nâng Cấp Toàn Diện Dashboard Quản Trị Khóa Học (Course Studio 2.0)**:
    * **Thanh Mini KPI Metrics đầu trang**: Thống kê thời gian thực 4 chỉ số cốt lõi (Tổng số khóa học, tổng bài giảng phân loại Video/Bài đọc, % Tiến độ hoàn thành chung, Tổng số lượng chủ đề & giảng viên).
    * **Bộ điều khiển Lọc & Sắp xếp chuyên sâu trên Bảng**:
      - Tabs lọc nhanh trạng thái học: `Tất cả` | `Đang học` | `Chưa học` | `Đã xong (100%)`.
      - Dropdown lọc kết hợp theo Chủ đề và Nền tảng nguồn.
      - Dropdown Sắp xếp: *Mới cập nhật gần nhất*, *Tên A-Z*, *Tiến độ học*, *Số lượng bài học*.
      - Phân trang thông minh (`10` | `20` | `50` | `Tất cả`) kèm nút điều hướng Trang trước / Trang sau.
    * **Tính Năng Nhân Bản Khóa Học 1-Click (Duplicate / Clone Course)**:
      - Bổ sung nút `[📋 Nhân bản]` cạnh nút Sửa: Cho phép nhân bản tức thì toàn bộ cấu trúc chương, bài học và tài liệu của khóa học có sẵn.
    * **Tối ưu Thumbnail chuẩn 16:9 & Thematic Fallback**:
      - Tỷ lệ ảnh 16:9 sắc nét, bo góc chuẩn mực.
      - Khi ảnh bị lỗi link hoặc chưa có: Tự động render huy hiệu biểu tượng Gradient theo danh mục (AI, Code, Design, Marketing, Finance...) thay vì text vỡ.
    * **Thao tác hàng loạt (Floating Batch Actions Toolbar)**:
      - Checkbox chọn nhiều khóa học (kèm nút Chọn tất cả).
      - Thanh công cụ nổi thông minh: Xóa hàng loạt, Đổi danh mục hàng loạt, Xuất JSON riêng cho các khóa được chọn.
    * **Thước Đo Sức Khỏe Bộ Nhớ Thiết Bị (Offline Storage Health Meter)**:
      - Hiển thị trực quan dung lượng LocalStorage đang sử dụng (KB/MB) so với giới hạn an toàn 5MB của trình duyệt.
    * **Modal Xác Nhận Xóa Tùy Chỉnh (Custom Dark Confirmation Modals)** & **Phím tắt Studio (`/` để tìm kiếm, `Esc` để hủy chọn)**.
