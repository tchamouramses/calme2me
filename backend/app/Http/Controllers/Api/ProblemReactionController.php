<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Problem;
use App\Models\ProblemReaction;
use Illuminate\Http\Request;

class ProblemReactionController extends Controller
{
    public function toggle(Request $request, Problem $problem)
    {
        $data = $request->validate([
            'pseudo' => 'required|string|max:32',
            'reaction' => 'required|string|in:like,love,support,care,celebrate',
        ]);

        $existing = ProblemReaction::query()
            ->where('problem_id', $problem->id)
            ->where('pseudo', $data['pseudo'])
            ->where('reaction', $data['reaction'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['action' => 'removed']);
        }

        ProblemReaction::create([
            'problem_id' => $problem->id,
            'pseudo' => $data['pseudo'],
            'reaction' => $data['reaction'],
        ]);

        return response()->json(['action' => 'added'], 201);
    }
}
