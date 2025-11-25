<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductoExterno extends Model
{
    use HasFactory;

    protected $table = 'productos_externos';
    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'heading',
        'paragraphs',
        'tables',
        'images',
    ];

    protected $casts = [
        'heading' => 'array',
        'paragraphs' => 'array',
        'tables' => 'array',
        'images' => 'array',
        'created_at' => 'datetime:Y-m-d\TH:i:sP',
        'updated_at' => 'datetime:Y-m-d\TH:i:sP',
    ];
}
