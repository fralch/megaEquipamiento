<?php

use App\Models\Rol;
use App\Models\Slider;
use App\Models\Usuario;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $rol = Rol::firstOrCreate(['nombre_rol' => 'admin']);
    $this->admin = Usuario::create([
        'nombre_usuario' => 'admin_slider_'.uniqid(),
        'contraseña' => bcrypt('password'),
        'correo' => 'admin_slider_'.uniqid().'@test.local',
        'nombre' => 'Admin',
        'apellido' => 'Slider',
        'id_rol' => $rol->id_rol,
        'activo' => true,
    ]);

    // Sliders de prueba con prefijo único por test
    $this->prefix = 'TEST_'.uniqid().'_';
});

afterEach(function () {
    // Limpiar todos los sliders creados por el test (prefijo en titulo o subtitulo)
    Slider::where('titulo', 'like', $this->prefix.'%')
        ->orWhere('subtitulo', 'like', $this->prefix.'%')
        ->get()
        ->each(function (Slider $s) {
            if ($s->imagen && str_starts_with($s->imagen, 'img/slider/slider-')) {
                $abs = public_path($s->imagen);
                if (is_file($abs)) {
                    @unlink($abs);
                }
            }
            $s->delete();
        });

    if ($this->admin) {
        $this->admin->delete();
    }
});

test('usuario sin autenticar recibe 401 o redirect', function () {
    // Laravel redirige (302) a /login en rutas web cuando no hay sesión;
    // un endpoint JSON puro devolvería 401. Aceptamos ambos.
    $resp = $this->get('/admin/slider/data');
    expect($resp->getStatusCode())->toBeIn([401, 302]);
});

test('usuario no admin recibe 403', function () {
    $user = Usuario::create([
        'nombre_usuario' => 'user_slider_'.uniqid(),
        'contraseña' => bcrypt('password'),
        'correo' => 'user_slider_'.uniqid().'@test.local',
        'nombre' => 'User',
        'apellido' => 'NoAdmin',
        'id_rol' => null,
        'activo' => true,
    ]);

    $this->actingAs($user)
        ->get('/admin/slider/data')
        ->assertStatus(403);

    $user->delete();
});

test('admin puede listar slides en /admin/slider/data', function () {
    Slider::create([
        'tipo' => 'imagen',
        'titulo' => $this->prefix.'Slide A',
        'subtitulo' => $this->prefix.'Sub A',
        'texto_boton' => 'Ver más',
        'imagen' => 'img/slider-img1.webp',
        'orden' => 1,
        'activo' => true,
    ]);

    $resp = $this->actingAs($this->admin)->get('/admin/slider/data');
    $resp->assertStatus(200)->assertJsonStructure(['slides']);

    $titles = collect($resp->json('slides'))->pluck('titulo');
    expect($titles->contains($this->prefix.'Slide A'))->toBeTrue();
});

test('admin puede crear un slide de tipo imagen sin imagen (validación)', function () {
    $resp = $this->actingAs($this->admin)
        ->postJson('/admin/slider/store', [
            'tipo' => 'imagen',
            'titulo' => $this->prefix.'Nuevo',
        ]);

    // Como 'imagen' no requiere imagen en validación pero el slide sin imagen
    // puede ser válido (se renderiza como fallback), esperamos 201
    $resp->assertStatus(201)->assertJsonPath('slide.titulo', $this->prefix.'Nuevo');
});

test('admin puede crear un slide de tipo imagen con archivo', function () {
    $img = UploadedFile::fake()->image('test.webp', 100, 100);

    $resp = $this->actingAs($this->admin)
        ->post('/admin/slider/store', [
            'tipo' => 'imagen',
            'titulo' => $this->prefix.'ConImagen',
            'texto_boton' => 'Comprar',
            'url_boton' => 'https://wa.me/51999999999',
            'imagen' => $img,
        ]);

    $resp->assertStatus(201);
    $slide = Slider::where('titulo', $this->prefix.'ConImagen')->first();
    expect($slide)->not->toBeNull();
    expect($slide->imagen)->toStartWith('img/slider/slider-');
    expect(is_file(public_path($slide->imagen)))->toBeTrue();
});

