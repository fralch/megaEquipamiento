<?php

use App\Models\Marca;

it('devuelve 200 para URL de marca con slug SEO', function () {
    $marca = Marca::first();

    if (! $marca) {
        $marca = Marca::create(['nombre' => 'Marca Test']);
    }

    $response = $this->get('/marcas/'.$marca->getSeoSlug());
    $response->assertStatus(200);
});

it('redirige 301 desde URL antigua con ID numerico', function () {
    $marca = Marca::first();

    if (! $marca) {
        $marca = Marca::create(['nombre' => 'Marca Test']);
    }

    $response = $this->get('/marcas/'.$marca->id_marca);
    $response->assertStatus(301)
        ->assertRedirect('/marcas/'.$marca->getSeoSlug());
});

it('devuelve 404 para slug con ID inexistente', function () {
    $response = $this->get('/marcas/marca-inexistente-999999');
    $response->assertStatus(404);
});
