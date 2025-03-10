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

// Rutas que retornan vistas
Route::get('/', function () {
    return Inertia::render('Welcome');
});
Route::get('/categorias/{id_categoria?}', [CategoriaController::class, 'CategoriasWiew']);
Route::get('/subcategoria/{id}', [ProductoController::class, 'subCategoriaView']);
Route::get('/producto/{id}', [ProductoController::class, 'ProductView']);
Route::get('/crear', function () { return Inertia::render('Crear');});

// Rutas para crear y mostrar productos
Route::post('/product/create', [ProductoController::class, 'createProduct']);
Route::post('/product/update/{id}', [ProductoController::class, 'updateProduct']);
Route::get('/product/all', [ProductoController::class, 'getProductos']);
Route::get('/product/all-imagen', [ProductoController::class, 'getProductosImagen']);
Route::get('/product/show/{id}', [ProductoController::class, 'showProduct']);
Route::get('/product/image/{id}', [ProductoController::class, 'getImagenProducto']);
Route::get('/product/subcategoria/{id}', [ProductoController::class, 'getProductosSubcategoria']);

// Rutas para usuarios
Route::post('/login', [UsuarioController::class, 'login']);
Route::apiResource('usuarios', UsuarioController::class);

// Rutas para categorías
Route::get('/categorias-con-subcategorias', [CategoriaController::class, 'getCategoriasConSubcategorias']);
Route::get('/categorias-all', [CategoriaController::class, 'getCategorias']);
Route::get('/categorias-con-subcategorias-con-id', [CategoriaController::class, 'getCategoriasConSubcategoriasConId']);
Route::get('/categorias-completa', [CategoriaController::class, 'getCategoriasConSubcategoriasIds']);
Route::get('/categoria/{id}', [CategoriaController::class, 'getCategoriaById']);

// Rutas para subcategorías
Route::post('/subcategoria_post/create', [SubcategoriaController::class, 'store']);
Route::post('/subcategoria_post/update/{id}', [SubcategoriaController::class, 'update']);
Route::get('/subcategoria-all', [SubcategoriaController::class, 'getSubcategorias']);
Route::get('/subcategoria_get/categoria/{id}', [SubcategoriaController::class, 'getSubcategoriasCategoria']);
Route::get('/subcategoria_id/{id}', [SubcategoriaController::class, 'getSubcategoriaById']);
Route::get('/subcategoria_get/cat/{id}', [SubcategoriaController::class, 'getCatBySub']);

// Rutas para marcas
Route::post('/marca/create', [MarcaController::class, 'createMarca']);
Route::post('/marca/update/{id}', [MarcaController::class, 'updateMarca']);
Route::get('/marca/all', [MarcaController::class, 'getMarcas']);
