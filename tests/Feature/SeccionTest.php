<?php

use App\Models\Marca;
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

it('muestra la vista marca+sección con la página SeccionMarca', function () {
    $seccion = Seccion::activo()->first();

    if (! $seccion) {
        $this->markTestSkipped('No hay secciones activas en la BD.');
    }

    $marcas = $this->get("/api/secciones/{$seccion->id_seccion}/marcas")->json();

    if (empty($marcas)) {
        $this->markTestSkipped('La sección activa no tiene marcas asociadas.');
    }

    $marca = Marca::find($marcas[0]['id_marca']);

    $this->get("/seccion/{$seccion->slug}/marca/{$marca->getSeoSlug()}")
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('SeccionMarca')
            ->has('seccion')
            ->has('marca')
            ->has('productos')
            ->has('categorias')
            ->etc()
        );
});

it('la vista marca+sección solo incluye productos de esa marca en esa sección', function () {
    $seccion = Seccion::activo()->first();

    if (! $seccion) {
        $this->markTestSkipped('No hay secciones activas en la BD.');
    }

    $marcas = $this->get("/api/secciones/{$seccion->id_seccion}/marcas")->json();

    if (empty($marcas)) {
        $this->markTestSkipped('La sección activa no tiene marcas asociadas.');
    }

    $marca = Marca::find($marcas[0]['id_marca']);
    $props = null;

    $this->get("/seccion/{$seccion->slug}/marca/{$marca->getSeoSlug()}")
        ->assertStatus(200)
        ->assertInertia(function ($page) use (&$props) {
            $page->component('SeccionMarca')->etc();
            $props = $page->toArray();
        });

    foreach ($props['productos'] ?? [] as $producto) {
        expect((int) $producto['marca_id'])->toBe((int) $marca->id_marca);
        expect((int) ($producto['subcategoria']['categoria']['id_seccion'] ?? 0))
            ->toBe((int) $seccion->id_seccion);
    }
});

it('devuelve 404 en la vista marca+sección para una sección inexistente', function () {
    $this->get('/seccion/seccion-que-no-existe/marca/marca-test-1')
        ->assertStatus(404);
});

it('devuelve 404 en la vista marca+sección para una marca inexistente', function () {
    $seccion = Seccion::activo()->first();

    if (! $seccion) {
        $this->markTestSkipped('No hay secciones activas en la BD.');
    }

    $this->get("/seccion/{$seccion->slug}/marca/marca-falsa-999999999")
        ->assertStatus(404);
});

it('redirige 301 al slug canónico de marca en la vista marca+sección', function () {
    $seccion = Seccion::activo()->first();

    if (! $seccion) {
        $this->markTestSkipped('No hay secciones activas en la BD.');
    }

    $marcas = $this->get("/api/secciones/{$seccion->id_seccion}/marcas")->json();

    if (empty($marcas)) {
        $this->markTestSkipped('La sección activa no tiene marcas asociadas.');
    }

    $marca = Marca::find($marcas[0]['id_marca']);

    $this->get("/seccion/{$seccion->slug}/marca/{$marca->id_marca}")
        ->assertStatus(301)
        ->assertRedirect("/seccion/{$seccion->slug}/marca/{$marca->getSeoSlug()}");
});
