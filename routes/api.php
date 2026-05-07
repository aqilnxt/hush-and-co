<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MenuController;

// ── PUBLIC ROUTES ──
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Public — bisa diakses tanpa login
Route::get('/categories',       [CategoryController::class, 'index']);
Route::get('/menus',            [MenuController::class, 'index']);
Route::get('/menus/{id}',       [MenuController::class, 'show']);

// ── PROTECTED ROUTES ──
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);

    // Admin only — Category
    Route::post('/categories',        [CategoryController::class, 'store']);
    Route::put('/categories/{id}',    [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Admin only — Menu
    Route::post('/menus',              [MenuController::class, 'store']);
    Route::put('/menus/{id}',          [MenuController::class, 'update']);
    Route::delete('/menus/{id}',       [MenuController::class, 'destroy']);
    Route::patch('/menus/{id}/toggle', [MenuController::class, 'toggle']);
});