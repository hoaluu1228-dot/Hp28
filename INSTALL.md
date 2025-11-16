# Hướng dẫn cài đặt chi tiết - UXP Extension

## Yêu cầu

- Adobe Premiere Pro CC 2022 hoặc mới hơn (version 22.0.0+)
- Windows 10/11 hoặc macOS 10.15+
- UXP Developer Tool (cho development/testing)

## Phương pháp cài đặt

### Phương pháp 1: Sử dụng UXP Developer Tool (Recommended)

Đây là cách dễ nhất và phù hợp cho development.

#### Bước 1: Tải và cài đặt UXP Developer Tool

1. Truy cập: https://developer.adobe.com/photoshop/uxp/devtool/
2. Tải phiên bản phù hợp với hệ điều hành của bạn
3. Cài đặt UXP Developer Tool (UDT)

#### Bước 2: Mở UXP Developer Tool

1. Launch UXP Developer Tool
2. Bạn sẽ thấy danh sách các Adobe apps đang chạy

#### Bước 3: Load Extension

1. Click nút **"Add Plugin..."** ở góc trên
2. Browse đến thư mục chứa extension này (thư mục có file `manifest.json`)
3. Click **"Select Folder"**
4. Extension sẽ xuất hiện trong danh sách

#### Bước 4: Load vào Premiere Pro

1. Đảm bảo Premiere Pro đang chạy
2. Trong UDT, tìm extension "Image Caption Sync"
3. Click nút **"..."** (More Actions)
4. Chọn **"Load"**
5. Extension sẽ được load vào Premiere Pro

#### Bước 5: Mở Panel

Trong Premiere Pro:
1. Vào menu `Window > Extensions`
2. Chọn `Image Caption Sync`
3. Panel sẽ mở ra

### Phương pháp 2: Cài đặt thủ công (Production Use)

Phù hợp khi bạn muốn extension luôn có sẵn mà không cần UDT.

#### Windows

1. Mở File Explorer
2. Navigate đến thư mục:
   ```
   C:\Program Files\Common Files\Adobe\UXP\PluginsStorage\PPRO\<version>\External\
   ```

   Ví dụ:
   - Premiere Pro 2022: `.../PPRO/22/External/`
   - Premiere Pro 2023: `.../PPRO/23/External/`
   - Premiere Pro 2024: `.../PPRO/24/External/`

3. Nếu thư mục không tồn tại, tạo thủ công

4. Copy toàn bộ thư mục extension vào đây

   Cấu trúc sau khi copy:
   ```
   External/
   └── ImageCaptionSync/
       ├── manifest.json
       ├── index.html
       ├── index.js
       ├── styles.css
       └── icons/
   ```

5. Restart Premiere Pro

#### macOS

1. Mở Finder
2. Nhấn `Cmd + Shift + G` để Go to Folder
3. Paste đường dẫn:
   ```
   /Library/Application Support/Adobe/UXP/PluginsStorage/PPRO/<version>/External/
   ```

   Ví dụ:
   - Premiere Pro 2022: `.../PPRO/22/External/`
   - Premiere Pro 2023: `.../PPRO/23/External/`

4. Nếu thư mục không tồn tại, tạo thủ công (có thể cần quyền admin)

5. Copy toàn bộ thư mục extension vào đây

6. Restart Premiere Pro

### Phương pháp 3: Package thành .ccx và cài đặt

**CCX (Creative Cloud Extension)** là file package chuẩn của Adobe để distribute UXP extensions.
Phù hợp khi muốn share extension cho người khác hoặc cài đặt production version.

#### Bước 1: Package Extension

1. Mở UXP Developer Tool
2. Load extension như Phương pháp 1
3. Click nút **"..."** (More Actions) bên cạnh extension
4. Chọn **"Package"**
5. Chọn thư mục output để lưu file
6. UDT sẽ build và tạo file `.ccx`

**Lưu ý:**
- File CCX được sign và validate bởi Adobe
- Có thể distribute qua email, download link, etc.
- End-users không cần UXP Developer Tool để cài đặt

#### Bước 2: Cài đặt file .ccx

**Cách 1: Double-click (Đơn giản nhất)**

**Windows:**
1. Double-click file `.ccx`
2. Windows sẽ tự động mở Adobe Extension Manager
3. Follow hướng dẫn để cài đặt
4. Extension sẽ có sẵn trong Premiere Pro

**macOS:**
1. Double-click file `.ccx`
2. macOS sẽ tự động mở Adobe Extension Manager
3. Follow hướng dẫn để cài đặt
4. Extension sẽ có sẵn trong Premiere Pro

**Cách 2: Qua Creative Cloud Desktop App**

1. Mở Adobe Creative Cloud Desktop App
2. Vào tab **"Stock & Marketplace"** hoặc **"Manage"**
3. Tìm phần Extensions
4. Kéo thả file `.ccx` vào
5. Hoặc click "Install from file" và chọn file `.ccx`
6. Extension sẽ được cài đặt tự động