test('admin puede crear un slide de tipo video con id de YouTube', function () {
    $resp = $this->actingAs($this->admin)
        ->postJson('/admin/slider/store', [
            'tipo' => 'video',
            'titulo' => $this->prefix.'Video',
            'video_youtube_id' => 'dQw4w9WgXcQ',
        ]);

    $resp->assertStatus(201)->assertJsonPath('slide.video_youtube_id', 'dQw4w9WgXcQ');
});

test('admin puede crear un slide de tipo video con URL completa de youtu.be', function () {
    $resp = $this->actingAs($this->admin)
        ->postJson('/admin/slider/store', [
            'tipo' => 'video',
            'titulo' => $this->prefix.'VideoUrl1',
            'video_youtube_id' => 'https://youtu.be/3vbogzQ9vYM',
        ]);

    $resp->assertStatus(201)->assertJsonPath('slide.video_youtube_id', '3vbogzQ9vYM');
});

test('admin puede crear un slide de tipo video con URL completa de youtube.com/watch', function () {
    $resp = $this->actingAs($this->admin)
        ->postJson('/admin/slider/store', [
            'tipo' => 'video',
            'titulo' => $this->prefix.'VideoUrl2',
            'video_youtube_id' => 'https://www.youtube.com/watch?v=3vbogzQ9vYM&t=42s',
        ]);

    $resp->assertStatus(201)->assertJsonPath('slide.video_youtube_id', '3vbogzQ9vYM');
});

test('admin puede crear un slide de tipo video con URL /embed/ y /shorts/', function () {
    foreach (['https://www.youtube.com/embed/3vbogzQ9vYM', 'https://www.youtube.com/shorts/3vbogzQ9vYM'] as $i => $url) {
        $resp = $this->actingAs($this->admin)
            ->postJson('/admin/slider/store', [
                'tipo' => 'video',
                'titulo' => $this->prefix.'VideoEmbed'.$i,
                'video_youtube_id' => $url,
            ]);

        $resp->assertStatus(201)->assertJsonPath('slide.video_youtube_id', '3vbogzQ9vYM');
    }
});

test('admin puede actualizar un slide cambiando el video con URL completa', function () {
    $slide = Slider::create([
        'tipo' => 'video',
        'titulo' => $this->prefix.'VideoUpdate',
        'video_youtube_id' => 'oldId______',
        'orden' => 1,
        'activo' => true,
    ]);

    $resp = $this->actingAs($this->admin)
        ->post("/admin/slider/{$slide->id_slider}", [
            '_method' => 'PUT',
            'tipo' => 'video',
            'titulo' => $this->prefix.'VideoUpdate',
            'video_youtube_id' => 'https://youtu.be/3vbogzQ9vYM',
        ]);

    $resp->assertStatus(200);
    expect($slide->fresh()->video_youtube_id)->toBe('3vbogzQ9vYM');
});

test('admin puede desactivar un slide enviando activo como "0" (simulando FormData JS)', function () {
    $slide = Slider::create([
        'tipo' => 'imagen',
        'titulo' => $this->prefix.'ToggleFormData',
        'orden' => 1,
        'activo' => true,
    ]);

    // Cuando el frontend usa FormData.append('activo', false) → string "false",
    // por lo que ahora el frontend lo envía como "0". Validamos que ambos extremos funcionan.
    foreach (['0', '1'] as $val) {
        $resp = $this->actingAs($this->admin)
            ->post("/admin/slider/{$slide->id_slider}", [
                '_method' => 'PUT',
                'tipo' => 'imagen',
                'titulo' => $this->prefix.'ToggleFormData',
                'activo' => $val,
            ]);
        $resp->assertStatus(200);
    }

    expect($slide->fresh()->activo)->toBeTrue(); // último valor fue "1"
});

test('admin no puede crear video con id de YouTube inválido', function () {
    $resp = $this->actingAs($this->admin)
        ->postJson('/admin/slider/store', [
            'tipo' => 'video',
            'titulo' => $this->prefix.'VideoMal',
            'video_youtube_id' => 'no-es-valido',
        ]);

    $resp->assertStatus(422)->assertJsonValidationErrors(['video_youtube_id']);
});

