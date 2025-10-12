# Спецификация моделей заказов и доставки

## Описание

Модели для управления заказами, корзиной покупок, адресами доставки и зонами доставки в системе food delivery. Включает временную линию заказов, расчет стоимости и отслеживание статусов.

## Миграция: `create_delivery_zones_table`

### Таблица зон доставки

```php
Schema::create('delivery_zones', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();

    // Геометрия зоны
    $table->json('coordinates'); // Массив координат полигона
    $table->decimal('center_latitude', 10, 8);
    $table->decimal('center_longitude', 11, 8);

    // Настройки доставки
    $table->integer('delivery_fee'); // в копейках
    $table->integer('free_delivery_threshold')->nullable(); // в копейках
    $table->integer('estimated_delivery_time'); // минуты
    $table->integer('max_delivery_time'); // максимальное время доставки

    // Ограничения
    $table->integer('min_order_amount')->default(0); // в копейках
    $table->integer('max_order_amount')->nullable(); // в копейках
    $table->boolean('is_active')->default(true);

    // Время работы
    $table->time('opening_time')->nullable();
    $table->time('closing_time')->nullable();
    $table->json('working_days')->nullable(); // [1,2,3,4,5,6,7]

    $table->timestamps();

    // Индексы
    $table->index(['is_active', 'center_latitude', 'center_longitude']);
});
```

## Миграция: `create_addresses_table`

### Таблица адресов доставки

```php
Schema::create('addresses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');

    // Основная информация
    $table->string('title')->nullable(); // "Дом", "Работа", "Дача"
    $table->string('address');
    $table->decimal('latitude', 10, 8);
    $table->decimal('longitude', 11, 8);

    // Детали адреса
    $table->string('building')->nullable();
    $table->string('apartment')->nullable();
    $table->string('entrance')->nullable();
    $table->string('floor')->nullable();
    $table->text('comment')->nullable();

    // Контактная информация
    $table->string('contact_name')->nullable();
    $table->string('contact_phone')->nullable();

    // Настройки
    $table->boolean('is_default')->default(false);
    $table->boolean('is_active')->default(true);

    // Зона доставки
    $table->foreignId('delivery_zone_id')->nullable()->constrained()->onDelete('set null');

    $table->timestamps();

    // Индексы
    $table->index(['user_id', 'is_default']);
    $table->index(['user_id', 'is_active']);
    $table->index(['latitude', 'longitude']);
});
```

## Миграция: `create_carts_table`

### Таблица корзины покупок

```php
Schema::create('carts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('cascade');

    // Количество и цена
    $table->integer('quantity')->default(1);
    $table->integer('price'); // цена на момент добавления в копейках

    // Дополнительные опции
    $table->json('options')->nullable(); // дополнительные опции (например, "без лука")
    $table->text('comment')->nullable(); // комментарий к товару

    // Временные метки
    $table->timestamp('expires_at')->nullable(); // срок истечения корзины
    $table->timestamps();

    // Индексы
    $table->index(['user_id', 'created_at']);
    $table->index('expires_at');

    // Уникальный индекс - один товар с одинаковыми опциями в корзине
    $table->unique(['user_id', 'product_id', 'product_variant_id'], 'unique_cart_item');
});
```

## Миграция: `create_orders_table`

### Таблица заказов

