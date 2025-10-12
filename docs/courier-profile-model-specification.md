# Спецификация модели CourierProfile

## Описание

Модель `CourierProfile` представляет профиль курьера в системе food delivery. Содержит личную информацию, рабочие данные, транспорт, документы и банковские реквизиты.

## Миграция: `create_courier_profiles_table`

### Основная структура

```php
Schema::create('courier_profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->timestamps();

    // Индексы
    $table->index(['user_id', 'status']);
    $table->index('status');
    $table->index('rating');
});
```

### Личная информация

```php
// Личные данные
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
```

### Транспорт

```php
// Тип транспорта
$table->enum('transport_type', [
    'scooter',      // Самокат
    'motorcycle',   // Мотоцикл
    'car',          // Автомобиль
]);

// Данные транспорта
$table->string('transport_model')->nullable();
$table->string('transport_number')->nullable();
$table->string('transport_color')->nullable();
```

### Рабочие данные

```php
// Статус курьера
$table->enum('status', [
    'active',                // Активный
    'inactive',              // Неактивный
    'suspended',             // Приостановлен
    'pending_verification'   // Ожидает верификации
])->default('pending_verification');

// Статистика работы
$table->decimal('rating', 3, 2)->default(0.00);           // Рейтинг (0.00 - 5.00)
$table->integer('total_deliveries')->default(0);           // Общее количество доставок
$table->decimal('total_earnings', 10, 2)->default(0.00);  // Общий заработок

// Рабочие зоны (JSON массив ID зон доставки)
$table->json('delivery_zones')->nullable();

// Расписание работы (JSON объект с расписанием по дням недели)
$table->json('work_schedule')->nullable();
```

### Банковские реквизиты

```php
// Банковская информация
$table->string('bank_name')->nullable();
$table->string('bank_account')->nullable();
$table->string('bank_card_number')->nullable();
```

### Дополнительная информация

```php
// Заметки и документы
$table->text('notes')->nullable();
$table->json('documents')->nullable(); // Пути к загруженным документам
```

## Полная миграция

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
            $table->enum('transport_type', [
                 'scooter', 'motorcycle', 'car',
            ]);
            $table->string('transport_model')->nullable();
            $table->string('transport_number')->nullable();
            $table->string('transport_color')->nullable();

            // Рабочие данные
            $table->enum('status', [
                'active', 'inactive', 'suspended', 'pending_verification'
            ])->default('pending_verification');
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('total_deliveries')->default(0);
            $table->decimal('total_earnings', 10, 2)->default(0.00);

            // Рабочие зоны и расписание
            $table->json('delivery_zones')->nullable();
            $table->json('work_schedule')->nullable();

            // Банковские реквизиты
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('bank_card_number')->nullable();

            // Дополнительная информация
            $table->text('notes')->nullable();
            $table->json('documents')->nullable();

            $table->timestamps();

            // Индексы
            $table->index(['user_id', 'status']);
            $table->index('status');
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_profiles');
    }
};
```

## Модель CourierProfile.php

### Основная структура

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
}
```

### Отношения

```php
// Связь с пользователем
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

// Связь с доставками
public function deliveries(): HasMany
{
    return $this->hasMany(Delivery::class, 'courier_id');
}

// Связь с зонами доставки
public function deliveryZones()
{
    return $this->belongsToMany(DeliveryZone::class, 'courier_delivery_zones');
}
```

### Scope методы

```php
// Активные курьеры
public function scopeActive($query)
{
    return $query->where('status', 'active');
}

// Курьеры с высоким рейтингом
public function scopeWithHighRating($query, $minRating = 4.0)
{
    return $query->where('rating', '>=', $minRating);
}

// Курьеры по типу транспорта
public function scopeByTransportType($query, $transportType)
{
    return $query->where('transport_type', $transportType);
}

// Курьеры в определенной зоне
public function scopeInZone($query, $zoneId)
{
    return $query->whereJsonContains('delivery_zones', $zoneId);
}
```

### Accessor методы

```php
// Полное имя курьера
public function getFullNameAttribute(): string
{
    return trim($this->first_name . ' ' . $this->last_name);
}

// Полное имя с отчеством
public function getFullNameWithMiddleAttribute(): string
{
    $name = $this->first_name . ' ' . $this->last_name;
    if ($this->middle_name) {
        $name .= ' ' . $this->middle_name;
    }
    return trim($name);
}

// Форматированный рейтинг
public function getFormattedRatingAttribute(): string
{
    return number_format($this->rating, 1);
}

// Форматированный заработок
public function getFormattedEarningsAttribute(): string
{
    return number_format($this->total_earnings, 2) . ' ₽';
}

// Статус на русском языке
public function getStatusTextAttribute(): string
{
    return match($this->status) {
        'active' => 'Активный',
        'inactive' => 'Неактивный',
        'suspended' => 'Приостановлен',
        'pending_verification' => 'Ожидает верификации',
        default => 'Неизвестно'
    };
}

// Тип транспорта на русском языке
public function getTransportTypeTextAttribute(): string
{
    return match($this->transport_type) {
        'scooter' => 'Самокат',
        'motorcycle' => 'Мотоцикл',
        'car' => 'Автомобиль',
        default => 'Неизвестно'
    };
}
```

### Mutator методы

