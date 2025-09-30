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
        'ruc',
        'empresa_id',
        'area_id',
        'sucursal',
        'area',
        'cargo',
        'email',
        'telefono',
        'direccion',
        'usuario_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el modelo EmpresaCliente
     * Un cliente puede pertenecer a una empresa (empleado) o ser particular (null)
     */
    public function empresa()
    {
        return $this->belongsTo(EmpresaCliente::class, 'empresa_id');
    }

    /**
     * Relación con el modelo Usuario (vendedor asignado)
     */
    public function vendedor()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    /**
     * Relación con el modelo Area
     */
    public function areaRelacion()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    /**
     * Scope para clientes particulares (sin empresa)
     */
    public function scopeParticulares($query)
    {
        return $query->whereNull('empresa_id');
    }

    /**
     * Scope para clientes empleados (con empresa)
     */
    public function scopeEmpleados($query)
    {
        return $query->whereNotNull('empresa_id');
    }

    /**
     * Scope para buscar por nombre, email o teléfono
     */
    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('nombrecompleto', 'like', "%{$termino}%")
              ->orWhere('email', 'like', "%{$termino}%")
              ->orWhere('telefono', 'like', "%{$termino}%")
              ->orWhere('ruc', 'like', "%{$termino}%");
        });
    }

    /**
     * Scope para filtrar por vendedor
     */
    public function scopePorVendedor($query, $vendedorId)
    {
        return $query->where('usuario_id', $vendedorId);
    }

    /**
     * Accessor para determinar el tipo de cliente
     */
    public function getTipoClienteAttribute()
    {
        return $this->empresa_id ? 'Empleado' : 'Particular';
    }
}