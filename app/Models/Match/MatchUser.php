<?php

namespace App\Models\Match;

use Illuminate\Database\Eloquent\Model;

class MatchUser extends Model
{
    protected $table = 'match_users';
    
    protected $fillable = [
        'name', 'age', 'gender', 'description', 
        'interested_in', 'instagram', 'whatsapp'
    ];

    public function photos()
    {
        return $this->hasMany(MatchPhoto::class)->orderBy('order');
    }

    public function swipes_made()
    {
        return $this->hasMany(MatchSwipe::class, 'swiper_id');
    }

    public function swipes_received()
    {
        return $this->hasMany(MatchSwipe::class, 'swiped_id');
    }

    public function matches()
    {
        return MatchPair::where('user_1_id', $this->id)
            ->orWhere('user_2_id', $this->id)
            ->get();
    }
}
