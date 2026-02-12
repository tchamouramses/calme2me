<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('problem_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('problem_id')->constrained('problems')->cascadeOnDelete();
            $table->string('pseudo', 32);
            $table->string('reaction', 20); // like, love, support, care, etc.
            $table->timestamps();

            $table->unique(['problem_id', 'pseudo', 'reaction']);
        });

        Schema::create('comment_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')->constrained('comments')->cascadeOnDelete();
            $table->string('pseudo', 32);
            $table->string('reaction', 20);
            $table->timestamps();

            $table->unique(['comment_id', 'pseudo', 'reaction']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_reactions');
        Schema::dropIfExists('problem_reactions');
    }
};
