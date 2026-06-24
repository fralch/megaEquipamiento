<?php

use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Producto;
use App\Models\Rol;
use App\Models\Subcategoria;
use App\Models\Usuario;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
    $rol = Rol::firstOrCreate(['nombre_rol' => 'admin']);
    $this->admin = Usuario::create([
        'nombre_usuario' => 'admin_test_'.uniqid(),
        'contraseña' => bcrypt('password'),
        'correo' => 'admin_'.uniqid().'@test.local',
        'nombre' => 'Admin',
        'apellido' => 'Test',
        'id_rol' => $rol->id_rol,
        'activo' => true,
    ]);
});

test('usuario sin autenticar recibe 401', function () {
    $this->postJson('/admin/products/preview-csv', [])
        ->assertStatus(401);
});

test('usuario no admin recibe 403', function () {
    $user = Usuario::create([
        'nombre_usuario' => 'user_'.uniqid(),
        'contraseña' => bcrypt('password'),
        'correo' => 'user_'.uniqid().'@test.local',
        'nombre' => 'User',
        'apellido' => 'NoAdmin',
        'id_rol' => null,
        'activo' => true,
    ]);
    $this->actingAs($user)
        ->postJson('/admin/products/preview-csv', [
            'archivo' => UploadedFile::fake()->create('x.csv', 10, 'text/csv'),
        ])
        ->assertStatus(403);
});

test('admin sube CSV y obtiene preview con productos y pendientes', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos_sample.csv', $csv);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $data = $response->json('data');
    expect($data['resumen']['productos'])->toBe(3)
        ->and($data['categorias_pendientes'])->not->toBeEmpty()
        ->and($data['marcas_pendientes'])->not->toBeEmpty();

    $cats = array_column($data['categorias_pendientes'], 'nombre');
    $subs = array_column($data['subcategorias_pendientes'], 'nombre');
    $marcas = array_column($data['marcas_pendientes'], 'nombre');
    expect($cats)->toContain('Instrumentos de Medición')
        ->and($subs)->toContain('MULTÍMETROS', 'OSCILOSCOPIOS')
        ->and($marcas)->toContain('FLUKE', 'KEYSIGHT');
});

test('acepta CSV con MIME type no estándar del navegador (vnd.ms-excel)', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    // Simula lo que mandan los browsers: un .csv pero con MIME "raro"
    $archivo = UploadedFile::fake()->createWithContent('productos.csv', $csv);
    $archivo->mimeType = 'application/vnd.ms-excel';

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    expect($response->json('data.resumen.productos'))->toBe(3);
});

test('rechaza archivo con extensión no permitida', function () {
    $archivo = UploadedFile::fake()->createWithContent('productos.xlsx', 'fake content');

    $this->actingAs($this->admin)
        ->postJson('/admin/products/preview-csv', ['archivo' => $archivo])
        ->assertStatus(422)
        ->assertJsonPath('errors.archivo.0', 'Archivo "productos.xlsx": debe tener extensión .csv o .txt (recibido: .xlsx).');
});

test('admin crea categoria pendiente y aparece en BD', function () {
    $this->actingAs($this->admin)
        ->postJson('/admin/categorias/quick', [
            'nombre' => 'Instrumentos de Medición',
            'descripcion' => 'Multímetros y osciloscopios',
        ])
        ->assertStatus(201)
        ->assertJsonPath('created', true);

    expect(Categoria::where('nombre', 'Instrumentos de Medición')->exists())->toBeTrue();
});

test('admin crea marca pendiente', function () {
    $this->actingAs($this->admin)
        ->postJson('/admin/marcas/quick', ['nombre' => 'FLUKE'])
        ->assertStatus(201)
        ->assertJsonPath('created', true);

    expect(Marca::where('nombre', 'FLUKE')->exists())->toBeTrue();
});

test('quick categoria es idempotente', function () {
    Categoria::create(['nombre' => 'Instrumentos de Medición']);
    $this->actingAs($this->admin)
        ->postJson('/admin/categorias/quick', ['nombre' => 'Instrumentos de Medición'])
        ->assertOk()
        ->assertJsonPath('created', false);

    expect(Categoria::where('nombre', 'Instrumentos de Medición')->count())->toBe(1);
});

test('admin crea subcategoria pendiente y aparece en BD', function () {
    Categoria::create(['nombre' => 'Instrumentos de Medición']);
    $categoriaId = Categoria::where('nombre', 'Instrumentos de Medición')->value('id_categoria');

    $this->actingAs($this->admin)
        ->postJson('/admin/subcategorias/quick', [
            'nombre' => 'MULTÍMETROS',
            'id_categoria' => $categoriaId,
        ])
        ->assertStatus(201)
        ->assertJsonPath('created', true);

    expect(Subcategoria::where('nombre', 'MULTÍMETROS')->exists())->toBeTrue();
});

