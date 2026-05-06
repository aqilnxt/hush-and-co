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
    Schema::create('tables', function (Blueprint $table) {
        $table->id();
        $table->string('table_number')->unique();
        $table->string('qr_code')->nullable();
        $table->enum('status', ['available', 'occupied', 'reserved', 'unavailable'])
              ->default('available');
        $table->integer('capacity')->default(2);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
