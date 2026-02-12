<?php

return [
    'default' => env('REVERB_SERVER', 'reverb'),

    'servers' => [
        'reverb' => [
            'host' => env('REVERB_HOST', '0.0.0.0'),
            'port' => env('REVERB_PORT', 8080),
            'hostname' => env('REVERB_HOSTNAME'),
            'pulse_ingest_interval' => env('REVERB_PULSE_INGEST_INTERVAL', 15),
            'telescope_ingest_interval' => env('REVERB_TELESCOPE_INGEST_INTERVAL', 15),
            'options' => [
                'tls' => [],
            ],
            'max_request_size' => env('REVERB_MAX_REQUEST_SIZE', 10000),
            'scaling' => [
                'enabled' => env('REVERB_SCALING_ENABLED', false),
                'channel' => env('REVERB_SCALING_CHANNEL', 'reverb'),
                'redis' => [
                    'connection' => env('REVERB_SCALING_REDIS_CONNECTION', 'default'),
                ],
            ],
            'apps' => [
                [
                    'key' => env('REVERB_APP_KEY'),
                    'secret' => env('REVERB_APP_SECRET'),
                    'app_id' => env('REVERB_APP_ID'),
                    'options' => [
                        'host' => env('REVERB_HOST', '127.0.0.1'),
                        'port' => env('REVERB_PORT', 8080),
                        'scheme' => env('REVERB_SCHEME', 'http'),
                        'useTLS' => env('REVERB_SCHEME', 'http') === 'https',
                    ],
                ],
            ],
        ],
    ],
];
