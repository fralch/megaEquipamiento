<?php

namespace App\Models\Match;

use Illuminate\Database\Eloquent\Model;

class MatchSwipe extends Model
{
    protected $table = 'match_swipes';
    
    protected $fillable = ['swiper_id', 'swiped_id', 'type'];

    public function swiper()
    {
        return $this->belongsTo(MatchUser::class, 'swiper_id');
    }

    public function swiped()
    {
        return $this->belongsTo(MatchUser::class, 'swiped_id');
    }
}
