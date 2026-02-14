<?php

namespace App\Events;

use App\Models\Problem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProblemPublished implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public $connection = 'sync';
    public $queue = 'broadcasts';
    public $tries = 3;
    public $timeout = 30;

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