**Cách 3: Command Line (Advanced)**

**Windows:**
```cmd
ExManCmd /install "path/to/extension.ccx"
```

**macOS:**
```bash
/Applications/Adobe\ Extension\ Manager\ CC/Adobe\ Extension\ Manager\ CC.app/Contents/MacOS/ExManCmd --install "path/to/extension.ccx"
```

## Kiểm tra cài đặt thành công

1. Mở Premiere Pro
2. Vào menu `Window > Extensions`
3. Bạn sẽ thấy `Image Caption Sync` trong danh sách
4. Click để mở panel
5. Panel sẽ hiển thị UI với nút "Phân tích Timeline" và "Đồng bộ"

## Debug và Development

### Bật Chrome DevTools

Khi extension đang chạy trong Premiere Pro qua UDT:

1. Trong UXP Developer Tool
2. Tìm extension "Image Caption Sync" trong danh sách
3. Click nút **"Debug"**
4. Chrome DevTools sẽ mở
5. Bạn có thể xem Console, inspect elements, debug JavaScript

### Reload Extension sau khi chỉnh sửa code

1. Chỉnh sửa code trong editor của bạn
2. Save files
3. Trong UDT, click **"Reload"** hoặc **"Watch"** để auto-reload
4. Extension sẽ reload với code mới
5. **Không cần restart Premiere Pro**

### Watch Mode (Auto-reload)

1. Trong UDT, click nút **"..."** bên cạnh extension
2. Enable **"Watch"**
3. Mỗi khi bạn save file, extension sẽ tự động reload

## Troubleshooting

### Extension không xuất hiện trong menu

**Nguyên nhân:**
- Premiere Pro version < 22.0.0
- Extension không được load đúng cách
- Manifest.json có lỗi

**Giải pháp:**
1. Kiểm tra phiên bản Premiere Pro: `Help > About Adobe Premiere Pro`
2. Trong UDT, kiểm tra xem có error messages không
3. Click "Reload" trong UDT
4. Restart Premiere Pro

### Extension load nhưng UI không hiển thị

**Nguyên nhân:**
- Lỗi trong HTML/CSS
- File path không đúng

**Giải pháp:**
1. Mở DevTools và kiểm tra Console
2. Kiểm tra file `index.html` có tồn tại không
3. Kiểm tra đường dẫn trong manifest.json

### Lỗi khi phân tích timeline

**Nguyên nhân:**
- Không có sequence active
- Lỗi trong JavaScript code
- Không có quyền truy cập API

**Giải pháp:**
1. Đảm bảo đã mở một sequence trong Premiere Pro
2. Mở DevTools và xem Console errors
3. Kiểm tra manifest.json có đủ permissions không

### Extension bị crash

**Giải pháp:**
1. Mở DevTools trước để xem lỗi
2. Reload extension trong UDT
3. Nếu vẫn bị, restart Premiere Pro

## Uninstall Extension

### Nếu cài qua UDT:

1. Mở UXP Developer Tool
2. Tìm extension trong danh sách
3. Click **"..."** > **"Remove"**
4. Restart Premiere Pro

### Nếu cài thủ công:

1. Xóa thư mục extension khỏi:
   - Windows: `C:\Program Files\Common Files\Adobe\UXP\PluginsStorage\PPRO\<version>\External\ImageCaptionSync\`
   - macOS: `/Library/Application Support/Adobe/UXP/PluginsStorage/PPRO/<version>/External/ImageCaptionSync/`

2. Restart Premiere Pro

### Nếu cài qua .ccx:

1. Sử dụng Adobe Extension Manager để uninstall
2. Hoặc xóa thủ công như trên

## Tips cho Development

### 1. Sử dụng Console.log

Trong `index.js`, thêm:
```javascript
console.log('Debug message:', data);
```

Xem output trong Chrome DevTools.

### 2. Kiểm tra Manifest

Nếu thay đổi `manifest.json`, bạn cần:
1. Reload extension trong UDT
2. Hoặc restart Premiere Pro

### 3. Hot Reload

Enable Watch mode trong UDT để tự động reload khi save files.

### 4. Test với nhiều sequences

Test extension với:
- Sequence rỗng
- Sequence có nhiều tracks
- Sequence với tên file đặc biệt

## Resources

- UXP Documentation: https://developer.adobe.com/photoshop/uxp/
- Premiere Pro API: https://ppro-scripting.docsforadobe.dev/
- UXP Developer Forum: https://forums.creativeclouddeveloper.com/

## Liên hệ hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Console trong DevTools
2. Kiểm tra log trong UDT
3. Tạo issue trên GitHub với:
   - Premiere Pro version
   - OS version
   - Error messages
   - Screenshots
