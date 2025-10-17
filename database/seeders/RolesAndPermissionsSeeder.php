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

        // Создание базовых разрешений для MVP (упрощенная система)
        $permissions = [
            // Управление пользователями
            'users.viewAny',
            'users.viewOwn',
            'users.create',
            'users.updateAny',
            'users.updateOwn',
            'users.delete',
            'users.restore',
            'users.forceDelete',

            // Управление ролями и разрешениями
            'roles.viewAny',
            'roles.viewOwn',
            'roles.create',
            'roles.updateAny',
            'roles.delete',
            'roles.restore',
            'roles.forceDelete',

            'permissions.viewAny',
            'permissions.create',
            'permissions.updateAny',
            'permissions.delete',
            'permissions.restore',
            'permissions.forceDelete',

            // Профили
            'courier-profiles.viewAny',
            'courier-profiles.viewOwn',
            'courier-profiles.create',
            'courier-profiles.updateAny',
            'courier-profiles.updateOwn',
            'courier-profiles.delete',
            'courier-profiles.restore',
            'courier-profiles.forceDelete',

            // Магазин и продукты
            'products.viewAny',
            'products.viewOwn',
            'products.create',
            'products.updateAny',
            'products.updateOwn',
            'products.delete',
            'products.restore',
            'products.forceDelete',

            // Заказы и доставка
            'orders.viewAny',
            'orders.viewOwn',
            'orders.create',
            'orders.updateAny',
            'orders.delete',
            'orders.restore',
            'orders.forceDelete',

            // Платежи
            'payments.viewAny',
            'payments.viewOwn',
            'payments.create',
            'payments.delete',
            'payments.restore',
            'payments.forceDelete',

            // Коммуникации
            'notifications.manage', // управление уведомлениями
            'support.manage',      // управление поддержкой
            'messages.manage',     // управление сообщениями

            // Аналитика и отчеты
            'analytics.view',      // просмотр аналитики
            'reports.view',        // просмотр отчетов

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Создание ролей (идемпотентно)
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $manager = Role::firstOrCreate(['name' => 'manager']);
        $courier = Role::firstOrCreate(['name' => 'courier']);
        $customer = Role::firstOrCreate(['name' => 'customer']);

        // Назначение разрешений ролям (упрощенная система)

        // Админ - полный доступ ко всему
        $admin->syncPermissions(Permission::all());

        // Менеджер - управление системой без доступа к ролям и разрешениям
        $manager->syncPermissions([

            'users.viewAny',
            'users.viewOwn',
            'users.create',
            'users.updateAny',
            'users.updateOwn',
            'users.delete',
            'users.restore',
            'users.forceDelete',
            'courier-profiles.viewAny',
            'courier-profiles.viewOwn',
            'courier-profiles.create',
            'courier-profiles.updateAny',
            'courier-profiles.updateOwn',
            'courier-profiles.delete',
            'courier-profiles.restore',
            'courier-profiles.forceDelete',
            'orders.viewAny',
            'orders.viewOwn',
            'orders.create',
            'orders.updateAny',
            'orders.delete',
            'orders.restore',
            'orders.forceDelete',
            'payments.viewAny',
            'payments.create',
            'payments.delete',
            'payments.restore',
            'payments.forceDelete',

        ]);

        // Курьер - управление доставками
        $courier->syncPermissions([
            'users.viewOwn',
            'users.updateOwn',
            'courier-profiles.viewOwn',
            'courier-profiles.updateOwn',
            'products.viewAny',
            'orders.viewAny',
        ]);

        // Клиент - базовые функции
        $customer->syncPermissions([
            'users.viewOwn',
            'users.updateOwn',

            'products.viewAny',
            'orders.create',
            'orders.viewOwn',
            'courier-profiles.viewAny',
            'payments.create',
            'payments.viewOwn',
        ]);

    }
}