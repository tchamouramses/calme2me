<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RejectedMessage extends Model
{
    protected $fillable = [
        'type',
        'pseudo',
        'body',
        'problem_id',
        'problem_uuid',
        'reason',
        'assistant_decision',
        'toxicity_score',
        'ip_address',
        'user_agent',
        'assistant_payload',
    ];

    protected $casts = [
        'assistant_payload' => 'array',
        'toxicity_score' => 'integer',
    ];

    public function problem(): BelongsTo
    {
        return $this->belongsTo(Problem::class);
    }
}
