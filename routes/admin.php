<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Админские роуты с проверкой прав доступа
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
        // Главная страница админки
        Route::get('/', function () {
                return Inertia::render('admin/dashboard');
        })->name('dashboard');



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
