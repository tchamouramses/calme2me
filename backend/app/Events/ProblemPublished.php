<?php

namespace App\Events;

use App\Models\Problem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProblemPublished implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public Problem $problem)
    {
    }

    public function broadcastOn(): Channel
    {
        return new Channel('problems');
    }

    public function broadcastAs(): string
    {
        return 'problem.published';
    }
}
