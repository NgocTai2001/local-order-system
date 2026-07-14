# Pho Viet - Local Order System MVP (Pi3B)

Hệ thống order món ăn chạy local bằng Docker, tối ưu cho mô hình nhỏ như quán ăn dùng Raspberry Pi 3B. Khách quét QR ở bàn, web tự nhận diện bàn và gửi đơn realtime cho bếp.

## Cấu trúc project

```text
local-order-system/
├── docker-compose.yml
├── server/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── web/
│   ├── index.html
│   ├── kitchen.html
│   ├── admin.html
│   ├── admin/
│   │   ├── statistics.html
│   │   ├── statistics.css
│   │   └── statistics.js
│   ├── css/
│   └── js/
├── nginx/
│   └── default.conf
└── data/
    └── sqlite/
        └── tableflow.db
```

## Chạy local

```bash
docker compose up -d --build
```

Xem log:

```bash
docker compose logs -f
```

Dừng:

```bash
docker compose down
```

## Truy cập

- Customer QR: <http://localhost:8080/t/TOKEN_CUA_BAN>
- Kitchen: <http://localhost:8080/kitchen>
- Admin: <http://localhost:8080/admin>
- Thống kê: <http://localhost:8080/admin/statistics>

Vào Admin, tab `Quản lý bàn`, chọn một bàn để xem link và tải QR order thật của bàn đó.

## Test flow

1. Mở <http://localhost:8080/admin>.
2. Vào tab `Quản lý bàn` và chọn `Bàn 01` trên sơ đồ.
3. Mở link order hoặc tải QR order trong màn hình chi tiết bàn.
4. Mở link `/t/<token>` trên trình duyệt hoặc điện thoại cùng mạng.
5. Chọn món và đặt món.
6. Mở <http://localhost:8080/kitchen>.
7. Kiểm tra bếp nhận order realtime và đổi trạng thái đơn.
8. Thử tạo khu vực, tạo bàn và bật chế độ sắp xếp để kéo bàn trên sơ đồ.
9. Thanh toán một bill, mở tab `Thống kê` và kiểm tra doanh thu cùng số lượng món đã bán.

## Database

SQLite tự tạo khi API khởi động lần đầu tại `data/sqlite/tableflow.db`.
Ảnh món upload từ Admin được lưu tại `data/uploads/menu/` và được serve qua `/uploads/menu/...`.

Các bảng chính:

- `areas`: khu vực phục vụ, thứ tự và trạng thái hiển thị.
- `tables`: khu vực, tên bàn, hình dạng, sức chứa, vị trí, kích thước, token QR và trạng thái bàn.
- `table_sessions`: bill/phiên bàn hiện tại, trạng thái `open` hoặc `closed`.
- `restaurant_info`: tên quán, địa chỉ, số điện thoại, nhân viên thu ngân dùng cho giao diện và bill.
- `menu_items`: món, danh mục, giá, ảnh, trạng thái đang bán.
- `option_groups`: nhóm tùy chọn động như Size, Đường, Đá, Topping.
- `option_values`: các lựa chọn trong từng nhóm, có thể cộng thêm tiền.
- `menu_item_option_groups`: gắn nhóm tùy chọn vào từng món.
- `orders`: đơn hàng theo `table_id`, thuộc một `table_session` khi bàn đang mở bill.
- `order_items`: món trong đơn, lưu snapshot tên/giá/ghi chú tại thời điểm đặt.
- `order_item_options`: snapshot tùy chọn đã chọn để bill/bếp không bị thay đổi khi Admin sửa cấu hình sau này.

Seed lần đầu:

- 10 bàn: `Bàn 01` đến `Bàn 10`, mỗi bàn có token random riêng.
- 7 món mẫu: Bún bò, Phở bò, Cơm tấm, Bánh mì thuộc `food`; Trà đào, Coca, Pepsi thuộc `drink`.
- 4 bộ tùy chọn mẫu: Size, Đường, Đá, Topping. Admin có thể sửa/xóa nếu chưa phát sinh order dùng tùy chọn đó.

