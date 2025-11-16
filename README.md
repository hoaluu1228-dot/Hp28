# Image Caption Sync - Premiere Pro CEP Extension

Extension CEP cho Adobe Premiere Pro để tự động đồng bộ hóa thời gian của ảnh và caption dựa trên số trong tên file.

## Tính năng

- 🔍 **Phân tích Timeline**: Tự động quét và phát hiện caption và ảnh trong sequence
- 🎯 **Matching thông minh**: Đồng bộ dựa trên số cuối trong caption và tên ảnh
- ⚡ **Đồng bộ tự động**: Tự động điều chỉnh thời gian của ảnh để khớp với caption
- 📊 **Báo cáo chi tiết**: Hiển thị số lượng cặp matched và unmatched
- 🎨 **UI hiện đại**: Dark theme với gradient buttons

## Quy tắc matching và đồng bộ

Extension sẽ match caption và ảnh dựa trên quy tắc sau:

- **Caption** phải có format: `XXX. Text...` (ví dụ: `002. In 1770`)
- **Ảnh** phải có số ở cuối tên file (ví dụ: `102.png`, `image_025.jpg`)
- Hệ thống sẽ lấy **2 số cuối** của caption và match với **2 số cuối** của tên ảnh

### Ví dụ matching:

| Caption | Số lấy từ caption | Ảnh | Số lấy từ ảnh | Kết quả |
|---------|------------------|-----|---------------|---------|
| `002. In 1770` | `02` | `102.png` | `02` | ✅ Match |
| `015. The story` | `15` | `img_015.jpg` | `15` | ✅ Match |
| `003. Example` | `03` | `204.png` | `04` | ❌ Không match |

### Logic đồng bộ (Cùng thời gian):

Khi đồng bộ, ảnh sẽ có **cùng thời gian** với caption tương ứng (chỉ khác track):

```
Timeline trước đồng bộ:
Track 1 - Captions:
├── Caption 001: [0s -------- 5s]
└── Caption 002: [5s ------------- 13s]

Track 2 - Images (chưa sync):
├── Image 101: [20s --- 23s]      ← Vị trí ngẫu nhiên
└── Image 102: [30s --- 33s]      ← Vị trí ngẫu nhiên

Timeline sau đồng bộ:
Track 1 - Captions:
├── Caption 001: [0s -------- 5s]
└── Caption 002: [5s ------------- 13s]

Track 2 - Images (đã sync):
├── Image 101:   [0s -------- 5s]    ← Cùng thời gian với Caption 001
└── Image 102:   [5s ------------- 13s]    ← Cùng thời gian với Caption 002
```

**Logic:**
1. Tìm caption và ảnh matching (dựa trên số)
2. Sắp xếp theo thứ tự số caption (001, 002, 003...)
3. Đồng bộ thời gian: `Image.start = Caption.start` và `Image.end = Caption.end`
4. Kết quả: Caption và Image cùng timing, chỉ khác track (ở dưới)

## Yêu cầu hệ thống

- **Adobe Premiere Pro CC 2018 trở lên** (bao gồm 2025)
- Windows 10/11 hoặc macOS 10.15+

## Cài đặt

### Bước 1: Copy extension vào thư mục CEP

#### Windows:
```
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\ImageCaptionSync\
```

#### macOS:
```
/Library/Application Support/Adobe/CEP/extensions/ImageCaptionSync/
```

Copy toàn bộ nội dung của thư mục này vào thư mục `ImageCaptionSync`.

### Bước 2: Enable debug mode

Để chạy extension không được ký, bạn cần enable debug mode:

#### Windows:
1. Mở Registry Editor (`regedit`)
2. Tạo key mới tại: `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`
3. Tạo String Value tên `PlayerDebugMode` với giá trị `1`

#### macOS:
Mở Terminal và chạy:
```bash
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

**Lưu ý**: Số phiên bản (11) có thể khác nhau tùy thuộc vào phiên bản Premiere Pro:
- CC 2018: CSXS.8
- CC 2019-2020: CSXS.9
- CC 2021: CSXS.10
- CC 2022-2025: CSXS.11

### Bước 3: Khởi động lại Premiere Pro

Sau khi cài đặt, khởi động lại Premiere Pro.

### Bước 4: Mở Extension

Trong Premiere Pro, vào menu:
```
Window > Extensions > Image Caption Sync
```

## Sử dụng

### 1. Chuẩn bị Timeline

Đảm bảo sequence của bạn có:
- **Caption clips** với tên format: `XXX. Text...`
- **Ảnh** với tên có số ở cuối

### 2. Phân tích

1. Mở extension từ menu `Window > Extensions > Image Caption Sync`
2. Click nút **"Phân tích Timeline"**
3. Extension sẽ quét toàn bộ timeline và hiển thị:
   - Tổng số caption và ảnh
   - Số cặp có thể đồng bộ
   - Chi tiết matching

### 3. Đồng bộ

1. Kiểm tra kết quả phân tích
2. Click nút **"Đồng bộ"** để thực hiện đồng bộ
3. Ảnh sẽ được di chuyển để khớp với thời gian của caption tương ứng

## Cấu trúc Project

```
ImageCaptionSync/
├── CSXS/
│   └── manifest.xml          # Manifest cho CEP extension
├── client/
│   ├── index.html            # Giao diện UI
│   ├── styles.css            # Styling
│   ├── main.js               # Logic client-side
│   └── lib/
│       └── CSInterface.js    # Thư viện CEP
├── host/
│   └── index.jsx             # ExtendScript cho Premiere Pro
├── .debug                    # Debug configuration
├── package.json
└── README.md
```

## Troubleshooting

### Extension không xuất hiện trong menu

1. Kiểm tra xem extension đã được copy đúng thư mục chưa
2. Đảm bảo debug mode đã được enable
3. Khởi động lại Premiere Pro
4. Kiểm tra phiên bản CSXS trong registry/defaults

### Extension bị lỗi khi chạy

1. Mở Chrome DevTools để debug:
   - Windows/Linux: Right-click extension panel → Inspect
   - macOS: Cmd+Opt+I
2. Kiểm tra Console để xem lỗi
3. Đảm bảo sequence đang được mở trong Premiere Pro

### Caption hoặc ảnh không được phát hiện

1. Kiểm tra format tên caption: phải có số và dấu chấm ở đầu
2. Kiểm tra tên ảnh có số ở cuối không
3. Đảm bảo clips nằm trên video track (không phải audio track)

## License

MIT License

## Liên hệ

- GitHub: [hoaluu1228-dot/Hp28](https://github.com/hoaluu1228-dot/Hp28)

## Changelog

### Version 1.0.0 (2025-11-16)
- Phiên bản CEP cho Premiere Pro 2018-2025
- Support tất cả versions kể cả Premiere Pro 2025
- Tính năng phân tích timeline
- Tính năng matching và đồng bộ
- Giao diện UI hoàn chỉnh
