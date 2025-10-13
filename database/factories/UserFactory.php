<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'phone' => fake()->unique()->phoneNumber(),
            'bio' => fake()->optional()->text(200),
            'birth_date' => fake()->optional()->date('Y-m-d', '2000-01-01'),
            'gender' => fake()->optional()->randomElement(['male', 'female']),
            'default_address' => fake()->optional()->address(),
            'default_latitude' => fake()->optional()->latitude(),
            'default_longitude' => fake()->optional()->longitude(),
            'email_notifications' => true,
            'sms_notifications' => true,
            'push_notifications' => true,
            'is_active' => true,
            'last_login_at' => fake()->optional()->dateTimeBetween('-1 month', 'now'),
            'last_login_ip' => fake()->optional()->ipv4(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
