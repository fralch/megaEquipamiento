<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sector extends Model
{
    use HasFactory;

    protected $table = 'sectores';
    protected $primaryKey = 'id_sector';

    protected $fillable = [
        'nombre',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con clientes particulares
     */
    public function clientes()
    {
        return $this->hasMany(Cliente::class, 'sector_id', 'id_sector');
    }

    /**
     * Relación con empresas clientes
     */
    public function empresasClientes()
    {
        return $this->hasMany(EmpresaCliente::class, 'sector_id', 'id_sector');
    }
}
