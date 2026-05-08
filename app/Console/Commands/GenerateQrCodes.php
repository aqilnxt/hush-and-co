<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Table;

class GenerateQrCodes extends Command
{
    protected $signature   = 'qr:generate';
    protected $description = 'Generate QR Code URL untuk semua meja';

    public function handle(): void
    {
        $tables = Table::all();

        foreach ($tables as $table) {
            $qrUrl = config('app.url') . '/order?table=' . $table->table_number;
            $table->update(['qr_code' => $qrUrl]);
            $this->info("✓ QR URL saved: Meja {$table->table_number} → {$qrUrl}");
        }

        $this->info('Semua QR Code URL berhasil disimpan!');
    }
}