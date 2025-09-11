<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TagParent extends Model
{
    use HasFactory;

    protected $table = 'tag_parents';
    protected $primaryKey = 'id_tag_parent';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'slug',
        'descripcion',
        'color',
        'imagen',
    ];

    public function tags()
    {
        return $this->hasMany(Tag::class, 'id_tag_parent', 'id_tag_parent');
    }

    public function productos()
    {
        return $this->hasManyThrough(
            Producto::class,
            Tag::class,
            'id_tag_parent', // Foreign key on tags table
            'id_producto',   // Foreign key on producto_tag table (through pivot)
            'id_tag_parent', // Local key on tag_parents table
            'id_tag'         // Local key on tags table
        );
    }
}