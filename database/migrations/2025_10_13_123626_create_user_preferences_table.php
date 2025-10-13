<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Язык и локализация
            $table->string('language', 5)->default('ru');
            $table->string('timezone')->default('Europe/Moscow');
            $table->string('currency', 3)->default('RUB');

            // Настройки интерфейса
            $table->string('theme')->default('light'); // light, dark, auto
            $table->boolean('compact_mode')->default(false);
            $table->json('dashboard_widgets')->nullable();

            // Настройки уведомлений
            $table->json('notification_settings')->nullable();
            $table->time('quiet_hours_start')->nullable();
            $table->time('quiet_hours_end')->nullable();

            // Настройки доставки
            $table->integer('default_delivery_time')->default(30); // минуты
            $table->boolean('auto_confirm_orders')->default(false);
            $table->decimal('max_order_amount', 10, 2)->nullable();

            // Приватность
            $table->boolean('show_phone')->default(false);
            $table->boolean('show_email')->default(false);
            $table->boolean('allow_marketing')->default(true);

            $table->timestamps();

            // Индексы
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
