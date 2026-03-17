# 📘 Hướng Dẫn Sử Dụng FinWise

> **FinWise** — Ứng dụng quản lý tài chính cá nhân thông minh với trợ lý AI

---

## 📑 Mục Lục

1. [Bắt đầu sử dụng](#1-bắt-đầu-sử-dụng)
2. [Tổng quan (Dashboard)](#2-tổng-quan-dashboard)
3. [Ghi chép giao dịch với AI](#3-ghi-chép-giao-dịch-với-ai)
4. [Quản lý giao dịch](#4-quản-lý-giao-dịch)
5. [Quản lý ngân sách](#5-quản-lý-ngân-sách)
6. [Mục tiêu tiết kiệm](#6-mục-tiêu-tiết-kiệm)
7. [Quản lý ví & tài khoản](#7-quản-lý-ví--tài-khoản)
8. [Báo cáo tài chính](#8-báo-cáo-tài-chính)
9. [Hỏi FinWise (Hỗ trợ AI)](#9-hỏi-finwise-hỗ-trợ-ai)
10. [Kiến thức tài chính](#10-kiến-thức-tài-chính)
11. [Hồ sơ cá nhân](#11-hồ-sơ-cá-nhân)
12. [Cài đặt](#12-cài-đặt)
13. [Câu hỏi thường gặp (FAQ)](#13-câu-hỏi-thường-gặp-faq)

---

## 🤖 Các tính năng AI trong FinWise

FinWise tích hợp trí tuệ nhân tạo (AI) xuyên suốt ứng dụng, giúp bạn quản lý tài chính thông minh và tiết kiệm thời gian.

### Ghi chép giao dịch thông minh

| Tính năng | Mô tả |
|-----------|-------|
| **Nhận diện văn bản tự nhiên** | Nhập *"ăn phở 45k"* → AI tự phân loại danh mục, số tiền, loại giao dịch |
| **Nhận diện giọng nói** | Nói tiếng Việt → AI chuyển thành giao dịch tự động |
| **Quét ảnh hóa đơn** | Chụp/chọn ảnh hóa đơn → AI Vision (LLaMA 4 Scout) trích xuất thông tin giao dịch |

### Phân tích & Dự báo tài chính

| Tính năng | Mô tả | Vị trí |
|-----------|-------|--------|
| **Cảnh báo chi tiêu bất thường** | Phát hiện khoản chi vượt 150% trung bình danh mục → cảnh báo vàng | Màn hình Ghi giao dịch |
| **Dự báo Burn Rate** | Dự đoán chi tiêu đến cuối tháng dựa trên tốc độ chi hiện tại, gợi ý mức chi hàng ngày/tuần | Màn hình Ngân sách |
| **Dự báo tài chính AI** | Phân tích xu hướng thu chi, đưa ra nhận xét và gợi ý cải thiện | Màn hình Báo cáo |
| **Hỏi AI về tài chính** | Hỏi bất kỳ câu hỏi nào → AI trả lời dựa trên dữ liệu thực từ database | Màn hình Ghi giao dịch |
| 🔍 **AI Lùng sục Đăng ký ngầm** | Tự động quét và phát hiện các dịch vụ trừ tiền định kỳ (Netflix, Spotify...) | Màn hình Tổng quan (Dashboard) |
| 🤖 **AI "Soi" Chi tiêu** | Nhận xét vui nhộn, xéo xắt hoặc khen ngợi tình hình thu chi tháng | Màn hình Báo cáo |
| 📊 **AI Khám Sức khỏe Kinh doanh** | Phân tích Khung giờ vàng và hành vi khách hàng để tối ưu doanh thu (*) | Màn hình Báo cáo |

> (*) *Tính năng độc quyền dành cho gói Doanh nghiệp SME*

### Lập kế hoạch thông minh

| Tính năng | Mô tả | Vị trí |
|-----------|-------|--------|
| **AI lập kế hoạch tiết kiệm** | Phân tích thu chi hiện tại, đề xuất mức tiết kiệm/tháng để đạt mục tiêu đúng hạn | Màn hình Mục tiêu |

### Hỗ trợ & Hướng dẫn

| Tính năng | Mô tả | Vị trí |
|-----------|-------|--------|
| **Chatbot Hỏi FinWise** | Hỗ trợ khách hàng 24/7 — hướng dẫn sử dụng, giải đáp thắc mắc, mẹo tài chính | Công cụ nhanh → Hỏi FinWise |

### Công nghệ AI sử dụng

| Model | Vai trò |
|-------|---------|
| **LLaMA 3.3 70B** (Groq) | Xử lý văn bản: nhận diện giao dịch, phân tích tài chính, chatbot hỗ trợ |
| **LLaMA 4 Scout** (Groq) | Xử lý hình ảnh: quét hóa đơn, nhận diện ảnh chụp |

> 💡 Tất cả tính năng AI cần kết nối mạng. Các chức năng offline (ghi chép thủ công, xem giao dịch, ngân sách, ví, mục tiêu) vẫn hoạt động bình thường khi không có mạng.

---

## 1. Bắt đầu sử dụng

### 1.1 Đăng ký tài khoản

1. Mở ứng dụng FinWise
2. Nhấn **"Chưa có tài khoản? Đăng ký"** ở màn hình đăng nhập
3. Điền đầy đủ thông tin:
   - **Tên hiển thị**: Tên của bạn
   - **Email**: Địa chỉ email hợp lệ
   - **Mật khẩu**: Tối thiểu 6 ký tự
   - **Xác nhận mật khẩu**: Nhập lại mật khẩu
4. Nhấn **"Đăng ký"**
5. Sau khi đăng ký thành công, bạn sẽ được chuyển về màn hình đăng nhập

### 1.2 Đăng nhập

Có 3 cách đăng nhập:

- **Email & Mật khẩu**: Nhập email và mật khẩu đã đăng ký, nhấn **"Đăng nhập"**
- **Vân tay / Face ID**: Nhấn nút vân tay bên cạnh nút đăng nhập (nếu thiết bị hỗ trợ)
- **Google**: Nhấn **"Đăng nhập với Google"** để dùng tài khoản Google

> 💡 Tích chọn **"Ghi nhớ đăng nhập"** để không phải đăng nhập lại lần sau.

### 1.3 Quên mật khẩu

1. Nhấn **"Quên mật khẩu?"** ở màn hình đăng nhập
2. Nhập địa chỉ email đã đăng ký
3. Nhấn **"Gửi link đặt lại"**
4. Kiểm tra email và làm theo hướng dẫn

---

## 2. Tổng quan (Dashboard)

Đây là màn hình chính sau khi đăng nhập, hiển thị toàn bộ thông tin tài chính của bạn.

### 2.1 Lời chào & Thời gian

- Hiển thị lời chào theo thời gian trong ngày (Chào buổi sáng / trưa / chiều / tối)
- Hiển thị tên người dùng

### 2.2 Thẻ Chi tiêu tháng

Thẻ tổng quan nổi ở đầu trang hiển thị:
- **Tổng chi tiêu tháng này** (cập nhật realtime)
- **Số giao dịch hôm nay** và thời gian hiện tại
- **Thu nhập** tháng này (màu xanh lá)
- **Số dư còn lại** (thu nhập - chi tiêu)
- Nhấn **"Xem báo cáo chi tiết →"** để xem báo cáo đầy đủ

### 2.3 Thao tác nhanh

- **Liên kết tài khoản ngân hàng**: Kết nối tài khoản ngân hàng
- **Ghi chi tiêu**: Nút xoay tròn, nhấn để mở AI ghi chép giao dịch

### 2.4 Bốn tính năng chính (Grid 2×2)

| Nút | Chức năng | Điều hướng |
|-----|-----------|------------|
| 🔴 **Chi tiêu** | Xem danh sách chi tiêu | Màn hình Giao dịch (lọc chi tiêu) |
| 🟢 **Thu nhập** | Xem danh sách thu nhập | Màn hình Giao dịch (lọc thu nhập) |
| 🔵 **Ngân sách** | Quản lý ngân sách | Màn hình Ngân sách |
| 🟠 **Báo cáo** | Xem báo cáo phân tích | Màn hình Báo cáo |

### 2.5 Cảnh báo thông minh

- **Cảnh báo ngân sách**: Hiển thị số danh mục đã **vượt ngân sách** tháng này với badge đỏ nhấp nháy.
- 🔍 **AI Cảnh báo Đăng ký ngầm**: Nếu AI phát hiện bạn có dịch vụ trả phí định kỳ (như Netflix, Spotify), một thông báo màu vàng sẽ mở ra khuyên bạn cân nhắc cắt bỏ nếu ít dùng.

### 2.6 Công cụ nhanh (Grid 5 nút)

| Nút | Chức năng |
|-----|-----------|
| 💼 **Ví điện tử** | Quản lý ví & tài khoản |
| 🤖 **Hỏi FinWise** | Chatbot hỗ trợ & hướng dẫn |
| 🎯 **Mục tiêu** | Quản lý mục tiêu tiết kiệm |
| 💡 **Mẹo tài chính** | Bài viết kiến thức tài chính |
| ⚙️ **Cài đặt** | Cài đặt ứng dụng |

### 2.7 Dịch vụ tài chính

4 dịch vụ bổ sung: Chuyển tiền, Tiết kiệm, Đầu tư, Bảo hiểm.

### 2.8 Thanh điều hướng (Bottom Navigation)

Thanh điều hướng cố định ở dưới cùng với 5 tab:

| Tab | Chức năng |
|-----|-----------|
| 🏠 **Tổng quan** | Quay về Dashboard |
| 🔄 **Giao dịch** | Xem lịch sử giao dịch |
| ➕ **Thêm** | Mở AI ghi chép giao dịch (nút nổi ở giữa) |
| 📊 **Báo cáo** | Xem báo cáo & biểu đồ |
| 👤 **Hồ sơ** | Trang cá nhân |

---

## 3. Ghi chép giao dịch với AI

Đây là tính năng cốt lõi của FinWise — ghi chép thu chi bằng AI thông minh.

### 3.1 Mở màn hình ghi chép

Nhấn nút **"+"** ở thanh điều hướng dưới cùng, hoặc nhấn nút **"Ghi chi tiêu"** trên Dashboard.

### 3.2 Ghi bằng văn bản

Nhập mô tả giao dịch bằng ngôn ngữ tự nhiên vào ô chat, ví dụ:
- `"ăn sáng phở 45k"`
- `"đổ xăng 150 nghìn"`
- `"lương tháng 18 triệu"`
- `"mua quần áo 500k"`
- `"tiền điện tháng 3 là 350k"`

AI sẽ tự động nhận diện:
- **Số tiền** (45.000đ, 150.000đ, 18.000.000đ...)
- **Loại giao dịch** (chi tiêu hay thu nhập)
- **Danh mục** (Ăn uống, Di chuyển, Lương...)
- **Ghi chú** chi tiết

### 3.3 Ghi bằng giọng nói

1. Nhấn biểu tượng **🎤 microphone** ở thanh nhập liệu
2. Nói mô tả giao dịch bằng tiếng Việt, ví dụ: *"Hôm nay ăn trưa hết năm mươi ngàn"*
3. Chờ AI nhận diện và hiển thị kết quả
4. Xác nhận hoặc chỉnh sửa

### 3.4 Ghi bằng ảnh hóa đơn

1. Nhấn biểu tượng **📷 camera** ở thanh nhập liệu
2. Chọn:
   - **"Chụp ảnh"** — Mở camera chụp hóa đơn
   - **"Chọn từ thư viện"** — Chọn ảnh hóa đơn có sẵn
3. AI sẽ phân tích ảnh và trích xuất thông tin giao dịch
4. Xác nhận hoặc chỉnh sửa

### 3.5 Xác nhận giao dịch

Sau khi AI nhận diện, một modal xác nhận hiển thị với:
- **Số tiền** (có màu xanh nếu thu nhập, đỏ nếu chi tiêu)
- **Danh mục** đã phân loại
- **Ghi chú** mô tả
- **Ngày** giao dịch
- **Chọn tài khoản** — Nhấn vào ví/tài khoản bạn muốn ghi nhận

Nhấn **"Lưu giao dịch"** để xác nhận hoặc **"Hủy"** để bỏ.

### 3.6 Cảnh báo chi tiêu bất thường

Nếu khoản chi vượt quá **150% mức trung bình** của danh mục đó trong các tháng trước, AI sẽ hiển thị **cảnh báo vàng** cùng lời nhận xét.

### 3.7 Hỏi AI về tài chính

Ngoài ghi chép, bạn còn có thể hỏi AI trực tiếp trong chat:
- *"Tháng này tôi tiêu bao nhiêu cho ăn uống?"*
- *"Tôi còn bao nhiêu tiền?"*
- *"So sánh chi tiêu tháng này với tháng trước"*

AI sẽ phân tích dữ liệu thực từ database của bạn để trả lời.

### 3.8 Danh mục giao dịch

**Danh mục chi tiêu:**
| Danh mục | Mô tả |
|----------|-------|
| 🍜 Ăn uống | Bữa ăn, đồ uống, cafe |
| 🚗 Di chuyển | Xăng, grab, taxi, xe buýt |
| 🛍️ Mua sắm | Quần áo, đồ dùng |
| 🎬 Giải trí | Phim, game, du lịch |
| 🏥 Sức khỏe | Thuốc, khám bệnh |
| 📚 Giáo dục | Học phí, sách |
| 💡 Tiện ích | Điện, nước, internet |
| 📦 Khác | Các khoản khác |

**Danh mục thu nhập:**
| Danh mục | Mô tả |
|----------|-------|
| 💰 Lương | Lương hàng tháng |
| 🎁 Thưởng | Thưởng, bonus |
| 📈 Đầu tư | Lợi nhuận đầu tư |
| 🏪 Kinh doanh | Thu từ kinh doanh |
| 📦 Khác | Các khoản thu khác |

---

## 4. Quản lý giao dịch

### 4.1 Xem danh sách giao dịch

Nhấn tab **"Giao dịch"** ở thanh điều hướng dưới.

### 4.2 Lọc giao dịch

- **Theo loại**: Nhấn tab **Tất cả** / **Chi tiêu** / **Thu nhập** ở đầu trang
- **Theo tháng**: Nhấn mũi tên **◀ ▶** để chuyển tháng trước/sau

### 4.3 Tổng quan tháng

Phía trên danh sách hiển thị 3 chỉ số:
- 🟢 **Thu nhập** tổng trong tháng
- 🔴 **Chi tiêu** tổng trong tháng
- 🔵 **Còn lại** (thu nhập − chi tiêu)

### 4.4 Chi tiết giao dịch

Mỗi giao dịch hiển thị:
- Icon và tên danh mục
- Ghi chú / Tên tài khoản
- Số tiền (xanh = thu nhập, đỏ = chi tiêu)
- Giao dịch được nhóm theo ngày (Hôm nay, Hôm qua, hoặc thứ/ngày)

### 4.5 Xóa giao dịch

1. **Nhấn giữ** vào giao dịch muốn xóa
2. Xác nhận xóa trong hộp thoại

> ⚠️ Lưu ý: Xóa giao dịch sẽ tự động cập nhật lại số dư tài khoản tương ứng.

---

## 5. Quản lý ngân sách

### 5.1 Truy cập

Nhấn **"Ngân sách"** trên Dashboard hoặc từ các nút điều hướng.

### 5.2 Tổng quan ngân sách

Thẻ tổng quan ở đầu trang hiển thị:
- **Đã chi**: Tổng số tiền đã chi trong tháng
- **Hạn mức**: Tổng ngân sách tháng
- **Thanh tiến độ** với mã màu:
  - 🟢 Xanh: Dưới 80% ngân sách
  - 🟡 Cam: 80% — 100%
  - 🔴 Đỏ: Vượt ngân sách

### 5.3 Thiết lập hạn mức tổng

1. Nhấn vào phần **"Hạn mức (Chạm để sửa)"** trong thẻ tổng quan
2. Nhập số tiền ngân sách tổng cho tháng
3. Nhấn **"Lưu"**

### 5.4 Ngân sách theo danh mục

Mỗi thẻ ngân sách hiển thị:
- Tên danh mục và icon
- Phần trăm đã sử dụng
- Badge **"Vượt"** nếu đã vượt hạn mức
- Thanh tiến độ
- Số tiền đã chi và số tiền còn lại

### 5.5 Xóa ngân sách

**Nhấn giữ** vào thẻ ngân sách → Xác nhận xóa.

### 5.6 Dự báo AI Burn Rate

Thẻ **"Dự báo Dòng tiền AI"** sử dụng AI để phân tích:
- Tốc độ chi tiêu hiện tại
- Dự báo chi tiêu đến cuối tháng
- Cảnh báo nếu có nguy cơ vượt ngân sách
- Gợi ý mức chi tiêu hàng ngày/tuần

> AI dự báo sẽ tự động cập nhật khi bạn mở màn hình Ngân sách.

---

## 6. Mục tiêu tiết kiệm

### 6.1 Truy cập

Nhấn **"Mục tiêu"** trong phần Công cụ nhanh trên Dashboard.

### 6.2 Tổng quan tiến độ

Thẻ ở đầu trang hiển thị:
- **Tổng đã tiết kiệm** trên tất cả mục tiêu
- **Tổng mục tiêu** cần đạt
- Thanh tiến độ tổng và phần trăm hoàn thành

### 6.3 Tạo mục tiêu mới

1. Nhấn nút **"+"** ở góc trên bên phải
2. Điền thông tin:
   - **Tên mục tiêu** (ví dụ: "Mua laptop", "Du lịch Đà Lạt")
   - **Số tiền mục tiêu** (ví dụ: 15.000.000)
   - **Hạn hoàn thành** (định dạng: YYYY-MM-DD)
   - **Chọn icon** từ 15 biểu tượng: 🎯🏠🚗✈️💻📱🎓💍🏖️💰🏥👶🎁📦⭐
   - **Chọn màu** từ 8 tùy chọn
3. Nhấn **"Tạo mục tiêu"**

### 6.4 Nạp tiền vào mục tiêu

1. **Nhấn** vào thẻ mục tiêu
2. Nhập số tiền muốn nạp
3. Nhấn **"Nạp tiền"**
4. Tiến độ sẽ được cập nhật ngay lập tức

### 6.5 AI lập kế hoạch tiết kiệm

1. Nhấn nút **"✨ Gợi ý AI"** bên dưới mục tiêu chưa hoàn thành
2. AI sẽ phân tích:
   - Thu nhập và chi tiêu hiện tại
   - Số tiền cần tiết kiệm thêm
   - Thời hạn còn lại
3. AI đưa ra kế hoạch cụ thể: tiết kiệm bao nhiêu/tháng, cần cắt giảm gì

### 6.6 Trạng thái mục tiêu

- **Đang tiến hành**: Hiện thanh tiến độ và số ngày còn lại
- **Hoàn thành**: Badge xanh **"Hoàn thành"** + thông báo chúc mừng
- **Quá hạn**: Hiện chữ đỏ **"Đã quá hạn"**

### 6.7 Xóa mục tiêu

**Nhấn giữ** vào mục tiêu → Xác nhận xóa.

---

## 7. Quản lý ví & tài khoản

### 7.1 Truy cập

Nhấn **"Ví điện tử"** trong Công cụ nhanh trên Dashboard.

### 7.2 Tổng tài sản

Thẻ ở đầu trang hiển thị **tổng số dư** trên tất cả tài khoản.

### 7.3 Loại tài khoản

| Loại | Icon | Mô tả |
|------|------|-------|
| 💵 Tiền mặt | Cash | Tiền mặt trong ví |
| 🏦 Ngân hàng | Bank | Tài khoản ngân hàng |
| 📱 Ví điện tử | E-wallet | MoMo, ZaloPay, v.v. |
| 💳 Thẻ tín dụng | Credit | Thẻ tín dụng (nợ) |

### 7.4 Thêm tài khoản mới

1. Nhấn nút **"+"** ở góc trên bên phải
2. **Chọn loại** tài khoản: Nhấn vào chip tương ứng
3. **Nhập tên** tài khoản (ví dụ: "Vietcombank", "MoMo")
4. **Nhập số dư** ban đầu
5. Nhấn **"Thêm tài khoản"**

### 7.5 Số dư tài khoản

- Số dư **dương** hiển thị màu xanh
- Số dư **âm** (thẻ tín dụng/nợ) hiển thị màu đỏ
- Số dư tự động cập nhật khi thêm/xóa giao dịch

### 7.6 Xóa tài khoản

**Nhấn giữ** vào tài khoản → Xác nhận xóa.

> ⚠️ Xóa tài khoản không xóa các giao dịch đã ghi nhận.

---

## 8. Báo cáo tài chính

### 8.1 Truy cập

Nhấn tab **"Báo cáo"** ở thanh điều hướng dưới, hoặc nút **"Báo cáo"** trên Dashboard.

### 8.2 Thẻ KPI (4 chỉ số chính)

| Chỉ số | Mô tả |
|--------|-------|
| 📉 Chi tiêu tháng | Tổng chi tiêu tháng hiện tại |
| 📈 Thu nhập | Tổng thu nhập tháng hiện tại |
| 💰 Tiết kiệm | Thu nhập − Chi tiêu |
| 📋 Giao dịch | Số lượng giao dịch trong tháng |

### 8.3 Biểu đồ chi tiêu theo ngày

- **Biểu đồ đường** hiển thị chi tiêu mỗi ngày trong tháng
- Đơn vị: triệu đồng
- Cuộn ngang để xem đầy đủ

### 8.4 Biểu đồ danh mục

- **Biểu đồ tròn** hiển thị tỷ lệ chi tiêu theo danh mục
- Hiển thị **top 5** danh mục chi tiêu nhiều nhất
- Phần trăm cho mỗi danh mục

### 8.5 Cố vấn AI (Forecast)

1. Nhấn nút **"Phân tích"** trong thẻ "Cố vấn AI"
2. AI phân tích toàn bộ lịch sử giao dịch
3. Đưa ra nhận xét về:
   - Xu hướng chi tiêu
   - Dự báo chi tiêu cuối tháng
   - Gợi ý cải thiện tài chính

### 8.6 AI "Soi" Chi Tiêu (Dành cho Gen Z)

1. Nhấn nút **"Nhận xét"** ở phần thẻ màu cam
2. AI "Roaster" sẽ đọc thu chi tháng này của bạn và thả một câu đùa cực mặn.
3. Nếu tiêu lố, chuẩn bị tinh thần bị "chê"! Nếu tiết kiệm tốt, bạn sẽ nhận được lời khen ngút trời.

### 8.7 Sức Khoẻ Kinh Doanh (**Gói SME**)

Tính năng phân tích cao cấp cho chủ shop/doanh nghiệp, giúp tối ưu hóa doanh thu.
1. Nhấn nút **"Phân tích"** ở phần thẻ xanh lá
2. AI phân tích và đưa ra:
   - *Ngày/Giờ Vàng:* Khoảng thời gian khách hàng thanh toán nhiều nhất.
   - *Cảnh báo Dòng tiền:* Phát hiện lúc chi phí đầu vào tăng vọt.
   - *Lời khuyên Bán hàng:* Gợi ý tung khuyến mãi hoặc quảng cáo để chốt đơn.

### 8.8 Giao dịch gần đây

- Hiển thị **5 giao dịch mới nhất**
- Nhấn **"Xem tất cả →"** để chuyển sang màn hình Giao dịch đầy đủ

---

## 9. Hỏi FinWise (Hỗ trợ AI)

### 9.1 Truy cập

Nhấn **"Hỏi FinWise"** trong Công cụ nhanh trên Dashboard.

### 9.2 Chức năng

Đây là chatbot hỗ trợ khách hàng, giúp bạn:
- 📖 **Hướng dẫn sử dụng** các tính năng của app
- ❓ **Giải đáp thắc mắc** về ứng dụng
- 💡 **Mẹo quản lý tài chính** hiệu quả

### 9.3 Câu hỏi nhanh

Khi mới mở, 6 câu hỏi gợi ý hiển thị sẵn — nhấn để hỏi ngay:

| Câu hỏi | Nội dung |
|----------|----------|
| Hướng dẫn thêm giao dịch | Cách ghi chép thu chi bằng AI |
| Xem báo cáo tài chính ở đâu? | Hướng dẫn truy cập báo cáo |
| Cách đặt mục tiêu tiết kiệm | Hướng dẫn tạo và quản lý mục tiêu |
| Quản lý ví điện tử thế nào? | Cách thêm, quản lý tài khoản |
| FinWise AI giúp được gì? | Giới thiệu các tính năng AI |
| Cách thiết lập ngân sách | Hướng dẫn đặt hạn mức chi tiêu |

### 9.4 Hỏi tự do

Nhập bất kỳ câu hỏi nào liên quan đến app hoặc tài chính cá nhân, AI sẽ trả lời cụ thể và chi tiết.

> 💡 **Khác biệt với nút "+"**: Nút **"+"** dùng để ghi chép giao dịch, còn **"Hỏi FinWise"** dùng để hỏi đáp và hướng dẫn.

---

## 10. Kiến thức tài chính

### 10.1 Truy cập

Nhấn **"Mẹo tài chính"** trong Công cụ nhanh trên Dashboard.

### 10.2 Nội dung

8 bài viết kiến thức tài chính:

| # | Bài viết | Danh mục | Thời gian đọc |
|---|----------|----------|---------------|
| 1 | Quy tắc 50/30/20 | Ngân sách | 3 phút |
| 2 | Quỹ khẩn cấp 6 tháng | Tiết kiệm | 4 phút |
| 3 | Đầu tư sớm, lãi kép hoạt động | Đầu tư | 5 phút |
| 4 | Cắt giảm chi phí không cần thiết | Ngân sách | 4 phút |
| 5 | Trả nợ thẻ tín dụng đúng hạn | Nợ | 3 phút |
| 6 | Bảo hiểm nhân thọ bao nhiêu là đủ? | Bảo hiểm | 6 phút |
| 7 | Đa dạng hóa danh mục đầu tư | Đầu tư | 4 phút |
| 8 | Tiết kiệm tự động hóa | Tiết kiệm | 2 phút |

### 10.3 Lọc theo danh mục

Nhấn vào các tab lọc: **Tất cả**, **Tiết kiệm**, **Đầu tư**, **Ngân sách**, **Nợ**, **Bảo hiểm**.

### 10.4 Đọc bài viết

Nhấn vào thẻ bài viết để **mở rộng** xem nội dung chi tiết. Nhấn lại để thu gọn.

---

## 11. Hồ sơ cá nhân

### 11.1 Truy cập

Nhấn tab **"Hồ sơ"** ở thanh điều hướng dưới.

### 11.2 Thống kê tài chính

Hiển thị 3 chỉ số:
- Thu nhập hàng tháng
- Chi tiêu hàng tháng
- Tiết kiệm

### 11.3 Chỉnh sửa hồ sơ

1. Nhấn **"Chỉnh sửa hồ sơ"**
2. Thay đổi:
   - Tên hiển thị
   - Số điện thoại
   - Email (chỉ đọc, không thay đổi)
3. Nhấn **"Lưu thay đổi"**

### 11.4 Đổi mật khẩu

1. Nhấn **"Đổi mật khẩu"**
2. Nhập:
   - Mật khẩu hiện tại
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
3. Nhấn **"Cập nhật"**

### 11.5 Giao diện

- **Chế độ tối**: Bật/tắt bằng công tắc để chuyển giao diện sáng/tối

### 11.6 Ngôn ngữ

1. Nhấn **"Ngôn ngữ"**
2. Chọn: 🇻🇳 Tiếng Việt hoặc 🇬🇧 English

### 11.7 Hỗ trợ

- **Trung tâm hỗ trợ**: Hiện thông tin liên hệ (hotline, email)
- **Chính sách bảo mật**: Mở liên kết chính sách
- **Về ứng dụng**: Xem phiên bản, mô tả, thông tin liên hệ

### 11.8 Đăng xuất

Nhấn nút **"Đăng xuất"** màu đỏ ở cuối trang → Xác nhận.

---

## 12. Cài đặt

### 12.1 Truy cập

Nhấn **"Cài đặt"** trong Công cụ nhanh trên Dashboard.

### 12.2 Tài khoản cá nhân

- Xem/chỉnh sửa thông tin cá nhân
- Thiết lập tiền tệ mặc định
- Chọn múi giờ

### 12.3 Ngân sách & Chi tiêu

- Thiết lập ngân sách hàng tháng
- Quản lý danh mục chi tiêu
- Cấu hình chi phí định kỳ

### 12.4 Thông báo

| Tùy chọn | Mô tả |
|-----------|-------|
| Thông báo đẩy | Bật/tắt thông báo chung |
| Cảnh báo ngân sách | Thông báo khi vượt ngân sách |
| Nhắc thanh toán | Nhắc hóa đơn đến hạn |
| Tổng kết tuần | Báo cáo chi tiêu hàng tuần |

### 12.5 Tài khoản liên kết

- Quản lý tài khoản ngân hàng đã liên kết
- Quản lý ví điện tử đã liên kết
- Bật/tắt **đồng bộ tự động**

### 12.6 Sao lưu & Dữ liệu

- **Sao lưu tự động**: Bật/tắt
- **Sao lưu ngay**: Nhấn để sao lưu dữ liệu
- **Xuất dữ liệu**: Xuất file dữ liệu
- **Khôi phục**: Khôi phục từ bản sao lưu

### 12.7 Bảo mật

- Đổi mật khẩu
- Bật/tắt **khóa PIN**
- Bật/tắt **Vân tay / Face ID**
- Đăng xuất

---

## 13. Câu hỏi thường gặp (FAQ)

### Dữ liệu của tôi lưu ở đâu?
Dữ liệu được lưu **cục bộ trên thiết bị** bằng SQLite. Không có dữ liệu nào được gửi lên server (trừ khi bạn chat với AI).

### AI có đọc được dữ liệu tài chính của tôi không?
Khi bạn hỏi AI về tài chính, app sẽ gửi **tóm tắt giao dịch** (không gửi thông tin cá nhân nhạy cảm) lên API để phân tích.

### Tôi có thể dùng app khi không có mạng không?
Có. Toàn bộ chức năng ghi chép, xem giao dịch, ngân sách, ví, mục tiêu đều hoạt động **offline**. Chỉ các tính năng AI (ghi chép bằng chat, dự báo, hỏi đáp) cần kết nối mạng.

### Làm sao để xóa toàn bộ dữ liệu?
Vào **Cài đặt** → **Sao lưu & Dữ liệu** → Xóa dữ liệu. Hoặc gỡ cài đặt app.

### App hỗ trợ những loại tiền tệ nào?
Hiện tại app mặc định sử dụng **Việt Nam Đồng (VNĐ)**.

### Tôi quên mật khẩu thì phải làm sao?
Nhấn **"Quên mật khẩu?"** ở màn hình đăng nhập và nhập email đã đăng ký để nhận link đặt lại mật khẩu.

---

## 📞 Liên hệ hỗ trợ

- **Email**: support@finwise.vn
- **Phiên bản**: 1.0.0

---

> *Tài liệu này được tạo cho FinWise v1.0.0 — Ứng dụng quản lý tài chính cá nhân thông minh.*
