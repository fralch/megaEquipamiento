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