test('flujo completo: preview, resolver pendientes, importar y verificar productos', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos_sample.csv', $csv);
    $preview = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $cacheKey = $preview['cache_key'];
    $skus = array_column($preview['data']['productos'], 'sku');

    Categoria::create(['nombre' => 'Instrumentos de Medición']);
    $categoriaId = Categoria::where('nombre', 'Instrumentos de Medición')->value('id_categoria');
    Subcategoria::create(['nombre' => 'MULTÍMETROS', 'id_categoria' => $categoriaId]);
    $subAId = Subcategoria::where('nombre', 'MULTÍMETROS')->value('id_subcategoria');
    Subcategoria::create(['nombre' => 'OSCILOSCOPIOS', 'id_categoria' => $categoriaId]);
    $subBId = Subcategoria::where('nombre', 'OSCILOSCOPIOS')->value('id_subcategoria');
    Marca::create(['nombre' => 'FLUKE']);
    $marcaFlukeId = Marca::where('nombre', 'FLUKE')->value('id_marca');
    Marca::create(['nombre' => 'KEYSIGHT']);
    $marcaKeysightId = Marca::where('nombre', 'KEYSIGHT')->value('id_marca');

    $mapping = [
        'SKU001' => ['id_subcategoria' => $subAId, 'marca_id' => $marcaFlukeId],
        'SKU002' => ['id_subcategoria' => $subAId, 'marca_id' => $marcaFlukeId],
        'SKU003' => ['id_subcategoria' => $subBId, 'marca_id' => $marcaKeysightId],
    ];

    $import = $this->actingAs($this->admin)
        ->postJson('/admin/products/import-csv', [
            'cache_key' => $cacheKey,
            'skus' => $skus,
            'mapping' => $mapping,
        ]);

    $import->assertOk();
    expect($import->json('insertados'))->toBe(3)
        ->and($import->json('actualizados'))->toBe(0);

    $p1 = Producto::where('sku', 'SKU001')->first();
    expect($p1)->not->toBeNull()
        ->and($p1->nombre)->toBe('Multímetro Digital Tester')
        ->and((float) $p1->precio_sin_ganancia)->toBe(150.0)
        ->and((float) $p1->precio_ganancia)->toBe(214.29)
        ->and((float) $p1->precio_igv)->toBe(252.86)
        ->and($p1->pais)->toBe('Estados Unidos');

    $caracts = $p1->caracteristicas;
    expect($caracts)->toBeArray()
        ->and(count($caracts))->toBeGreaterThan(0)
        ->and($p1->archivos_adicionales)->toContain('https://example.com/manual.pdf');
});

test('segunda ejecucion del mismo SKU actualiza en lugar de duplicar', function () {
    Categoria::create(['nombre' => 'Instrumentos de Medición']);
    $categoriaId = Categoria::where('nombre', 'Instrumentos de Medición')->value('id_categoria');
    Subcategoria::create(['nombre' => 'MULTÍMETROS', 'id_categoria' => $categoriaId]);
    $subAId = Subcategoria::where('nombre', 'MULTÍMETROS')->value('id_subcategoria');
    Marca::create(['nombre' => 'FLUKE']);
    $marcaId = Marca::where('nombre', 'FLUKE')->value('id_marca');

    $csv = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos_sample.csv', $csv);
    $preview = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $mapping = [
        'SKU001' => ['id_subcategoria' => $subAId, 'marca_id' => $marcaId],
    ];

    $this->actingAs($this->admin)
        ->postJson('/admin/products/import-csv', [
            'cache_key' => $preview['cache_key'],
            'skus' => ['SKU001'],
            'mapping' => $mapping,
        ])->assertOk()->assertJsonPath('insertados', 1);

    $archivo2 = UploadedFile::fake()->createWithContent('productos_sample.csv', $csv);
    $preview2 = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo2], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $this->actingAs($this->admin)
        ->postJson('/admin/products/import-csv', [
            'cache_key' => $preview2['cache_key'],
            'skus' => ['SKU001'],
            'mapping' => $mapping,
        ])->assertOk()->assertJsonPath('actualizados', 1);

    expect(Producto::where('sku', 'SKU001')->count())->toBe(1);
});

