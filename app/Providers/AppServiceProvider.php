<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        $gate = $this->app->make('Illuminate\Contracts\Auth\Access\Gate');

        $gate->policy(\App\Models\User::class, \App\Policies\UserPolicy::class);
        $gate->policy(\Spatie\Permission\Models\Role::class, \App\Policies\RolePolicy::class);
        $gate->policy(\Spatie\Permission\Models\Permission::class, \App\Policies\PermissionPolicy::class);
    }
}
