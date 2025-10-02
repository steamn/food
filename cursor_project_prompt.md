# Документация проекта: Приложение доставки продуктов

## Обзор проекта

Это приложение для доставки продуктов из магазинов с веб-интерфейсом (админка + клиентский сайт) и мобильным приложением.

**Технологический стек:**

- Backend: Laravel 11.x
- Web Frontend: React + Inertia.js
- Mobile: React Native
- База данных: MySQL
- Аутентификация: Laravel Sanctum
- Файловое хранилище: Laravel Storage (local)

---

## Архитектура приложения

### Структура проекта

```
project/
├── app/
│   ├── Models/              # Eloquent модели
│   ├── Services/            # Бизнес-логика
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/       # Админ-панель (Inertia)
│   │   │   ├── Web/         # Клиентский сайт (Inertia)
│   │   │   └── Api/         # API для мобильного приложения
│   │   ├── Requests/        # Form Request валидация
│   │   └── Resources/       # API Resources
│   ├── Repositories/        # Репозитории для работы с БД (опционально)
│   └── Enums/              # Enum классы для статусов
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── web.php             # Inertia маршруты
│   ├── api.php             # API маршруты
│   └── admin.php           # Админ маршруты (опционально)
└── resources/
    └── js/
        ├── Pages/          # Inertia страницы
        │   ├── Admin/
        │   └── Web/
        └── Components/     # React компоненты
```

---

## База данных

### Основные таблицы

#### 1. users (Пользователи)

```sql
- id: bigint primary key
- name: string
- email: string unique
- phone: string unique nullable
- email_verified_at: timestamp nullable
- password: string
- role: enum('customer', 'courier', 'admin', 'store_manager')
- avatar: string nullable
- is_active: boolean default true
- created_at, updated_at: timestamps
```

#### 2. stores (Магазины)

```sql
- id: bigint primary key
- name: string
- description: text nullable
- address: string
- latitude: decimal(10,8)
- longitude: decimal(11,8)
- phone: string
- email: string nullable
- logo: string nullable
- is_active: boolean default true
- opening_time: time
- closing_time: time
- delivery_radius_km: integer default 5
- created_at, updated_at: timestamps
```

#### 3. categories (Категории продуктов)

```sql
- id: bigint primary key
- name: string
- slug: string unique
- description: text nullable
- image: string nullable
- parent_id: bigint nullable foreign key -> categories.id
- sort_order: integer default 0
- is_active: boolean default true
- created_at, updated_at: timestamps
```

#### 4. products (Продукты)

```sql
- id: bigint primary key
- store_id: bigint foreign key -> stores.id
- category_id: bigint foreign key -> categories.id
- name: string
- slug: string unique
- description: text nullable
- price: decimal(10,2)
- discount_price: decimal(10,2) nullable
- sku: string unique nullable
- barcode: string nullable
- unit: enum('kg', 'g', 'l', 'ml', 'pcs') default 'pcs'
- stock_quantity: integer default 0
- min_order_quantity: integer default 1
- max_order_quantity: integer nullable
- image: string nullable
- is_active: boolean default true
- is_featured: boolean default false
- created_at, updated_at: timestamps
- deleted_at: timestamp nullable (soft delete)
```

#### 5. product_images (Дополнительные изображения продуктов)

```sql
- id: bigint primary key
- product_id: bigint foreign key -> products.id cascade
- image_path: string
- sort_order: integer default 0
- created_at, updated_at: timestamps
```

#### 6. addresses (Адреса доставки)

```sql
- id: bigint primary key
- user_id: bigint foreign key -> users.id cascade
- title: string (например: "Дом", "Работа")
- address_line: string
- city: string
- postal_code: string nullable
- latitude: decimal(10,8)
- longitude: decimal(11,8)
- apartment: string nullable
- floor: string nullable
- entrance: string nullable
- intercom: string nullable
- notes: text nullable
- is_default: boolean default false
- created_at, updated_at: timestamps
```

#### 7. orders (Заказы)

```sql
- id: bigint primary key
- order_number: string unique
- user_id: bigint foreign key -> users.id
- store_id: bigint foreign key -> stores.id
- courier_id: bigint nullable foreign key -> users.id
- address_id: bigint foreign key -> addresses.id
- status: enum('pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered', 'cancelled')
- payment_method: enum('cash', 'card', 'online')
- payment_status: enum('pending', 'paid', 'failed', 'refunded')
- subtotal: decimal(10,2)
- delivery_fee: decimal(10,2)
- discount: decimal(10,2) default 0
- total: decimal(10,2)
- notes: text nullable
- estimated_delivery_time: timestamp nullable
- delivered_at: timestamp nullable
- cancelled_at: timestamp nullable
- cancellation_reason: text nullable
- created_at, updated_at: timestamps
```

#### 8. order_items (Товары в заказе)

```sql
- id: bigint primary key
- order_id: bigint foreign key -> orders.id cascade
- product_id: bigint foreign key -> products.id
- product_name: string (snapshot)
- quantity: integer
- price: decimal(10,2) (snapshot)
- subtotal: decimal(10,2)
- created_at, updated_at: timestamps
```

