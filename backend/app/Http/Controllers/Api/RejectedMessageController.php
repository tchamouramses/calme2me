<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RejectedMessage;
use App\Models\SuspendedIp;
use Illuminate\Http\Request;

class RejectedMessageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);

        return RejectedMessage::query()
            ->with('problem')
            ->latest()
            ->paginate($perPage);
    }

    public function suspend(Request $request, RejectedMessage $rejectedMessage)
    {
        $data = $request->validate([
            'duration' => 'required|in:1m,6m,lifetime,custom',
            'months' => 'required_if:duration,custom|integer|min:1|max:60',
            'reason' => 'nullable|string|max:2000',
        ]);

        if (!$rejectedMessage->ip_hash || !$rejectedMessage->ip_encrypted) {
            return response()->json([
                'message' => __('messages.moderation.suspension_unavailable'),
            ], 422);
        }

        $months = null;
        if ($data['duration'] === '1m') {
            $months = 1;
        } elseif ($data['duration'] === '6m') {
            $months = 6;
        } elseif ($data['duration'] === 'custom') {
            $months = (int) $data['months'];
        }

        $suspendedUntil = $months ? now()->addMonths($months) : null;

        $suspension = SuspendedIp::updateOrCreate(
            ['ip_hash' => $rejectedMessage->ip_hash],
            [
                'ip_encrypted' => $rejectedMessage->ip_encrypted,
                'reason' => $data['reason'] ?? $rejectedMessage->reason,
                'suspended_until' => $suspendedUntil,
                'rejected_message_id' => $rejectedMessage->id,
                'created_by' => $request->user()?->id,
            ]
        );

        return response()->json([
            'message' => __('messages.moderation.suspended'),
            'suspension' => $suspension,
        ]);
    }
}