```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('order_number')->unique();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('store_id')->constrained()->onDelete('cascade');
    $table->foreignId('courier_id')->nullable()->constrained('users')->onDelete('set null');

    // Статус заказа
    $table->enum('status', [
        'pending',           // Ожидает подтверждения
        'confirmed',         // Подтвержден
        'preparing',         // Готовится
        'ready',            // Готов к выдаче
        'picked_up',        // Курьер забрал
        'on_way',           // В пути
        'delivered',         // Доставлен
        'cancelled',        // Отменен
        'refunded'          // Возвращен
    ])->default('pending');

    // Адрес доставки
    $table->foreignId('address_id')->constrained()->onDelete('cascade');
    $table->foreignId('delivery_zone_id')->nullable()->constrained()->onDelete('set null');

    // Контактная информация
    $table->string('customer_name');
    $table->string('customer_phone');
    $table->string('customer_email')->nullable();

    // Стоимость
    $table->integer('subtotal'); // стоимость товаров в копейках
    $table->integer('delivery_fee'); // стоимость доставки в копейках
    $table->integer('discount_amount')->default(0); // скидка в копейках
    $table->integer('total_amount'); // итоговая сумма в копейках

    // Способ оплаты
    $table->enum('payment_method', ['cash', 'card', 'online', 'wallet'])->default('cash');
    $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
    $table->string('payment_id')->nullable(); // ID платежа в платежной системе

    // Время доставки
    $table->timestamp('preferred_delivery_time')->nullable();
    $table->timestamp('estimated_delivery_time')->nullable();
    $table->timestamp('actual_delivery_time')->nullable();

    // Комментарии
    $table->text('customer_comment')->nullable();
    $table->text('store_comment')->nullable();
    $table->text('courier_comment')->nullable();

    // Рейтинг и отзыв
    $table->integer('rating')->nullable(); // 1-5
    $table->text('review')->nullable();

    // Временная линия (JSON с событиями)
    $table->json('timeline')->nullable();

    // Внешние системы
    $table->string('external_order_id')->nullable(); // ID в внешней системе
    $table->json('external_data')->nullable(); // дополнительные данные

    $table->timestamps();

    // Индексы
    $table->index(['user_id', 'status']);
    $table->index(['store_id', 'status']);
    $table->index(['courier_id', 'status']);
    $table->index(['status', 'created_at']);
    $table->index('order_number');
    $table->index('payment_status');
    $table->index('estimated_delivery_time');
});
```

## Миграция: `create_order_items_table`

### Таблица товаров в заказе

```php
Schema::create('order_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('cascade');

    // Информация о товаре на момент заказа
    $table->string('product_name');
    $table->string('product_sku');
    $table->text('product_description')->nullable();
    $table->string('product_image')->nullable();

    // Количество и цена
    $table->integer('quantity');
    $table->integer('unit_price'); // цена за единицу в копейках
    $table->integer('total_price'); // общая стоимость в копейках

    // Дополнительные опции
    $table->json('options')->nullable();
    $table->text('comment')->nullable();

    // Характеристики товара
    $table->json('product_attributes')->nullable();
    $table->decimal('weight', 8, 3)->nullable();
    $table->decimal('volume', 8, 3)->nullable();

    $table->timestamps();

    // Индексы
    $table->index(['order_id', 'product_id']);
    $table->index('product_id');
});
```

## Миграция: `create_order_timeline_table`

### Таблица временной линии заказов

```php
Schema::create('order_timeline', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

    // Событие
    $table->string('event_type'); // status_changed, comment_added, etc.
    $table->string('event_name'); // "Заказ подтвержден", "Курьер назначен"
    $table->text('description')->nullable();

    // Данные события
    $table->json('data')->nullable();

    // Метаданные
    $table->string('source')->default('system'); // system, user, admin, courier
    $table->string('ip_address')->nullable();
    $table->string('user_agent')->nullable();

    $table->timestamp('occurred_at');
    $table->timestamps();

    // Индексы
    $table->index(['order_id', 'occurred_at']);
    $table->index(['event_type', 'occurred_at']);
    $table->index('occurred_at');
});
```

## Модель DeliveryZone.php

