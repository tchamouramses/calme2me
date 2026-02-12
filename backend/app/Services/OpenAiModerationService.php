<?php

namespace App\Services;

use OpenAI\Client;

class OpenAiModerationService
{
    public function __construct(private Client $client)
    {
    }

    public function moderate(string $text): array
    {
        $assistantId = config('services.openai.assistant_id');
        if (!$assistantId) {
            return [
                'approved' => false,
                'reason' => __('messages.moderation.unavailable'),
            ];
        }

        $thread = $this->client->threads()->create([]);
        $this->client->threads()->messages()->create($thread->id, [
            'role' => 'user',
            'content' => $text,
        ]);

        $run = $this->client->threads()->runs()->create($thread->id, [
            'assistant_id' => $assistantId,
        ]);

        $run = $this->pollRun($thread->id, $run->id);
        if ($run['status'] !== 'completed') {
            return [
                'approved' => false,
                'reason' => __('messages.moderation.failed'),
            ];
        }

        $content = $this->latestAssistantMessage($thread->id);
        if ($content === null) {
            return [
                'approved' => false,
                'reason' => __('messages.moderation.failed'),
            ];
        }

        $payload = json_decode($content, true);
        if (!is_array($payload) || !array_key_exists('approved', $payload)) {
            return [
                'approved' => false,
                'reason' => __('messages.moderation.failed'),
            ];
        }

        return [
            'approved' => (bool) $payload['approved'],
            'reason' => (string) ($payload['reason'] ?? ''),
        ];
    }

    private function pollRun(string $threadId, string $runId): array
    {
        $maxAttempts = 12;
        $attempt = 0;
        $run = $this->client->threads()->runs()->retrieve($threadId, $runId);

        while (in_array($run->status, ['queued', 'in_progress'], true) && $attempt < $maxAttempts) {
            sleep(1);
            $attempt++;
            $run = $this->client->threads()->runs()->retrieve($threadId, $runId);
        }

        return [
            'status' => $run->status,
        ];
    }

    private function latestAssistantMessage(string $threadId): ?string
    {
        $messages = $this->client->threads()->messages()->list($threadId, [
            'limit' => 10,
        ]);

        foreach ($messages->data as $message) {
            if ($message->role !== 'assistant' || empty($message->content)) {
                continue;
            }

            $chunk = $message->content[0] ?? null;
            if (!$chunk || !isset($chunk->text->value)) {
                continue;
            }

            return trim($chunk->text->value);
        }

        return null;
    }
}
