<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use OpenAI;

class OpenAiServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(\OpenAI\Client::class, function ($app) {
            $apiKey = config('services.openai.api_key');

            if (empty($apiKey)) {
                throw new \RuntimeException('OpenAI API key is not configured');
            }

            return OpenAI::client($apiKey);
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
