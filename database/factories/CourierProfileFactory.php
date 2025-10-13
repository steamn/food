<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CourierProfile>
 */
class CourierProfileFactory extends Factory
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
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'middle_name' => fake()->optional()->firstName(),
            'phone' => fake()->unique()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'passport_series' => fake()->optional()->numerify('####'),
            'passport_number' => fake()->optional()->numerify('######'),
            'passport_issued_date' => fake()->optional()->date(),
            'passport_issued_by' => fake()->optional()->company(),
            'transport_type' => fake()->randomElement(['bicycle', 'scooter', 'motorcycle', 'car', 'walking']),
            'transport_model' => fake()->optional()->word(),
            'transport_number' => fake()->optional()->bothify('??###??'),
            'transport_color' => fake()->optional()->colorName(),
            'status' => fake()->randomElement(['active', 'inactive', 'suspended', 'pending_verification']),
            'rating' => fake()->randomFloat(2, 0, 5),
            'total_deliveries' => fake()->numberBetween(0, 1000),
            'total_earnings' => fake()->randomFloat(2, 0, 100000),
            'delivery_zones' => fake()->optional()->randomElements([1, 2, 3, 4, 5], 2),
            'work_schedule' => fake()->optional()->randomElements([
                'monday' => ['start' => '09:00', 'end' => '18:00'],
                'tuesday' => ['start' => '09:00', 'end' => '18:00'],
                'wednesday' => ['start' => '09:00', 'end' => '18:00'],
                'thursday' => ['start' => '09:00', 'end' => '18:00'],
                'friday' => ['start' => '09:00', 'end' => '18:00'],
            ], 5),
            'bank_name' => fake()->optional()->company(),
            'bank_account' => fake()->optional()->numerify('################'),
            'bank_card_number' => fake()->optional()->creditCardNumber(),
            'notes' => fake()->optional()->text(500),
            'documents' => fake()->optional()->randomElements([
                'passport_front.jpg',
                'passport_back.jpg',
                'driver_license.jpg',
                'vehicle_registration.jpg',
            ], 2),
        ];
    }
}
