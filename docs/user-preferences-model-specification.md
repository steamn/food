# Спецификация модели UserPreferences

## Описание

Модель `UserPreferences` представляет настройки пользователей системы food delivery. Содержит персональные предпочтения, настройки уведомлений, интерфейса и доставки для каждого пользователя.

## Миграция: `create_user_preferences_table`

### Основная таблица настроек

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

## Миграция: `add_user_preferences_indexes`

### Дополнительные индексы для производительности

```php
Schema::table('user_preferences', function (Blueprint $table) {
    // Индексы для частых запросов
    $table->index('theme');
    $table->index('language');
    $table->index('currency');
    $table->index('allow_marketing');

    // Составной индекс для фильтрации
    $table->index(['theme', 'language', 'compact_mode']);
});
```

## Миграция: `add_user_preferences_constraints`

### Ограничения и проверки

```php
Schema::table('user_preferences', function (Blueprint $table) {
    // Ограничения для enum значений
    $table->check('theme IN ("light", "dark", "auto")');
    $table->check('language IN ("ru", "en", "kz", "uz", "ky")');
    $table->check('currency IN ("RUB", "USD", "EUR", "KZT", "UZS", "KGS")');

    // Ограничения для числовых значений
    $table->check('default_delivery_time >= 5 AND default_delivery_time <= 180');
    $table->check('max_order_amount IS NULL OR max_order_amount > 0');
});
```

## Модель UserPreferences.php

### Основная структура

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

    // Отношения
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope методы
    public function scopeByTheme($query, $theme)
    {
        return $query->where('theme', $theme);
    }

    public function scopeByLanguage($query, $language)
    {
        return $query->where('language', $language);
    }

    public function scopeMarketingAllowed($query)
    {
        return $query->where('allow_marketing', true);
    }

    public function scopeCompactMode($query)
    {
        return $query->where('compact_mode', true);
    }

    // Accessor методы
    public function getThemeDisplayAttribute()
    {
        return match($this->theme) {
            'light' => 'Светлая',
            'dark' => 'Темная',
            'auto' => 'Автоматическая',
            default => 'Неизвестно'
        };
    }

    public function getLanguageDisplayAttribute()
    {
        return match($this->language) {
            'ru' => 'Русский',
            'en' => 'English',
            'kz' => 'Қазақша',
            'uz' => 'O\'zbekcha',
            'ky' => 'Кыргызча',
            default => 'Неизвестно'
        };
    }

    public function getCurrencyDisplayAttribute()
    {
        return match($this->currency) {
            'RUB' => '₽',
            'USD' => '$',
            'EUR' => '€',
            'KZT' => '₸',
            'UZS' => 'сўм',
            'KGS' => 'сом',
            default => $this->currency
        };
    }

    public function getIsQuietHoursAttribute()
    {
        if (!$this->quiet_hours_start || !$this->quiet_hours_end) {
            return false;
        }

        $now = now()->format('H:i');
        $start = $this->quiet_hours_start->format('H:i');
        $end = $this->quiet_hours_end->format('H:i');

        if ($start <= $end) {
            return $now >= $start && $now <= $end;
        } else {
            // Переход через полночь
            return $now >= $start || $now <= $end;
        }
    }

    // Mutator методы
    public function setNotificationSettingsAttribute($value)
    {
        $this->attributes['notification_settings'] = json_encode($value ?? []);
    }

    public function setDashboardWidgetsAttribute($value)
    {
        $this->attributes['dashboard_widgets'] = json_encode($value ?? []);
    }

    // Методы для работы с настройками
    public function getNotificationSetting($key, $default = null)
    {
        $settings = $this->notification_settings ?? [];
        return $settings[$key] ?? $default;
    }

    public function setNotificationSetting($key, $value)
    {
        $settings = $this->notification_settings ?? [];
        $settings[$key] = $value;
        $this->notification_settings = $settings;
    }

    public function getDashboardWidget($key, $default = null)
    {
        $widgets = $this->dashboard_widgets ?? [];
        return $widgets[$key] ?? $default;
    }

    public function setDashboardWidget($key, $value)
    {
        $widgets = $this->dashboard_widgets ?? [];
        $widgets[$key] = $value;
        $this->dashboard_widgets = $widgets;
    }
}
```

## Константы и перечисления

### Поддерживаемые языки

```php
class UserPreferences extends Model
{
    const LANGUAGES = [
        'ru' => 'Русский',
        'en' => 'English',
        'kz' => 'Қазақша',
        'uz' => 'O\'zbekcha',
        'ky' => 'Кыргызча',
    ];

