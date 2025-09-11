<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $table = 'tags';
    protected $primaryKey = 'id_tag';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'slug',
        'descripcion',
        'color',
        'id_tag_parent',
    ];

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'producto_tag', 'id_tag', 'id_producto')->withTimestamps();
    }

    public function tagParent()
    {
        return $this->belongsTo(TagParent::class, 'id_tag_parent', 'id_tag_parent');
    }

    public function hasParent()
    {
        return !is_null($this->id_tag_parent);
    }

    public function scopeWithParent($query)
    {
        return $query->whereNotNull('id_tag_parent');
    }

    public function scopeWithoutParent($query)
    {
        return $query->whereNull('id_tag_parent');
    }
}

