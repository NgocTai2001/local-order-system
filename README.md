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

Vào Admin, tab `Bàn & QR`, copy link hoặc in QR của `Bàn 01` để lấy token thật.

## Test flow

1. Mở <http://localhost:8080/admin>.
2. Vào tab `Bàn & QR`.
3. Copy link order, tải QR Wi-Fi/QR Order hoặc in sticker của `Bàn 01`.
4. Mở link `/t/<token>` trên trình duyệt hoặc điện thoại cùng mạng.
5. Chọn món và đặt món.
6. Mở <http://localhost:8080/kitchen>.
7. Kiểm tra bếp nhận order realtime và đổi trạng thái đơn.
8. Thử `Print Sticker` từng bàn và `Print All Stickers`.

## Database

SQLite tự tạo khi API khởi động lần đầu tại `data/sqlite/tableflow.db`.
Ảnh món upload từ Admin được lưu tại `data/uploads/menu/` và được serve qua `/uploads/menu/...`.

Các bảng chính:

- `tables`: tên bàn, token QR riêng, trạng thái bàn.
- `table_sessions`: bill/phiên bàn hiện tại, trạng thái `open` hoặc `closed`.
- `restaurant_info`: tên quán, địa chỉ, số điện thoại, nhân viên thu ngân dùng cho giao diện và bill.
- `menu_items`: món, loại `food`/`drink`, giá, ảnh URL, trạng thái đang bán.
- `orders`: đơn hàng theo `table_id`, thuộc một `table_session` khi bàn đang mở bill.
- `order_items`: món trong đơn, lưu snapshot tên/giá tại thời điểm đặt.

Seed lần đầu:

- 10 bàn: `Bàn 01` đến `Bàn 10`, mỗi bàn có token random riêng.
- 7 món mẫu: Bún bò, Phở bò, Cơm tấm, Bánh mì thuộc `food`; Trà đào, Coca, Pepsi thuộc `drink`.

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

GET    /api/restaurant
GET    /api/admin/restaurant
PATCH  /api/admin/restaurant

GET    /api/tables
GET    /api/tables/token/:token
POST   /api/tables
POST   /api/tables/bulk
PUT    /api/tables/:id
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
```

Khi khách gọi món, API tự tìm `table_session` đang mở của bàn. Nếu chưa có, API tạo session mới, gắn order vào session đó và chuyển bàn sang `occupied`. Khách gọi thêm lần 2, lần 3 thì các order mới vẫn thuộc cùng session để Admin xem được tổng bill của bàn.

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

Ví dụ tạo order:

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 1,
    "items": [
      { "menu_item_id": 1, "quantity": 2 },
      { "menu_item_id": 5, "quantity": 1 }
    ]
  }'
```

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