#### 9. carts (Корзина)

```sql
- id: bigint primary key
- user_id: bigint foreign key -> users.id cascade
- product_id: bigint foreign key -> products.id cascade
- quantity: integer default 1
- created_at, updated_at: timestamps
- unique(user_id, product_id)
```

#### 10. reviews (Отзывы)

```sql
- id: bigint primary key
- user_id: bigint foreign key -> users.id
- product_id: bigint nullable foreign key -> products.id
- order_id: bigint nullable foreign key -> orders.id
- rating: integer (1-5)
- comment: text nullable
- is_approved: boolean default false
- created_at, updated_at: timestamps
```

#### 11. coupons (Купоны/промокоды)

```sql
- id: bigint primary key
- code: string unique
- type: enum('fixed', 'percentage')
- value: decimal(10,2)
- min_order_amount: decimal(10,2) nullable
- max_discount: decimal(10,2) nullable
- usage_limit: integer nullable
- used_count: integer default 0
- starts_at: timestamp
- expires_at: timestamp
- is_active: boolean default true
- created_at, updated_at: timestamps
```

#### 12. notifications (Уведомления)

```sql
- id: bigint primary key
- user_id: bigint foreign key -> users.id cascade
- type: string
- title: string
- message: text
- data: json nullable
- is_read: boolean default false
- read_at: timestamp nullable
- created_at, updated_at: timestamps
```

---

## Enums

### OrderStatus

```php
enum OrderStatus: string {
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case PREPARING = 'preparing';
    case READY = 'ready';
    case IN_DELIVERY = 'in_delivery';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';
}
```

### PaymentMethod

```php
enum PaymentMethod: string {
    case CASH = 'cash';
    case CARD = 'card';
    case ONLINE = 'online';
}
```

### PaymentStatus

```php
enum PaymentStatus: string {
    case PENDING = 'pending';
    case PAID = 'paid';
    case FAILED = 'failed';
    case REFUNDED = 'refunded';
}
```

### UserRole

```php
enum UserRole: string {
    case CUSTOMER = 'customer';
    case COURIER = 'courier';
    case ADMIN = 'admin';
    case STORE_MANAGER = 'store_manager';
}
```

---

## Services (Бизнес-логика)

### ProductService

```php
- getProducts(array $filters): Collection
- getProductById(int $id): Product
- createProduct(array $data): Product
- updateProduct(Product $product, array $data): Product
- deleteProduct(Product $product): bool
- updateStock(Product $product, int $quantity): void
```

### OrderService

```php
- createOrder(User $user, array $data): Order
- updateOrderStatus(Order $order, OrderStatus $status): Order
- assignCourier(Order $order, User $courier): Order
- calculateTotal(array $items): array
- cancelOrder(Order $order, string $reason): Order
```

### CartService

```php
- addToCart(User $user, int $productId, int $quantity): Cart
- updateCartItem(Cart $cart, int $quantity): Cart
- removeFromCart(Cart $cart): bool
- getCartItems(User $user): Collection
- clearCart(User $user): bool
```

### AuthService

```php
- register(array $data): User
- login(array $credentials): array (user + token)
- logout(User $user): void
- verifyEmail(User $user): void
```

---

## API Endpoints (для React Native)

### Аутентификация

```
POST /api/register
POST /api/login
POST /api/logout
POST /api/forgot-password
POST /api/reset-password
GET  /api/user
PUT  /api/user/profile
```

### Продукты

```
GET  /api/products (с фильтрами: category, search, store, price_min, price_max)
GET  /api/products/{id}
GET  /api/products/{id}/reviews
```

### Категории

```
GET  /api/categories
GET  /api/categories/{slug}/products
```

### Магазины

```
GET  /api/stores
GET  /api/stores/{id}
GET  /api/stores/{id}/products
```

### Корзина

```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/{id}
DELETE /api/cart/{id}
DELETE /api/cart/clear
```

### Заказы

```
GET  /api/orders
POST /api/orders
GET  /api/orders/{id}
PUT  /api/orders/{id}/cancel
POST /api/orders/{id}/review
```

### Адреса

```
GET    /api/addresses
POST   /api/addresses
PUT    /api/addresses/{id}
DELETE /api/addresses/{id}
PUT    /api/addresses/{id}/set-default
```

### Купоны

```
POST /api/coupons/validate
```

---

## Web Routes (Inertia)

### Клиентская часть

```
GET  /
GET  /products
GET  /products/{slug}
GET  /stores
GET  /stores/{id}
GET  /cart
GET  /checkout
GET  /orders
GET  /orders/{orderNumber}
GET  /profile
GET  /profile/addresses
GET  /login
GET  /register
```

### Админ-панель

```
GET  /admin/dashboard
GET  /admin/products
GET  /admin/products/create
GET  /admin/products/{id}/edit
GET  /admin/orders
GET  /admin/orders/{id}
GET  /admin/stores
GET  /admin/categories
GET  /admin/users
GET  /admin/coupons
GET  /admin/reviews
GET  /admin/settings
```

