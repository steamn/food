<?php

use App\Models\CourierProfile;
use App\Models\User;
use App\Models\UserPreferences;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create a user with food delivery fields', function () {
    $user = User::factory()->create([
        'phone' => '+79001234567',
        'bio' => 'Test bio',
        'birth_date' => '1990-01-01',
        'gender' => 'male',
        'default_address' => 'Test Address',
        'default_latitude' => 55.7558,
        'default_longitude' => 37.6176,
        'is_active' => true,
    ]);

    expect($user->phone)->toBe('+79001234567');
    expect($user->bio)->toBe('Test bio');
    expect($user->birth_date->format('Y-m-d'))->toBe('1990-01-01');
    expect($user->gender)->toBe('male');
    expect($user->default_address)->toBe('Test Address');
    expect($user->default_latitude)->toBe('55.75580000');
    expect($user->default_longitude)->toBe('37.61760000');
    expect($user->is_active)->toBeTrue();
});

it('can create courier profile for user', function () {
    $user = User::factory()->create();

    $courierProfile = CourierProfile::create([
        'user_id' => $user->id,
        'first_name' => 'Иван',
        'last_name' => 'Иванов',
        'phone' => '+79001234567',
        'email' => 'courier@example.com',
        'transport_type' => 'bicycle',
        'status' => 'active',
        'rating' => 4.5,
        'total_deliveries' => 100,
        'total_earnings' => 50000.00,
    ]);

    expect($courierProfile->user_id)->toBe($user->id);
    expect($courierProfile->first_name)->toBe('Иван');
    expect($courierProfile->last_name)->toBe('Иванов');
    expect($courierProfile->transport_type)->toBe('bicycle');
    expect($courierProfile->status)->toBe('active');
    expect($courierProfile->rating)->toBe('4.50');
    expect($courierProfile->total_deliveries)->toBe(100);
    expect($courierProfile->total_earnings)->toBe('50000.00');
});

it('can create user preferences', function () {
    $user = User::factory()->create();

    $preferences = UserPreferences::create([
        'user_id' => $user->id,
        'language' => 'ru',
        'timezone' => 'Europe/Moscow',
        'currency' => 'RUB',
        'theme' => 'dark',
        'compact_mode' => true,
        'default_delivery_time' => 45,
        'auto_confirm_orders' => false,
        'max_order_amount' => 1000.00,
    ]);

    expect($preferences->user_id)->toBe($user->id);
    expect($preferences->language)->toBe('ru');
    expect($preferences->timezone)->toBe('Europe/Moscow');
    expect($preferences->currency)->toBe('RUB');
    expect($preferences->theme)->toBe('dark');
    expect($preferences->compact_mode)->toBeTrue();
    expect($preferences->default_delivery_time)->toBe(45);
    expect($preferences->auto_confirm_orders)->toBeFalse();
    expect($preferences->max_order_amount)->toBe('1000.00');
});

it('user has courier profile relationship', function () {
    $user = User::factory()->create();
    $courierProfile = CourierProfile::create([
        'user_id' => $user->id,
        'first_name' => 'Иван',
        'last_name' => 'Иванов',
        'phone' => '+79001234567',
        'email' => 'courier@example.com',
        'transport_type' => 'bicycle',
    ]);

    expect($user->courierProfile)->not->toBeNull();
    expect($user->courierProfile->id)->toBe($courierProfile->id);
});

it('user has preferences relationship', function () {
    $user = User::factory()->create();
    $preferences = UserPreferences::create([
        'user_id' => $user->id,
        'language' => 'ru',
        'timezone' => 'Europe/Moscow',
        'currency' => 'RUB',
    ]);

    expect($user->preferences)->not->toBeNull();
    expect($user->preferences->id)->toBe($preferences->id);
});

it('can filter users by active scope', function () {
    User::factory()->create(['is_active' => true]);
    User::factory()->create(['is_active' => false]);

    $activeUsers = User::active()->get();

    expect($activeUsers)->toHaveCount(1);
    expect($activeUsers->first()->is_active)->toBeTrue();
});

it('courier profile has full name accessor', function () {
    $courierProfile = CourierProfile::create([
        'user_id' => User::factory()->create()->id,
        'first_name' => 'Иван',
        'last_name' => 'Иванов',
        'phone' => '+79001234567',
        'email' => 'courier@example.com',
        'transport_type' => 'bicycle',
    ]);

    expect($courierProfile->full_name)->toBe('Иван Иванов');
});

it('can filter courier profiles by active scope', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    CourierProfile::create([
        'user_id' => $user1->id,
        'first_name' => 'Иван',
        'last_name' => 'Иванов',
        'phone' => '+79001234567',
        'email' => 'courier1@example.com',
        'transport_type' => 'bicycle',
        'status' => 'active',
    ]);

    CourierProfile::create([
        'user_id' => $user2->id,
        'first_name' => 'Петр',
        'last_name' => 'Петров',
        'phone' => '+79001234568',
        'email' => 'courier2@example.com',
        'transport_type' => 'scooter',
        'status' => 'inactive',
    ]);

    $activeCouriers = CourierProfile::active()->get();

    expect($activeCouriers)->toHaveCount(1);
    expect($activeCouriers->first()->status)->toBe('active');
});
