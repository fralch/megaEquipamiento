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
    ];

    protected $hidden = [
        'contraseña',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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
}