test('refresh-preview actualiza los IDs de dependencias creadas sin resubir CSV', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos_sample.csv', $csv);
    $preview = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $cacheKey = $preview['cache_key'];

    // El preview original no tiene IDs resueltos
    expect($preview['data']['productos'][0]['id_subcategoria'])->toBeNull()
        ->and($preview['data']['productos'][0]['marca_id'])->toBeNull();

    // Crear dependencias manualmente (simulando que el usuario las creó una a una)
    Categoria::create(['nombre' => 'Instrumentos de Medición']);
    $categoriaId = Categoria::where('nombre', 'Instrumentos de Medición')->value('id_categoria');
    Subcategoria::create(['nombre' => 'MULTÍMETROS', 'id_categoria' => $categoriaId]);
    Subcategoria::create(['nombre' => 'OSCILOSCOPIOS', 'id_categoria' => $categoriaId]);
    Marca::create(['nombre' => 'FLUKE']);
    Marca::create(['nombre' => 'KEYSIGHT']);

    $refresh = $this->actingAs($this->admin)
        ->postJson('/admin/products/refresh-preview', ['cache_key' => $cacheKey]);

    $refresh->assertOk();
    $data = $refresh->json('data');

    // Todas las dependencias deben estar resueltas
    expect($data['categorias_pendientes'])->toBeEmpty()
        ->and($data['subcategorias_pendientes'])->toBeEmpty()
        ->and($data['marcas_pendientes'])->toBeEmpty();

    // Cada producto debe tener id_subcategoria y marca_id
    foreach ($data['productos'] as $producto) {
        expect($producto['id_subcategoria'])->not->toBeNull()
            ->and($producto['marca_id'])->not->toBeNull();
    }
});

test('create-pending-dependencies crea todo y devuelve preview actualizado', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos_sample.csv', $csv);
    $preview = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $cacheKey = $preview['cache_key'];

    expect($preview['data']['categorias_pendientes'])->not->toBeEmpty()
        ->and($preview['data']['marcas_pendientes'])->not->toBeEmpty();

    $response = $this->actingAs($this->admin)
        ->postJson('/admin/products/create-pending-dependencies', ['cache_key' => $cacheKey]);

    $response->assertOk();
    $data = $response->json('data');

    expect($data['categorias_pendientes'])->toBeEmpty()
        ->and($data['subcategorias_pendientes'])->toBeEmpty()
        ->and($data['marcas_pendientes'])->toBeEmpty()
        ->and($response->json('resumen.categorias.pendientes_despues'))->toBe(0)
        ->and($response->json('resumen.marcas.pendientes_despues'))->toBe(0);

    // Verificar que las entidades se crearon en BD
    expect(Categoria::where('nombre', 'Instrumentos de Medición')->exists())->toBeTrue()
        ->and(Marca::where('nombre', 'FLUKE')->exists())->toBeTrue()
        ->and(Marca::where('nombre', 'KEYSIGHT')->exists())->toBeTrue()
        ->and(Subcategoria::where('nombre', 'MULTÍMETROS')->exists())->toBeTrue();
});

test('refresh-preview devuelve 410 si la sesion expiro', function () {
    $this->actingAs($this->admin)
        ->postJson('/admin/products/refresh-preview', ['cache_key' => 'clave-inexistente'])
        ->assertStatus(410);
});

