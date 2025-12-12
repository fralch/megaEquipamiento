<?php

namespace App\Models\Match;

use Illuminate\Database\Eloquent\Model;

class MatchPair extends Model
{
    protected $table = 'match_pairs';
    
    protected $fillable = ['user_1_id', 'user_2_id'];

    public function user1()
    {
        return $this->belongsTo(MatchUser::class, 'user_1_id');
    }

    public function user2()
    {
        return $this->belongsTo(MatchUser::class, 'user_2_id');
    }

    public function messages()
    {
        return $this->hasMany(MatchMessage::class, 'match_pair_id');
    }
}