## Tùy chọn món ăn

Admin vào tab `Menu` để quản lý bộ tùy chọn và gắn vào món. Mỗi bộ tùy chọn có thể chọn 1 hoặc chọn nhiều, có số lượng tối thiểu/tối đa, giá cộng thêm và trạng thái hiển thị.

Khi khách bấm món có tùy chọn, trang order mở popup để chọn option và ghi chú. Giỏ hàng sẽ tách dòng theo `món + tùy chọn + ghi chú`, ví dụ `Trà đào - Size L - Ít đá` là một dòng riêng với `Trà đào - Size M`.

Bếp, lịch sử món đã đặt và bill Admin đều hiển thị snapshot tùy chọn/ghi chú đúng tại thời điểm khách đặt.

## Thống kê doanh thu

Trang `/admin/statistics` chỉ sử dụng các order có trạng thái `paid`. Doanh thu được tính từ `order_items.subtotal`; top món được tổng hợp bằng `SUM(quantity)` và `GROUP BY` trực tiếp trong SQLite, giới hạn 10 món.

Dashboard hỗ trợ:

- Theo ngày: chọn một ngày cụ thể.
- Theo tuần: chọn ngày bất kỳ, server tự lấy tuần từ thứ Hai đến Chủ nhật.
- Theo tháng: chọn tháng cần xem.
- Tự cập nhật khi một bill vừa được thanh toán qua Socket.IO.

Mốc ngày được tính theo múi giờ Việt Nam (`UTC+7`). Không tạo thêm bảng thống kê hoặc dữ liệu giả.

## QR bàn

QR không lưu trong database. Admin gọi API thì server sinh QR động cho hai mục đích:

```text
WIFI:T:WPA;S:TABLEFLOW_ORDER;P:order1234;;
http://localhost:8080/t/<token>
```

QR Wi-Fi chỉ giúp điện thoại hiện popup kết nối Wi-Fi. QR Order là link dự phòng mở đúng trang đặt món của bàn. Khi chạy trên Raspberry Pi/captive portal, Order URL nên trỏ về địa chỉ local của máy chạy hệ thống, ví dụ:

```text
http://192.168.4.1/t/A8KX12QD
```

Các biến cấu hình liên quan trong `.env`:

```text
WIFI_SSID=TABLEFLOW_ORDER
WIFI_PASSWORD=order1234
WIFI_SECURITY=WPA
BASE_ORDER_URL=http://192.168.4.1
```

Nếu muốn cố định host cho QR order, ưu tiên đặt `BASE_ORDER_URL`. Biến cũ `PUBLIC_BASE_URL` vẫn được hỗ trợ làm fallback.

Reset token trong Admin sẽ làm QR cũ hết hiệu lực.

Response `GET /api/tables/:id/qr` gồm QR Wi-Fi và QR Order:

```json
{
  "table_id": 1,
  "name": "Bàn 01",
  "wifi": {
    "ssid": "TABLEFLOW_ORDER",
    "security": "WPA",
    "qrText": "WIFI:T:WPA;S:TABLEFLOW_ORDER;P:order1234;;",
    "qrDataUrl": "data:image/png;base64,..."
  },
  "order": {
    "url": "http://192.168.4.1/t/A8KX12QD",
    "qrText": "http://192.168.4.1/t/A8KX12QD",
    "qrDataUrl": "data:image/png;base64,..."
  }
}
```

## API

