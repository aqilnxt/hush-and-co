<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\GalleryItemController;

// ── PUBLIC ROUTES ──
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

Route::get('/categories',              [CategoryController::class, 'index']);
Route::get('/menus',                   [MenuController::class, 'index']);
Route::get('/menus/{id}',              [MenuController::class, 'show']);
Route::get('/tables',                  [TableController::class, 'index']);
Route::get('/tables/number/{number}',  [TableController::class, 'findByNumber']);
Route::get('/tables/{id}',             [TableController::class, 'show']);
Route::post('/orders',                 [OrderController::class, 'store']);
Route::get('/gallery',                 [GalleryItemController::class, 'index']);

// ── PROTECTED ROUTES ──
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'update']);

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
    Route::get('/points/history', [OrderController::class, 'pointHistory']);

    // Orders (staff & admin)
    Route::get('/staff/orders',             [OrderController::class, 'staffOrders']);
    Route::patch('/orders/{id}/status',     [OrderController::class, 'updateStatus']);
    Route::patch('/orders/{id}/payment',    [OrderController::class, 'confirmPayment']);

    // Tables (admin)
    Route::post('/tables',                    [TableController::class, 'store']);
    Route::put('/tables/{id}',                [TableController::class, 'update']);
    Route::delete('/tables/{id}',             [TableController::class, 'destroy']);
    Route::post('/tables/{id}/regenerate-qr', [TableController::class, 'regenerateQr']);

    // Dashboard & Report (admin)
    Route::get('/admin/dashboard',           [DashboardController::class, 'index']);
    Route::get('/admin/report',              [ReportController::class, 'index']);
    Route::get('/admin/report/export-pdf',   [ReportController::class, 'exportPdf']);
    Route::get('/admin/report/export-excel', [ReportController::class, 'exportExcel']);

    // User management (admin)
    Route::get('/admin/users',        [UserController::class, 'index']);
    Route::post('/admin/users',       [UserController::class, 'store']);
    Route::put('/admin/users/{id}',   [UserController::class, 'update']);

    // Gallery (admin)
    Route::middleware('admin')->group(function () {
        Route::get('/admin/gallery',         [GalleryItemController::class, 'adminIndex']);
        Route::post('/admin/gallery',        [GalleryItemController::class, 'store']);
        Route::put('/admin/gallery/{id}',    [GalleryItemController::class, 'update']);
        Route::delete('/admin/gallery/{id}', [GalleryItemController::class, 'destroy']);
    });
});
