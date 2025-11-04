<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $table = 'clientes';

    protected $fillable = [
        'nombrecompleto',
        'ruc_dni',
        'cargo',
        'email',
        'telefono',
        'direccion',
        'usuario_id',
        'sector_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el modelo Usuario (vendedor asignado)
     */
    public function vendedor()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    /**
     * Relación con el modelo Sector
     */
    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id', 'id_sector');
    }
}
