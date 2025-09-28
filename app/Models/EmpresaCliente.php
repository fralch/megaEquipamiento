<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmpresaCliente extends Model
{
    use HasFactory;

    protected $table = 'empresasclientes';

    protected $fillable = [
        'razon_social',
        'ruc',
        'sector',
        'contacto_principal',
        'email',
        'telefono',
        'direccion',
        'usuario_id',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el modelo Usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    /**
     * Scope para empresas activas
     */
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para filtrar por sector
     */
    public function scopePorSector($query, $sector)
    {
        return $query->where('sector', $sector);
    }

    /**
     * Accessor para obtener el estado en texto
     */
    public function getEstadoAttribute()
    {
        return $this->activo ? 'Activo' : 'Inactivo';
    }
}