```php
class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'coordinates', 'center_latitude',
        'center_longitude', 'delivery_fee', 'free_delivery_threshold',
        'estimated_delivery_time', 'max_delivery_time', 'min_order_amount',
        'max_order_amount', 'is_active', 'opening_time', 'closing_time',
        'working_days'
    ];

    protected function casts(): array
    {
        return [
            'coordinates' => 'array',
            'working_days' => 'array',
            'is_active' => 'boolean',
            'center_latitude' => 'decimal:8',
            'center_longitude' => 'decimal:8',
        ];
    }

    // Отношения
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Scope методы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWorkingNow($query)
    {
        $now = now();
        return $query->where(function ($q) use ($now) {
            $q->whereNull('opening_time')
              ->orWhere(function ($q2) use ($now) {
                  $q2->whereTime('opening_time', '<=', $now->format('H:i:s'))
                     ->whereTime('closing_time', '>=', $now->format('H:i:s'))
                     ->whereJsonContains('working_days', $now->dayOfWeek);
              });
        });
    }

    // Accessor методы
    public function getDeliveryFeeAttribute($value)
    {
        return $value / 100;
    }

    public function getFreeDeliveryThresholdAttribute($value)
    {
        return $value ? $value / 100 : null;
    }

    public function getMinOrderAmountAttribute($value)
    {
        return $value / 100;
    }

    public function getMaxOrderAmountAttribute($value)
    {
        return $value ? $value / 100 : null;
    }

    // Mutator методы
    public function setDeliveryFeeAttribute($value)
    {
        $this->attributes['delivery_fee'] = $value * 100;
    }

    public function setFreeDeliveryThresholdAttribute($value)
    {
        $this->attributes['free_delivery_threshold'] = $value ? $value * 100 : null;
    }

    public function setMinOrderAmountAttribute($value)
    {
        $this->attributes['min_order_amount'] = $value * 100;
    }

    public function setMaxOrderAmountAttribute($value)
    {
        $this->attributes['max_order_amount'] = $value ? $value * 100 : null;
    }

    // Методы
    public function containsPoint($latitude, $longitude)
    {
        // Простая проверка вхождения точки в полигон
        // В реальном проекте лучше использовать PostGIS или библиотеку для работы с геометрией
        $coordinates = $this->coordinates;
        if (!$coordinates || count($coordinates) < 3) {
            return false;
        }

        $x = $longitude;
        $y = $latitude;
        $inside = false;

        for ($i = 0, $j = count($coordinates) - 1; $i < count($coordinates); $j = $i++) {
            $xi = $coordinates[$i][0];
            $yi = $coordinates[$i][1];
            $xj = $coordinates[$j][0];
            $yj = $coordinates[$j][1];

            if ((($yi > $y) !== ($yj > $y)) && ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi)) {
                $inside = !$inside;
            }
        }

        return $inside;
    }

    public function calculateDeliveryFee($orderAmount)
    {
        if ($this->free_delivery_threshold && $orderAmount >= $this->free_delivery_threshold) {
            return 0;
        }

        return $this->delivery_fee;
    }

    public function isWorkingNow()
    {
        if (!$this->opening_time || !$this->closing_time) {
            return true;
        }

        $now = now();
        $currentTime = $now->format('H:i:s');
        $currentDay = $now->dayOfWeek;

        return in_array($currentDay, $this->working_days) &&
               $currentTime >= $this->opening_time &&
               $currentTime <= $this->closing_time;
    }
}
```

## Модель Address.php

```php
class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'address', 'latitude', 'longitude',
        'building', 'apartment', 'entrance', 'floor', 'comment',
        'contact_name', 'contact_phone', 'is_default', 'is_active',
        'delivery_zone_id'
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    // Отношения
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function deliveryZone()
    {
        return $this->belongsTo(DeliveryZone::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Scope методы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Accessor методы
    public function getFullAddressAttribute()
    {
        $parts = array_filter([
            $this->address,
            $this->building,
            $this->apartment ? "кв. {$this->apartment}" : null,
            $this->entrance ? "подъезд {$this->entrance}" : null,
            $this->floor ? "этаж {$this->floor}" : null,
        ]);

        return implode(', ', $parts);
    }

    public function getFormattedAddressAttribute()
    {
        $address = $this->full_address;
        if ($this->comment) {
            $address .= " ({$this->comment})";
        }
        return $address;
    }

    // Методы
    public function setAsDefault()
    {
        // Снимаем флаг default с других адресов пользователя
        static::where('user_id', $this->user_id)
              ->where('id', '!=', $this->id)
              ->update(['is_default' => false]);

        // Устанавливаем флаг default для текущего адреса
        $this->update(['is_default' => true]);
    }

    public function findDeliveryZone()
    {
        if ($this->delivery_zone_id) {
            return $this->deliveryZone;
        }

        $zone = DeliveryZone::active()
            ->where(function ($query) {
                $query->whereRaw('ST_Contains(coordinates, POINT(?, ?))', [
                    $this->longitude,
                    $this->latitude
                ]);
            })
            ->first();

        if ($zone) {
            $this->update(['delivery_zone_id' => $zone->id]);
            return $zone;
        }

        return null;
    }

    public function getDistanceFrom($latitude, $longitude)
    {
        // Формула гаверсинуса для расчета расстояния между двумя точками
        $earthRadius = 6371; // радиус Земли в км

        $lat1 = deg2rad($this->latitude);
        $lon1 = deg2rad($this->longitude);
        $lat2 = deg2rad($latitude);
        $lon2 = deg2rad($longitude);

        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;

        $a = sin($dlat / 2) * sin($dlat / 2) +
             cos($lat1) * cos($lat2) *
             sin($dlon / 2) * sin($dlon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
```

