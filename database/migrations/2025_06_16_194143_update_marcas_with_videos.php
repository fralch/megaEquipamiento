<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Array con los datos exactos de marcas con sus IDs y videos
        $marcasConVideos = [
            [
                'id_marca' => 1,
                'nombre' => '7_ealway',
                'video_url' => 'https://www.youtube.com/embed/uNDuiuz6nBM?mute=1&autoplay=1&loop=1&playlist=uNDuiuz6nBM&vq=hd1080'
            ],
            [
                'id_marca' => 2,
                'nombre' => 'accumax',
                'video_url' => 'https://www.youtube.com/embed/jqQmOhOU2G8?mute=1&autoplay=1&loop=1&playlist=jqQmOhOU2G8&vq=hd1080'
            ],
            [
                'id_marca' => 3,
                'nombre' => 'aczet',
                'video_url' => 'https://www.youtube.com/embed/uslDyshJQBA?mute=1&autoplay=1&loop=1&playlist=uslDyshJQBA&vq=hd1080'
            ],
            [
                'id_marca' => 4,
                'nombre' => 'adam',
                'video_url' => 'https://www.youtube.com/embed/JQg6eToxjOh?mute=1&autoplay=1&loop=1&playlist=JQg6eToxjOh&vq=hd1080'
            ],
            [
                'id_marca' => 5,
                'nombre' => 'alp',
                'video_url' => 'https://www.youtube.com/embed/CCw-vFusnzc?mute=1&autoplay=1&loop=1&playlist=CCw-vFusnzc&vq=hd1080'
            ],
            [
                'id_marca' => 7,
                'nombre' => 'aralab',
                'video_url' => 'https://www.youtube.com/embed/X_tX4hfqw_I?mute=1&autoplay=1&loop=1&playlist=X_tX4hfqw_I&vq=hd1080'
            ],
            [
                'id_marca' => 9,
                'nombre' => 'axis',
                'video_url' => 'https://www.youtube.com/embed/vMJBXGPTSeE?mute=1&autoplay=1&loop=1&playlist=vMJBXGPTSeE&vq=hd1080'
            ],
            [
                'id_marca' => 10,
                'nombre' => 'beger',
                'video_url' => 'https://www.youtube.com/embed/7rzVYP3txyA?mute=1&autoplay=1&loop=1&playlist=7rzVYP3txyA&vq=hd1080'
            ],
            [
                'id_marca' => 11,
                'nombre' => 'biobase',
                'video_url' => 'https://www.youtube.com/embed/TyQvn5A86qQ?mute=1&autoplay=1&loop=1&playlist=TyQvn5A86qQ&vq=hd1080'
            ],
            [
                'id_marca' => 15,
                'nombre' => 'elma',
                'video_url' => 'https://www.youtube.com/embed/-dLTKHFDTbw?mute=1&autoplay=1&loop=1&playlist=-dLTKHFDTbw&vq=hd1080'
            ],
            [
                'id_marca' => 17,
                'nombre' => 'eyela',
                'video_url' => 'https://www.youtube.com/embed/odafgFJlt4?mute=1&autoplay=1&loop=1&playlist=odafgFJlt4&vq=hd1080'
            ],
            [
                'id_marca' => 18,
                'nombre' => 'grant',
                'video_url' => 'https://www.youtube.com/embed/Gd_2gOKVYdo?mute=1&autoplay=1&loop=1&playlist=Gd_2gOKVYdo&vq=hd1080'
            ],
            [
                'id_marca' => 20,
                'nombre' => 'hanon',
                'video_url' => 'https://www.youtube.com/embed/YvH6KH3eSK?mute=1&autoplay=1&loop=1&playlist=YvH6KH3eSK&vq=hd1080'
            ],
            [
                'id_marca' => 21,
                'nombre' => 'harry_gestigkeit_gmbh',
                'video_url' => 'https://www.youtube.com/embed/KsRyS3Xsm1?mute=1&autoplay=1&loop=1&playlist=KsRyS3Xsm1&vq=hd1080'
            ],
            [
                'id_marca' => 22,
                'nombre' => 'hirschmann',
                'video_url' => 'https://www.youtube.com/embed/VBQVHOPnEZQ?mute=1&autoplay=1&loop=1&playlist=VBQVHOPnEZQ&vq=hd1080'
            ],
            [
                'id_marca' => 23,
                'nombre' => 'horiba',
                'video_url' => 'https://www.youtube.com/embed/yoQeJF-tf0I?mute=1&autoplay=1&loop=1&playlist=yoQeJF-tf0I&vq=hd1080'
            ],
            [
                'id_marca' => 24,
                'nombre' => 'ika',
                'video_url' => 'https://www.youtube.com/embed/zvxQDn40NMM?mute=1&autoplay=1&loop=1&playlist=zvxQDn40NMM&vq=hd1080'
            ],
            [
                'id_marca' => 26,
                'nombre' => 'kern',
                'video_url' => 'https://www.youtube.com/embed/CtNWY8TJNU0?mute=1&autoplay=1&loop=1&playlist=CtNWY8TJNU0&vq=hd1080'
            ],
            [
                'id_marca' => 27,
                'nombre' => 'kruss',
                'video_url' => 'https://www.youtube.com/embed/qAO4Zwn6uO0?mute=1&autoplay=1&loop=1&playlist=qAO4Zwn6uO0&vq=hd1080'
            ],
            [
                'id_marca' => 28,
                'nombre' => 'labtech',
                'video_url' => 'https://www.youtube.com/embed/iGAypzOLkn4?mute=1&autoplay=1&loop=1&playlist=iGAypzOLkn4&vq=hd1080'
            ],
            [
                'id_marca' => 29,
                'nombre' => 'lamy_rheology',
                'video_url' => 'https://www.youtube.com/embed/g1pL91QLVf8?mute=1&autoplay=1&loop=1&playlist=g1pL91QLVf8&vq=hd1080'
            ],
            [
                'id_marca' => 30,
                'nombre' => 'mag',
                'video_url' => 'https://www.youtube.com/embed/20Ni9MUEWkc?mute=1&autoplay=1&loop=1&playlist=20Ni9MUEWkc&vq=hd1080'
            ],
            [
                'id_marca' => 32,
                'nombre' => 'mpw',
                'video_url' => 'https://www.youtube.com/embed/zwFZbX4GnQ4?mute=1&autoplay=1&loop=1&playlist=zwFZbX4GnQ4&vq=hd1080'
            ],
            [
                'id_marca' => null,
                'nombre' => 'nksystem',
                'video_url' => 'https://www.youtube.com/embed/223QJHMlsoY?mute=1&autoplay=1&loop=1&playlist=223QJHMlsoY&vq=hd1080'
            ],
            [
                'id_marca' => 35,
                'nombre' => 'nuve',
                'video_url' => 'https://www.youtube.com/embed/3dT2yQxDDw?mute=1&autoplay=1&loop=1&playlist=3dT2yQxDDw&vq=hd1080'
            ],
            [
                'id_marca' => 36,
                'nombre' => 'ovan',
                'video_url' => 'https://www.youtube.com/embed/uFis2C2f2cU?mute=1&autoplay=1&loop=1&playlist=uFis2C2f2cU&vq=hd1080'
            ],
            [
                'id_marca' => 37,
                'nombre' => 'pobel',
                'video_url' => 'https://www.youtube.com/embed/y4q46kwpkQU?mute=1&autoplay=1&loop=1&playlist=y4q46kwpkQU&vq=hd1080'
            ],
            [
                'id_marca' => 38,
                'nombre' => 'pol_eko',
                'video_url' => 'https://www.youtube.com/embed/QarAv8JDEH8?mute=1&autoplay=1&loop=1&playlist=QarAv8JDEH8&vq=hd1080'
            ],
            [
                'id_marca' => 39,
                'nombre' => 'polyscience',
                'video_url' => 'https://www.youtube.com/embed/icokXKeA6F0?mute=1&autoplay=1&loop=1&playlist=icokXKeA6F0&vq=hd1080'
            ],
            [
                'id_marca' => null,
                'nombre' => 'topair_systems',
                'video_url' => 'https://www.youtube.com/embed/XwzgdNbQrlM?mute=1&autoplay=1&loop=1&playlist=XwzgdNbQrlM&vq=hd1080'
            ],
            [
                'id_marca' => 42,
                'nombre' => 'vibra',
                'video_url' => 'https://www.youtube.com/embed/NB13cqtp_1o?mute=1&autoplay=1&loop=1&playlist=NB13cqtp_1o&vq=hd1080'
            ],
            [
                'id_marca' => 43,
                'nombre' => 'wld_tec',
                'video_url' => 'https://www.youtube.com/embed/XTfaf5FDa4M?mute=1&autoplay=1&loop=1&playlist=XTfaf5FDa4M&vq=hd1080'
            ]
        ];

        // Actualizar cada marca con su video correspondiente
        foreach ($marcasConVideos as $marca) {
            if ($marca['id_marca'] !== null) {
                // Si tenemos ID, actualizar directamente por ID (más eficiente y preciso)
                DB::table('marcas')
                    ->where('id_marca', $marca['id_marca'])
                    ->update(['video_url' => $marca['video_url']]);
            } else {
                // Si no tenemos ID, buscar por nombre exacto
                DB::table('marcas')
                    ->where('nombre', $marca['nombre'])
                    ->update(['video_url' => $marca['video_url']]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Limpiar las URLs de video de todas las marcas actualizadas
        $idsParaLimpiar = [1, 2, 3, 4, 5, 7, 9, 10, 11, 15, 17, 18, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 32, 35, 36, 37, 38, 39, 42, 43];
        
        DB::table('marcas')
            ->whereIn('id_marca', $idsParaLimpiar)
            ->update(['video_url' => null]);
            
        // Limpiar también las marcas que se actualizaron por nombre (las que tenían id null)
        DB::table('marcas')
            ->whereIn('nombre', ['nksystem', 'topair_systems'])
            ->update(['video_url' => null]);
    }
};