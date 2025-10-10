<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    protected $fillable = [
        'nombre_usuario',
        'contraseña',
        'correo',
        'nombre',
        'apellido',
        'direccion',
        'telefono',
        'id_rol',
        'activo',
        'ultima_conexion',
    ];

    protected $hidden = [
        'contraseña',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'activo' => 'boolean',
        'ultima_conexion' => 'datetime',
    ];

    public function getAuthPassword()
    {
        return $this->contraseña;
    }

    /**
     * Relación con el modelo Rol
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }

    /**
     * Relación con clientes asignados (como vendedor)
     */
    public function clientes()
    {
        return $this->hasMany(Cliente::class, 'usuario_id', 'id_usuario');
    }

    /**
     * Relación con empresas clientes asignadas (como vendedor)
     */
    public function empresasClientes()
    {
        return $this->hasMany(EmpresaCliente::class, 'usuario_id', 'id_usuario');
    }
}