```php
// Нормализация телефона
public function setPhoneAttribute($value)
{
    $this->attributes['phone'] = preg_replace('/[^0-9+]/', '', $value);
}

// Нормализация email
public function setEmailAttribute($value)
{
    $this->attributes['email'] = strtolower(trim($value));
}

// Нормализация имени
public function setFirstNameAttribute($value)
{
    $this->attributes['first_name'] = ucfirst(strtolower(trim($value)));
}

public function setLastNameAttribute($value)
{
    $this->attributes['last_name'] = ucfirst(strtolower(trim($value)));
}
```

## Валидация

### CourierProfileRequest

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CourierProfileRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            // Личная информация
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'phone' => 'required|string|unique:courier_profiles,phone,' . $this->id,
            'email' => 'required|email|unique:courier_profiles,email,' . $this->id,

            // Документы
            'passport_series' => 'nullable|string|max:10',
            'passport_number' => 'nullable|string|max:20',
            'passport_issued_date' => 'nullable|date|before:today',
            'passport_issued_by' => 'nullable|string|max:255',

            // Транспорт
            'transport_type' => 'required|in:scooter,motorcycle,car',
            'transport_model' => 'nullable|string|max:255',
            'transport_number' => 'nullable|string|max:20',
            'transport_color' => 'nullable|string|max:50',

            // Рабочие данные
            'status' => 'in:active,inactive,suspended,pending_verification',
            'rating' => 'numeric|min:0|max:5',
            'total_deliveries' => 'integer|min:0',
            'total_earnings' => 'numeric|min:0',

            // Рабочие зоны
            'delivery_zones' => 'nullable|array',
            'delivery_zones.*' => 'integer|exists:delivery_zones,id',

            // Расписание работы
            'work_schedule' => 'nullable|array',

            // Банковские реквизиты
            'bank_name' => 'nullable|string|max:255',
            'bank_account' => 'nullable|string|max:50',
            'bank_card_number' => 'nullable|string|max:20',

            // Дополнительная информация
            'notes' => 'nullable|string|max:1000',
            'documents' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Имя обязательно для заполнения',
            'last_name.required' => 'Фамилия обязательна для заполнения',
            'phone.required' => 'Телефон обязателен для заполнения',
            'phone.unique' => 'Курьер с таким телефоном уже существует',
            'email.required' => 'Email обязателен для заполнения',
            'email.unique' => 'Курьер с таким email уже существует',
            'transport_type.required' => 'Тип транспорта обязателен для заполнения',
            'transport_type.in' => 'Недопустимый тип транспорта',
        ];
    }
}
```

## Использование в контроллерах

### Создание профиля курьера

```php
// Создание курьера
public function store(CourierProfileRequest $request)
{
    $user = User::create([
        'name' => $request->first_name . ' ' . $request->last_name,
        'email' => $request->email,
        'phone' => $request->phone,
        'password' => Hash::make(Str::random(12)),
    ]);

    $user->assignRole('courier');

    $courierProfile = $user->courierProfile()->create($request->validated());

    return response()->json([
        'message' => 'Курьер успешно создан',
        'courier' => $courierProfile->load('user')
    ], 201);
}
```

### Получение курьеров с фильтрацией

```php
// Получение курьеров с фильтрами
public function index(Request $request)
{
    $query = CourierProfile::with('user');

    // Фильтр по статусу
    if ($request->has('status')) {
        $query->where('status', $request->status);
    }

    // Фильтр по типу транспорта
    if ($request->has('transport_type')) {
        $query->byTransportType($request->transport_type);
    }

    // Фильтр по рейтингу
    if ($request->has('min_rating')) {
        $query->withHighRating($request->min_rating);
    }

    // Фильтр по зоне доставки
    if ($request->has('zone_id')) {
        $query->inZone($request->zone_id);
    }

    $couriers = $query->paginate(20);

    return response()->json($couriers);
}
```

## Индексы для производительности

```sql
-- Основные индексы
CREATE INDEX idx_courier_profiles_user_status ON courier_profiles(user_id, status);
CREATE INDEX idx_courier_profiles_status ON courier_profiles(status);
CREATE INDEX idx_courier_profiles_rating ON courier_profiles(rating);
CREATE INDEX idx_courier_profiles_transport ON courier_profiles(transport_type);

-- Составные индексы
CREATE INDEX idx_courier_profiles_status_rating ON courier_profiles(status, rating);
CREATE INDEX idx_courier_profiles_transport_status ON courier_profiles(transport_type, status);

-- JSON индексы (для PostgreSQL)
CREATE INDEX idx_courier_profiles_delivery_zones ON courier_profiles USING GIN (delivery_zones);
```

## Примеры использования

### Получение активных курьеров с высоким рейтингом

```php
$topCouriers = CourierProfile::active()
    ->withHighRating(4.5)
    ->with('user')
    ->orderBy('rating', 'desc')
    ->get();
```

### Получение курьеров в определенной зоне

```php
$zoneCouriers = CourierProfile::active()
    ->inZone($zoneId)
    ->byTransportType('car')
    ->get();
```

### Обновление статистики курьера

```php
$courier = CourierProfile::find($id);
$courier->increment('total_deliveries');
$courier->increment('total_earnings', $deliveryAmount);
$courier->updateRating(); // Кастомный метод для пересчета рейтинга
```
