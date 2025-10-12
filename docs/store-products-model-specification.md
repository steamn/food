# Спецификация моделей магазина и продуктов

## Описание

Модели для управления магазином, категориями продуктов, самими продуктами, отзывами и избранными товарами в системе food delivery. Включает синхронизацию с 1С и управление зонами доставки.

## Миграция: `create_stores_table`

### Таблица магазинов

```php
Schema::create('stores', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->string('logo')->nullable();
    $table->string('cover_image')->nullable();

    // Контактная информация
    $table->string('phone')->nullable();
    $table->string('email')->nullable();
    $table->string('address');
    $table->decimal('latitude', 10, 8);
    $table->decimal('longitude', 11, 8);

    // Настройки работы
    $table->time('opening_time');
    $table->time('closing_time');
    $table->json('working_days'); // [1,2,3,4,5,6,7] - дни недели
    $table->boolean('is_24h')->default(false);
    $table->boolean('is_active')->default(true);

    // Настройки доставки
    $table->integer('min_order_amount')->default(0);
    $table->integer('delivery_fee')->default(0); // в копейках
    $table->integer('free_delivery_threshold')->nullable();
    $table->integer('estimated_delivery_time')->default(30); // минуты

    // Зоны доставки
    $table->json('delivery_zones')->nullable(); // Координаты полигонов зон

    // Рейтинг и статистика
    $table->decimal('rating', 3, 2)->default(0.00);
    $table->integer('total_orders')->default(0);
    $table->integer('total_reviews')->default(0);

    // Интеграция с 1С
    $table->string('external_id')->nullable()->unique(); // ID в 1С
    $table->timestamp('last_sync_at')->nullable();

    $table->timestamps();

    // Индексы
    $table->index(['is_active', 'rating']);
    $table->index('external_id');
    $table->index('last_sync_at');
});
```

## Миграция: `create_categories_table`

### Таблица категорий продуктов

```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->string('image')->nullable();
    $table->string('icon')->nullable();

    // Иерархия
    $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('cascade');
    $table->integer('sort_order')->default(0);
    $table->integer('level')->default(0); // Уровень вложенности

    // Настройки отображения
    $table->boolean('is_active')->default(true);
    $table->boolean('is_featured')->default(false);
    $table->boolean('show_in_menu')->default(true);

    // SEO
    $table->string('meta_title')->nullable();
    $table->text('meta_description')->nullable();
    $table->string('meta_keywords')->nullable();

    // Интеграция с 1С
    $table->string('external_id')->nullable()->unique();
    $table->timestamp('last_sync_at')->nullable();

    $table->timestamps();

    // Индексы
    $table->index(['parent_id', 'sort_order']);
    $table->index(['is_active', 'is_featured']);
    $table->index('external_id');
});
```

## Миграция: `create_products_table`