test('flujo con marca TESTO: crear todo resuelve marca_id en todos los productos', function () {
    Categoria::create(['nombre' => 'Cámaras Termográficas']);
    $categoriaId = Categoria::where('nombre', 'Cámaras Termográficas')->value('id_categoria');
    Subcategoria::create(['nombre' => 'Cámaras Termográficas', 'id_categoria' => $categoriaId]);

    $csv = file_get_contents(base_path('tests/Fixtures/productos_marca_testo.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos_marca_testo.csv', $csv);
    $preview = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $cacheKey = $preview['cache_key'];

    expect($preview['data']['marcas_pendientes'])->not->toBeEmpty()
        ->and($preview['data']['marcas_pendientes'][0]['nombre'])->toBe('TESTO');

    $response = $this->actingAs($this->admin)
        ->postJson('/admin/products/create-pending-dependencies', ['cache_key' => $cacheKey]);

    $response->assertOk();
    $data = $response->json('data');

    expect($data['marcas_pendientes'])->toBeEmpty();

    foreach ($data['productos'] as $producto) {
        expect($producto['marca_id'])->not->toBeNull(
            "El producto {$producto['sku']} debería tener marca_id resuelto"
        );
    }
});

test('crear marca TESTO individualmente y refrescar preview resuelve marca_id', function () {
    Categoria::create(['nombre' => 'Cámaras Termográficas']);
    $categoriaId = Categoria::where('nombre', 'Cámaras Termográficas')->value('id_categoria');
    Subcategoria::create(['nombre' => 'Cámaras Termográficas', 'id_categoria' => $categoriaId]);

    $csv = file_get_contents(base_path('tests/Fixtures/productos_marca_testo.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos_marca_testo.csv', $csv);
    $preview = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $cacheKey = $preview['cache_key'];

    $this->actingAs($this->admin)
        ->postJson('/admin/marcas/quick', ['nombre' => 'TESTO'])
        ->assertStatus(201);

    $refresh = $this->actingAs($this->admin)
        ->postJson('/admin/products/refresh-preview', ['cache_key' => $cacheKey]);

    $refresh->assertOk();
    $data = $refresh->json('data');

    expect($data['marcas_pendientes'])->toBeEmpty();

    foreach ($data['productos'] as $producto) {
        expect($producto['marca_id'])->not->toBeNull(
            "El producto {$producto['sku']} debería tener marca_id resuelto"
        );
    }
});

test('CSV con precios vacíos genera preview con precios nulos sin errores', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_empty_prices.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos_empty_prices.csv', $csv);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $data = $response->json('data');

    expect($data['resumen']['productos'])->toBe(1)
        ->and($data['resumen']['errores'])->toBe(0);

    $producto = $data['productos'][0];
    expect($producto['sku'])->toBe('SKU-EMPTY')
        ->and($producto['precio_base'])->toBeNull()
        ->and($producto['porcentaje_ganancia'])->toBeNull()
        ->and($producto['precio_sin_ganancia'])->toBeNull()
        ->and($producto['precio_ganancia'])->toBeNull()
        ->and($producto['precio_igv'])->toBeNull()
        ->and($producto['nombre'])->toBe('Producto Sin Precios');
});

test('flujo completo con precios vacíos importa producto con precios nulos', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_empty_prices.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos_empty_prices.csv', $csv);
    $preview = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $cacheKey = $preview['cache_key'];

    Categoria::create(['nombre' => 'Instrumentos de Medición']);
    $categoriaId = Categoria::where('nombre', 'Instrumentos de Medición')->value('id_categoria');
    Subcategoria::create(['nombre' => 'MULTÍMETROS', 'id_categoria' => $categoriaId]);
    $subId = Subcategoria::where('nombre', 'MULTÍMETROS')->value('id_subcategoria');
    Marca::create(['nombre' => 'TESTMARCA']);
    $marcaId = Marca::where('nombre', 'TESTMARCA')->value('id_marca');

    $import = $this->actingAs($this->admin)
        ->postJson('/admin/products/import-csv', [
            'cache_key' => $cacheKey,
            'skus' => ['SKU-EMPTY'],
            'mapping' => [
                'SKU-EMPTY' => ['id_subcategoria' => $subId, 'marca_id' => $marcaId],
            ],
        ]);

    $import->assertOk();
    expect($import->json('insertados'))->toBe(1);

    $producto = Producto::where('sku', 'SKU-EMPTY')->first();
    expect($producto)->not->toBeNull()
        ->and($producto->nombre)->toBe('Producto Sin Precios')
        ->and($producto->precio_sin_ganancia)->toBeNull()
        ->and($producto->precio_ganancia)->toBeNull()
        ->and($producto->precio_igv)->toBeNull();
});

test('precios parciales (solo uno presente) marcan error', function () {
    $csv = "SKU,Nombre,Precio Base,% Ganancia\nSKU-PARTIAL,Producto Parcial,100,,\n";
    $archivo = UploadedFile::fake()->createWithContent('parcial.csv', $csv);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $data = $response->json('data');

    expect($data['resumen']['errores'])->toBe(1)
        ->and($data['resumen']['productos'])->toBe(0);
});

test('precios con espacios en blanco se tratan como nulos', function () {
    $csv = "SKU,Nombre,Precio Base,% Ganancia\nSKU-SPACE,Producto Espacios,   ,   ,\n";
    $archivo = UploadedFile::fake()->createWithContent('espacios.csv', $csv);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $data = $response->json('data');

    expect($data['resumen']['productos'])->toBe(1)
        ->and($data['resumen']['errores'])->toBe(0);

    $producto = $data['productos'][0];
    expect($producto['precio_sin_ganancia'])->toBeNull();
});

test('precio base con formato inválido marca error', function () {
    $csv = "SKU,Nombre,Precio Base,% Ganancia\nSKU-BAD,Producto Malo,abc,25,\n";
    $archivo = UploadedFile::fake()->createWithContent('malo.csv', $csv);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $data = $response->json('data');

    expect($data['resumen']['errores'])->toBe(1)
        ->and($data['resumen']['productos'])->toBe(0);
});

