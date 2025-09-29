<?php

namespace Database\Factories;

use App\Models\EmpresaCliente;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmpresaCliente>
 */
class EmpresaClienteFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = EmpresaCliente::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sectores = [
            'Tecnología',
            'Salud y Laboratorios',
            'Industria Química',
            'Servicios Médicos',
            'Educación Superior',
            'Minería',
            'Industria Alimentaria',
            'Farmacéutico',
            'Petroquímica',
            'Investigación',
            'Manufactura',
            'Comercio',
            'Servicios',
            'Construcción',
            'Energía',
            'Telecomunicaciones'
        ];

        $sufijos = ['S.A.C.', 'S.A.', 'S.R.L.', 'E.I.R.L.', 'Ltda.'];

        return [
            'razon_social' => $this->faker->company() . ' ' . $this->faker->randomElement($sufijos),
            'ruc' => '20' . $this->faker->unique()->numerify('#########'),
            'sector' => $this->faker->randomElement($sectores),
            'contacto_principal' => $this->faker->name(),
            'email' => $this->faker->unique()->companyEmail(),
            'telefono' => '+51 1 ' . $this->faker->numerify('###-####'),
            'direccion' => $this->faker->streetAddress() . ', ' . $this->faker->city() . ', Lima',
            'usuario_id' => Usuario::factory(),
            'activo' => $this->faker->boolean(85), // 85% de empresas activas
        ];
    }

    /**
     * Indicate that the empresa cliente is active.
     */
    public function activa(): static
    {
        return $this->state(fn (array $attributes) => [
            'activo' => true,
        ]);
    }

    /**
     * Indicate that the empresa cliente is inactive.
     */
    public function inactiva(): static
    {
        return $this->state(fn (array $attributes) => [
            'activo' => false,
        ]);
    }

    /**
     * Set a specific sector for the empresa cliente.
     */
    public function sector(string $sector): static
    {
        return $this->state(fn (array $attributes) => [
            'sector' => $sector,
        ]);
    }

    /**
     * Set a specific usuario_id for the empresa cliente.
     */
    public function forUsuario(int $usuarioId): static
    {
        return $this->state(fn (array $attributes) => [
            'usuario_id' => $usuarioId,
        ]);
    }
}