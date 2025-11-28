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
        'contacto_principal',
        'email',
        'telefono',
        'direccion',
        'usuario_id',
        'sector_id',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
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

    /**
     * Relación con los contactos de la empresa
     */
    public function contactos()
    {
        return $this->hasMany(ContactoEmpresa::class, 'empresa_cliente_id');
    }
}