## Модель Cart.php

```php
class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'product_id', 'product_variant_id', 'quantity',
        'price', 'options', 'comment', 'expires_at'
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'expires_at' => 'datetime',
        ];
    }

    // Отношения
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    // Scope методы
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    // Accessor методы
    public function getPriceAttribute($value)
    {
        return $value / 100;
    }

    public function getTotalPriceAttribute()
    {
        return $this->price * $this->quantity;
    }

    public function getTotalPriceInCentsAttribute()
    {
        return $this->attributes['price'] * $this->quantity;
    }

    // Mutator методы
    public function setPriceAttribute($value)
    {
        $this->attributes['price'] = $value * 100;
    }

    // Методы
    public function updateQuantity($quantity)
    {
        if ($quantity <= 0) {
            return $this->delete();
        }

        $this->update(['quantity' => $quantity]);
    }

    public function getProductPrice()
    {
        if ($this->productVariant) {
            return $this->productVariant->getFinalPrice() / 100;
        }

        return $this->product->price;
    }

    public function updatePrice()
    {
        $currentPrice = $this->getProductPrice();
        $this->update(['price' => $currentPrice * 100]);
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function extendExpiration($hours = 24)
    {
        $this->update([
            'expires_at' => now()->addHours($hours)
        ]);
    }

    // Статические методы
    public static function addItem($userId, $productId, $quantity = 1, $options = [], $comment = null, $productVariantId = null)
    {
        $product = Product::findOrFail($productId);

        if (!$product->isAvailableForUser()) {
            throw new \Exception('Товар недоступен для заказа');
        }

        $existingItem = static::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('product_variant_id', $productVariantId)
            ->where('options', json_encode($options))
            ->first();

        if ($existingItem) {
            $existingItem->updateQuantity($existingItem->quantity + $quantity);
            return $existingItem;
        }

        $price = $productVariantId
            ? ProductVariant::find($productVariantId)->getFinalPrice() / 100
            : $product->price;

        return static::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'product_variant_id' => $productVariantId,
            'quantity' => $quantity,
            'price' => $price * 100,
            'options' => $options,
            'comment' => $comment,
            'expires_at' => now()->addHours(24),
        ]);
    }

    public static function getCartTotal($userId)
    {
        return static::byUser($userId)
            ->active()
            ->get()
            ->sum('total_price_in_cents');
    }

    public static function clearExpiredItems()
    {
        static::expired()->delete();
    }

    public static function clearUserCart($userId)
    {
        static::byUser($userId)->delete();
    }
}
```

## Модель Order.php

