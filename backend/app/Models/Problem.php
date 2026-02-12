<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Problem extends Model
{
    protected $fillable = [
        'uuid',
        'pseudo',
        'body',
        'status',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(ProblemReaction::class);
    }

    protected static function booted(): void
    {
        static::creating(function (Problem $problem) {
            if (!$problem->uuid) {
                $problem->uuid = (string) Str::uuid();
            }
        });
    }
}