### Таблица продуктов

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->foreignId('store_id')->constrained()->onDelete('cascade');
    $table->foreignId('category_id')->constrained()->onDelete('cascade');

    // Основная информация
    $table->string('name');
    $table->string('slug');
    $table->text('description')->nullable();
    $table->text('short_description')->nullable();
    $table->string('sku')->unique(); // Артикул

    // Цены
    $table->integer('price'); // в копейках
    $table->integer('old_price')->nullable(); // старая цена для скидок
    $table->integer('cost_price')->nullable(); // себестоимость

    // Изображения
    $table->json('images')->nullable(); // массив путей к изображениям
    $table->string('main_image')->nullable();

    // Характеристики
    $table->json('attributes')->nullable(); // дополнительные характеристики
    $table->decimal('weight', 8, 3)->nullable(); // вес в кг
    $table->decimal('volume', 8, 3)->nullable(); // объем в л
    $table->string('barcode')->nullable();

    // Настройки продажи
    $table->boolean('is_active')->default(true);
    $table->boolean('is_featured')->default(false);
    $table->boolean('is_available')->default(true);
    $table->integer('stock_quantity')->default(0);
    $table->boolean('track_stock')->default(true);
    $table->boolean('allow_backorder')->default(false);

    // Настройки доставки
    $table->boolean('requires_cooking')->default(false);
    $table->integer('cooking_time')->nullable(); // минуты
    $table->boolean('is_frozen')->default(false);
    $table->boolean('is_alcohol')->default(false);
    $table->integer('min_age')->nullable(); // минимальный возраст для покупки

    // Рейтинг и статистика
    $table->decimal('rating', 3, 2)->default(0.00);
    $table->integer('total_reviews')->default(0);
    $table->integer('total_sales')->default(0);
    $table->integer('view_count')->default(0);

    // SEO
    $table->string('meta_title')->nullable();
    $table->text('meta_description')->nullable();
    $table->string('meta_keywords')->nullable();

    // Интеграция с 1С
    $table->string('external_id')->nullable()->unique();
    $table->timestamp('last_sync_at')->nullable();
    $table->json('sync_data')->nullable(); // дополнительные данные из 1С

    $table->timestamps();

    // Индексы
    $table->index(['store_id', 'is_active']);
    $table->index(['category_id', 'is_active']);
    $table->index(['is_featured', 'is_active']);
    $table->index(['price', 'is_active']);
    $table->index(['rating', 'is_active']);
    $table->index('external_id');
    $table->index('last_sync_at');

    // Составной уникальный индекс
    $table->unique(['store_id', 'slug']);
});
```

## Миграция: `create_product_reviews_table`

### Таблица отзывов о продуктах

```php
Schema::create('product_reviews', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');

    // Оценка и отзыв
    $table->integer('rating'); // 1-5
    $table->string('title')->nullable();
    $table->text('comment')->nullable();

    // Изображения отзыва
    $table->json('images')->nullable();

    // Статус модерации
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->text('moderation_comment')->nullable();
    $table->foreignId('moderated_by')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('moderated_at')->nullable();

    // Полезность отзыва
    $table->integer('helpful_count')->default(0);
    $table->integer('not_helpful_count')->default(0);

    // Ответ магазина
    $table->text('store_reply')->nullable();
    $table->timestamp('store_replied_at')->nullable();

    $table->timestamps();

    // Индексы
    $table->index(['product_id', 'status']);
    $table->index(['user_id', 'status']);
    $table->index(['rating', 'status']);
    $table->index('moderated_at');

    // Уникальный индекс - один отзыв на продукт от пользователя
    $table->unique(['product_id', 'user_id']);
});
```

## Миграция: `create_product_favorites_table`

### Таблица избранных продуктов

```php
Schema::create('product_favorites', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_id')->constrained()->onDelete('cascade');

    $table->timestamps();

    // Индексы
    $table->index(['user_id', 'created_at']);
    $table->index('product_id');

    // Уникальный индекс - один продукт в избранном у пользователя
    $table->unique(['user_id', 'product_id']);
});
```

## Миграция: `create_product_variants_table`

### Таблица вариантов продуктов (размеры, вкусы и т.д.)

```php
Schema::create('product_variants', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->onDelete('cascade');

    // Название варианта
    $table->string('name'); // "Большая", "Острая", "Без сахара"
    $table->string('sku')->nullable();

    // Цена и характеристики
    $table->integer('price_adjustment')->default(0); // изменение цены в копейках
    $table->decimal('weight_adjustment', 8, 3)->nullable();
    $table->json('attributes')->nullable(); // дополнительные характеристики

    // Настройки
    $table->boolean('is_active')->default(true);
    $table->integer('sort_order')->default(0);

    // Интеграция с 1С
    $table->string('external_id')->nullable();

    $table->timestamps();

    // Индексы
    $table->index(['product_id', 'is_active']);
    $table->index('external_id');
});
```

## Миграция: `create_product_categories_table`

### Связующая таблица для связи многие-ко-многим между продуктами и категориями

```php
Schema::create('product_categories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->foreignId('category_id')->constrained()->onDelete('cascade');
    $table->integer('sort_order')->default(0);

    $table->timestamps();

    // Индексы
    $table->index(['product_id', 'sort_order']);
    $table->index(['category_id', 'sort_order']);

    // Уникальный индекс
    $table->unique(['product_id', 'category_id']);
});
```

## Модель Store.php

```php
class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'logo', 'cover_image',
        'phone', 'email', 'address', 'latitude', 'longitude',
        'opening_time', 'closing_time', 'working_days', 'is_24h',
        'is_active', 'min_order_amount', 'delivery_fee',
        'free_delivery_threshold', 'estimated_delivery_time',
        'delivery_zones', 'rating', 'total_orders', 'total_reviews',
        'external_id', 'last_sync_at'
    ];

    protected function casts(): array
    {
        return [
            'working_days' => 'array',
            'delivery_zones' => 'array',
            'is_24h' => 'boolean',
            'is_active' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'rating' => 'decimal:2',
            'last_sync_at' => 'datetime',
        ];
    }

    // Отношения
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    // Scope методы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOpen($query)
    {
        $now = now();
        return $query->where(function ($q) use ($now) {
            $q->where('is_24h', true)
              ->orWhere(function ($q2) use ($now) {
                  $q2->whereTime('opening_time', '<=', $now->format('H:i:s'))
                     ->whereTime('closing_time', '>=', $now->format('H:i:s'))
                     ->whereJsonContains('working_days', $now->dayOfWeek);
              });
        });
    }

    public function scopeInDeliveryZone($query, $latitude, $longitude)
    {
        return $query->whereRaw('ST_Contains(delivery_zones, POINT(?, ?))', [$longitude, $latitude]);
    }

    // Accessor методы
    public function getPriceAttribute($value)
    {
        return $value / 100; // Конвертация из копеек в рубли
    }

    public function getDeliveryFeeAttribute($value)
    {
        return $value / 100;
    }

    public function getMinOrderAmountAttribute($value)
    {
        return $value / 100;
    }

    public function getFreeDeliveryThresholdAttribute($value)
    {
        return $value ? $value / 100 : null;
    }

    // Mutator методы
    public function setPriceAttribute($value)
    {
        $this->attributes['price'] = $value * 100;
    }

    public function setDeliveryFeeAttribute($value)
    {
        $this->attributes['delivery_fee'] = $value * 100;
    }

    public function setMinOrderAmountAttribute($value)
    {
        $this->attributes['min_order_amount'] = $value * 100;
    }

    public function setFreeDeliveryThresholdAttribute($value)
    {
        $this->attributes['free_delivery_threshold'] = $value ? $value * 100 : null;
    }

    // Методы
    public function isOpen()
    {
        if ($this->is_24h) {
            return true;
        }

        $now = now();
        $currentTime = $now->format('H:i:s');
        $currentDay = $now->dayOfWeek;

        return in_array($currentDay, $this->working_days) &&
               $currentTime >= $this->opening_time &&
               $currentTime <= $this->closing_time;
    }

    public function calculateDeliveryFee($orderAmount)
    {
        if ($this->free_delivery_threshold && $orderAmount >= $this->free_delivery_threshold) {
            return 0;
        }

        return $this->delivery_fee;
    }
}
```

## Модель Category.php

```php
class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'image', 'icon',
        'parent_id', 'sort_order', 'level', 'is_active',
        'is_featured', 'show_in_menu', 'meta_title',
        'meta_description', 'meta_keywords', 'external_id',
        'last_sync_at'
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'show_in_menu' => 'boolean',
            'last_sync_at' => 'datetime',
        ];
    }

    // Отношения
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_categories')
                    ->withPivot('sort_order')
                    ->orderBy('product_categories.sort_order');
    }

    public function allChildren()
    {
        return $this->children()->with('allChildren');
    }

    // Scope методы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInMenu($query)
    {
        return $query->where('show_in_menu', true);
    }

    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // Accessor методы
    public function getBreadcrumbAttribute()
    {
        $breadcrumb = collect([$this]);
        $parent = $this->parent;

        while ($parent) {
            $breadcrumb->prepend($parent);
            $parent = $parent->parent;
        }

        return $breadcrumb;
    }

    public function getPathAttribute()
    {
        return $this->breadcrumb->pluck('slug')->join('/');
    }

    // Методы
    public function hasChildren()
    {
        return $this->children()->exists();
    }

    public function getAllProducts()
    {
        $productIds = collect();

        // Добавляем продукты текущей категории
        $productIds = $productIds->merge($this->products()->pluck('products.id'));

        // Рекурсивно добавляем продукты дочерних категорий
        $this->children->each(function ($child) use ($productIds) {
            $productIds = $productIds->merge($child->getAllProducts());
        });

        return Product::whereIn('id', $productIds);
    }
}
```

## Модель Product.php

```php
class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id', 'category_id', 'name', 'slug', 'description',
        'short_description', 'sku', 'price', 'old_price', 'cost_price',
        'images', 'main_image', 'attributes', 'weight', 'volume',
        'barcode', 'is_active', 'is_featured', 'is_available',
        'stock_quantity', 'track_stock', 'allow_backorder',
        'requires_cooking', 'cooking_time', 'is_frozen', 'is_alcohol',
        'min_age', 'rating', 'total_reviews', 'total_sales',
        'view_count', 'meta_title', 'meta_description', 'meta_keywords',
        'external_id', 'last_sync_at', 'sync_data'
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'attributes' => 'array',
            'sync_data' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_available' => 'boolean',
            'track_stock' => 'boolean',
            'allow_backorder' => 'boolean',
            'requires_cooking' => 'boolean',
            'is_frozen' => 'boolean',
            'is_alcohol' => 'boolean',
            'weight' => 'decimal:3',
            'volume' => 'decimal:3',
            'rating' => 'decimal:2',
            'last_sync_at' => 'datetime',
        ];
    }

    // Отношения
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'product_categories')
                    ->withPivot('sort_order')
                    ->orderBy('product_categories.sort_order');
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function favorites()
    {
        return $this->hasMany(ProductFavorite::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    // Scope методы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where(function ($q) {
            $q->where('track_stock', false)
              ->orWhere('stock_quantity', '>', 0)
              ->orWhere('allow_backorder', true);
        });
    }

    public function scopeByPriceRange($query, $min, $max)
    {
        return $query->whereBetween('price', [$min * 100, $max * 100]);
    }

    public function scopeByRating($query, $minRating)
    {
        return $query->where('rating', '>=', $minRating);
    }

    // Accessor методы
    public function getPriceAttribute($value)
    {
        return $value / 100;
    }

    public function getOldPriceAttribute($value)
    {
        return $value ? $value / 100 : null;
    }

    public function getCostPriceAttribute($value)
    {
        return $value ? $value / 100 : null;
    }

    public function getDiscountPercentAttribute()
    {
        if (!$this->old_price) {
            return 0;
        }

        return round((($this->old_price - $this->price) / $this->old_price) * 100);
    }

    public function getIsOnSaleAttribute()
    {
        return $this->old_price && $this->old_price > $this->price;
    }

    public function getIsInStockAttribute()
    {
        if (!$this->track_stock) {
            return true;
        }

        return $this->stock_quantity > 0 || $this->allow_backorder;
    }

    public function getMainImageUrlAttribute()
    {
        return $this->main_image ? Storage::url($this->main_image) : null;
    }

    public function getImageUrlsAttribute()
    {
        if (!$this->images) {
            return [];
        }

        return collect($this->images)->map(function ($image) {
            return Storage::url($image);
        })->toArray();
    }

    // Mutator методы
    public function setPriceAttribute($value)
    {
        $this->attributes['price'] = $value * 100;
    }

    public function setOldPriceAttribute($value)
    {
        $this->attributes['old_price'] = $value ? $value * 100 : null;
    }

    public function setCostPriceAttribute($value)
    {
        $this->attributes['cost_price'] = $value ? $value * 100 : null;
    }

    // Методы
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    public function updateRating()
    {
        $approvedReviews = $this->reviews()->where('status', 'approved');
        $avgRating = $approvedReviews->avg('rating');
        $totalReviews = $approvedReviews->count();

        $this->update([
            'rating' => round($avgRating, 2),
            'total_reviews' => $totalReviews,
        ]);
    }

    public function isAvailableForUser($user = null)
    {
        if (!$this->is_active || !$this->is_available) {
            return false;
        }

        if (!$this->is_in_stock) {
            return false;
        }

        if ($this->is_alcohol && $user) {
            $userAge = $user->age ?? 0;
            if ($userAge < ($this->min_age ?? 18)) {
                return false;
            }
        }

        return true;
    }
}
```

## Модель ProductReview.php

```php
class ProductReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'user_id', 'order_id', 'rating', 'title',
        'comment', 'images', 'status', 'moderation_comment',
        'moderated_by', 'moderated_at', 'helpful_count',
        'not_helpful_count', 'store_reply', 'store_replied_at'
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'moderated_at' => 'datetime',
            'store_replied_at' => 'datetime',
        ];
    }

    // Отношения
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    // Scope методы
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeWithImages($query)
    {
        return $query->whereNotNull('images');
    }

    // Accessor методы
    public function getImageUrlsAttribute()
    {
        if (!$this->images) {
            return [];
        }

        return collect($this->images)->map(function ($image) {
            return Storage::url($image);
        })->toArray();
    }

    public function getHelpfulnessScoreAttribute()
    {
        $total = $this->helpful_count + $this->not_helpful_count;
        return $total > 0 ? round(($this->helpful_count / $total) * 100) : 0;
    }

    // Методы
    public function approve()
    {
        $this->update([
            'status' => 'approved',
            'moderated_at' => now(),
        ]);

        $this->product->updateRating();
    }

    public function reject($comment = null)
    {
        $this->update([
            'status' => 'rejected',
            'moderation_comment' => $comment,
            'moderated_at' => now(),
        ]);
    }

    public function markHelpful()
    {
        $this->increment('helpful_count');
    }

    public function markNotHelpful()
    {
        $this->increment('not_helpful_count');
    }

    public function addStoreReply($reply)
    {
        $this->update([
            'store_reply' => $reply,
            'store_replied_at' => now(),
        ]);
    }
}
```

## Модель ProductFavorite.php

```php
class ProductFavorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'product_id'
    ];

    // Отношения
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Scope методы
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Методы
    public static function toggle($userId, $productId)
    {
        $favorite = static::where('user_id', $userId)
                          ->where('product_id', $productId)
                          ->first();

        if ($favorite) {
            $favorite->delete();
            return false; // Удален
        } else {
            static::create([
                'user_id' => $userId,
                'product_id' => $productId,
            ]);
            return true; // Добавлен
        }
    }

    public static function isFavorited($userId, $productId)
    {
        return static::where('user_id', $userId)
                    ->where('product_id', $productId)
                    ->exists();
    }
}
```

## Модель ProductVariant.php

```php
class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'name', 'sku', 'price_adjustment',
        'weight_adjustment', 'attributes', 'is_active',
        'sort_order', 'external_id'
    ];

    protected function casts(): array
    {
        return [
            'attributes' => 'array',
            'is_active' => 'boolean',
            'weight_adjustment' => 'decimal:3',
        ];
    }

    // Отношения
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Scope методы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    // Accessor методы
    public function getPriceAttribute()
    {
        return ($this->product->price + $this->price_adjustment) / 100;
    }

    public function getWeightAttribute()
    {
        $baseWeight = $this->product->weight ?? 0;
        return $baseWeight + ($this->weight_adjustment ?? 0);
    }

    // Методы
    public function getFinalPrice()
    {
        return $this->product->price + $this->price_adjustment;
    }
}
```

## Индексы для производительности

```sql
-- Основные индексы для stores
CREATE INDEX idx_stores_active_rating ON stores(is_active, rating);
CREATE INDEX idx_stores_external_id ON stores(external_id);
CREATE INDEX idx_stores_last_sync ON stores(last_sync_at);

