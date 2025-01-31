<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\CategoriaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/categorias', function () {
    return Inertia::render('Categoria');
});

Route::get('/producto', function () {
    return Inertia::render('Product');
});


Route::get('/categorias-con-subcategorias', [CategoriaController::class, 'getCategoriasConSubcategorias']);

Route::get('/categorias-all', [CategoriaController::class, 'getCategorias']);


// Rutas para las operaciones CRUD
Route::apiResource('usuarios', UsuarioController::class);

// Ruta para el inicio de sesión
Route::post('login', [UsuarioController::class, 'login']);

// Ruta para la vista de crear producto
Route::get('/crear', function () {
    return Inertia::render('Crear');
});
