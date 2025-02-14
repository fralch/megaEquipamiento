<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\SubcategoriaController;
use App\Http\Controllers\MarcaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// rutas que retornan vistas
Route::get('/', function () { return Inertia::render('Welcome');});
Route::get('/categorias', function () {return Inertia::render('Categoria'); });
Route::get('/subcategorias', function () {return Inertia::render('Subcategorias'); });
Route::get('/producto', function () { return Inertia::render('Product'); });
Route::get('/crear', function () {return Inertia::render('Crear');});




// rutas para crear y mostrar productos
Route::post('/product/create', [ProductoController::class, 'createProduct']);
Route::post('/product/update/{id}', [ProductoController::class, 'updateProduct']);
Route::get('/product/all', [ProductoController::class, 'getProductos']);
Route::get('/product/all-imagen', [ProductoController::class, 'getProductosImagen']);
Route::get('/product/show/{id}', [ProductoController::class, 'showProduct']);
Route::get('/product/image/{id}', [ProductoController::class, 'getImagenProducto']);
Route::get('/subcategoria/{id}', function ($id) {
    return Inertia::render('Subcategoria', ['subcategoriaId' => $id]);
})->name('subcategoria.show');



Route::post('/login', [UsuarioController::class, 'login']);
Route::apiResource('usuarios', UsuarioController::class);
//Rutas para las operaciones Categorias
Route::get('/categorias-con-subcategorias', [CategoriaController::class, 'getCategoriasConSubcategorias']);
Route::get('/categorias-all', [CategoriaController::class, 'getCategorias']);
Route::get('/categorias-con-subcategorias-con-id', [CategoriaController::class, 'getCategoriasConSubcategoriasConId']);
Route::get('/categorias-completa', [CategoriaController::class, 'getCategoriasConSubcategoriasIds']);


// rutas para crear y mostrar subcategorias
Route::post('/subcategoria/create', [SubcategoriaController::class, 'store']);
Route::post('/subcategoria/update/{id}', [SubcategoriaController::class, 'update']);
Route::get('/subcategoria/all', [SubcategoriaController::class, 'getSubcategorias']);
Route::get('/subcategoria/categoria/{id}', [SubcategoriaController::class, 'getSubcategoriasCategoria']);

// rutas para crear y mostrar marcas 
Route::post('/marca/create', [MarcaController::class, 'createMarca']);
Route::post('/marca/update/{id}', [MarcaController::class, 'updateMarca']);
Route::get('/marca/all', [MarcaController::class, 'getMarcas']);