test('CSV con precios en 0.0 se importan como 0.0 (no null)', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_marca_testo.csv'));
    $archivo = UploadedFile::fake()->createWithContent('testo.csv', $csv);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $data = $response->json('data');

    expect($data['resumen']['productos'])->toBe(2)
        ->and($data['resumen']['errores'])->toBe(0);

    foreach ($data['productos'] as $p) {
        expect((float) $p['precio_base'])->toBe(0.0)
            ->and((float) $p['porcentaje_ganancia'])->toBe(0.0)
            ->and((float) $p['precio_sin_ganancia'])->toBe(0.0)
            ->and((float) $p['precio_ganancia'])->toBe(0.0)
            ->and((float) $p['precio_igv'])->toBe(0.0);
    }
});

test('marca y procedencia se extraen de atributos y no aparecen en caracteristicas', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_marca_espec_test.csv'));
    $archivo = UploadedFile::fake()->createWithContent('marca_espec.csv', $csv);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $producto = $response->json('data.productos.0');

    // Marca y procedencia deben estar en los campos dedicados
    expect($producto['marca_nombre'])->toBe('CROWCON')
        ->and($producto['pais'])->toBe('Reino Unido')
        // Y NO deben estar en caracteristicas
        ->and($producto['caracteristicas'])->toMatchArray([
            'Canales' => '16',
            'Potencia' => '50 W',
        ]);
});

test('especificaciones tecnicas HTML se parsean correctamente', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_marca_espec_test.csv'));
    $archivo = UploadedFile::fake()->createWithContent('marca_espec.csv', $csv);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $producto = $response->json('data.productos.0');

    expect($producto['especificaciones_tecnicas'])->toBeArray()
        ->and($producto['especificaciones_tecnicas']['filas'])->toMatchArray([
            'Modelo' => 'GM16',
            'Canales' => '1 a 16',
        ]);
});

test('flujo completo importa marca, procedencia y especificaciones correctamente', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_marca_espec_test.csv'));
    $archivo = UploadedFile::fake()->createWithContent('marca_espec.csv', $csv);
    $preview = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $cacheKey = $preview['cache_key'];

    Categoria::create(['nombre' => 'INSTRUMENTOS DE MEDIDA']);
    $categoriaId = Categoria::where('nombre', 'INSTRUMENTOS DE MEDIDA')->value('id_categoria');
    Subcategoria::create(['nombre' => 'Paneles de Control', 'id_categoria' => $categoriaId]);
    $subId = Subcategoria::where('nombre', 'Paneles de Control')->value('id_subcategoria');
    Marca::create(['nombre' => 'CROWCON']);
    $marcaId = Marca::where('nombre', 'CROWCON')->value('id_marca');

    $import = $this->actingAs($this->admin)
        ->postJson('/admin/products/import-csv', [
            'cache_key' => $cacheKey,
            'skus' => ['GM16'],
            'mapping' => [
                'GM16' => ['id_subcategoria' => $subId, 'marca_id' => $marcaId],
            ],
        ]);

    $import->assertOk();
    expect($import->json('insertados'))->toBe(1);

    $producto = Producto::where('sku', 'GM16')->first();
    expect($producto)->not->toBeNull()
        ->and($producto->nombre)->toBe('Panel de Control Direccionable GM16 - CROWCON PERÚ')
        ->and($producto->marca_id)->toBe($marcaId)
        ->and($producto->pais)->toBe('Reino Unido')
        ->and((float) $producto->precio_sin_ganancia)->toBe(100.0)
        ->and((float) $producto->precio_ganancia)->toBe(133.33)
        ->and((float) $producto->precio_igv)->toBe(157.33)
        ->and($producto->caracteristicas)->toMatchArray([
            'Canales' => '16',
            'Potencia' => '50 W',
        ]);

    // Verificar que especificaciones técnicas se guardaron correctamente
    expect($producto->especificaciones_tecnicas)->toBeArray()
        ->and($producto->especificaciones_tecnicas['filas'])->toMatchArray([
            'Modelo' => 'GM16',
            'Canales' => '1 a 16',
        ]);

    // Verificar documentos
    expect($producto->archivos_adicionales)->toContain('https://example.com/manual.pdf');

    // Verificar envío y soporte
    expect($producto->envio)->toContain('Panel GM16')
        ->and($producto->soporte_tecnico)->toContain('Garantía');
});
