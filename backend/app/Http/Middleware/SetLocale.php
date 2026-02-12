<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language', 'fr');

        // Extract language code (e.g., 'fr-FR' -> 'fr')
        $locale = substr($locale, 0, 2);

        // Support only fr and en
        if (!in_array($locale, ['fr', 'en'])) {
            $locale = 'fr';
        }

        // If user is authenticated, use their preferred language
        if ($request->user()) {
            $locale = $request->user()->lang ?? $locale;
        }

        App::setLocale($locale);

        return $next($request);
    }
}
