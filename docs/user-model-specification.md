# Спецификация модели User

## Описание

Модель `User` представляет пользователей системы food delivery. Поддерживает различные роли (admin, manager, courier, customer) через Spatie Permission и включает профили курьеров.

## Миграция: `create_users_table`

### Базовые поля (уже существуют)

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->rememberToken();
    $table->timestamps();
});
```

### Дополнительные поля для food delivery

```php
// Контактная информация
$table->string('phone')->nullable()->unique();
$table->string('avatar')->nullable();

// Профиль пользователя
$table->text('bio')->nullable();
$table->date('birth_date')->nullable();
$table->enum('gender', ['male', 'female'])->nullable();

// Адрес по умолчанию
$table->string('default_address')->nullable();
$table->decimal('default_latitude', 10, 8)->nullable();
$table->decimal('default_longitude', 11, 8)->nullable();

// Настройки уведомлений
$table->boolean('email_notifications')->default(true);
$table->boolean('sms_notifications')->default(true);
$table->boolean('push_notifications')->default(true);

// Статус и активность
$table->boolean('is_active')->default(true);
$table->timestamp('last_login_at')->nullable();
$table->string('last_login_ip')->nullable();


// Индексы
$table->index(['email', 'is_active']);
$table->index(['phone', 'is_active']);
$table->index('last_login_at');
});
```

## Миграция: `create_courier_profiles_table`

### Профиль курьера

```php
Schema::create('courier_profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');

    // Личная информация
    $table->string('first_name');
    $table->string('last_name');
    $table->string('middle_name')->nullable();
    $table->string('phone')->unique();
    $table->string('email')->unique();

    // Документы
    $table->string('passport_series')->nullable();
    $table->string('passport_number')->nullable();
    $table->date('passport_issued_date')->nullable();
    $table->string('passport_issued_by')->nullable();

    // Транспорт
    $table->enum('transport_type', ['bicycle', 'scooter', 'motorcycle', 'car', 'walking']);
    $table->string('transport_model')->nullable();
    $table->string('transport_number')->nullable();
    $table->string('transport_color')->nullable();

    // Рабочие данные
    $table->enum('status', ['active', 'inactive', 'suspended', 'pending_verification'])->default('pending_verification');
    $table->decimal('rating', 3, 2)->default(0.00);
    $table->integer('total_deliveries')->default(0);
    $table->decimal('total_earnings', 10, 2)->default(0.00);

    // Рабочие зоны
    $table->json('delivery_zones')->nullable(); // Массив ID зон доставки

    // Расписание работы
    $table->json('work_schedule')->nullable(); // Расписание по дням недели

    // Банковские реквизиты
    $table->string('bank_name')->nullable();
    $table->string('bank_account')->nullable();
    $table->string('bank_card_number')->nullable();

    // Дополнительная информация
    $table->text('notes')->nullable();
    $table->json('documents')->nullable(); // Пути к загруженным документам

    $table->timestamps();

    // Индексы
    $table->index(['user_id', 'status']);
    $table->index('status');
    $table->index('rating');
});
```

## Миграция: `create_user_preferences_table`

### Настройки пользователя

```php
Schema::create('user_preferences', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');

    // Язык и локализация
    $table->string('language', 5)->default('ru');
    $table->string('timezone')->default('Europe/Moscow');
    $table->string('currency', 3)->default('RUB');

    // Настройки интерфейса
    $table->string('theme')->default('light'); // light, dark, auto
    $table->boolean('compact_mode')->default(false);
    $table->json('dashboard_widgets')->nullable();

    // Настройки уведомлений
    $table->json('notification_settings')->nullable();
    $table->time('quiet_hours_start')->nullable();
    $table->time('quiet_hours_end')->nullable();

    // Настройки доставки
    $table->integer('default_delivery_time')->default(30); // минуты
    $table->boolean('auto_confirm_orders')->default(false);
    $table->decimal('max_order_amount', 10, 2)->nullable();

    // Приватность
    $table->boolean('show_phone')->default(false);
    $table->boolean('show_email')->default(false);
    $table->boolean('allow_marketing')->default(true);

    $table->timestamps();

    // Индексы
    $table->unique('user_id');
});
```

## Модель User.php

### Основные отношения

```php
class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'avatar', 'bio', 'birth_date',
        'gender', 'default_address', 'default_latitude', 'default_longitude',
        'email_notifications', 'sms_notifications', 'push_notifications',
        'is_active', 'last_login_at', 'last_login_ip'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
            'last_login_at' => 'datetime',
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'is_active' => 'boolean',
            'default_latitude' => 'decimal:8',
            'default_longitude' => 'decimal:8',
        ];
    }

    // Отношения
    public function courierProfile()
    {
        return $this->hasOne(CourierProfile::class);
    }

    public function preferences()
    {
        return $this->hasOne(UserPreferences::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function cart()
    {
        return $this->hasMany(Cart::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function favorites()
    {
        return $this->hasMany(ProductFavorite::class);
    }

    // Scope методы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, $role)
    {
        return $query->whereHas('roles', function ($q) use ($role) {
            $q->where('name', $role);
        });
    }

    // Accessor методы
    public function getFullNameAttribute()
    {
        return $this->name;
    }

    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? Storage::url($this->avatar) : null;
    }

    public function getIsCourierAttribute()
    {
        return $this->hasRole('courier');
    }

    public function getIsAdminAttribute()
    {
        return $this->hasRole(['admin', 'super-admin']);
    }
}
```

## Модель CourierProfile.php

```php
class CourierProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'middle_name', 'phone', 'email',
        'passport_series', 'passport_number', 'passport_issued_date', 'passport_issued_by',
        'transport_type', 'transport_model', 'transport_number', 'transport_color',
        'status', 'rating', 'total_deliveries', 'total_earnings',
        'delivery_zones', 'work_schedule', 'bank_name', 'bank_account',
        'bank_card_number', 'notes', 'documents'
    ];

    protected function casts(): array
    {
        return [
            'delivery_zones' => 'array',
            'work_schedule' => 'array',
            'documents' => 'array',
            'rating' => 'decimal:2',
            'total_earnings' => 'decimal:2',
            'passport_issued_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'courier_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }
}
```

## Модель UserPreferences.php

```php
class UserPreferences extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'language', 'timezone', 'currency', 'theme', 'compact_mode',
        'dashboard_widgets', 'notification_settings', 'quiet_hours_start',
        'quiet_hours_end', 'default_delivery_time', 'auto_confirm_orders',
        'max_order_amount', 'show_phone', 'show_email', 'allow_marketing'
    ];

    protected function casts(): array
    {
        return [
            'dashboard_widgets' => 'array',
            'notification_settings' => 'array',
            'quiet_hours_start' => 'datetime:H:i',
            'quiet_hours_end' => 'datetime:H:i',
            'compact_mode' => 'boolean',
            'auto_confirm_orders' => 'boolean',
            'show_phone' => 'boolean',
            'show_email' => 'boolean',
            'allow_marketing' => 'boolean',
            'max_order_amount' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

## Индексы для производительности

```sql
-- Основные индексы для users
CREATE INDEX idx_users_email_active ON users(email, is_active);
CREATE INDEX idx_users_phone_active ON users(phone, is_active);
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- Индексы для courier_profiles
CREATE INDEX idx_courier_profiles_user_status ON courier_profiles(user_id, status);
CREATE INDEX idx_courier_profiles_status ON courier_profiles(status);
CREATE INDEX idx_courier_profiles_rating ON courier_profiles(rating);

-- Уникальные индексы
CREATE UNIQUE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

## Валидация

### User Request Validation

```php
// StoreUserRequest
'name' => 'required|string|max:255',
'email' => 'required|email|unique:users,email',
'phone' => 'nullable|string|unique:users,phone',
'password' => 'required|string|min:8|confirmed',
'birth_date' => 'nullable|date|before:today',
'gender' => 'nullable|in:male,female,other',

// CourierProfileRequest
'first_name' => 'required|string|max:255',
'last_name' => 'required|string|max:255',
'phone' => 'required|string|unique:courier_profiles,phone',
'email' => 'required|email|unique:courier_profiles,email',
'transport_type' => 'required|in:bicycle,scooter,motorcycle,car,walking',
'status' => 'in:active,inactive,suspended,pending_verification',
```

## Использование в контроллерах

```php
// Получение пользователей с ролями
$users = User::with('roles', 'courierProfile')
    ->active()
    ->byRole('courier')
    ->paginate(20);

// Создание курьера
$user = User::create($userData);
$user->assignRole('courier');
$user->courierProfile()->create($courierData);

// Получение настроек пользователя
$preferences = $user->preferences ?? $user->preferences()->create();
```
