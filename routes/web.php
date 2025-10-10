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
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\BancoImagenesController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TagParentController;
use App\Http\Controllers\ProductoTagController;
use App\Http\Controllers\SectorController;
use App\Http\Controllers\CRM\UsuariosRoles\UsuariosGestionController;
use App\Http\Controllers\CRM\UsuariosRoles\RolesUsuariosController;
use App\Http\Controllers\CRM\NuestrasEmpresas\NuestrasEmpresasController;
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
Route::get('/sector/{id_tag_parent}', [SectorController::class, 'show'])->name('sector.view');
Route::get('/sectores', [SectorController::class, 'index'])->name('sectores.index');
Route::get('/contacto', function () { return Inertia::render('Contacto'); })->name('contacto.view');
Route::get('/crear', function () { return Inertia::render('Crear');})->name('crear.view')->middleware('auth');
Route::get('/admin/products', [ProductoController::class, 'productsAdminView'])->name('admin.products.index')->middleware('auth');

// Rutas del CRM agrupadas por prefijo
Route::middleware('auth')->prefix('crm')->name('crm.')->group(function () {
    Route::get('/', fn () => Inertia::render('CRM/Dashboard'))->name('dashboard');

    Route::prefix('clientes')->name('clientes.')->group(function () {
        Route::get('/empresas', fn () => Inertia::render('CRM/Clientes/EmpresasClientes'))->name('empresas');
        Route::get('/particulares', fn () => Inertia::render('CRM/Clientes/Cliente'))->name('particulares');
        Route::get('/crear-empresa', fn () => Inertia::render('CRM/Clientes/CrearEmpresaCliente'))->name('crear-empresa');
    });

    Route::get('/cotizaciones', fn () => Inertia::render('CRM/Cotizaciones/Cotizaciones'))->name('cotizaciones');

    Route::prefix('empresas')->name('empresas.')->group(function () {
        Route::get('/', fn () => Inertia::render('CRM/Empresas/VerEmpresas'))->name('index');
        
        // API routes for empresas CRUD operations
        Route::get('/data', [NuestrasEmpresasController::class, 'index'])->name('data');
        Route::post('/store', [NuestrasEmpresasController::class, 'store'])->name('store');
        Route::get('/usuarios', [NuestrasEmpresasController::class, 'getUsuarios'])->name('usuarios');
        Route::get('/search', [NuestrasEmpresasController::class, 'search'])->name('search');
        Route::post('/bulk-delete', [NuestrasEmpresasController::class, 'bulkDelete'])->name('bulk-delete');
        Route::get('/{id}', [NuestrasEmpresasController::class, 'show'])->name('show');
        Route::match(['put', 'post'], '/{id}', [NuestrasEmpresasController::class, 'update'])->name('update');
        Route::match(['delete', 'post'], '/{id}/delete', [NuestrasEmpresasController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('productos')->name('productos.')->group(function () {
        Route::get('/', fn () => Inertia::render('CRM/ProductosServicios/Productos'))->name('index');
        Route::get('/marcas', fn () => Inertia::render('CRM/ProductosServicios/Marcas'))->name('marcas');
    });

    // Rutas de roles (deben ir antes de las rutas de usuarios para evitar conflictos)
    Route::prefix('usuarios/roles')->name('usuarios.roles.')->group(function () {
        Route::get('/', [RolesUsuariosController::class, 'index'])->name('index');
        Route::post('/', [RolesUsuariosController::class, 'store'])->name('store');
        Route::get('/users-count', [RolesUsuariosController::class, 'getUsersCount'])->name('users-count');
        Route::post('/assign-role', [RolesUsuariosController::class, 'assignRole'])->name('assign');
        Route::post('/bulk-assign', [RolesUsuariosController::class, 'bulkAssignRole'])->name('bulk-assign');
        Route::get('/{id}', [RolesUsuariosController::class, 'show'])->name('show');
        Route::match(['put', 'post'], '/{id}', [RolesUsuariosController::class, 'update'])->name('update');
        Route::match(['delete', 'post'], '/{id}/delete', [RolesUsuariosController::class, 'destroy'])->name('destroy');
        Route::post('/{userId}/remove-role', [RolesUsuariosController::class, 'removeRole'])->name('remove');
    });

    // Rutas de usuarios
    Route::prefix('usuarios')->name('usuarios.')->group(function () {
        Route::get('/', [UsuariosGestionController::class, 'index'])->name('index');
        Route::post('/', [UsuariosGestionController::class, 'store'])->name('store');
        Route::post('/bulk-delete', [UsuariosGestionController::class, 'bulkDelete'])->name('bulk-delete');
        Route::get('/export', [UsuariosGestionController::class, 'export'])->name('export');
        Route::get('/{id}', [UsuariosGestionController::class, 'show'])->name('show');
        Route::match(['put', 'post'], '/{id}', [UsuariosGestionController::class, 'update'])->name('update');
        Route::match(['delete', 'post'], '/{id}/delete', [UsuariosGestionController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/toggle-status', [UsuariosGestionController::class, 'toggleStatus'])->name('toggle-status');
        Route::post('/{id}/change-password', [UsuariosGestionController::class, 'changePassword'])->name('change-password');
        Route::post('/{id}/reset-password', [UsuariosGestionController::class, 'resetPassword'])->name('reset-password');
    });
});


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
// Búsqueda simple de productos para modal de relacionados
Route::post('/productos/buscar-relacionados', [ProductoController::class, 'buscarSoloProductos']);
Route::post('/productos/buscarproductosrelacionados', [ProductoController::class, 'buscarSoloProductosRelacionados'])->name('productos.buscar-relacionados');
Route::post('/productos/actualizar-imagen', [ProductoController::class, 'updateProductImage']);
Route::delete('/productos/{id}/imagen', [ProductoController::class, 'deleteProductImage'])->name('productos.eliminar-imagen');
Route::post('/productos/actualizar-categoria', [ProductoController::class, 'updateProductCategory'])->name('productos.actualizar-categoria');
Route::get('/productos/productos-marca/{marca_id}', [ProductoController::class, 'getProductosByMarca'])->name('productos.by-marca');
// Rutas para relaciones de productos
Route::post('/product/agregar-relacion', [ProductoController::class, 'agregarRelacion'])->name('product.agregar-relacion');
Route::get('/product/relacion/{id}', [ProductoController::class, 'obtenerRelacionados'])->name('product.obtener-relacionados');
Route::get('/product/con-relacion/{id}', [ProductoController::class, 'obtenerProductosQueRelacionan'])->name('product.obtener-productos-que-relacionan');
Route::post('/product/eliminar-relacion', [ProductoController::class, 'eliminarRelacion'])->name('product.eliminar-relacion');

// Rutas de tags (web)
Route::get('/productos/{id}/tags', [ProductoController::class, 'getProductoTags'])->name('productos.tags');
Route::middleware('auth')->group(function () {
    Route::post('/productos/{id}/tags/sync', [ProductoController::class, 'syncProductoTags'])->name('productos.tags.sync');
    Route::post('/productos/{id}/tags/attach', [ProductoController::class, 'attachProductoTag'])->name('productos.tags.attach');
    Route::delete('/productos/{id}/tags/detach', [ProductoController::class, 'detachProductoTag'])->name('productos.tags.detach');
});
Route::get('/tags/{tag}/productos', [ProductoController::class, 'getProductosByTag'])->name('tags.productos');

// Rutas para usuarios
Route::apiResource('usuarios', UsuarioController::class);

// Rutas para categorías
Route::get('/categorias-con-subcategorias', [CategoriaController::class, 'getCategoriasConSubcategorias'])->name('categorias.with-subcategorias');
Route::get('/categorias-all', [CategoriaController::class, 'getCategorias'])->name('categorias.all');
Route::get('/categorias-con-subcategorias-con-id', [CategoriaController::class, 'getCategoriasConSubcategoriasConId'])->name('categorias.with-subcategorias-id');
Route::get('/categorias-completa', [CategoriaController::class, 'getCategoriasConSubcategoriasIds'])->name('categorias.complete');
Route::get('/debug-category-images', [CategoriaController::class, 'debugCategoryImages'])->name('debug.category.images');
Route::get('/categoria/{id}', [CategoriaController::class, 'getCategoriaById'])->name('categoria.show');
Route::post('/categoria/create', [CategoriaController::class, 'store'])->name('categoria.create');
Route::put('/categoria/update/{id}', [CategoriaController::class, 'update'])->name('categoria.update');
Route::post('/categoria/update/{id}', [CategoriaController::class, 'update'])->name('categoria.update.post');
Route::delete('/categoria/delete/{id}', [CategoriaController::class, 'destroy'])->name('categoria.delete');
Route::get('/categoria/{id}/subcategorias', [CategoriaController::class, 'getSubcategorias'])->name('categoria.subcategorias');

// Rutas para subcategorías
Route::post('/subcategoria/edit/{subcategoria}', [SubcategoriaController::class, 'update'])->name('subcategoria.update');
Route::post('/subcategoria_post/create', [SubcategoriaController::class, 'store'])->name('subcategoria.create');


Route::get('/subcategoria-all', [SubcategoriaController::class, 'getSubcategorias'])->name('subcategoria.all');
Route::get('/subcategoria_get/categoria/{id}', [SubcategoriaController::class, 'getSubcategoriasCategoria'])->name('subcategoria.by-categoria');
Route::get('/subcategoria_id/{id}', [SubcategoriaController::class, 'getSubcategoriaById'])->name('subcategoria.show');
Route::get('/subcategoria_get/cat/{id}', [SubcategoriaController::class, 'getCatBySub'])->name('subcategoria.get-categoria');
Route::get('/catsub_optimizadas/{marca_id?}', [SubcategoriaController::class, 'getCategoriasOptimizadasPorMarca'])->name('categorias.optimizadas-por-marca');
Route::post('/subcategoria/delete/{id}', [SubcategoriaController::class, 'destroy'])->name('subcategoria.destroy');
Route::post('/subcategorias/mover', [SubcategoriaController::class, 'moverSubcategorias'])->name('subcategorias.mover');

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

// Rutas para pedidos
Route::post('/pedido/confirmar', [PedidoController::class, 'confirmarPedido'])->name('pedido.confirmar');
Route::get('/orders/{orderNumber}', [PedidoController::class, 'verPedido'])->name('pedido.ver');

// Admin de Tags (protegido)
Route::middleware('auth')->prefix('admin/tags')->group(function () {
    Route::get('/', [TagController::class, 'index'])->name('admin.tags.index');
    Route::post('/', [TagController::class, 'store'])->name('admin.tags.store');
    Route::put('/{id}', [TagController::class, 'update'])->name('admin.tags.update');
    Route::delete('/{id}', [TagController::class, 'destroy'])->name('admin.tags.destroy');
});

// Admin de Tag Parents (Sectores) - protegido
Route::middleware('auth')->prefix('admin/tag-parents')->group(function () {
    Route::get('/', [TagParentController::class, 'index'])->name('admin.tagparents.index');
    Route::post('/', [TagParentController::class, 'store'])->name('admin.tagparents.store');
    Route::put('/{id}', [TagParentController::class, 'update'])->name('admin.tagparents.update');
    Route::delete('/{id}', [TagParentController::class, 'destroy'])->name('admin.tagparents.destroy');
});

// Rutas para gestión de relaciones Producto-Tag
Route::middleware('auth')->prefix('admin/producto-tags')->group(function () {
    Route::get('/', [ProductoTagController::class, 'index'])->name('admin.producto-tags.index');
    Route::get('/stats', [ProductoTagController::class, 'getTagStats'])->name('admin.producto-tags.stats');
    Route::post('/bulk-assign', [ProductoTagController::class, 'bulkAssignTags'])->name('admin.producto-tags.bulk-assign');
});

// Rutas públicas para relaciones Producto-Tag
Route::get('/productos/{id}/tags', [ProductoTagController::class, 'getProductTags'])->name('productos.tags');
Route::get('/tags/{id}/productos', [ProductoTagController::class, 'getProductsByTag'])->name('tag.productos');

// Rutas públicas para sectores
Route::get('/api/tag-parents', [TagParentController::class, 'getPublicTagParents'])->name('api.tag-parents');
Route::get('/sector/{id_tag_parent}/products/{id_tag}', [SectorController::class, 'getProductsByTag'])->name('sector.products-by-tag');
Route::get('/sector/{id_tag_parent}/search', [SectorController::class, 'searchProducts'])->name('sector.search');
Route::get('/sector/{id_tag_parent}/stats', [SectorController::class, 'getStats'])->name('sector.stats');

// Rutas protegidas para modificar relaciones Producto-Tag
Route::middleware('auth')->group(function () {
    Route::post('/productos/{id}/tags/sync', [ProductoTagController::class, 'syncTags'])->name('productos.tags.sync');
    Route::post('/productos/{id}/tags/attach', [ProductoTagController::class, 'attachTag'])->name('productos.tags.attach');
    Route::delete('/productos/{id}/tags/detach', [ProductoTagController::class, 'detachTag'])->name('productos.tags.detach');
});

// Rutas para banco de imágenes
Route::middleware('auth')->prefix('banco-imagenes')->group(function () {
    Route::get('/', [BancoImagenesController::class, 'index'])->name('banco-imagenes.index');
    Route::get('/api/all', [BancoImagenesController::class, 'getAllImagesJson'])->name('banco-imagenes.api.all');
    Route::post('/', [BancoImagenesController::class, 'store'])->name('banco-imagenes.store');
    Route::get('/buscar', [BancoImagenesController::class, 'buscar'])->name('banco-imagenes.buscar');
    Route::get('/{id}', [BancoImagenesController::class, 'show'])->name('banco-imagenes.show');
    Route::put('/{id}', [BancoImagenesController::class, 'update'])->name('banco-imagenes.update');
    Route::delete('/{id}', [BancoImagenesController::class, 'destroy'])->name('banco-imagenes.destroy');
});


use Illuminate\Support\Facades\Mail;
use App\Mail\TestMail;

Route::get('/test-email', function () {
    Mail::to('test@example.com')->send(new TestMail());
    return 'Email sent!';
});

Route::get('/test-pedido-email', function () {
    $datosPrueba = [
        'orderNumber' => 'ORD-12345678',
        'customerData' => [
            'firstName' => 'Juan',
            'lastName' => 'Pérez',
            'email' => 'juan.perez@example.com',
            'phone' => '+51 987 654 321',
            'documentType' => 'DNI',
            'documentNumber' => '12345678'
        ],
        'shippingData' => [
            'address' => 'Av. Ejemplo 123, Dpto 456',
            'city' => 'Lima',
            'state' => 'Lima',
            'zipCode' => '15001'
        ],
        'paymentData' => [
            'method' => 'transfer'
        ],
        'orderData' => [
            'cartItems' => [
                [
                    'title' => 'Producto de Prueba 1',
                    'price' => 150.00,
                    'quantity' => 2
                ],
                [
                    'title' => 'Producto de Prueba 2',
                    'price' => 75.50,
                    'quantity' => 1
                ]
            ]
        ],
        'totals' => [
            'subtotal' => 375.50,
            'shipping' => 25.00,
            'tax' => 67.59,
            'total' => 468.09
        ],
        'datosBancarios' => [
            'banco' => 'Banco de Crédito del Perú (BCP)',
            'titular' => 'MegaEquipamiento S.A.C.',
            'numeroCuenta' => '194-2345678-0-12',
            'cuentaInterbancaria' => '002-194-002345678012-34',
            'ruc' => '20123456789',
            'email' => 'ventas@megaequipamiento.com',
            'telefono' => '+51 1 234-5678'
        ]
    ];
    
    Mail::to('test@example.com')->send(new \App\Mail\PedidoConfirmacion($datosPrueba));
    return 'Email de pedido enviado!';
});

// Ruta para sitemap
use App\Http\Controllers\SitemapController;
Route::get('/sitemap.xml', [SitemapController::class, 'show'])->name('sitemap.show');

// Ruta para robots.txt dinámico
Route::get('/robots.txt', function () {
    $content = "User-agent: *\n";
    $content .= "Allow: /\n";
    $content .= "Disallow: /admin/\n";
    $content .= "Disallow: /crear\n";
    $content .= "Disallow: /api/\n";
    $content .= "\n";
    $content .= "Sitemap: " . url('/sitemap.xml') . "\n";
    
    return response($content, 200, [
        'Content-Type' => 'text/plain'
    ]);
})->name('robots.txt');
