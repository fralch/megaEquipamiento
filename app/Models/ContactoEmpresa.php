<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactoEmpresa extends Model
{
    protected $fillable = [
        'empresa_cliente_id',
        'nombre',
        'email',
        'telefono',
        'cargo',
        'es_principal'
    ];

    protected $casts = [
        'es_principal' => 'boolean',
    ];

    public function empresa()
    {
        return $this->belongsTo(EmpresaCliente::class, 'empresa_cliente_id');
    }
}
