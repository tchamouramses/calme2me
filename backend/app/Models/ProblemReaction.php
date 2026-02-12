<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProblemReaction extends Model
{
    protected $fillable = [
        'problem_id',
        'pseudo',
        'reaction',
    ];

    public function problem(): BelongsTo
    {
        return $this->belongsTo(Problem::class);
    }
}
