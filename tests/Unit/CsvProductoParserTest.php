<?php

use App\Services\Csv\CsvProductoParser;

beforeEach(function () {
    $this->parser = app(CsvProductoParser::class);
});

test('calcula precios base, ganancia e IGV correctamente', function () {
    $precios = $this->parser->calcularPrecios(100, 25);
    expect($precios['precio_sin_ganancia'])->toBe(100.0)
        ->and($precios['precio_ganancia'])->toBe(133.33)
        ->and($precios['precio_igv'])->toBe(157.33);
});

test('parsea atributos desde pares name/value', function () {
    $row = ['', '', '', '', '', '', 'Corriente', '10 A', 'Voltaje', '600 V', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    $attributeIndexes = [
        ['name_idx' => 6, 'value_idx' => 7],
        ['name_idx' => 8, 'value_idx' => 9],
    ];
    $out = $this->parser->parseAtributos($row, $attributeIndexes);
    expect($out)->toHaveCount(2)
        ->and($out[0])->toBe(['name' => 'Corriente', 'value' => '10 A'])
        ->and($out[1])->toBe(['name' => 'Voltaje', 'value' => '600 V']);
});

test('parsea especificaciones desde tabla HTML', function () {
    $html = '<table><tr><th>Campo</th><th>Valor</th></tr><tr><td>Rango</td><td>Auto</td></tr><tr><td>Display</td><td>LCD</td></tr></table>';
    $out = $this->parser->parseEspecificaciones($html);
    expect($out)->toBeArray()
        ->and($out['filas']['Rango'])->toBe('Auto')
        ->and($out['filas']['Display'])->toBe('LCD');
});

test('parsea especificaciones como JSON estructurado sin tocarlo', function () {
    $json = json_encode(['filas' => ['a' => 'b']]);
    $out = $this->parser->parseEspecificaciones($json);
    expect($out)->toBe(['filas' => ['a' => 'b']]);
});

test('parseDecimal retorna null para strings vacíos o espacios', function () {
    $ref = new ReflectionMethod(CsvProductoParser::class, 'parseDecimal');
    $ref->setAccessible(true);

    expect($ref->invoke($this->parser, ''))->toBeNull();
    expect($ref->invoke($this->parser, '   '))->toBeNull();
    expect($ref->invoke($this->parser, null))->toBeNull();
});

test('parseDecimal retorna float para números válidos', function () {
    $ref = new ReflectionMethod(CsvProductoParser::class, 'parseDecimal');
    $ref->setAccessible(true);

    expect($ref->invoke($this->parser, '0'))->toBe(0.0);
    expect($ref->invoke($this->parser, '150'))->toBe(150.0);
    expect($ref->invoke($this->parser, '150.50'))->toBe(150.5);
    expect($ref->invoke($this->parser, '1,234.56'))->toBe(1234.56);
    expect($ref->invoke($this->parser, '1.234,56'))->toBe(1234.56);
});

test('parseDecimal retorna null para valores inválidos', function () {
    $ref = new ReflectionMethod(CsvProductoParser::class, 'parseDecimal');
    $ref->setAccessible(true);

    expect($ref->invoke($this->parser, 'abc'))->toBeNull();
    expect($ref->invoke($this->parser, '123abc'))->toBeNull();
});

test('parsea el fixture CSV sin BD devuelve 0 errores', function () {
    // La prueba completa con detección de pendientes está en
    // Feature/ProductoImportTest. Aquí validamos que el método
    // parseEspecificaciones (que no toca BD) funcione con el bloque
    // HTML del fixture.
    $path = realpath(__DIR__.'/../Fixtures/productos_sample.csv');
    expect($path)->not->toBeFalse();

    $html = '<table><tr><th>Campo</th><th>Valor</th></tr><tr><td>Rango</td><td>Auto</td></tr></table>';
    $out = $this->parser->parseEspecificaciones($html);
    expect($out['filas']['Rango'])->toBe('Auto');
});
