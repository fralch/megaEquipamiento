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
        'imagen_logo',
        'imagen_firma',
        'id_usuario',
        'codigo_cotizacion',
        'contador_cotizacion',
        'anio_cotizacion',
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
     * Accessor para obtener la URL completa del logo
     */
    public function getImagenLogoUrlAttribute()
    {
        if ($this->imagen_logo) {
            return asset($this->imagen_logo);
        }
        return null;
    }

    /**
     * Accessor para obtener la URL completa de la firma
     */
    public function getImagenFirmaUrlAttribute()
    {
        if ($this->imagen_firma) {
            return asset($this->imagen_firma);
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