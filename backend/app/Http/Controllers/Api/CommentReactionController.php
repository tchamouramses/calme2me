<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentReaction;
use Illuminate\Http\Request;

class CommentReactionController extends Controller
{
    public function toggle(Request $request, Comment $comment)
    {
        $data = $request->validate([
            'pseudo' => 'required|string|max:32',
            'reaction' => 'required|string|in:like,love,support,care,celebrate',
        ]);

        $existing = CommentReaction::query()
            ->where('comment_id', $comment->id)
            ->where('pseudo', $data['pseudo'])
            ->where('reaction', $data['reaction'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['action' => 'removed']);
        }

        CommentReaction::create([
            'comment_id' => $comment->id,
            'pseudo' => $data['pseudo'],
            'reaction' => $data['reaction'],
        ]);

        return response()->json(['action' => 'added'], 201);
    }
}