---

## Middleware

```php
- auth: Проверка аутентификации
- auth:sanctum: API аутентификация
- role:{role}: Проверка роли пользователя
- verified: Email должен быть подтвержден
- throttle:api: Rate limiting для API
```

---

## Permissions & Roles

### Admin

- Полный доступ ко всем функциям
- Управление пользователями
- Управление магазинами
- Просмотр статистики

### Store Manager

- Управление продуктами своего магазина
- Просмотр заказов своего магазина
- Управление категориями

### Courier

- Просмотр назначенных заказов
- Обновление статуса доставки
- Просмотр адресов доставки

### Customer

- Просмотр продуктов
- Оформление заказов
- Управление профилем и адресами
- Оставление отзывов

---

## Form Requests (Validation)

### StoreProductRequest

```php
'name' => 'required|string|max:255'
'category_id' => 'required|exists:categories,id'
'price' => 'required|numeric|min:0'
'stock_quantity' => 'required|integer|min:0'
```

### StoreOrderRequest

```php
'address_id' => 'required|exists:addresses,id'
'payment_method' => 'required|in:cash,card,online'
'items' => 'required|array|min:1'
'items.*.product_id' => 'required|exists:products,id'
'items.*.quantity' => 'required|integer|min:1'
```

---

## API Resources

### ProductResource

```php
- id
- name
- slug
- description
- price
- discount_price
- image
- category (CategoryResource)
- store (StoreResource)
- is_in_stock
- reviews_count
- average_rating
```

### OrderResource

```php
- id
- order_number
- status
- total
- created_at
- items (OrderItemResource collection)
- address (AddressResource)
- store (StoreResource)
```

---

## События и слушатели

### Events

```php
- OrderCreated: Когда создан новый заказ
- OrderStatusChanged: Изменение статуса заказа
- ProductOutOfStock: Товар закончился
- UserRegistered: Новая регистрация
```

### Listeners

```php
- SendOrderConfirmationNotification
- NotifyStoreAboutNewOrder
- NotifyCourierAboutAssignment
- SendWelcomeEmail
```

---

## Notifications (каналы: database, mail)

```php
- OrderCreatedNotification
- OrderStatusUpdatedNotification
- OrderDeliveredNotification
- LowStockNotification
```

---

## Jobs (очереди)

```php
- ProcessOrderPayment
- SendPushNotification
- GenerateInvoice
- UpdateProductStock
```

---

## Требования к реализации

1. **Используй Service Pattern** для бизнес-логики
2. **Используй Form Requests** для валидации
3. **Используй API Resources** для форматирования ответов API
4. **Используй Enums** вместо строковых констант
5. **Используй eager loading** для предотвращения N+1 проблем
6. **Добавляй индексы** на внешние ключи и часто используемые поля
7. **Используй транзакции** для критичных операций (создание заказа и т.д.)
8. **Логируй критичные операции** (создание заказа, изменение статуса)
9. **Добавь soft deletes** для продуктов
10. **Кэшируй** списки категорий и популярных продуктов

---

## Примеры кода

### Создание заказа в OrderService

```php
public function createOrder(User $user, array $data): Order
{
    return DB::transaction(function () use ($user, $data) {
        // Создаем заказ
        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => $this->generateOrderNumber(),
            'store_id' => $data['store_id'],
            'address_id' => $data['address_id'],
            'payment_method' => $data['payment_method'],
            'status' => OrderStatus::PENDING,
            'subtotal' => $data['subtotal'],
            'delivery_fee' => $data['delivery_fee'],
            'total' => $data['total'],
        ]);

        // Добавляем товары
        foreach ($data['items'] as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'product_name' => $item['product_name'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'subtotal' => $item['subtotal'],
            ]);

            // Обновляем stock
            $this->productService->updateStock(
                Product::find($item['product_id']),
                -$item['quantity']
            );
        }

        // Очищаем корзину
        $this->cartService->clearCart($user);

        // Отправляем уведомления
        event(new OrderCreated($order));

        return $order;
    });
}
```

---

## Следующие шаги

1. Создай миграции для всех таблиц
2. Создай модели с отношениями
3. Создай Enums
4. Создай Services
5. Создай API Resources
6. Создай Form Requests
7. Создай контроллеры (Admin, Web, Api)
8. Создай маршруты
9. Создай seeders для тестовых данных
10. Создай React компоненты для админки и клиентской части

---

## Конфигурация Laravel

### .env важные параметры

```
APP_NAME="Food Delivery"
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_DATABASE=food_delivery

QUEUE_CONNECTION=redis
CACHE_DRIVER=redis
SESSION_DRIVER=redis

SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

---

**Инструкция для Cursor AI:**
При разработке функционала всегда обращайся к этому документу. Следуй описанной архитектуре, именованию таблиц, структуре папок и паттернам разработки. Если что-то не описано - предложи решение согласно best practices Laravel и спроси подтверждение у разработчика.
