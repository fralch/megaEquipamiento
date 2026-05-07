<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_photos', function (Blueprint $table) {
            $table->string('status')->default('pending')->index();
            $table->timestamp('moderated_at')->nullable();
            $table->string('moderation_reason')->nullable();
            $table->foreignId('moderated_by')->nullable()->constrained('match_admins')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('match_photos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('moderated_by');
            $table->dropIndex(['status']);
            $table->dropColumn([
                'status',
                'moderated_at',
                'moderation_reason',
            ]);
        });
    }
};
