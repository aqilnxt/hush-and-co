<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Penjualan — Hush & Co.</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #0E1A2E; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #1B2A4A; padding-bottom: 12px; }
    .header h1 { font-size: 20px; color: #1B2A4A; margin: 0; }
    .header p  { color: #6B7B95; margin: 4px 0 0; }
    .summary   { display: flex; gap: 20px; margin-bottom: 20px; }
    .sum-box   { background: #E8EEF7; padding: 10px 16px; border-radius: 6px; flex: 1; }
    .sum-box p { margin: 0; }
    .sum-label { font-size: 10px; color: #6B7B95; text-transform: uppercase; }
    .sum-val   { font-size: 16px; font-weight: bold; color: #1B2A4A; }
    table      { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th         { background: #1B2A4A; color: #F5EFE0; padding: 8px 10px; text-align: left; font-size: 11px; }
    td         { padding: 7px 10px; border-bottom: 1px solid #E8E0D0; font-size: 11px; }
    tr:nth-child(even) td { background: #FDFAF5; }
    .footer    { margin-top: 24px; text-align: center; font-size: 10px; color: #6B7B95; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Hush & Co. — Laporan Penjualan</h1>
    <p>Periode: {{ $summary['start_date'] }} — {{ $summary['end_date'] }}</p>
  </div>

  <table style="width:100%;margin-bottom:16px;border-collapse:collapse;">
    <tr>
      <td style="padding:8px;background:#E8EEF7;border-radius:4px;">
        <div style="font-size:10px;color:#6B7B95;">Total Order</div>
        <div style="font-size:18px;font-weight:bold;color:#1B2A4A;">{{ $summary['total_orders'] }}</div>
      </td>
      <td style="width:12px;"></td>
      <td style="padding:8px;background:#E8EEF7;border-radius:4px;">
        <div style="font-size:10px;color:#6B7B95;">Total Pendapatan</div>
        <div style="font-size:18px;font-weight:bold;color:#1B2A4A;">Rp {{ number_format($summary['total_revenue'],0,',','.') }}</div>
      </td>
    </tr>
  </table>

  <table>
    <thead>
      <tr>
        <th>No</th>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Tipe</th>
        <th>Total</th>
        <th>Tanggal</th>
      </tr>
    </thead>
    <tbody>
      @foreach($orders as $i => $order)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td>#HSH-{{ str_pad($order->id, 4, '0', STR_PAD_LEFT) }}</td>
        <td>{{ $order->user->name }}</td>
        <td>{{ $order->order_type }}</td>
        <td>Rp {{ number_format($order->total_price,0,',','.') }}</td>
        <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <div class="footer">
    Digenerate oleh sistem Hush & Co. pada {{ now()->format('d M Y H:i') }}
  </div>
</body>
</html>