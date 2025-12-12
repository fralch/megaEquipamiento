<?php

namespace App\Models\Match;

use Illuminate\Database\Eloquent\Model;

class MatchPhoto extends Model
{
    protected $table = 'match_photos';
    
    protected $fillable = ['match_user_id', 'url', 'order'];

    public function user()
    {
        return $this->belongsTo(MatchUser::class, 'match_user_id');
    }
}
