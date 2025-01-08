<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/tienda', function () {
    return Inertia::render('Tienda');
});

Route::get('/product', function () {
    return Inertia::render('Product');
});


// Rutas para las operaciones CRUD
Route::apiResource('usuarios', UsuarioController::class);

// Ruta para el inicio de sesión
Route::post('login', [UsuarioController::class, 'login']);

