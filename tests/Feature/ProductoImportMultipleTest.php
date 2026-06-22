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
        'nombre_usuario' => 'admin_multi_'.uniqid(),
        'contraseña' => bcrypt('password'),
        'correo' => 'admin_multi_'.uniqid().'@test.local',
        'nombre' => 'Admin',
        'apellido' => 'Multi',
        'id_rol' => $rol->id_rol,
        'activo' => true,
    ]);
});

test('admin sube 2 CSVs y obtiene preview consolidado', function () {
    $csvA = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    $csvB = file_get_contents(base_path('tests/Fixtures/productos_sample_b.csv'));

    $archivoA = UploadedFile::fake()->createWithContent('multimetros.csv', $csvA);
    $archivoB = UploadedFile::fake()->createWithContent('camaras.csv', $csvB);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', [
            'archivo' => [$archivoA, $archivoB],
        ], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $data = $response->json('data');

    // 3 de sample.csv + 2 de sample_b.csv = 5 productos
    expect($data['resumen']['productos'])->toBe(5)
        ->and($data['archivos_origen'])->toHaveCount(2)
        ->and($data['archivos_origen'])->toContain('multimetros.csv', 'camaras.csv');

    // Verificar que cada producto tiene archivo_origen
    $origenes = array_unique(array_column($data['productos'], 'archivo_origen'));
    expect($origenes)->toContain('multimetros.csv')
        ->and($origenes)->toContain('camaras.csv');
});

test('SKUs duplicados entre archivos se reportan como error', function () {
    $csvA = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    // Mismos productos → SKUs duplicados
    $csvDup = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));

    $archivoA = UploadedFile::fake()->createWithContent('lote1.csv', $csvA);
    $archivoDup = UploadedFile::fake()->createWithContent('lote1_copia.csv', $csvDup);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', [
            'archivo' => [$archivoA, $archivoDup],
        ], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    $data = $response->json('data');

    // Solo 3 productos válidos (los duplicados se eliminan)
    expect($data['resumen']['productos'])->toBe(3);

    // Debe haber errores de duplicados entre archivos
    $erroresDup = array_filter($data['errores'], fn ($e) => str_contains($e['motivo'], 'duplicado entre archivos'));
    expect(count($erroresDup))->toBe(3);
});

test('importar desde múltiples archivos inserta todos los productos', function () {
    $csvA = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    $csvB = file_get_contents(base_path('tests/Fixtures/productos_sample_b.csv'));

    $archivoA = UploadedFile::fake()->createWithContent('multimetros.csv', $csvA);
    $archivoB = UploadedFile::fake()->createWithContent('camaras.csv', $csvB);

    // Preview
    $preview = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', [
            'archivo' => [$archivoA, $archivoB],
        ], ['X-Requested-With' => 'XMLHttpRequest'])
        ->json();

    $cacheKey = $preview['cache_key'];
    $skus = array_column($preview['data']['productos'], 'sku');

    // Crear dependencias
    Categoria::create(['nombre' => 'Instrumentos de Medición']);
    $categoriaId = Categoria::where('nombre', 'Instrumentos de Medición')->value('id_categoria');

    Categoria::create(['nombre' => 'Instrumentos de Medida']);
    $categoriaId2 = Categoria::where('nombre', 'Instrumentos de Medida')->value('id_categoria');

    Subcategoria::create(['nombre' => 'MULTÍMETROS', 'id_categoria' => $categoriaId]);
    $subMultId = Subcategoria::where('nombre', 'MULTÍMETROS')->value('id_subcategoria');
    Subcategoria::create(['nombre' => 'OSCILOSCOPIOS', 'id_categoria' => $categoriaId]);
    $subOscId = Subcategoria::where('nombre', 'OSCILOSCOPIOS')->value('id_subcategoria');
    Subcategoria::create(['nombre' => 'Cámaras Termográficas', 'id_categoria' => $categoriaId2]);
    $subCamId = Subcategoria::where('nombre', 'Cámaras Termográficas')->value('id_subcategoria');

    Marca::create(['nombre' => 'FLUKE']);
    $marcaFluke = Marca::where('nombre', 'FLUKE')->value('id_marca');
    Marca::create(['nombre' => 'KEYSIGHT']);
    $marcaKeysight = Marca::where('nombre', 'KEYSIGHT')->value('id_marca');
    Marca::create(['nombre' => 'TESTO']);
    $marcaTesto = Marca::where('nombre', 'TESTO')->value('id_marca');
    Marca::create(['nombre' => 'FLIR']);
    $marcaFlir = Marca::where('nombre', 'FLIR')->value('id_marca');

    $mapping = [
        'SKU001' => ['id_subcategoria' => $subMultId, 'marca_id' => $marcaFluke],
        'SKU002' => ['id_subcategoria' => $subMultId, 'marca_id' => $marcaFluke],
        'SKU003' => ['id_subcategoria' => $subOscId, 'marca_id' => $marcaKeysight],
        'CAM001' => ['id_subcategoria' => $subCamId, 'marca_id' => $marcaTesto],
        'CAM002' => ['id_subcategoria' => $subCamId, 'marca_id' => $marcaFlir],
    ];

    // Import
    $import = $this->actingAs($this->admin)
        ->postJson('/admin/products/import-csv', [
            'cache_key' => $cacheKey,
            'skus' => $skus,
            'mapping' => $mapping,
        ]);

    $import->assertOk();
    expect($import->json('insertados'))->toBe(5)
        ->and($import->json('actualizados'))->toBe(0);

    // Verificar productos en BD
    expect(Producto::where('sku', 'SKU001')->exists())->toBeTrue()
        ->and(Producto::where('sku', 'CAM001')->exists())->toBeTrue()
        ->and(Producto::where('sku', 'CAM002')->exists())->toBeTrue();
});

test('subir un solo archivo como antes sigue funcionando (compatibilidad)', function () {
    $csv = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    $archivo = UploadedFile::fake()->createWithContent('productos.csv', $csv);

    $response = $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', ['archivo' => $archivo], ['X-Requested-With' => 'XMLHttpRequest']);

    $response->assertOk();
    expect($response->json('data.resumen.productos'))->toBe(3);
});

test('rechaza archivo con extensión no permitida en multi-upload', function () {
    $csvOk = file_get_contents(base_path('tests/Fixtures/productos_sample.csv'));
    $archivoOk = UploadedFile::fake()->createWithContent('valido.csv', $csvOk);
    $archivoMal = UploadedFile::fake()->createWithContent('datos.xlsx', 'fake');

    $this->actingAs($this->admin)
        ->post('/admin/products/preview-csv', [
            'archivo' => [$archivoOk, $archivoMal],
        ], ['X-Requested-With' => 'XMLHttpRequest'])
        ->assertStatus(422)
        ->assertJsonPath('success', false);
});
