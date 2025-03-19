<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\SubcategoriaController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\AuthController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Rutas de autenticación
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Rutas que retornan vistas
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');
Route::get('/categorias/{id_categoria?}', [CategoriaController::class, 'CategoriasWiew'])->name('categorias.view');
Route::get('/subcategoria/{id}', [ProductoController::class, 'subCategoriaView'])->name('subcategoria.view');
Route::get('/producto/{id}', [ProductoController::class, 'ProductView'])->name('producto.view');
Route::get('/crear', function () { return Inertia::render('Crear');})->name('crear.view')->middleware('auth');

// Rutas para crear y mostrar productos
Route::post('/product/create', [ProductoController::class, 'createProduct'])->name('product.create');
Route::post('/product/update', [ProductoController::class, 'updateProduct'])->name('product.update');
Route::get('/product/all', [ProductoController::class, 'getProductos'])->name('product.all');
Route::get('/product/all-imagen', [ProductoController::class, 'getProductosImagen'])->name('product.all-imagen');
Route::get('/product/show/{id}', [ProductoController::class, 'showProduct'])->name('product.show');
Route::get('/product/image/{id}', [ProductoController::class, 'getImagenProducto'])->name('product.image');
Route::get('/product/subcategoria/{id}', [ProductoController::class, 'getProductosSubcategoria'])->name('product.by-subcategoria');

// Rutas para usuarios
Route::apiResource('usuarios', UsuarioController::class);

// Rutas para categorías
Route::get('/categorias-con-subcategorias', [CategoriaController::class, 'getCategoriasConSubcategorias'])->name('categorias.with-subcategorias');
Route::get('/categorias-all', [CategoriaController::class, 'getCategorias'])->name('categorias.all');
Route::get('/categorias-con-subcategorias-con-id', [CategoriaController::class, 'getCategoriasConSubcategoriasConId'])->name('categorias.with-subcategorias-id');
Route::get('/categorias-completa', [CategoriaController::class, 'getCategoriasConSubcategoriasIds'])->name('categorias.complete');
Route::get('/categoria/{id}', [CategoriaController::class, 'getCategoriaById'])->name('categoria.show');

// Rutas para subcategorías
Route::post('/subcategoria_post/create', [SubcategoriaController::class, 'store'])->name('subcategoria.create');
Route::post('/subcategoria_post/update/{id}', [SubcategoriaController::class, 'update'])->name('subcategoria.update');
Route::get('/subcategoria-all', [SubcategoriaController::class, 'getSubcategorias'])->name('subcategoria.all');
Route::get('/subcategoria_get/categoria/{id}', [SubcategoriaController::class, 'getSubcategoriasCategoria'])->name('subcategoria.by-categoria');
Route::get('/subcategoria_id/{id}', [SubcategoriaController::class, 'getSubcategoriaById'])->name('subcategoria.show');
Route::get('/subcategoria_get/cat/{id}', [SubcategoriaController::class, 'getCatBySub'])->name('subcategoria.get-categoria');

// Rutas para marcas
Route::post('/marca/create', [MarcaController::class, 'createMarca'])->name('marca.create');
Route::post('/marca/update/{id}', [MarcaController::class, 'updateMarca'])->name('marca.update');
Route::get('/marca/all', [MarcaController::class, 'getMarcas'])->name('marca.all');