```php
class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number', 'user_id', 'store_id', 'courier_id', 'status',
        'address_id', 'delivery_zone_id', 'customer_name', 'customer_phone',
        'customer_email', 'subtotal', 'delivery_fee', 'discount_amount',
        'total_amount', 'payment_method', 'payment_status', 'payment_id',
        'preferred_delivery_time', 'estimated_delivery_time', 'actual_delivery_time',
        'customer_comment', 'store_comment', 'courier_comment', 'rating',
        'review', 'timeline', 'external_order_id', 'external_data'
    ];

    protected function casts(): array
    {
        return [
            'timeline' => 'array',
            'external_data' => 'array',
            'preferred_delivery_time' => 'datetime',
            'estimated_delivery_time' => 'datetime',
            'actual_delivery_time' => 'datetime',
        ];
    }

    // Отношения
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function courier()
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function deliveryZone()
    {
        return $this->belongsTo(DeliveryZone::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function timelineEvents()
    {
        return $this->hasMany(OrderTimeline::class);
    }

    // Scope методы
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByStore($query, $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    public function scopeByCourier($query, $courierId)
    {
        return $query->where('courier_id', $courierId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed', 'preparing']);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['delivered', 'cancelled', 'refunded']);
    }

    // Accessor методы
    public function getSubtotalAttribute($value)
    {
        return $value / 100;
    }

    public function getDeliveryFeeAttribute($value)
    {
        return $value / 100;
    }

    public function getDiscountAmountAttribute($value)
    {
        return $value / 100;
    }

    public function getTotalAmountAttribute($value)
    {
        return $value / 100;
    }

    public function getStatusDisplayAttribute()
    {
        return match($this->status) {
            'pending' => 'Ожидает подтверждения',
            'confirmed' => 'Подтвержден',
            'preparing' => 'Готовится',
            'ready' => 'Готов к выдаче',
            'picked_up' => 'Курьер забрал',
            'on_way' => 'В пути',
            'delivered' => 'Доставлен',
            'cancelled' => 'Отменен',
            'refunded' => 'Возвращен',
            default => 'Неизвестно'
        };
    }

    public function getPaymentStatusDisplayAttribute()
    {
        return match($this->payment_status) {
            'pending' => 'Ожидает оплаты',
            'paid' => 'Оплачен',
            'failed' => 'Ошибка оплаты',
            'refunded' => 'Возвращен',
            default => 'Неизвестно'
        };
    }

    // Mutator методы
    public function setSubtotalAttribute($value)
    {
        $this->attributes['subtotal'] = $value * 100;
    }

    public function setDeliveryFeeAttribute($value)
    {
        $this->attributes['delivery_fee'] = $value * 100;
    }

    public function setDiscountAmountAttribute($value)
    {
        $this->attributes['discount_amount'] = $value * 100;
    }

    public function setTotalAmountAttribute($value)
    {
        $this->attributes['total_amount'] = $value * 100;
    }

    // Методы
    public function generateOrderNumber()
    {
        do {
            $orderNumber = 'ORD-' . strtoupper(Str::random(8));
        } while (static::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    public function updateStatus($newStatus, $comment = null, $userId = null)
    {
        $oldStatus = $this->status;
        $this->update(['status' => $newStatus]);

        // Добавляем событие в временную линию
        $this->addTimelineEvent('status_changed', [
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'comment' => $comment,
        ], $userId);

        // Обновляем JSON timeline
        $this->updateTimeline();
    }

    public function addTimelineEvent($eventType, $data = [], $userId = null)
    {
        $event = $this->timelineEvents()->create([
            'event_type' => $eventType,
            'event_name' => $this->getEventName($eventType),
            'description' => $this->getEventDescription($eventType, $data),
            'data' => $data,
            'user_id' => $userId,
            'occurred_at' => now(),
        ]);

        return $event;
    }

    public function updateTimeline()
    {
        $timeline = $this->timelineEvents()
            ->orderBy('occurred_at')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'type' => $event->event_type,
                    'name' => $event->event_name,
                    'description' => $event->description,
                    'data' => $event->data,
                    'occurred_at' => $event->occurred_at->toISOString(),
                    'source' => $event->source,
                ];
            })
            ->toArray();

        $this->update(['timeline' => $timeline]);
    }

    public function calculateDeliveryFee()
    {
        if (!$this->deliveryZone) {
            return 0;
        }

        return $this->deliveryZone->calculateDeliveryFee($this->subtotal);
    }

    public function calculateTotal()
    {
        $subtotal = $this->items->sum('total_price');
        $deliveryFee = $this->calculateDeliveryFee();
        $discount = $this->discount_amount;
        $total = $subtotal + $deliveryFee - $discount;

        $this->update([
            'subtotal' => $subtotal * 100,
            'delivery_fee' => $deliveryFee * 100,
            'total_amount' => $total * 100,
        ]);

        return $total;
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'confirmed', 'preparing']);
    }

    public function canBeRated()
    {
        return $this->status === 'delivered' && !$this->rating;
    }

    public function isOverdue()
    {
        return $this->estimated_delivery_time &&
               $this->estimated_delivery_time->isPast() &&
               !in_array($this->status, ['delivered', 'cancelled', 'refunded']);
    }

    private function getEventName($eventType)
    {
        return match($eventType) {
            'status_changed' => 'Статус изменен',
            'comment_added' => 'Добавлен комментарий',
            'courier_assigned' => 'Назначен курьер',
            'payment_processed' => 'Оплата обработана',
            'delivery_started' => 'Доставка началась',
            'delivery_completed' => 'Доставка завершена',
            default => 'Событие'
        };
    }

    private function getEventDescription($eventType, $data)
    {
        return match($eventType) {
            'status_changed' => "Статус изменен с '{$data['old_status']}' на '{$data['new_status']}'",
            'comment_added' => 'Добавлен комментарий к заказу',
            'courier_assigned' => 'Курьер назначен на доставку',
            'payment_processed' => 'Оплата успешно обработана',
            'delivery_started' => 'Курьер начал доставку',
            'delivery_completed' => 'Заказ успешно доставлен',
            default => 'Произошло событие с заказом'
        };
    }
}
```

