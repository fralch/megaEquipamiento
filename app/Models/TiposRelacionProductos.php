<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TiposRelacionProductos extends Model
{
     // Definir los atributos que se pueden asignar masivamente
     protected $fillable = ['nombre', 'descripcion'];

     // Opcional: Definir las reglas de validación para los atributos
     public static function rules()
     {
         return [
             'nombre' => 'required|string|max:255',
             'descripcion' => 'nullable|string',
         ];
     }
}
