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
        Schema::create('courier_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Личная информация
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('phone')->unique();
            $table->string('email')->unique();

            // Документы
            $table->string('passport_series')->nullable();
            $table->string('passport_number')->nullable();
            $table->date('passport_issued_date')->nullable();
            $table->string('passport_issued_by')->nullable();

            // Транспорт
            $table->enum('transport_type', ['bicycle', 'scooter', 'motorcycle', 'car', 'walking']);
            $table->string('transport_model')->nullable();
            $table->string('transport_number')->nullable();
            $table->string('transport_color')->nullable();

            // Рабочие данные
            $table->enum('status', ['active', 'inactive', 'suspended', 'pending_verification'])->default('pending_verification');
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('total_deliveries')->default(0);
            $table->decimal('total_earnings', 10, 2)->default(0.00);

            // Рабочие зоны
            $table->json('delivery_zones')->nullable(); // Массив ID зон доставки

            // Расписание работы
            $table->json('work_schedule')->nullable(); // Расписание по дням недели

            // Банковские реквизиты
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('bank_card_number')->nullable();

            // Дополнительная информация
            $table->text('notes')->nullable();
            $table->json('documents')->nullable(); // Пути к загруженным документам

            $table->timestamps();

            // Индексы
            $table->index(['user_id', 'status']);
            $table->index('status');
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_profiles');
    }
};
