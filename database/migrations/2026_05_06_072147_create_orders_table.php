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
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')
              ->constrained('users')
              ->onDelete('cascade');
        $table->foreignId('table_id')
              ->nullable()
              ->constrained('tables')
              ->onDelete('set null');
        $table->enum('order_type', ['dine-in', 'takeaway']);
        $table->string('pickup_name')->nullable();
        $table->enum('status', ['pending', 'diproses', 'selesai', 'dibatalkan'])
              ->default('pending');
        $table->enum('payment_status', ['unpaid', 'paid'])
              ->default('unpaid');
        $table->integer('total_price')->default(0);
        $table->integer('points_used')->default(0);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
