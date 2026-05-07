<?php

namespace App\Models\Match;

use Illuminate\Database\Eloquent\Model;

class MatchSetting extends Model
{
    protected $table = 'match_settings';

    protected $fillable = [
        'discovery_default_radius_km',
        'daily_swipe_limit',
        'maintenance_mode',
    ];

    protected $casts = [
        'discovery_default_radius_km' => 'integer',
        'daily_swipe_limit' => 'integer',
        'maintenance_mode' => 'boolean',
    ];

    public static function current(): self
    {
        return self::query()->firstOrCreate([], [
            'discovery_default_radius_km' => 50,
            'daily_swipe_limit' => 100,
            'maintenance_mode' => false,
        ]);
    }
}
