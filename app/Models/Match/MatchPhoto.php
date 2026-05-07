<?php

namespace App\Models\Match;

use Illuminate\Database\Eloquent\Model;

class MatchPhoto extends Model
{
    protected $table = 'match_photos';
    
    protected $fillable = ['match_user_id', 'url', 'order'];

    protected $casts = [
        'moderated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(MatchUser::class, 'match_user_id');
    }

    public function moderator()
    {
        return $this->belongsTo(MatchAdmin::class, 'moderated_by');
    }
}
