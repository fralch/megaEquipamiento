<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $table = 'areas';

    protected $fillable = [
        'nombre',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con clientes que tienen esta área
     */
    public function clientes()
    {
        return $this->hasMany(Cliente::class, 'area_id');
    }

    /**
     * Scope para áreas activas
     */
    public function scopeActivas($query)
    {
        return $query->where('estado', 'Activo');
    }

    /**
     * Scope para áreas inactivas
     */
    public function scopeInactivas($query)
    {
        return $query->where('estado', 'Inactivo');
    }

    /**
     * Scope para buscar por nombre o descripción
     */
    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('nombre', 'like', "%{$termino}%")
              ->orWhere('descripcion', 'like', "%{$termino}%");
        });
    }
}