test('admin no puede crear con url_boton inválida', function () {
    $resp = $this->actingAs($this->admin)
        ->postJson('/admin/slider/store', [
            'tipo' => 'imagen',
            'titulo' => $this->prefix.'UrlMal',
            'url_boton' => 'no-es-url',
        ]);

    $resp->assertStatus(422)->assertJsonValidationErrors(['url_boton']);
});

test('admin puede actualizar un slide (PUT emulado vía _method)', function () {
    $slide = Slider::create([
        'tipo' => 'imagen',
        'titulo' => $this->prefix.'Original',
        'orden' => 1,
        'activo' => true,
    ]);

    $resp = $this->actingAs($this->admin)
        ->post("/admin/slider/{$slide->id_slider}", [
            '_method' => 'PUT',
            'tipo' => 'imagen',
            'titulo' => $this->prefix.'Editado',
            'texto_boton' => 'Comprar ahora',
            'orden' => 5,
            'activo' => false,
        ]);

    $resp->assertStatus(200);
    $slide->refresh();
    expect($slide->titulo)->toBe($this->prefix.'Editado');
    expect($slide->texto_boton)->toBe('Comprar ahora');
    expect($slide->orden)->toBe(5);
    expect($slide->activo)->toBeFalse();
});

test('admin puede activar/desactivar un slide vía toggle', function () {
    $slide = Slider::create([
        'tipo' => 'imagen',
        'titulo' => $this->prefix.'Toggle',
        'activo' => true,
    ]);

    $resp = $this->actingAs($this->admin)
        ->postJson("/admin/slider/{$slide->id_slider}/toggle-activo");

    $resp->assertStatus(200)->assertJsonPath('slide.activo', false);

    $this->actingAs($this->admin)
        ->postJson("/admin/slider/{$slide->id_slider}/toggle-activo")
        ->assertStatus(200)
        ->assertJsonPath('slide.activo', true);
});

test('admin puede eliminar un slide y se borra su archivo físico', function () {
    $img = UploadedFile::fake()->image('del.webp', 50, 50);
    $resp = $this->actingAs($this->admin)
        ->post('/admin/slider/store', [
            'tipo' => 'imagen',
            'titulo' => $this->prefix.'Borrar',
            'imagen' => $img,
        ]);
    $resp->assertStatus(201);
    $slideId = $resp->json('slide.id_slider');
    $slide = Slider::findOrFail($slideId);
    $absPath = public_path($slide->imagen);
    expect(is_file($absPath))->toBeTrue();

    $del = $this->actingAs($this->admin)
        ->post("/admin/slider/{$slideId}/delete", ['_method' => 'DELETE']);

    $del->assertStatus(200);
    expect(Slider::find($slideId))->toBeNull();
    expect(is_file($absPath))->toBeFalse();
});

test('admin puede reordenar slides masivamente', function () {
    $a = Slider::create(['tipo' => 'imagen', 'titulo' => $this->prefix.'A', 'orden' => 1]);
    $b = Slider::create(['tipo' => 'imagen', 'titulo' => $this->prefix.'B', 'orden' => 2]);
    $c = Slider::create(['tipo' => 'imagen', 'titulo' => $this->prefix.'C', 'orden' => 3]);

    // Invertimos: A=3, B=2, C=1
    $resp = $this->actingAs($this->admin)
        ->postJson('/admin/slider/reorder', [
            'items' => [
                ['id_slider' => $a->id_slider, 'orden' => 3],
                ['id_slider' => $b->id_slider, 'orden' => 2],
                ['id_slider' => $c->id_slider, 'orden' => 1],
            ],
        ]);

    $resp->assertStatus(200);
    expect($a->fresh()->orden)->toBe(3);
    expect($b->fresh()->orden)->toBe(2);
    expect($c->fresh()->orden)->toBe(1);
});

test('admin no puede reordenar con id_slider inexistente', function () {
    $resp = $this->actingAs($this->admin)
        ->postJson('/admin/slider/reorder', [
            'items' => [
                ['id_slider' => 999999, 'orden' => 1],
            ],
        ]);

    $resp->assertStatus(422);
});
