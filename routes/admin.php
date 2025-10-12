<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Админские роуты с проверкой прав доступа
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
        // Главная страница админки
        Route::get('/', function () {
                return Inertia::render('admin/dashboard');
        })->name('dashboard');

        // Управление пользователями
        Route::get('/users', function () {
                return Inertia::render('admin/users/index');
        })->name('users.index');

        Route::get('/users/create', function () {
                return Inertia::render('admin/users/create');
        })->name('users.create');

        Route::get('/users/{user}/edit', function () {
                return Inertia::render('admin/users/edit');
        })->name('users.edit');

        // Управление заказами
        Route::get('/orders', function () {
                return Inertia::render('admin/orders/index');
        })->name('orders.index');

        Route::get('/orders/{order}', function () {
                return Inertia::render('admin/orders/show');
        })->name('orders.show');





        // Настройки системы
        Route::get('/settings', function () {
                return Inertia::render('admin/settings/index');
        })->name('settings.index');

        // Статистика и аналитика
        Route::get('/analytics', function () {
                return Inertia::render('admin/analytics/index');
        })->name('analytics.index');
});
