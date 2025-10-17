<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::prefix('panel')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // // Users
    // Route::resource('users', App\Http\Controllers\UserController::class);
    // Route::post('users/bulk-action', [App\Http\Controllers\UserController::class, 'bulkAction'])
    //     ->name('users.bulk-action')
    //     ->middleware('can:viewAny,App\Models\User');


    // // User management routes
    // Route::resource('users', App\Http\Controllers\UserController::class)
    //     ->middleware([
    //         'index' => 'can:manage,App\Models\User',
    //         'show' => 'can:viewAny,App\Models\User',
    //         'create' => 'can:create,App\Models\User',
    //         'store' => 'can:create,App\Models\User',
    //         'edit' => 'can:update,user',
    //         'update' => 'can:update,user',
    //         'destroy' => 'can:delete,user',
    //     ]);
    // Route::post('users/bulk-action', [App\Http\Controllers\UserController::class, 'bulkAction'])
    //     ->name('users.bulk-action')
    //     ->middleware('can:viewAny,App\Models\User');

    // Admin routes for roles and permissions
    Route::name('admin.')->middleware('can:viewAny,App\Models\User')->group(function () {

        // Users
        Route::resource('users', App\Http\Controllers\UserController::class);

        // Roles
        Route::resource('roles', App\Http\Controllers\Admin\RoleController::class);

        // Permissions
        Route::resource('permissions', App\Http\Controllers\Admin\PermissionController::class);

        // Roles
        Route::resource('roles', App\Http\Controllers\Admin\RoleController::class);

        // Permissions
        Route::resource('permissions', App\Http\Controllers\Admin\PermissionController::class);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
