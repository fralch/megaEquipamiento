<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\CategoriaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// rutas que retornan vistas
Route::get('/', function () { return Inertia::render('Welcome');});
Route::get('/categorias', function () {return Inertia::render('Categoria'); });
Route::get('/producto', function () { return Inertia::render('Product'); });
Route::get('/crear', function () {return Inertia::render('Crear');});


//Rutas para las operaciones CRUD
Route::get('/categorias-con-subcategorias', [CategoriaController::class, 'getCategoriasConSubcategorias']);
Route::get('/categorias-all', [CategoriaController::class, 'getCategorias']);
Route::post('/login', [UsuarioController::class, 'login']);
Route::apiResource('usuarios', UsuarioController::class);


// rutas para crear y mostrar productos
Route::post('/product/create', [ProductoController::class, 'createProduct']);
Route::post('/product/update/{id}', [ProductoController::class, 'updateProduct']);
Route::get('/product/all', [ProductoController::class, 'getProductos']);
Route::get('/product/all-imagen', [ProductoController::class, 'getProductosImagen']);
Route::get('/product/show/{id}', [ProductoController::class, 'showProduct']);
Route::get('/product/image/{id}', [ProductoController::class, 'getImagenProducto']);


// rutas para crear y mostrar subcategorias
Route::post('/subcategoria/create', [SubcategoriaController::class, 'store']);
Route::post('/subcategoria/update/{id}', [SubcategoriaController::class, 'update']);
Route::get('/subcategoria/all', [SubcategoriaController::class, 'getSubcategorias']);
Route::get('/subcategoria/categoria/{id}', [SubcategoriaController::class, 'getSubcategoriasCategoria']);
