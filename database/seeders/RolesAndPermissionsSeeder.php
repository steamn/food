<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Отключаем проверку внешних ключей для безопасной очистки (поддержка разных БД)
        $connection = DB::connection();
        $driver = $connection->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        }

        // Очистка таблиц ролей и разрешений в правильном порядке (сначала зависимые таблицы)
        DB::table('model_has_roles')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('role_has_permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('permissions')->truncate();

        // Включаем обратно проверку внешних ключей
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        }

        // Сброс кэша ролей и разрешений
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Создание разрешений для всех моделей из плана (идемпотентно)
        $permissions = [
            // Пользователи и роли
            'users.create',
            'users.view.any',
            'users.view.own',
            'users.update.any',
            'users.update.own',
            'users.delete.any',
            'users.delete.own',
            'users.restore',
            'users.forceDelete',

            'roles.create',
            'roles.view.any',
            'roles.update.any',
            'roles.delete.any',

            'permissions.create',
            'permissions.view.any',
            'permissions.update.any',
            'permissions.delete.any',

            // Профили пользователей
            'courier-profiles.create',
            'courier-profiles.view.any',
            'courier-profiles.view.own',
            'courier-profiles.update.any',
            'courier-profiles.update.own',
            'courier-profiles.delete.any',
            'courier-profiles.delete.own',

            'user-preferences.create',
            'user-preferences.view.any',
            'user-preferences.view.own',
            'user-preferences.update.any',
            'user-preferences.update.own',
            'user-preferences.delete.any',
            'user-preferences.delete.own',

            // Магазин и продукты
            'store.view.any',
            'store.update.any',
            'store.settings.manage',

            'categories.create',
            'categories.view.any',
            'categories.update.any',
            'categories.delete.any',

            'products.create',
            'products.view.any',
            'products.update.any',
            'products.delete.any',
            'products.sync.1c',

            'product-reviews.create',
            'product-reviews.view.any',
            'product-reviews.view.own',
            'product-reviews.update.any',
            'product-reviews.update.own',
            'product-reviews.delete.any',
            'product-reviews.delete.own',

            'product-favorites.create',
            'product-favorites.view.any',
            'product-favorites.view.own',
            'product-favorites.delete.any',
            'product-favorites.delete.own',

            // Заказы и доставка
            'orders.create',
            'orders.view.any',
            'orders.view.own',
            'orders.update.any',
            'orders.update.own',
            'orders.delete.any',
            'orders.delete.own',
            'orders.track.any',
            'orders.track.own',

            'order-items.create',
            'order-items.view.any',
            'order-items.view.own',
            'order-items.update.any',
            'order-items.update.own',
            'order-items.delete.any',
            'order-items.delete.own',

            'addresses.create',
            'addresses.view.any',
            'addresses.view.own',
            'addresses.update.any',
            'addresses.update.own',
            'addresses.delete.any',
            'addresses.delete.own',

            'delivery-zones.create',
            'delivery-zones.view.any',
            'delivery-zones.update.any',
            'delivery-zones.delete.any',

            'cart.create',
            'cart.view.own',
            'cart.update.own',
            'cart.delete.own',

            // Платежи
            'payments.create',
            'payments.view.any',
            'payments.view.own',
            'payments.update.any',
            'payments.update.own',
            'payments.delete.any',
            'payments.delete.own',

            'refunds.create',
            'refunds.view.any',
            'refunds.view.own',
            'refunds.update.any',
            'refunds.update.own',
            'refunds.delete.any',
            'refunds.delete.own',

            'commissions.create',
            'commissions.view.any',
            'commissions.update.any',
            'commissions.delete.any',

            // Коммуникации
            'notifications.create',
            'notifications.view.any',
            'notifications.view.own',
            'notifications.update.any',
            'notifications.update.own',
            'notifications.delete.any',
            'notifications.delete.own',

            'support-tickets.create',
            'support-tickets.view.any',
            'support-tickets.view.own',
            'support-tickets.update.any',
            'support-tickets.update.own',
            'support-tickets.delete.any',
            'support-tickets.delete.own',

            'messages.create',
            'messages.view.any',
            'messages.view.own',
            'messages.update.any',
            'messages.update.own',
            'messages.delete.any',
            'messages.delete.own',

            // Аналитика
            'analytics-events.create',
            'analytics-events.view.any',
            'analytics-events.update.any',
            'analytics-events.delete.any',

            'reports.create',
            'reports.view.any',
            'reports.view.own',
            'reports.update.any',
            'reports.update.own',
            'reports.delete.any',
            'reports.delete.own',

            'audit-logs.view.any',

            // Общие разрешения
            'export.data',
            'import.data',
            'view.admin.panel',
            'view.statistics',
            'view.courier.panel',
            'view.customer.panel',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Создание ролей (идемпотентно)
        $superAdmin = Role::firstOrCreate(['name' => 'admin']);
        $manager = Role::firstOrCreate(['name' => 'manager']);
        $courier = Role::firstOrCreate(['name' => 'courier']);
        $customer = Role::firstOrCreate(['name' => 'customer']);

        // Назначение разрешений ролям (без дублирования)

        // Админ - полный доступ ко всему
        $superAdmin->syncPermissions(Permission::all());

        // Менеджер - управление системой, пользователями, заказами, продуктами
        $manager->syncPermissions([
            // Пользователи и роли
            'users.create',
            'users.view.any',
            'users.update.any',
            'users.delete.any',
            'users.restore',
            'users.forceDelete',
            'roles.create',
            'roles.view.any',
            'roles.update.any',
            'roles.delete.any',
            'permissions.create',
            'permissions.view.any',
            'permissions.update.any',
            'permissions.delete.any',

            // Профили пользователей
            'courier-profiles.create',
            'courier-profiles.view.any',
            'courier-profiles.update.any',
            'courier-profiles.delete.any',
            'user-preferences.create',
            'user-preferences.view.any',
            'user-preferences.update.any',
            'user-preferences.delete.any',

            // Магазин и продукты
            'store.view.any',
            'store.update.any',
            'store.settings.manage',
            'categories.create',
            'categories.view.any',
            'categories.update.any',
            'categories.delete.any',
            'products.create',
            'products.view.any',
            'products.update.any',
            'products.delete.any',
            'products.sync.1c',
            'product-reviews.create',
            'product-reviews.view.any',
            'product-reviews.update.any',
            'product-reviews.delete.any',
            'product-favorites.create',
            'product-favorites.view.any',
            'product-favorites.delete.any',

            // Заказы и доставка
            'orders.create',
            'orders.view.any',
            'orders.update.any',
            'orders.delete.any',
            'orders.track.any',
            'order-items.create',
            'order-items.view.any',
            'order-items.update.any',
            'order-items.delete.any',
            'addresses.create',
            'addresses.view.any',
            'addresses.update.any',
            'addresses.delete.any',
            'delivery-zones.create',
            'delivery-zones.view.any',
            'delivery-zones.update.any',
            'delivery-zones.delete.any',
            'cart.create',
            'cart.view.own',
            'cart.update.own',
            'cart.delete.own',

            // Платежи
            'payments.create',
            'payments.view.any',
            'payments.update.any',
            'payments.delete.any',
            'refunds.create',
            'refunds.view.any',
            'refunds.update.any',
            'refunds.delete.any',
            'commissions.create',
            'commissions.view.any',
            'commissions.update.any',
            'commissions.delete.any',

            // Коммуникации
            'notifications.create',
            'notifications.view.any',
            'notifications.update.any',
            'notifications.delete.any',
            'support-tickets.create',
            'support-tickets.view.any',
            'support-tickets.update.any',
            'support-tickets.delete.any',
            'messages.create',
            'messages.view.any',
            'messages.update.any',
            'messages.delete.any',

            // Аналитика
            'analytics-events.create',
            'analytics-events.view.any',
            'analytics-events.update.any',
            'analytics-events.delete.any',
            'reports.create',
            'reports.view.any',
            'reports.update.any',
            'reports.delete.any',
            'audit-logs.view.any',

            // Общие разрешения
            'export.data',
            'import.data',
            'view.admin.panel',
            'view.statistics',
        ]);

        // Курьер - управление доставками
        $courier->syncPermissions([
            // Профиль курьера
            'courier-profiles.view.own',
            'courier-profiles.update.own',
            'user-preferences.view.own',
            'user-preferences.update.own',

            // Заказы и доставка
            'orders.view.own',
            'orders.update.own',
            'orders.track.own',
            'order-items.view.own',
            'order-items.update.own',
            'addresses.view.own',
            'addresses.update.own',
            'delivery-zones.view.any',

            // Платежи
            'payments.view.own',
            'commissions.view.any',

            // Коммуникации
            'notifications.view.own',
            'notifications.update.own',
            'messages.create',
            'messages.view.own',
            'messages.update.own',
            'messages.delete.own',

            // Общие разрешения
            'view.courier.panel',
        ]);

        // Клиент - базовые функции
        $customer->syncPermissions([
            // Профиль клиента
            'user-preferences.view.own',
            'user-preferences.update.own',

            // Магазин и продукты
            'store.view.any',
            'categories.view.any',
            'products.view.any',
            'product-reviews.create',
            'product-reviews.view.any',
            'product-reviews.view.own',
            'product-reviews.update.own',
            'product-reviews.delete.own',
            'product-favorites.create',
            'product-favorites.view.own',
            'product-favorites.delete.own',

            // Заказы и доставка
            'orders.create',
            'orders.view.own',
            'orders.track.own',
            'order-items.create',
            'order-items.view.own',
            'order-items.update.own',
            'order-items.delete.own',
            'addresses.create',
            'addresses.view.own',
            'addresses.update.own',
            'addresses.delete.own',
            'cart.create',
            'cart.view.own',
            'cart.update.own',
            'cart.delete.own',

            // Платежи
            'payments.create',
            'payments.view.own',
            'refunds.create',
            'refunds.view.own',

            // Коммуникации
            'notifications.view.own',
            'notifications.update.own',
            'support-tickets.create',
            'support-tickets.view.own',
            'support-tickets.update.own',
            'messages.create',
            'messages.view.own',
            'messages.update.own',
            'messages.delete.own',

            // Общие разрешения
            'view.customer.panel',
        ]);

    }
}