-- Основные индексы для categories
CREATE INDEX idx_categories_parent_sort ON categories(parent_id, sort_order);
CREATE INDEX idx_categories_active_featured ON categories(is_active, is_featured);
CREATE INDEX idx_categories_external_id ON categories(external_id);

-- Основные индексы для products
CREATE INDEX idx_products_store_active ON products(store_id, is_active);
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_products_featured_active ON products(is_featured, is_active);
CREATE INDEX idx_products_price_active ON products(price, is_active);
CREATE INDEX idx_products_rating_active ON products(rating, is_active);
CREATE INDEX idx_products_external_id ON products(external_id);
CREATE INDEX idx_products_last_sync ON products(last_sync_at);

-- Индексы для отзывов
CREATE INDEX idx_product_reviews_product_status ON product_reviews(product_id, status);
CREATE INDEX idx_product_reviews_user_status ON product_reviews(user_id, status);
CREATE INDEX idx_product_reviews_rating_status ON product_reviews(rating, status);
CREATE INDEX idx_product_reviews_moderated_at ON product_reviews(moderated_at);

-- Индексы для избранного
CREATE INDEX idx_product_favorites_user_created ON product_favorites(user_id, created_at);
CREATE INDEX idx_product_favorites_product ON product_favorites(product_id);

