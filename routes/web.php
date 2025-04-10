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
Route::post('/product/agregar-relacion', [ProductoController::class, 'agregarRelacion'])->name('product.agregar-relacion');
Route::get('/product/relacion/{id}', [ProductoController::class, 'obtenerRelacionados'])->name('product.obtener-relacionados');
Route::post('/productos/buscar', [ProductoController::class, 'buscarPorIniciales'])->name('productos.buscar-iniciales');

// Rutas para usuarios
Route::apiResource('usuarios', UsuarioController::class);

// Rutas para categorías
Route::get('/categorias-con-subcategorias', [CategoriaController::class, 'getCategoriasConSubcategorias'])->name('categorias.with-subcategorias');
Route::get('/categorias-all', [CategoriaController::class, 'getCategorias'])->name('categorias.all');
Route::get('/categorias-con-subcategorias-con-id', [CategoriaController::class, 'getCategoriasConSubcategoriasConId'])->name('categorias.with-subcategorias-id');
Route::get('/categorias-completa', [CategoriaController::class, 'getCategoriasConSubcategoriasIds'])->name('categorias.complete');
Route::get('/categoria/{id}', [CategoriaController::class, 'getCategoriaById'])->name('categoria.show');
Route::post('/categoria/create', [CategoriaController::class, 'store'])->name('categoria.create');
Route::post('/categoria/update/{id}', [CategoriaController::class, 'update'])->name('categoria.update');
Route::delete('/categoria/delete/{id}', [CategoriaController::class, 'destroy'])->name('categoria.delete');

// Rutas para subcategorías
Route::post('/subcategoria_post/create', [SubcategoriaController::class, 'store'])->name('subcategoria.create');
Route::post('/subcategoria_post/update/{subcategoria}', [SubcategoriaController::class, 'update'])->name('subcategoria.update');
Route::delete('/subcategoria_post/delete/{id}', [SubcategoriaController::class, 'destroy'])->name('subcategoria.delete');
Route::get('/subcategoria-all', [SubcategoriaController::class, 'getSubcategorias'])->name('subcategoria.all');
Route::get('/subcategoria_get/categoria/{id}', [SubcategoriaController::class, 'getSubcategoriasCategoria'])->name('subcategoria.by-categoria');
Route::get('/subcategoria_id/{id}', [SubcategoriaController::class, 'getSubcategoriaById'])->name('subcategoria.show');
Route::get('/subcategoria_get/cat/{id}', [SubcategoriaController::class, 'getCatBySub'])->name('subcategoria.get-categoria');

// Rutas para marcas
Route::post('/marca/create', [MarcaController::class, 'create'])->name('marca.create');
Route::post('/marca/update/{id}', [MarcaController::class, 'update'])->name('marca.update');
Route::get('/marca/all', [MarcaController::class, 'getMarcas'])->name('marca.all');
