<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserPreferences>
 */
class UserPreferencesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'language' => fake()->randomElement(['ru', 'en', 'de', 'fr']),
            'timezone' => fake()->randomElement(['Europe/Moscow', 'Europe/London', 'America/New_York', 'Asia/Tokyo']),
            'currency' => fake()->randomElement(['RUB', 'USD', 'EUR', 'GBP']),
            'theme' => fake()->randomElement(['light', 'dark', 'auto']),
            'compact_mode' => fake()->boolean(),
            'dashboard_widgets' => fake()->optional()->randomElements([
                'recent_orders',
                'delivery_stats',
                'earnings_chart',
                'rating_widget',
            ], 2),
            'notification_settings' => fake()->optional()->randomElements([
                'email' => true,
                'sms' => false,
                'push' => true,
                'order_updates' => true,
                'promotions' => false,
            ], 5),
            'quiet_hours_start' => fake()->optional()->time('H:i'),
            'quiet_hours_end' => fake()->optional()->time('H:i'),
            'default_delivery_time' => fake()->numberBetween(15, 120),
            'auto_confirm_orders' => fake()->boolean(),
            'max_order_amount' => fake()->optional()->randomFloat(2, 100, 10000),
            'show_phone' => fake()->boolean(),
            'show_email' => fake()->boolean(),
            'allow_marketing' => fake()->boolean(),
        ];
    }
}
