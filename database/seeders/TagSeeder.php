<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Tag;
use App\Models\TagParent;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear sectores principales (tag_parents)
        $sectores = [
            ['nombre' => 'Manufactura', 'color' => '#1E3A8A', 'imagen' => 'https://megaequipamiento.com/wp-content/uploads/2023/09/MANUFACTURA-GIF-OF.gif'],
            ['nombre' => 'Extracción', 'color' => '#059669', 'imagen' => 'https://megaequipamiento.com/wp-content/uploads/2023/09/EXTRACCION-GIF-OF.gif'],
            ['nombre' => 'Educación', 'color' => '#7C3AED', 'imagen' => 'https://megaequipamiento.com/wp-content/uploads/2023/09/EDUCACION-GIF-OF.gif'],
            ['nombre' => 'Ind. Alimentaria', 'color' => '#DC2626', 'imagen' => 'https://megaequipamiento.com/wp-content/uploads/2023/09/ALIMENTOS-GIF-OF.gif'],
            ['nombre' => 'Sector Salud', 'color' => '#DB2777', 'imagen' => 'https://megaequipamiento.com/wp-content/uploads/2023/09/SALUD-GIF-OF.gif'],
            ['nombre' => 'Farmacéutica', 'color' => '#0891B2', 'imagen' => 'https://megaequipamiento.com/wp-content/uploads/2023/09/FARMACIA-GIF-OF.gif'],
        ];

        $sectorIds = [];

        // Crear sectores principales en tag_parents
        foreach ($sectores as $sector) {
            $slug = Str::slug($sector['nombre']);
            $tagParent = TagParent::firstOrCreate(
                ['slug' => $slug],
                [
                    'nombre' => $sector['nombre'],
                    'color' => $sector['color'],
                    'imagen' => $sector['imagen'],
                ]
            );
            $sectorIds[$sector['nombre']] = $tagParent->id_tag_parent;
        }

        // Crear subsectores (tags hijos)
        $subsectores = [
            // Manufactura
            'Manufactura' => [
                ['nombre' => 'Textil', 'color' => '#065F46'],
                ['nombre' => 'Química', 'color' => '#7C2D12'],
                ['nombre' => 'Papelería', 'color' => '#92400E'],
                ['nombre' => 'Pintura', 'color' => '#BE185D'],
                ['nombre' => 'Metalurgia', 'color' => '#374151'],
            ],
            
            // Extracción
            'Extracción' => [
                ['nombre' => 'Gas Natural', 'color' => '#1F2937'],
                ['nombre' => 'Petróleo', 'color' => '#111827'],
                ['nombre' => 'Minería', 'color' => '#78716C'],
                ['nombre' => 'Pesca', 'color' => '#0C4A6E'],
                ['nombre' => 'Agua', 'color' => '#0EA5E9'],
            ],
            
            // Educación
            'Educación' => [
                ['nombre' => 'Universidades', 'color' => '#5B21B6'],
                ['nombre' => 'Institutos', 'color' => '#6D28D9'],
                ['nombre' => 'Colegios', 'color' => '#7C3AED'],
                ['nombre' => 'Escuelas', 'color' => '#8B5CF6'],
                ['nombre' => 'Centros de investigación', 'color' => '#A855F7'],
            ],
            
            // Industria Alimentaria
            'Ind. Alimentaria' => [
                ['nombre' => 'Lácteos', 'color' => '#FED7D7'],
                ['nombre' => 'Cárnicos', 'color' => '#DC2626'],
                ['nombre' => 'Aceites', 'color' => '#F59E0B'],
                ['nombre' => 'Agroindustria', 'color' => '#16A34A'],
                ['nombre' => 'Harina y derivados', 'color' => '#EAB308'],
            ],
            
            // Sector Salud
            'Sector Salud' => [
                ['nombre' => 'Hospitales', 'color' => '#DB2777'],
                ['nombre' => 'Clínicas', 'color' => '#BE185D'],
                ['nombre' => 'Centros Médicos', 'color' => '#A21CAF'],
                ['nombre' => 'Ocupacionales', 'color' => '#86198F'],
                ['nombre' => 'Dentales', 'color' => '#701A75'],
            ],
            
            // Farmacéutica
            'Farmacéutica' => [
                ['nombre' => 'Perfumerías', 'color' => '#0891B2'],
                ['nombre' => 'Cosméticos', 'color' => '#0E7490'],
                ['nombre' => 'Joyas', 'color' => '#155E75'],
                ['nombre' => 'Vacunas', 'color' => '#164E63'],
                ['nombre' => 'Encapsulados', 'color' => '#0C4A6E'],
            ],
        ];

        // Crear subsectores con id_tag_parent
        foreach ($subsectores as $sectorNombre => $subTags) {
            $parentId = $sectorIds[$sectorNombre];
            
            foreach ($subTags as $subTag) {
                $slug = Str::slug($subTag['nombre']);
                Tag::firstOrCreate(
                    ['slug' => $slug],
                    [
                        'nombre' => $subTag['nombre'],
                        'color' => $subTag['color'],
                        'id_tag_parent' => $parentId,
                    ]
                );
            }
        }

        // Tags generales (sin id_tag_parent)
        $generales = [
            ['nombre' => 'Destacado', 'color' => '#F59E0B'],
            ['nombre' => 'Oferta', 'color' => '#EF4444'],
            ['nombre' => 'Nuevo', 'color' => '#10B981'],
            ['nombre' => 'Outlet', 'color' => '#6366F1'],
            ['nombre' => 'Reacondicionado', 'color' => '#3B82F6'],
            ['nombre' => 'Usado', 'color' => '#6B7280'],
        ];

        foreach ($generales as $general) {
            $slug = Str::slug($general['nombre']);
            Tag::firstOrCreate(
                ['slug' => $slug],
                [
                    'nombre' => $general['nombre'],
                    'color' => $general['color'],
                    'id_tag_parent' => null,
                ]
            );
        }
    }
}