## Модель OrderItem.php

```php
class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'product_id', 'product_variant_id', 'product_name',
        'product_sku', 'product_description', 'product_image', 'quantity',
        'unit_price', 'total_price', 'options', 'comment', 'product_attributes',
        'weight', 'volume'
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'product_attributes' => 'array',
            'weight' => 'decimal:3',
            'volume' => 'decimal:3',
        ];
    }

    // Отношения
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    // Accessor методы
    public function getUnitPriceAttribute($value)
    {
        return $value / 100;
    }

    public function getTotalPriceAttribute($value)
    {
        return $value / 100;
    }

    public function getProductImageUrlAttribute()
    {
        return $this->product_image ? Storage::url($this->product_image) : null;
    }

    public function getVariantNameAttribute()
    {
        return $this->productVariant ? $this->productVariant->name : null;
    }

    public function getOptionsTextAttribute()
    {
        if (!$this->options) {
            return null;
        }

        return collect($this->options)->map(function ($value, $key) {
            return "{$key}: {$value}";
        })->join(', ');
    }

    // Mutator методы
    public function setUnitPriceAttribute($value)
    {
        $this->attributes['unit_price'] = $value * 100;
    }

    public function setTotalPriceAttribute($value)
    {
        $this->attributes['total_price'] = $value * 100;
    }

    // Методы
    public function calculateTotal()
    {
        $total = $this->unit_price * $this->quantity;
        $this->update(['total_price' => $total * 100]);
        return $total;
    }

    public function getFullProductName()
    {
        $name = $this->product_name;

        if ($this->productVariant) {
            $name .= " ({$this->productVariant->name})";
        }

        if ($this->options_text) {
            $name .= " - {$this->options_text}";
        }

        return $name;
    }
}
```

## Модель OrderTimeline.php

```php
class OrderTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'user_id', 'event_type', 'event_name',
        'description', 'data', 'source', 'ip_address',
        'user_agent', 'occurred_at'
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    // Отношения
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope методы
    public function scopeByOrder($query, $orderId)
    {
        return $query->where('order_id', $orderId);
    }

    public function scopeByEventType($query, $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('occurred_at', '>=', now()->subDays($days));
    }

    // Accessor методы
    public function getFormattedOccurredAtAttribute()
    {
        return $this->occurred_at->format('d.m.Y H:i');
    }

    public function getSourceDisplayAttribute()
    {
        return match($this->source) {
            'system' => 'Система',
            'user' => 'Пользователь',
            'admin' => 'Администратор',
            'courier' => 'Курьер',
            default => 'Неизвестно'
        };
    }
}
```

## Индексы для производительности

