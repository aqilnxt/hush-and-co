<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TableController extends Controller
{
    // GET /api/tables
    public function index(Request $request): JsonResponse
    {
        $query = Table::query();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $tables = $query->get();

        return response()->json([
            'data' => $tables
        ]);
    }

    // GET /api/tables/{id}
    public function show(int $id): JsonResponse
    {
        $table = Table::findOrFail($id);

        return response()->json([
            'data' => $table
        ]);
    }

    // GET /api/tables/number/{tableNumber}
    public function findByNumber(string $tableNumber): JsonResponse
    {
        $table = Table::where('table_number', $tableNumber)
                      ->firstOrFail();

        return response()->json([
            'data' => $table
        ]);
    }

    // POST /api/tables
// POST /api/tables
public function store(Request $request): JsonResponse
{
    $request->validate([
        'table_number' => 'required|string|unique:tables,table_number',
        'capacity'     => 'required|integer|min:1',
        'status'       => 'in:available,unavailable',
    ]);

    // Simpan URL saja, QR generate di frontend
    $qrUrl = config('app.url') . '/order?table=' . $request->table_number;

    $table = Table::create([
        'table_number' => $request->table_number,
        'capacity'     => $request->capacity,
        'status'       => $request->status ?? 'available',
        'qr_code'      => $qrUrl,
    ]);

    return response()->json([
        'message' => 'Meja berhasil ditambahkan!',
        'data'    => $table,
    ], 201);
}

    // PUT /api/tables/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $table = Table::findOrFail($id);

        $request->validate([
            'table_number' => 'sometimes|string|unique:tables,table_number,' . $id,
            'capacity'     => 'sometimes|integer|min:1',
            'status'       => 'sometimes|in:available,occupied,reserved,unavailable',
        ]);

        $table->update($request->all());

        return response()->json([
            'message' => 'Meja berhasil diupdate!',
            'data'    => $table,
        ]);
    }

    // DELETE /api/tables/{id}
public function destroy(int $id): JsonResponse
{
    $table = Table::findOrFail($id);
    $table->delete();

    return response()->json([
        'message' => 'Meja berhasil dihapus!',
    ]);
}

// POST /api/tables/{id}/regenerate-qr
public function regenerateQr(int $id): JsonResponse
{
    $table = Table::findOrFail($id);

    $qrUrl = config('app.url') . '/order?table=' . $table->table_number;
    $table->update(['qr_code' => $qrUrl]);

    return response()->json([
        'message' => 'QR Code URL berhasil diupdate!',
        'data'    => $table,
    ]);
}
}