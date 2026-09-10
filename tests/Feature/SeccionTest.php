<?php

use App\Models\Seccion;

it('devuelve 200 y un array JSON de marcas para una sección activa', function () {
    $seccion = Seccion::activo()->first();

    if (! $seccion) {
        $this->markTestSkipped('No hay secciones activas en la BD.');
    }

    $response = $this->get("/api/secciones/{$seccion->id_seccion}/marcas");

    $response->assertStatus(200)->assertJsonIsArray();

    foreach ($response->json() as $marca) {
        expect($marca)->toHaveKeys(['id_marca', 'nombre', 'imagen']);
    }
});

it('no devuelve marcas duplicadas', function () {
    $seccion = Seccion::activo()->first();

    if (! $seccion) {
        $this->markTestSkipped('No hay secciones activas en la BD.');
    }

    $ids = collect($this->get("/api/secciones/{$seccion->id_seccion}/marcas")->json())
        ->pluck('id_marca');

    expect($ids->unique()->count())->toBe($ids->count());
});

it('devuelve 404 para una sección inexistente', function () {
    $this->get('/api/secciones/999999999/marcas')->assertStatus(404);
});
