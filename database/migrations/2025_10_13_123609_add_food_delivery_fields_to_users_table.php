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
        Schema::table('users', function (Blueprint $table) {
            // Контактная информация
            $table->string('phone')->nullable()->unique();
            $table->string('avatar')->nullable();

            // Профиль пользователя
            $table->text('bio')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();

            // Адрес по умолчанию
            $table->string('default_address')->nullable();
            $table->decimal('default_latitude', 10, 8)->nullable();
            $table->decimal('default_longitude', 11, 8)->nullable();

            // Настройки уведомлений
            $table->boolean('email_notifications')->default(true);
            $table->boolean('sms_notifications')->default(true);
            $table->boolean('push_notifications')->default(true);

            // Статус и активность
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();

            // Индексы
            $table->index(['email', 'is_active']);
            $table->index(['phone', 'is_active']);
            $table->index('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email', 'is_active']);
            $table->dropIndex(['phone', 'is_active']);
            $table->dropIndex(['last_login_at']);

            $table->dropColumn([
                'phone',
                'avatar',
                'bio',
                'birth_date',
                'gender',
                'default_address',
                'default_latitude',
                'default_longitude',
                'email_notifications',
                'sms_notifications',
                'push_notifications',
                'is_active',
                'last_login_at',
                'last_login_ip',
            ]);
        });
    }
};
