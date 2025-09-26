<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $table = 'roles';
    protected $primaryKey = 'id_rol';

    protected $fillable = [
        'nombre_rol',
        'descripcion',
    ];

    /**
     * Relación con usuarios
     */
    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'id_rol', 'id_rol');
    }
}