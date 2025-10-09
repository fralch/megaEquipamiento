<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NuestraEmpresa extends Model
{
    use HasFactory;

    protected $table = 'nuestras_empresas';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nombre',
        'email',
        'telefono',
        'ruc',
        'imagen_destacada',
        'id_usuario',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el modelo Usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Accessor para obtener la URL completa de la imagen destacada
     */
    public function getImagenDestacadaUrlAttribute()
    {
        if ($this->imagen_destacada) {
            return asset('storage/' . $this->imagen_destacada);
        }
        return null;
    }

    /**
     * Scope para buscar empresas por nombre
     */
    public function scopeBuscarPorNombre($query, $nombre)
    {
        return $query->where('nombre', 'like', '%' . $nombre . '%');
    }

    /**
     * Scope para empresas activas (con usuario asignado)
     */
    public function scopeActivas($query)
    {
        return $query->whereNotNull('id_usuario');
    }
}