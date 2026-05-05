<?php

namespace App\Models\Match;

use Illuminate\Database\Eloquent\Model;

class MatchNotification extends Model
{
    protected $table = 'match_notifications';

    protected $fillable = [
        'match_user_id',
        'type',
        'title',
        'content',
        'data',
        'is_read'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(MatchUser::class, 'match_user_id');
    }

    /**
     * Helper to create a notification and maintain only the last 10.
     */
    public static function send($userId, $type, $title, $content, $data = [])
    {
        // 1. Create the new notification
        $notification = self::create([
            'match_user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'data' => $data,
        ]);

        // 2. Circular Logic: Delete oldest if count > 10
        $count = self::where('match_user_id', $userId)->count();
        if ($count > 10) {
            $toDelete = $count - 10;
            self::where('match_user_id', $userId)
                ->orderBy('created_at', 'asc')
                ->limit($toDelete)
                ->delete();
        }

        return $notification;
    }
}
