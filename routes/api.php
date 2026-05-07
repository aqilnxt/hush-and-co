<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;

// ── PUBLIC ROUTES ──
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

Route::get('/categories',   [CategoryController::class, 'index']);
Route::get('/menus',        [MenuController::class, 'index']);
Route::get('/menus/{id}',   [MenuController::class, 'show']);

// ── PROTECTED ROUTES ──
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);

    // Category (admin)
    Route::post('/categories',        [CategoryController::class, 'store']);
    Route::put('/categories/{id}',    [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Menu (admin)
    Route::post('/menus',              [MenuController::class, 'store']);
    Route::put('/menus/{id}',          [MenuController::class, 'update']);
    Route::delete('/menus/{id}',       [MenuController::class, 'destroy']);
    Route::patch('/menus/{id}/toggle', [MenuController::class, 'toggle']);

    // Orders (customer)
    Route::get('/orders',      [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders',     [OrderController::class, 'store']);

    // Orders (staff & admin)
    Route::get('/staff/orders',                    [OrderController::class, 'staffOrders']);
    Route::patch('/orders/{id}/status',            [OrderController::class, 'updateStatus']);
    Route::patch('/orders/{id}/payment',           [OrderController::class, 'confirmPayment']);
});