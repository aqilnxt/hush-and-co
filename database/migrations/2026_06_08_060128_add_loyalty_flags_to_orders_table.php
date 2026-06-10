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
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('free_drink_claimed')->default(false)->after('points_used');
            $table->boolean('birthday_drink_claimed')->default(false)->after('free_drink_claimed');
            $table->integer('points_multiplier')->default(1)->after('birthday_drink_claimed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['free_drink_claimed', 'birthday_drink_claimed', 'points_multiplier']);
        });
    }
};
