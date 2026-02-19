<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rejected_messages', function (Blueprint $table) {
            $table->id();
            $table->string('type', 32);
            $table->string('pseudo', 32)->nullable();
            $table->text('body');
            $table->foreignId('problem_id')->nullable()->constrained('problems')->nullOnDelete();
            $table->string('problem_uuid', 36)->nullable();
            $table->text('reason')->nullable();
            $table->string('assistant_decision', 32)->nullable();
            $table->unsignedTinyInteger('toxicity_score')->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->text('ip_encrypted')->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->json('assistant_payload')->nullable();
            $table->timestamps();

            $table->index(['type', 'problem_id']);
            $table->index('problem_uuid');
            $table->index('ip_hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rejected_messages');
    }
};
