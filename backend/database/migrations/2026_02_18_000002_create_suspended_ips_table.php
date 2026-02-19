<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suspended_ips', function (Blueprint $table) {
            $table->id();
            $table->string('ip_hash', 64)->unique();
            $table->text('ip_encrypted');
            $table->text('reason')->nullable();
            $table->timestamp('suspended_until')->nullable();
            $table->foreignId('rejected_message_id')->nullable()->constrained('rejected_messages')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('suspended_until');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suspended_ips');
    }
};
