<?php

use App\Http\Controllers\ProfileController;
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