    const THEMES = [
        'light' => 'Светлая',
        'dark' => 'Темная',
        'auto' => 'Автоматическая',
    ];

    const CURRENCIES = [
        'RUB' => '₽',
        'USD' => '$',
        'EUR' => '€',
        'KZT' => '₸',
        'UZS' => 'сўм',
        'KGS' => 'сом',
    ];

    const TIMEZONES = [
        'Europe/Moscow' => 'Москва',
        'Asia/Almaty' => 'Алматы',
        'Asia/Tashkent' => 'Ташкент',
        'Asia/Bishkek' => 'Бишкек',
    ];
}
```

## Валидация

### UserPreferencesRequest

```php
class UserPreferencesRequest extends FormRequest
{
    public function rules()
    {
        return [
            'language' => 'required|string|in:ru,en,kz,uz,ky',
            'timezone' => 'required|string|in:Europe/Moscow,Asia/Almaty,Asia/Tashkent,Asia/Bishkek',
            'currency' => 'required|string|in:RUB,USD,EUR,KZT,UZS,KGS',
            'theme' => 'required|string|in:light,dark,auto',
            'compact_mode' => 'boolean',
            'dashboard_widgets' => 'nullable|array',
            'notification_settings' => 'nullable|array',
            'quiet_hours_start' => 'nullable|date_format:H:i',
            'quiet_hours_end' => 'nullable|date_format:H:i|after:quiet_hours_start',
            'default_delivery_time' => 'integer|min:5|max:180',
            'auto_confirm_orders' => 'boolean',
            'max_order_amount' => 'nullable|numeric|min:0',
            'show_phone' => 'boolean',
            'show_email' => 'boolean',
            'allow_marketing' => 'boolean',
        ];
    }

    public function messages()
    {
        return [
            'language.in' => 'Выбранный язык не поддерживается.',
            'timezone.in' => 'Выбранный часовой пояс не поддерживается.',
            'currency.in' => 'Выбранная валюта не поддерживается.',
            'theme.in' => 'Выбранная тема не поддерживается.',
            'quiet_hours_end.after' => 'Время окончания тихого часа должно быть после времени начала.',
            'default_delivery_time.min' => 'Минимальное время доставки: 5 минут.',
            'default_delivery_time.max' => 'Максимальное время доставки: 180 минут.',
        ];
    }
}
```

## Использование в контроллерах

### Создание настроек по умолчанию

```php
// Создание настроек при регистрации пользователя
$user = User::create($userData);
$user->preferences()->create([
    'language' => 'ru',
    'timezone' => 'Europe/Moscow',
    'currency' => 'RUB',
    'theme' => 'light',
    'default_delivery_time' => 30,
]);

// Получение настроек с fallback
$preferences = $user->preferences ?? $user->preferences()->create();
```

### Обновление настроек

```php
// Обновление настроек
$preferences = $user->preferences;
$preferences->update([
    'theme' => 'dark',
    'compact_mode' => true,
    'language' => 'en',
]);

// Обновление конкретной настройки уведомлений
$preferences->setNotificationSetting('email_orders', true);
$preferences->setNotificationSetting('sms_promotions', false);
$preferences->save();
```

### Фильтрация пользователей по настройкам

```php
// Пользователи с темной темой
$darkThemeUsers = User::whereHas('preferences', function ($query) {
    $query->where('theme', 'dark');
})->get();

