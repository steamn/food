<!-- 8b1a8a2a-bb52-4fb7-ab11-85b0b807c0c5 68ca0ba1-cfda-4c93-a9a5-e8da487496c4 -->

# План реализации MVP Food Delivery

## Этап 1: Подготовка базы данных

### 1.1 Создание Enums

Создать enum классы в `app/Enums/`:

- `UserRole.php` - роли пользователей (customer, courier, admin, store_manager)
- `OrderStatus.php` - статусы заказов (pending, confirmed, preparing, ready, in_delivery, delivered, cancelled)
- `PaymentMethod.php` - методы оплаты (cash, card, online)
- `PaymentStatus.php` - статусы оплаты (pending, paid, failed, refunded)
- `ProductUnit.php` - единицы измерения (kg, g, l, ml, pcs)

### 1.2 Создание миграций

Создать миграции для основных таблиц:

- `create_stores_table` - магазины
- `create_categories_table` - категории продуктов
- `create_products_table` - продукты
- `create_product_images_table` - дополнительные изображения
- `create_addresses_table` - адреса доставки
- `create_orders_table` - заказы
- `create_order_items_table` - товары в заказе
- `create_carts_table` - корзина
- `add_role_to_users_table` - добавление роли к пользователям

Добавить индексы на внешние ключи и часто используемые поля (slug, email, phone).

### 1.3 Создание моделей

Создать Eloquent модели в `app/Models/`:

- `Store.php` - с отношениями hasMany(Product), hasMany(Order)
- `Category.php` - с отношениями hasMany(Product), belongsTo(Category) для parent
- `Product.php` - с SoftDeletes, отношениями belongsTo(Store, Category), hasMany(ProductImage, CartItem, OrderItem)
- `ProductImage.php` - belongsTo(Product)
- `Address.php` - belongsTo(User), hasMany(Order)
- `Order.php` - belongsTo(User, Store, Address, Courier), hasMany(OrderItem)
- `OrderItem.php` - belongsTo(Order, Product)
- `Cart.php` - belongsTo(User, Product)

Обновить модель `User.php` с отношениями hasMany(Address, Order, Cart).

## Этап 2: Бизнес-логика (Services)

Создать сервисы в `app/Services/`:

- `ProductService.php` - управление продуктами и стоком
- `OrderService.php` - создание заказов, расчет стоимости, обновление статусов
- `CartService.php` - добавление/удаление товаров, получение корзины

## Этап 3: API для веб-приложения

### 3.1 Form Requests

Создать в `app/Http/Requests/`:

- `StoreProductRequest.php` - валидация создания продукта
- `UpdateProductRequest.php` - валидация обновления продукта
- `StoreOrderRequest.php` - валидация создания заказа
- `StoreAddressRequest.php` - валидация адреса

### 3.2 Контроллеры для админки

Создать в `app/Http/Controllers/Admin/`:

- `DashboardController.php` - статистика админки
- `ProductController.php` - CRUD продуктов
- `OrderController.php` - управление заказами
- `StoreController.php` - CRUD магазинов
- `CategoryController.php` - CRUD категорий

### 3.3 Контроллеры для клиентской части

Создать в `app/Http/Controllers/Web/`:

- `HomeController.php` - главная страница
- `ProductController.php` - каталог и детальная продукта
- `CartController.php` - корзина
- `CheckoutController.php` - оформление заказа
- `OrderController.php` - список и детали заказов
- `ProfileController.php` - профиль пользователя

## Этап 4: Маршруты

### 4.1 Настроить маршруты

- `routes/web.php` - клиентские маршруты (главная, продукты, корзина, чекаут, заказы)
- `routes/admin.php` (создать новый) - админские маршруты с prefix '/admin' и middleware 'role:admin'
- Обновить `routes/auth.php` при необходимости

### 4.2 Middleware

Создать `app/Http/Middleware/RoleMiddleware.php` для проверки ролей пользователей.

## Этап 5: Seeders с тестовыми данными

Создать seeders в `database/seeders/`:

- `RoleSeeder.php` - создание админа и тестовых пользователей разных ролей
- `StoreSeeder.php` - 2-3 тестовых магазина
- `CategorySeeder.php` - 5-7 категорий продуктов
- `ProductSeeder.php` - 20-30 продуктов с разными категориями и магазинами
- Обновить `DatabaseSeeder.php` для вызова всех seeders

## Этап 6: React компоненты (Inertia + Shadcn/ui)

### 6.1 Layouts

Создать базовые layout в `resources/js/layouts/`:

- `WebLayout.tsx` - layout для клиентской части (header, footer, navigation)
- `AdminLayout.tsx` - layout для админки (sidebar, header)
- `GuestLayout.tsx` - layout для страниц авторизации

### 6.2 Компоненты для клиентской части

Создать в `resources/js/pages/`:

- `Home.tsx` - главная страница с категориями и популярными продуктами
- `Products/Index.tsx` - каталог продуктов с фильтрами
- `Products/Show.tsx` - детальная страница продукта
- `Cart/Index.tsx` - корзина
- `Checkout/Index.tsx` - оформление заказа
- `Orders/Index.tsx` - список заказов
- `Orders/Show.tsx` - детали заказа
- `Profile/Index.tsx` - профиль пользователя

Создать переиспользуемые компоненты в `resources/js/components/`:

- `ProductCard.tsx` - карточка продукта
- `CartItem.tsx` - элемент корзины
- `OrderStatusBadge.tsx` - бейдж статуса заказа

### 6.3 Компоненты для админки

Создать в `resources/js/pages/Admin/`:

- `Dashboard.tsx` - дашборд с базовой статистикой
- `Products/Index.tsx` - таблица продуктов
- `Products/Create.tsx` - создание продукта
- `Products/Edit.tsx` - редактирование продукта
- `Orders/Index.tsx` - таблица заказов
- `Orders/Show.tsx` - детали заказа
- `Stores/Index.tsx` - список магазинов
- `Categories/Index.tsx` - список категорий

## Этап 7: Финальная настройка

- Запустить миграции: `php artisan migrate`
- Запустить seeders: `php artisan db:seed`
- Настроить загрузку файлов (создать symlink: `php artisan storage:link`)
- Проверить работу основных функций: регистрация, добавление в корзину, создание заказа
- Убедиться что админ может управлять продуктами и заказами

## Технические детали

- Использовать DB::transaction() при создании заказов
- Применять eager loading для предотвращения N+1 запросов
- Добавить scope методы в моделях для частых запросов (active, inStock)
- Использовать accessor для форматирования цен и изображений в моделях

### To-dos

- [x] Создать Enum классы для ролей, статусов и единиц измерения
- [x] Создать миграции для всех основных таблиц с индексами
- [x] Создать Eloquent модели с отношениями и scopes
- [x] Реализовать ProductService, OrderService, CartService
- [x] Создать Form Requests для валидации
- [x] Создать контроллеры для админки
- [x] Создать контроллеры для клиентской части
- [x] Настроить маршруты и создать RoleMiddleware
- [x] Создать seeders с тестовыми данными
- [x] Создать React layouts (Web, Admin, Guest)
- [x] Создать страницы клиентской части на React
- [x] Создать страницы админки на React
- [x] Запустить миграции, seeders и проверить работу приложения
