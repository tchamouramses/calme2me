<?php

namespace App\Http\Controllers\Api;

use App\Events\CommentCreated;
use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Problem;
use App\Models\RejectedMessage;
use App\Services\OpenAiModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class CommentController extends Controller
{
    public function index(Request $request, Problem $problem)
    {
        $perPage = $request->input('per_page', 10);

        return $problem->comments()
            ->with('reactions')
            ->latest()
            ->paginate($perPage);
    }

    public function store(Request $request, Problem $problem, OpenAiModerationService $moderation)
    {
        $data = $request->validate([
            'pseudo' => 'required|string|max:32',
            'body' => 'required|string|max:2000',
        ]);

        $moderationResult = $moderation->moderate('COMMENTAIRE', $problem->body, $data['body']);
        if (!$moderationResult['approved']) {
            $ip = $request->ip();
            RejectedMessage::create([
                'type' => 'COMMENTAIRE',
                'pseudo' => $data['pseudo'],
                'body' => $data['body'],
                'problem_id' => $problem->id,
                'problem_uuid' => $problem->uuid,
                'reason' => $moderationResult['reason'],
                'assistant_decision' => $moderationResult['decision'] ?? null,
                'toxicity_score' => $moderationResult['toxicity_score'] ?? null,
                'ip_hash' => $ip ? hash('sha256', $ip) : null,
                'ip_encrypted' => $ip ? Crypt::encryptString($ip) : null,
                'user_agent' => $request->userAgent(),
                'assistant_payload' => $moderationResult['assistant_payload'] ?? null,
            ]);

            return response()->json([
                'message' => __('messages.moderation.rejected'),
                'reason' => $moderationResult['reason'],
            ], 422);
        }

        $comment = Comment::create([
            'problem_id' => $problem->id,
            'pseudo' => $data['pseudo'],
            'body' => $data['body'],
        ]);

        event(new CommentCreated($comment));

        return response()->json($comment, 201);
    }
}
