# Local Order System - MVP (Pi3B)

Hệ thống order món ăn chạy local bằng Docker, tối ưu cho mô hình nhỏ như quán ăn dùng Raspberry Pi 3B.

## Cấu trúc project

```text
local-order-system/
├── docker-compose.yml
├── .env.example
├── server/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/
│       ├── database/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── socket/
│       └── utils/
├── web/
│   ├── index.html
│   ├── kitchen.html
│   ├── admin.html
│   ├── css/
│   └── js/
├── nginx/
│   └── default.conf
└── data/
    └── orders.db
```

## Chạy bằng Docker

```bash
docker compose up -d --build
```

Mặc định hệ thống chạy tại:

- Khách gọi món: <http://localhost:8080/?table=A1>
- Bếp: <http://localhost:8080/kitchen.html>
- Admin: <http://localhost:8080/admin.html>

Nếu muốn đổi port public:

```bash
cp .env.example .env
# sửa APP_PORT trong .env
docker compose up -d --build
```

## Database

SQLite tự tạo khi API khởi động lần đầu tại `data/orders.db`.

Các bảng:

- `menu_items`
- `orders`
- `order_items`

Menu được seed sẵn:

- Bún bò
- Phở
- Cơm tấm
- Bánh mì
- Trà đào
- Coca
- Pepsi

## API

```text
GET    /api/menu
POST   /api/menu
PATCH  /api/menu/:id
DELETE /api/menu/:id

POST   /api/orders
GET    /api/orders
GET    /api/orders?status=pending
PATCH  /api/orders/:id
```

Ví dụ tạo order:

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "table_token": "A1",
    "items": [
      { "menu_item_id": 1, "quantity": 2 },
      { "menu_item_id": 5, "quantity": 1 }
    ]
  }'
```

Ví dụ hoàn thành order:

```bash
curl -X PATCH http://localhost:8080/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{ "status": "completed" }'
```

## Realtime

Khi khách đặt món, API lưu order vào SQLite và emit Socket.IO event `order:new`.
Trang bếp đang mở sẽ tự cập nhật, không cần refresh.

## Ghi chú Raspberry Pi 3B

- Dùng SQLite file local trong `data/`, không cần MySQL/PostgreSQL/Redis.
- Nginx phục vụ file tĩnh và reverse proxy API để giảm tải cho NodeJS.
- API dùng ít dependency, logic đồng bộ đơn giản, phù hợp MVP local.
- Nếu build Docker trên Pi chậm, hãy đảm bảo Pi có swap đủ lớn vì package SQLite native cần biên dịch khi không có prebuilt binary phù hợp.
