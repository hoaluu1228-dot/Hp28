# Image Caption Sync - Premiere Pro UXP Extension

Extension UXP cho Adobe Premiere Pro để tự động đồng bộ hóa thời gian của ảnh và caption dựa trên số trong tên file.

## Tính năng

- 🔍 **Phân tích Timeline**: Tự động quét và phát hiện caption và ảnh trong sequence
- 🎯 **Matching thông minh**: Đồng bộ dựa trên số cuối trong caption và tên ảnh
- ⚡ **Đồng bộ tự động**: Tự động điều chỉnh thời gian của ảnh để khớp với caption
- 📊 **Báo cáo chi tiết**: Hiển thị số lượng cặp matched và unmatched
- 🎨 **UXP Modern**: Sử dụng UXP platform mới nhất của Adobe

## Quy tắc matching

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

## Yêu cầu hệ thống

- **Adobe Premiere Pro CC 2022 trở lên** (version 22.0.0+)
- Windows 10/11 hoặc macOS 10.15+
- UXP Developer Tool (cho development)

## Cài đặt

### Phương pháp 1: Sử dụng UXP Developer Tool (Recommended cho Development)

1. **Tải UXP Developer Tool**:
   - Tải từ: https://developer.adobe.com/photoshop/uxp/devtool/
   - Cài đặt UDT trên máy tính

2. **Load Extension**:
   - Mở UXP Developer Tool
   - Click "Add Plugin"
   - Chọn thư mục chứa `manifest.json` của extension này
   - Click "Load"
   - Extension sẽ xuất hiện trong Premiere Pro

### Phương pháp 2: Cài đặt trực tiếp (Production)

#### Windows:
```
C:\Program Files\Common Files\Adobe\UXP\PluginsStorage\PPRO\<version>\External\
```

#### macOS:
```
/Library/Application Support/Adobe/UXP/PluginsStorage/PPRO/<version>/External/
```

Copy toàn bộ thư mục extension vào đây và restart Premiere Pro.

### Phương pháp 3: Package thành .ccx

1. Sử dụng UXP Developer Tool để package extension
2. Click "Package" trong UDT
3. Tạo file .ccx
4. Double-click file .ccx để cài đặt

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
├── manifest.json         # UXP manifest configuration
├── index.html           # Panel UI
├── styles.css           # Modern dark theme styling
├── index.js             # Main logic with UXP APIs
├── icons/               # Extension icons
├── package.json         # Project metadata
├── README.md
└── INSTALL.md
```

## Development

### Debug Extension

1. Load extension qua UXP Developer Tool
2. Click "Debug" trong UDT
3. Chrome DevTools sẽ mở
4. Kiểm tra Console để debug

### Rebuild sau khi chỉnh sửa

1. Trong UDT, click "Reload"
2. Extension sẽ reload với code mới
3. Không cần restart Premiere Pro

## Troubleshooting

### Extension không xuất hiện trong menu

1. Kiểm tra Premiere Pro version >= 22.0.0
2. Reload extension trong UXP Developer Tool
3. Restart Premiere Pro

### Lỗi khi phân tích timeline

1. Đảm bảo có sequence đang mở
2. Kiểm tra Console trong DevTools
3. Đảm bảo clips có tên đúng format

### Caption hoặc ảnh không được phát hiện

1. Caption phải bắt đầu bằng số và dấu chấm (vd: `002.`)
2. Ảnh phải có extension hợp lệ (.png, .jpg, .jpeg, etc.)
3. Clips phải nằm trên video track

## API Reference

Extension sử dụng các UXP APIs sau:

- `window.require('premierepro')` - Truy cập Premiere Pro API
- `app.project.activeSequence` - Lấy sequence đang active
- `sequence.videoTracks` - Truy cập video tracks
- `clip.start.seconds` / `clip.end.seconds` - Thao tác với timing

## Khác biệt so với CEP

| Feature | CEP | UXP |
|---------|-----|-----|
| Platform | Legacy | Modern |
| JavaScript | ES5 + ExtendScript | Modern ES6+ |
| API Access | CEPEngine bridge | Direct API access |
| Min Premiere Version | 2018+ | 2022+ |
| Development Tool | ExtendScript Toolkit | UXP Developer Tool |
| Performance | Slower | Faster |

## License

MIT License

## Liên hệ

- GitHub: [hoaluu1228-dot/Hp28](https://github.com/hoaluu1228-dot/Hp28)

## Changelog

### Version 1.0.0 (2025-11-16)
- Migrated từ CEP sang UXP platform
- Support Premiere Pro CC 2022+
- Sử dụng modern JavaScript APIs
- Cải thiện performance
- UI hiện đại với dark theme