-- Индексы для вариантов
CREATE INDEX idx_product_variants_product_active ON product_variants(product_id, is_active);
CREATE INDEX idx_product_variants_external_id ON product_variants(external_id);

-- Уникальные индексы
CREATE UNIQUE INDEX idx_stores_slug ON stores(slug);
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
CREATE UNIQUE INDEX idx_products_sku ON products(sku);
CREATE UNIQUE INDEX idx_products_store_slug ON products(store_id, slug);
CREATE UNIQUE INDEX idx_product_reviews_user_product ON product_reviews(user_id, product_id);
CREATE UNIQUE INDEX idx_product_favorites_user_product ON product_favorites(user_id, product_id);
```

## Валидация

### ProductRequest

```php
class ProductRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'sku' => 'required|string|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'old_price' => 'nullable|numeric|min:0|gt:price',
            'cost_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'weight' => 'nullable|numeric|min:0',
            'volume' => 'nullable|numeric|min:0',
            'barcode' => 'nullable|string|unique:products,barcode',
            'stock_quantity' => 'integer|min:0',
            'cooking_time' => 'nullable|integer|min:1|max:300',
            'min_age' => 'nullable|integer|min:0|max:100',
            'images' => 'nullable|array|max:10',
            'images.*' => 'string',
            'attributes' => 'nullable|array',
        ];
    }
}
```

### ProductReviewRequest

```php
class ProductReviewRequest extends FormRequest
{
    public function rules()
    {
        return [
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:2048',
        ];
    }
}
```

## Использование в контроллерах

### Получение продуктов с фильтрацией

```php
// Получение активных продуктов магазина
$products = Product::with(['store', 'category', 'reviews'])
    ->where('store_id', $storeId)
    ->active()
    ->available()
    ->inStock()
    ->paginate(20);

// Поиск продуктов
$products = Product::with(['store', 'category'])
    ->where('name', 'like', "%{$search}%")
    ->orWhere('description', 'like', "%{$search}%")
    ->active()
    ->paginate(20);

// Фильтрация по цене и рейтингу
$products = Product::with(['store', 'category'])
    ->byPriceRange($minPrice, $maxPrice)
    ->byRating($minRating)
    ->active()
    ->paginate(20);
```

### Управление избранным

```php
// Добавление/удаление из избранного
$isFavorited = ProductFavorite::toggle($userId, $productId);

// Получение избранных продуктов пользователя
$favorites = ProductFavorite::with('product.store')
    ->byUser($userId)
    ->recent(30)
    ->paginate(20);
```

### Создание отзыва

```php
// Создание отзыва
$review = ProductReview::create([
    'product_id' => $productId,
    'user_id' => $userId,
    'order_id' => $orderId,
    'rating' => $request->rating,
    'title' => $request->title,
    'comment' => $request->comment,
    'images' => $uploadedImages,
]);

// Автоматическое обновление рейтинга продукта
$review->product->updateRating();
```
