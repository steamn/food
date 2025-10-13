<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',
            'view orders',
            'create orders',
            'edit orders',
            'delete orders',
            'view products',
            'create products',
            'edit products',
            'delete products',
            'view stores',
            'create stores',
            'edit stores',
            'delete stores',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $courier = Role::firstOrCreate(['name' => 'courier']);
        $customer = Role::firstOrCreate(['name' => 'customer']);

        // Assign permissions to roles
        $superAdmin->givePermissionTo(Permission::all());

        $admin->givePermissionTo([
            'view users',
            'create users',
            'edit users',
            'delete users',
            'view orders',
            'create orders',
            'edit orders',
            'delete orders',
            'view products',
            'create products',
            'edit products',
            'delete products',
            'view stores',
            'create stores',
            'edit stores',
            'delete stores',
        ]);

        $courier->givePermissionTo([
            'view orders',
            'edit orders',
        ]);

        $customer->givePermissionTo([
            'view orders',
            'create orders',
        ]);
    }
}
