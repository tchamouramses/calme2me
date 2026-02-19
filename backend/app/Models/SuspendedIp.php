<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class SuspendedIp extends Model
{
    protected $fillable = [
        'ip_hash',
        'ip_encrypted',
        'reason',
        'suspended_until',
        'rejected_message_id',
        'created_by',
    ];

    protected $casts = [
        'suspended_until' => 'datetime',
    ];

    protected $hidden = [
        'ip_encrypted',
    ];

    protected $appends = [
        'ip_address',
    ];

    public function rejectedMessage(): BelongsTo
    {
        return $this->belongsTo(RejectedMessage::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getIpAddressAttribute(): ?string
    {
        if (!$this->ip_encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($this->ip_encrypted);
        } catch (\Throwable $exception) {
            return null;
        }
    }
}
