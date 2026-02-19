<?php

namespace App\Http\Middleware;

use App\Models\SuspendedIp;
use Closure;
use Illuminate\Http\Request;

class CheckSuspendedIp
{
    public function handle(Request $request, Closure $next)
    {
        $ip = $request->ip();
        if (!$ip) {
            return $next($request);
        }

        $ipHash = hash('sha256', $ip);

        $suspension = SuspendedIp::query()
            ->where('ip_hash', $ipHash)
            ->where(function ($query) {
                $query->whereNull('suspended_until')
                    ->orWhere('suspended_until', '>', now());
            })
            ->first();

        if ($suspension) {
            return response()->json([
                'message' => __('messages.moderation.suspended'),
            ], 403);
        }

        return $next($request);
    }
}
