<?php

namespace App\Models\Match;

use Illuminate\Database\Eloquent\Model;

class MatchMessage extends Model
{
    protected $table = 'match_messages';
    
    protected $fillable = ['match_pair_id', 'sender_id', 'content', 'is_read'];

    public function pair()
    {
        return $this->belongsTo(MatchPair::class, 'match_pair_id');
    }
    
    public function sender()
    {
        return $this->belongsTo(MatchUser::class, 'sender_id');
    }
}
