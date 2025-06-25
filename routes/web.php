<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\SubcategoriaController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\FiltroController;
use App\Http\Controllers\TiposRelacionProductosController;
use App\Http\Controllers\MarcaCategoriaController;
use App\Http\Controllers\AuthController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Rutas de autenticación
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/carrito',function () { return Inertia::render('Carrito');})->name('carrito.view');


// Rutas que retornan vistas
Route::get('/', function () { return Inertia::render('Welcome'); })->name('welcome');
Route::get('/categorias/{id_categoria?}', [CategoriaController::class, 'CategoriasWiew'])->name('categorias.view');
Route::get('/subcategoria/{id}/{marca_id?}', [ProductoController::class, 'subCategoriaView'])->name('subcategoria.view');
Route::get('/producto/{id}', [ProductoController::class, 'ProductView'])->name('producto.view');
Route::get('/marcas/{id}', [ProductoController::class, 'ProductViewByMarca'])->name('marcas.view');
Route::get('/crear', function () { return Inertia::render('Crear');})->name('crear.view')->middleware('auth');

// Rutas para crear y mostrar productos
Route::get('/product/todo', [ProductoController::class, 'getProductosAll']);
Route::post('/product/create', [ProductoController::class, 'createProduct'])->name('product.create');
Route::delete('/product/delete/{id_producto}', [ProductoController::class, 'deleteProduct'])->name('product.delete')->middleware('auth');
Route::post('/product/update', [ProductoController::class, 'updateProduct'])->name('product.update');
Route::get('/product/all', [ProductoController::class, 'getProductos'])->name('product.all');
Route::get('/product/all-imagen', [ProductoController::class, 'getProductosImagen'])->name('product.all-imagen');
Route::get('/product/show/{id}', [ProductoController::class, 'showProduct'])->name('product.show');
Route::get('/product/image/{id}', [ProductoController::class, 'getImagenProducto'])->name('product.image');
Route::get('/product/subcategoria/{id}', [ProductoController::class, 'getProductosSubcategoria'])->name('product.by-subcategoria');
Route::post('/productos/buscar', [ProductoController::class, 'buscarPorIniciales'])->name('productos.buscar-iniciales');
Route::post('/productos/actualizar-imagen', [ProductoController::class, 'updateProductImage']);
Route::post('/productos/actualizar-categoria', [ProductoController::class, 'updateProductCategory'])->name('productos.actualizar-categoria');
Route::get('/productos/productos-marca/{marca_id}', [ProductoController::class, 'getProductosByMarca'])->name('productos.by-marca');
// Rutas para relaciones de productos
Route::post('/product/agregar-relacion', [ProductoController::class, 'agregarRelacion'])->name('product.agregar-relacion');
Route::get('/product/relacion/{id}', [ProductoController::class, 'obtenerRelacionados'])->name('product.obtener-relacionados');
Route::get('/product/con-relacion/{id}', [ProductoController::class, 'obtenerProductosQueRelacionan'])->name('product.obtener-productos-que-relacionan');
Route::post('/product/eliminar-relacion', [ProductoController::class, 'eliminarRelacion'])->name('product.eliminar-relacion');

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
Route::get('/categoria/{id}/subcategorias', [CategoriaController::class, 'getSubcategorias'])->name('categoria.subcategorias');

// Rutas para subcategorías
Route::post('/subcategoria_post/create', [SubcategoriaController::class, 'store'])->name('subcategoria.create');
Route::post('/subcategoria_post/update/{subcategoria}', [SubcategoriaController::class, 'update'])->name('subcategoria.update');
Route::delete('/subcategoria_post/delete/{id}', [SubcategoriaController::class, 'destroy'])->name('subcategoria.delete');
Route::get('/subcategoria-all', [SubcategoriaController::class, 'getSubcategorias'])->name('subcategoria.all');
Route::get('/subcategoria_get/categoria/{id}', [SubcategoriaController::class, 'getSubcategoriasCategoria'])->name('subcategoria.by-categoria');
Route::get('/subcategoria_id/{id}', [SubcategoriaController::class, 'getSubcategoriaById'])->name('subcategoria.show');
Route::get('/subcategoria_get/cat/{id}', [SubcategoriaController::class, 'getCatBySub'])->name('subcategoria.get-categoria');
Route::get('/catsub_optimizadas/{marca_id?}', [SubcategoriaController::class, 'getCategoriasOptimizadasPorMarca'])->name('categorias.optimizadas-por-marca');
Route::post('/subcategoria/delete/{id}', [SubcategoriaController::class, 'destroy'])->name('subcategoria.delete');

// Rutas para marcas
Route::post('/marca/create', [MarcaController::class, 'create'])->name('marca.create');
Route::post('/marca/update/{id}', [MarcaController::class, 'update'])->name('marca.update');
Route::get('/marca/all', [MarcaController::class, 'getMarcas'])->name('marca.all');
Route::post('/marca/delete/{id}', [MarcaController::class, 'destroy'])->name('marca.delete');
Route::post('/marca/buscar', [MarcaController::class, 'buscarPorNombre'])->name('marca.buscar');

// Rutas para filtros
Route::prefix('filtros')->group(function () {
    // Rutas específicas primero
    Route::get('/subcategoria/{subcategoriaId}', [FiltroController::class, 'getBySubcategoria'])->name('filtros.by-subcategoria');
    Route::put('/opcion/{id}', [FiltroController::class, 'updateOpcion'])->name('filtros.update-opcion');
    Route::delete('/opcion/{id}', [FiltroController::class, 'deleteOpcion'])->name('filtros.delete-opcion');
    Route::post('/filtrar-productos', [FiltroController::class, 'filtrarProductos'])->name('filtros.filtrar-productos');
    
    // Rutas generales después
    Route::get('/', [FiltroController::class, 'index'])->name('filtros.index');
    Route::post('/', [FiltroController::class, 'store'])->name('filtros.store');
    Route::get('/{id}', [FiltroController::class, 'show'])->name('filtros.show');
    Route::put('/{id}', [FiltroController::class, 'update'])->name('filtros.update');
    Route::delete('/{id}', [FiltroController::class, 'destroy'])->name('filtros.delete');
});

// Rutas para tipos de relación de productos
Route::get('/tipos-relacion-productos', [TiposRelacionProductosController::class, 'get_all'])->name('tipos-relacion-productos.all');
Route::post('/tipos-relacion-productos', [TiposRelacionProductosController::class, 'store'])->name('tipos-relacion-productos.store');

// Rutas para relación marca-categoría
Route::post('/marca-categoria/create', [MarcaCategoriaController::class, 'store'])->name('marca-categoria.create');

