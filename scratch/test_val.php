<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\Validator;

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$rules = [
    'order_type'  => 'required|in:dine-in,takeaway',
    'table_id'    => 'required_if:order_type,dine-in|nullable|exists:tables,id',
    'pickup_name' => 'required_if:order_type,takeaway|nullable|string|max:255',
];

// Test case 1: order_type is dine-in, pickup_name is missing (absent)
$validator1 = Validator::make([
    'order_type' => 'dine-in',
    'table_id' => 1,
], $rules);
echo "1. Dine-in, pickup_name absent errors:\n";
print_r($validator1->errors()->toArray());

// Test case 2: order_type is dine-in, pickup_name is empty string ""
$validator2 = Validator::make([
    'order_type' => 'dine-in',
    'table_id' => 1,
    'pickup_name' => '',
], $rules);
echo "\n2. Dine-in, pickup_name empty string errors:\n";
print_r($validator2->errors()->toArray());

// Test case 3: order_type is takeaway, pickup_name is empty string ""
$validator3 = Validator::make([
    'order_type' => 'takeaway',
    'table_id' => null,
    'pickup_name' => '',
], $rules);
echo "\n3. Takeaway, pickup_name empty string errors:\n";
print_r($validator3->errors()->toArray());

// Test case 4: order_type is takeaway, pickup_name is absent
$validator4 = Validator::make([
    'order_type' => 'takeaway',
    'table_id' => null,
], $rules);
echo "\n4. Takeaway, pickup_name absent errors:\n";
print_r($validator4->errors()->toArray());
