<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | for your application. These settings determine which origins are allowed
    | to make cross-origin requests to your API. Adjust as needed for dev
    | and production environments.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Allow all origins for development. In production restrict to your domains.
    'allowed_origins' => [env('FRONTEND_URL', '*')],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
