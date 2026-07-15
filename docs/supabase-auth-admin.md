# Supabase Auth cho Admin

Tài liệu này dùng cho chức năng bắt buộc đăng nhập trước khi vào trang Admin. Flow khách hàng quét QR gọi món vẫn chạy public và không cần đăng nhập.

## 1. Bật Email/Password Auth

1. Vào Supabase Dashboard.
2. Chọn project của quán.
3. Vào `Authentication` -> `Providers`.
4. Bật `Email`.
5. Tạo user admin trong `Authentication` -> `Users`.

## 2. Tạo bảng quyền admin

Chạy migration:

```sql
supabase/migrations/001_admin_users.sql
```

Bảng được tạo:

```sql
public.admin_users (
  id uuid primary key references auth.users(id),
  email text,
  restaurant_id text,
  role text,
  created_at timestamptz,
  updated_at timestamptz
)
```

RLS đã được bật. Policy chỉ cho user đọc profile của chính mình hoặc profile cùng quán nếu user là `owner/admin`.

## 3. Gán user vào quán

Lấy `id` của user trong `Authentication -> Users`, sau đó insert:

```sql
insert into public.admin_users (id, email, restaurant_id, role)
values (
  'AUTH_USER_ID',
  'admin@example.com',
  'YOUR_RESTAURANT_ID',
  'owner'
);
```

Role hợp lệ:

- `owner`
- `admin`
- `staff`

## 4. Env cần thiết

Trong `.env` trên Raspberry Pi:

```env
ADMIN_AUTH_REQUIRED=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESTAURANT_ID=YOUR_RESTAURANT_ID
```

Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend. Key này chỉ được truyền vào container `api`.

Nếu schema Supabase của bạn dùng `store_id` thay vì `restaurant_id`:

```env
STORE_ID=YOUR_STORE_ID
ADMIN_STORE_COLUMN=store_id
```

## 5. Route cần auth

Frontend admin:

- `/admin`
- `/admin/statistics.html`

Login:

- `/admin/login`

Admin API được bảo vệ:

- `/api/admin/*`
- `/api/statistics`
- `/api/areas`
- `/api/uploads`
- `/api/admin/tables/:id/current-bill`
- `/api/admin/tables/:id/current-session`
- `/api/admin/tables/:id/close-session`
- `POST/PATCH/PUT/DELETE /api/menu*`
- `GET /api/menu?all=1`
- `GET /api/menu/categories?all=1`
- CRUD/QR bàn trong `/api/tables`

Public API vẫn không cần login:

- `GET /api/menu`
- `GET /api/menu/categories`
- `POST /api/orders`
- `GET /api/restaurant`
- `GET /api/tables/token/:token`
- `GET /api/tables/:id/current-bill`
- `GET /api/tables/:id/current-session`

Kitchen/order status endpoint hiện vẫn giữ public để không phá flow bếp và flow khách hủy đơn khi món chưa làm. Nếu cần bảo vệ bếp sau này, nên thêm login staff riêng.

## 6. Debug lỗi

### 401

Thường do:

- Chưa login.
- Access token hết hạn.
- Frontend không gửi `Authorization: Bearer <token>`.
- `SUPABASE_URL` hoặc `SUPABASE_ANON_KEY` sai.

Kiểm tra bằng DevTools Network, request admin API phải có header:

```http
Authorization: Bearer ey...
```

### 403

Token hợp lệ nhưng user chưa có quyền quán hiện tại.

Kiểm tra:

- User đã có row trong `public.admin_users`.
- `restaurant_id` trong row khớp với `RESTAURANT_ID`.
- Role là `owner`, `admin`, hoặc `staff`.

### 503

API chưa được cấu hình Supabase:

- Thiếu `SUPABASE_URL`.
- Thiếu `SUPABASE_ANON_KEY`.
- Thiếu `SUPABASE_SERVICE_ROLE_KEY`.
- Thiếu `RESTAURANT_ID`.

Hoặc bảng quyền chưa cấp quyền cho backend:

```sql
grant select, insert, update, delete on public.admin_users to service_role;
grant select on public.admin_users to authenticated;
```

Sau khi sửa `.env`, chạy lại:

```bash
docker compose up -d --build
```
