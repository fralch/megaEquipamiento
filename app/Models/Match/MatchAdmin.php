<?php

namespace App\Models\Match;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class MatchAdmin extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const DEFAULT_NAME = 'Match Admin';

    public const DEFAULT_EMAIL = 'admin@gmail.com';

    public const DEFAULT_PASSWORD = '12345678';

    protected $table = 'match_admins';

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }
}
