<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
        ]);

        // User::factory(10)->create();

        // Создаем пользователя admin
        $adminUser = User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@admin.gg',
            'password' => Hash::make('password'), // Используем Hash::make()
        ]);
        $adminUser->assignRole("admin");
        $this->command->info('Пользователь admin создан и ему назначена роль admin.');


    }
}
