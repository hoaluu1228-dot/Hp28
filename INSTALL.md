# Hướng dẫn cài đặt chi tiết

## 1. Xác định thư mục cài đặt

### Windows
Thư mục extensions của CEP thường nằm ở:
```
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
```

Nếu không tồn tại, bạn có thể tạo thủ công.

### macOS
```
/Library/Application Support/Adobe/CEP/extensions/
```

Hoặc thư mục user-specific:
```
~/Library/Application Support/Adobe/CEP/extensions/
```

## 2. Copy extension

1. Tạo thư mục mới tên `ImageCaptionSync` trong thư mục extensions
2. Copy toàn bộ nội dung của project vào thư mục đó

Cấu trúc sau khi copy:
```
extensions/
└── ImageCaptionSync/
    ├── CSXS/
    ├── client/
    ├── host/
    ├── .debug
    └── package.json
```

## 3. Enable Debug Mode

### Windows - Sử dụng Registry

1. Nhấn `Win + R`, gõ `regedit` và Enter
2. Navigate đến: `HKEY_CURRENT_USER\Software\Adobe`
3. Tìm hoặc tạo key `CSXS.9` (hoặc version tương ứng)
4. Click phải > New > String Value
5. Đặt tên: `PlayerDebugMode`
6. Double click và set value: `1`

### Windows - Sử dụng file .reg

Tạo file `enable-debug.reg`:

```reg
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Adobe\CSXS.9]
"PlayerDebugMode"="1"

[HKEY_CURRENT_USER\Software\Adobe\CSXS.10]
"PlayerDebugMode"="1"

[HKEY_CURRENT_USER\Software\Adobe\CSXS.11]
"PlayerDebugMode"="1"
```

Double-click để import vào registry.

### macOS - Sử dụng Terminal

```bash
# For CC 2019-2020 (CSXS.9)
defaults write com.adobe.CSXS.9 PlayerDebugMode 1

# For CC 2021 (CSXS.10)
defaults write com.adobe.CSXS.10 PlayerDebugMode 1

# For CC 2022+ (CSXS.11)
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

## 4. Xác định phiên bản CSXS

Tùy thuộc vào phiên bản Premiere Pro:

| Premiere Pro Version | CSXS Version |
|---------------------|--------------|
| CC 2017 | CSXS.7 |
| CC 2018 | CSXS.8 |
| CC 2019 | CSXS.9 |
| CC 2020 | CSXS.9 |
| CC 2021 | CSXS.10 |
| CC 2022 | CSXS.11 |
| CC 2023+ | CSXS.11 |

## 5. Kiểm tra Extension

1. Khởi động lại Premiere Pro
2. Vào `Window > Extensions`
3. Bạn sẽ thấy `Image Caption Sync` trong danh sách
4. Click để mở panel

## 6. Debug (nếu có lỗi)

### Mở Chrome DevTools

Khi extension đang mở trong Premiere Pro:

**Windows/Linux:**
- Nhấn `Ctrl + Alt + I`

**macOS:**
- Nhấn `Cmd + Opt + I`

DevTools sẽ mở và bạn có thể xem Console để debug JavaScript errors.

### Kiểm tra ExtendScript Toolkit

Để debug phần ExtendScript (host-side):

1. Download và cài đặt ExtendScript Toolkit
2. Mở file `host/index.jsx`
3. Chọn target application là Premiere Pro
4. Set breakpoints và debug

## 7. Xử lý lỗi thường gặp

### Extension không hiển thị trong menu

**Nguyên nhân:**
- Debug mode chưa được enable
- Extension không được copy đúng vị trí
- Manifest.xml có lỗi cấu hình

**Giải pháp:**
1. Kiểm tra lại debug mode
2. Xác nhận cấu trúc thư mục
3. Kiểm tra file manifest.xml không có lỗi syntax

### Extension hiển thị nhưng không load

**Nguyên nhân:**
- File CSInterface.js bị thiếu
- Lỗi trong JavaScript code

**Giải pháp:**
1. Mở DevTools và kiểm tra Console
2. Đảm bảo file `client/lib/CSInterface.js` tồn tại
3. Kiểm tra lỗi JavaScript trong Console

### Extension load nhưng không tương tác được với Premiere

**Nguyên nhân:**
- Lỗi trong ExtendScript code
- Không có sequence đang active

**Giải pháp:**
1. Mở một sequence trong Premiere Pro
2. Kiểm tra file `host/index.jsx`
3. Xem log trong extension UI

## 8. Update Extension

Khi cần update extension:

1. Đóng Premiere Pro
2. Thay thế các file trong thư mục extension
3. Khởi động lại Premiere Pro
4. Extension sẽ tự động reload với code mới

## 9. Gỡ cài đặt

1. Đóng Premiere Pro
2. Xóa thư mục `ImageCaptionSync` khỏi thư mục extensions
3. (Optional) Xóa registry key hoặc defaults nếu muốn disable debug mode

## Liên hệ hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra Console trong DevTools
2. Kiểm tra log trong UI của extension
3. Tạo issue trên GitHub với thông tin chi tiết về lỗi
