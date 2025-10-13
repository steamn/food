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
        $this->app->make('Illuminate\Contracts\Auth\Access\Gate')
            ->policy(\App\Models\User::class, \App\Policies\UserPolicy::class);
    }
}