```sql
-- Индексы для delivery_zones
CREATE INDEX idx_delivery_zones_active_center ON delivery_zones(is_active, center_latitude, center_longitude);

-- Индексы для addresses
CREATE INDEX idx_addresses_user_default ON addresses(user_id, is_default);
CREATE INDEX idx_addresses_user_active ON addresses(user_id, is_active);
CREATE INDEX idx_addresses_coordinates ON addresses(latitude, longitude);

-- Индексы для carts
CREATE INDEX idx_carts_user_created ON carts(user_id, created_at);
CREATE INDEX idx_carts_expires_at ON carts(expires_at);
CREATE UNIQUE INDEX idx_carts_unique_item ON carts(user_id, product_id, product_variant_id);

-- Индексы для orders
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_store_status ON orders(store_id, status);
CREATE INDEX idx_orders_courier_status ON orders(courier_id, status);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_estimated_delivery ON orders(estimated_delivery_time);

-- Индексы для order_items
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Индексы для order_timeline
CREATE INDEX idx_order_timeline_order_occurred ON order_timeline(order_id, occurred_at);
CREATE INDEX idx_order_timeline_event_occurred ON order_timeline(event_type, occurred_at);
CREATE INDEX idx_order_timeline_occurred_at ON order_timeline(occurred_at);

-- Уникальные индексы
CREATE UNIQUE INDEX idx_orders_order_number ON orders(order_number);
```

## Валидация

### OrderRequest

```php
class OrderRequest extends FormRequest
{
    public function rules()
    {
        return [
            'address_id' => 'required|exists:addresses,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'preferred_delivery_time' => 'nullable|date|after:now',
            'payment_method' => 'required|in:cash,card,online,wallet',
            'customer_comment' => 'nullable|string|max:1000',
        ];
    }
}
```

### AddressRequest

```php
class AddressRequest extends FormRequest
{
    public function rules()
    {
        return [
            'title' => 'nullable|string|max:255',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'building' => 'nullable|string|max:50',
            'apartment' => 'nullable|string|max:20',
            'entrance' => 'nullable|string|max:20',
            'floor' => 'nullable|string|max:20',
            'comment' => 'nullable|string|max:500',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ];
    }
}
```

## Использование в контроллерах

### Создание заказа из корзины

```php
// Создание заказа
$cartItems = Cart::byUser($userId)->active()->get();
$address = Address::findOrFail($request->address_id);

$order = Order::create([
    'order_number' => Order::generateOrderNumber(),
    'user_id' => $userId,
    'store_id' => $cartItems->first()->product->store_id,
    'address_id' => $address->id,
    'delivery_zone_id' => $address->delivery_zone_id,
    'customer_name' => $request->customer_name,
    'customer_phone' => $request->customer_phone,
    'customer_email' => $request->customer_email,
    'payment_method' => $request->payment_method,
    'customer_comment' => $request->customer_comment,
]);

// Добавление товаров в заказ
foreach ($cartItems as $cartItem) {
    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $cartItem->product_id,
        'product_variant_id' => $cartItem->product_variant_id,
        'product_name' => $cartItem->product->name,
        'product_sku' => $cartItem->product->sku,
        'product_description' => $cartItem->product->description,
        'product_image' => $cartItem->product->main_image,
        'quantity' => $cartItem->quantity,
        'unit_price' => $cartItem->price,
        'total_price' => $cartItem->total_price,
        'options' => $cartItem->options,
        'comment' => $cartItem->comment,
    ]);
}

// Расчет стоимости
$order->calculateTotal();

// Очистка корзины
Cart::clearUserCart($userId);
```

### Управление статусами заказа

```php
// Изменение статуса заказа
$order->updateStatus('confirmed', 'Заказ подтвержден магазином', $adminId);

// Назначение курьера
$order->update([
    'courier_id' => $courierId,
    'status' => 'ready'
]);
$order->addTimelineEvent('courier_assigned', [
    'courier_id' => $courierId,
    'courier_name' => $courier->name
]);
```

### Работа с корзиной

```php
// Добавление товара в корзину
Cart::addItem($userId, $productId, $quantity, $options, $comment, $variantId);

// Обновление количества
$cartItem = Cart::find($cartItemId);
$cartItem->updateQuantity($newQuantity);

// Получение корзины пользователя
$cartItems = Cart::byUser($userId)->active()->with('product.store')->get();
$total = Cart::getCartTotal($userId);
```
