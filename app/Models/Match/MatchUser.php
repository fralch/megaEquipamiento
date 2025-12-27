<?php

namespace App\Models\Match;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class MatchUser extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'match_users';
    
    protected $fillable = [
        'name', 'email', 'password', 'age', 'gender', 'description', 
        'interested_in', 'instagram', 'whatsapp'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function photos()
    {
        return $this->hasMany(MatchPhoto::class, 'match_user_id')->orderBy('order');
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