// Пользователи, разрешившие маркетинг
$marketingUsers = User::whereHas('preferences', function ($query) {
    $query->where('allow_marketing', true);
})->get();

// Пользователи с компактным режимом
$compactUsers = User::whereHas('preferences', function ($query) {
    $query->where('compact_mode', true);
})->get();
```

## Индексы для производительности

```sql
-- Основные индексы
CREATE UNIQUE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Индексы для фильтрации
CREATE INDEX idx_user_preferences_theme ON user_preferences(theme);
CREATE INDEX idx_user_preferences_language ON user_preferences(language);
CREATE INDEX idx_user_preferences_currency ON user_preferences(currency);
CREATE INDEX idx_user_preferences_allow_marketing ON user_preferences(allow_marketing);

-- Составные индексы
CREATE INDEX idx_user_preferences_theme_lang ON user_preferences(theme, language);
CREATE INDEX idx_user_preferences_theme_compact ON user_preferences(theme, compact_mode);
```

## События модели

```php
class UserPreferences extends Model
{
    protected static function booted()
    {
        // Создание настроек по умолчанию при создании пользователя
        static::creating(function ($preferences) {
            if (!$preferences->language) {
                $preferences->language = 'ru';
            }
            if (!$preferences->timezone) {
                $preferences->timezone = 'Europe/Moscow';
            }
            if (!$preferences->currency) {
                $preferences->currency = 'RUB';
            }
        });

        // Валидация времени тихого часа
        static::saving(function ($preferences) {
            if ($preferences->quiet_hours_start && $preferences->quiet_hours_end) {
                $start = Carbon::parse($preferences->quiet_hours_start);
                $end = Carbon::parse($preferences->quiet_hours_end);

                if ($start->equalTo($end)) {
                    throw new \InvalidArgumentException('Время начала и окончания тихого часа не могут быть одинаковыми');
                }
            }
        });
    }
}
```

## Тестирование

### Unit тесты

```php
class UserPreferencesTest extends TestCase
{
    public function test_can_create_preferences_with_defaults()
    {
        $user = User::factory()->create();
        $preferences = UserPreferences::create(['user_id' => $user->id]);

        $this->assertEquals('ru', $preferences->language);
        $this->assertEquals('Europe/Moscow', $preferences->timezone);
        $this->assertEquals('RUB', $preferences->currency);
        $this->assertEquals('light', $preferences->theme);
    }

    public function test_notification_settings_accessor()
    {
        $preferences = UserPreferences::factory()->create();

        $preferences->setNotificationSetting('email_orders', true);
        $this->assertTrue($preferences->getNotificationSetting('email_orders'));

        $preferences->setNotificationSetting('sms_promotions', false);
        $this->assertFalse($preferences->getNotificationSetting('sms_promotions'));
    }

    public function test_quiet_hours_detection()
    {
        $preferences = UserPreferences::factory()->create([
            'quiet_hours_start' => '22:00',
            'quiet_hours_end' => '08:00',
        ]);

        // Тест в тихом часе
        Carbon::setTestNow('23:00');
        $this->assertTrue($preferences->is_quiet_hours);

        // Тест вне тихого часа
        Carbon::setTestNow('12:00');
        $this->assertFalse($preferences->is_quiet_hours);
    }
}
```

## Миграция данных

### Перенос существующих настроек

```php
// Миграция для переноса настроек из старой структуры
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['theme', 'language', 'timezone']);
});

// Создание настроек для существующих пользователей
User::whereDoesntHave('preferences')->chunk(100, function ($users) {
    foreach ($users as $user) {
        $user->preferences()->create([
            'language' => 'ru',
            'timezone' => 'Europe/Moscow',
            'currency' => 'RUB',
            'theme' => 'light',
        ]);
    }
});
```
