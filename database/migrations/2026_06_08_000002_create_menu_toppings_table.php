<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_toppings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->foreignId('topping_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('max_allowed')->default(1);
            $table->boolean('is_required')->default(false);
            $table->decimal('price_override', 8, 2)->nullable();
            $table->timestamps();
            $table->unique(['menu_id', 'topping_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_toppings');
    }
};
