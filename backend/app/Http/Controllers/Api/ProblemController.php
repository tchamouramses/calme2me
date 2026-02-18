<?php

namespace App\Http\Controllers\Api;

use App\Events\ProblemPublished;
use App\Http\Controllers\Controller;
use App\Models\Problem;
use App\Services\OpenAiModerationService;
use Illuminate\Http\Request;

class ProblemController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        return Problem::query()
            ->with(['reactions'])
            ->withCount('comments')
            ->where('is_public', true)
            ->latest()
            ->paginate($perPage);
    }

    public function show(Request $request, Problem $problem)
    {
        if ($problem->status !== 'published') {
            abort(404);
        }

        $perPage = $request->input('per_page', 10);
        $problem->load(['reactions']);

        $comments = $problem->comments()
            ->with('reactions')
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'problem' => $problem,
            'comments' => $comments,
        ]);
    }

    public function adminIndex()
    {
        return Problem::query()
            ->with(['comments.reactions', 'reactions'])
            ->latest()
            ->get();
    }

    public function store(Request $request, OpenAiModerationService $moderation)
    {
        $data = $request->validate([
            'pseudo' => 'required|string|max:32',
            'body' => 'required|string|max:2000',
            'is_public' => 'boolean',
        ]);

        $moderationResult = $moderation->moderate('CONFESSION', $data['body']);
        if (!$moderationResult['approved']) {
            return response()->json([
                'message' => __('messages.moderation.rejected'),
                'reason' => $moderationResult['reason'],
            ], 422);
        }

        $problem = Problem::create([
            'pseudo' => $data['pseudo'],
            'body' => $data['body'],
            'is_public' => $data['is_public'] ?? true,
            'status' => 'published',
        ]);

        event(new ProblemPublished($problem));

        return response()->json($problem, 201);
    }

    public function updateStatus(Request $request, Problem $problem)
    {
        $data = $request->validate([
            'status' => 'required|in:waiting,published,archived',
        ]);

        $wasPublished = $problem->status === 'published';
        $problem->status = $data['status'];
        $problem->save();

        if (!$wasPublished && $problem->status === 'published') {
            event(new ProblemPublished($problem));
        }

        return response()->json($problem);
    }

    public function destroy(Problem $problem)
    {
        $problem->delete();

        return response()->json(['message' => 'Problem deleted successfully.'], 200);
    }
}