```text
GET    /api/menu
GET    /api/menu?all=1
POST   /api/menu
PUT    /api/menu/:id
PATCH  /api/menu/:id
DELETE /api/menu/:id

GET    /api/admin/option-groups
POST   /api/admin/option-groups
GET    /api/admin/option-groups/:id
PUT    /api/admin/option-groups/:id
PATCH  /api/admin/option-groups/:id
DELETE /api/admin/option-groups/:id
GET    /api/admin/menu/:id/options
PUT    /api/admin/menu/:id/options

GET    /api/restaurant
GET    /api/admin/restaurant
PATCH  /api/admin/restaurant

GET    /api/areas
POST   /api/areas
PUT    /api/areas/:id
DELETE /api/areas/:id

GET    /api/tables
GET    /api/tables?area_id=:area_id
GET    /api/tables/token/:token
POST   /api/tables
POST   /api/tables/bulk
PUT    /api/tables/:id
PATCH  /api/tables/positions
DELETE /api/tables/:id
POST   /api/tables/:id/regenerate-token
GET    /api/tables/:id/current-session
GET    /api/tables/:id/current-bill
PATCH  /api/tables/:id/close-session
GET    /api/tables/:id/qr
GET    /api/tables/qr/all

POST   /api/orders
GET    /api/orders
GET    /api/orders?status=pending
PATCH  /api/orders/:id/status

GET    /api/statistics?type=day&date=2026-07-14
GET    /api/statistics?type=week&date=2026-07-14
GET    /api/statistics?type=month&date=2026-07
```

Khi khách gọi món, API tự tìm `table_session` đang mở của bàn. Nếu chưa có, API tạo session mới, gắn order vào session đó và chuyển bàn sang `in_use`. Khách gọi thêm lần 2, lần 3 thì các order mới vẫn thuộc cùng session để Admin xem được tổng bill của bàn.

Ví dụ cập nhật thông tin quán:

```bash
curl -X PATCH http://localhost:8080/api/admin/restaurant \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pho Viet",
    "address": "123 Duong A",
    "phone": "0900000000",
    "cashier_name": "Tai"
  }'
```

Ví dụ xem bill hiện tại:

```bash
curl http://localhost:8080/api/tables/1/current-bill
```

Đóng bàn/thanh toán:

```bash
curl -X PATCH http://localhost:8080/api/tables/1/close-session
```

Kiểm tra API thống kê:

```bash
curl "http://localhost:8080/api/statistics?type=day&date=2026-07-14"
curl "http://localhost:8080/api/statistics?type=week&date=2026-07-14"
curl "http://localhost:8080/api/statistics?type=month&date=2026-07"
```

Ví dụ tạo order:

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 1,
    "items": [
      {
        "menu_item_id": 1,
        "quantity": 2,
        "selected_option_value_ids": [1, 5],
        "customer_note": "Ít hành"
      },
      { "menu_item_id": 5, "quantity": 1 }
    ]
  }'
```

API luôn tự kiểm tra option theo cấu hình hiện tại trong database và tự tính giá. Client chỉ gửi `selected_option_value_ids`, không gửi giá option.

Ví dụ cập nhật trạng thái:

```bash
curl -X PATCH http://localhost:8080/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "ready" }'
```

Trạng thái order:

```text
pending
cooking
ready
served
cancelled
paid
```

## Realtime

Khi khách đặt món, API lưu order vào SQLite và emit Socket.IO event `order:new`.

Khi bếp đổi trạng thái, API emit:

- `order:updated`
- `order:status_changed`

Trang bếp đang mở sẽ tự cập nhật, không cần refresh.

## Ghi chú Raspberry Pi 3B

- Dùng SQLite file local trong `data/sqlite/`, không cần MySQL/PostgreSQL/Redis.
- Nginx phục vụ file tĩnh và reverse proxy API/Socket.IO để giảm tải cho NodeJS.
- Frontend dùng HTML/CSS/Vanilla JS, không có build step.
- QR chỉ sinh khi admin cần xem/tải/in.
- Nếu build Docker trên Pi chậm, hãy đảm bảo Pi có swap đủ lớn vì package SQLite native cần biên dịch khi không có prebuilt binary phù hợp.
