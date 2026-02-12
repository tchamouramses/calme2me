<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentCreated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public Comment $comment)
    {
    }

    public function broadcastOn(): Channel
    {
        return new Channel('problems.' . $this->comment->problem_id . '.comments');
    }

    public function broadcastAs(): string
    {
        return 'comment.created';
    }
}
