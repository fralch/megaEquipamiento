<?php

use App\Models\Slider;

afterEach(function () {
    Slider::where('titulo', 'like', 'TEST_API_%')->delete();
});

test('GET /api/slider devuelve 200 y un JSON array', function () {
    $resp = $this->get('/api/slider');
    $resp->assertStatus(200)->assertJsonIsArray();
});

test('GET /api/slider solo devuelve slides activos', function () {
    Slider::create([
        'tipo' => 'imagen',
        'titulo' => 'TEST_API_visible',
        'orden' => 1,
        'activo' => true,
    ]);
    Slider::create([
        'tipo' => 'imagen',
        'titulo' => 'TEST_API_oculto',
        'orden' => 2,
        'activo' => false,
    ]);

    $resp = $this->get('/api/slider')->assertStatus(200);

    $titles = collect($resp->json())->pluck('titulo');
    expect($titles->contains('TEST_API_visible'))->toBeTrue();
    expect($titles->contains('TEST_API_oculto'))->toBeFalse();
});

test('GET /api/slider devuelve los slides ordenados por orden', function () {
    Slider::create(['tipo' => 'imagen', 'titulo' => 'TEST_API_z', 'orden' => 99, 'activo' => true]);
    Slider::create(['tipo' => 'imagen', 'titulo' => 'TEST_API_a', 'orden' => 1, 'activo' => true]);
    Slider::create(['tipo' => 'imagen', 'titulo' => 'TEST_API_m', 'orden' => 50, 'activo' => true]);

    $resp = $this->get('/api/slider')->assertStatus(200);
    $titles = collect($resp->json())->pluck('titulo')->all();

    $posA = array_search('TEST_API_a', $titles);
    $posM = array_search('TEST_API_m', $titles);
    $posZ = array_search('TEST_API_z', $titles);

    expect($posA)->toBeLessThan($posM);
    expect($posM)->toBeLessThan($posZ);
});

test('GET /api/slider incluye los campos esperados en cada slide', function () {
    Slider::create([
        'tipo' => 'imagen',
        'titulo' => 'TEST_API_campos',
        'imagen' => 'img/slider-img1.webp',
        'texto_boton' => 'Ver más',
        'url_boton' => 'https://wa.me/51999999999',
        'orden' => 1,
        'activo' => true,
    ]);

    $resp = $this->get('/api/slider')->assertStatus(200);
    $slide = collect($resp->json())->firstWhere('titulo', 'TEST_API_campos');

    expect($slide)->not->toBeNull();
    expect($slide)->toHaveKeys([
        'id_slider', 'tipo', 'titulo', 'imagen_url',
        'texto_boton', 'url_boton', 'orden',
    ]);
    expect($slide['tipo'])->toBe('imagen');
    expect($slide['texto_boton'])->toBe('Ver más');
});
