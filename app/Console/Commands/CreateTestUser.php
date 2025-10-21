<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class CreateTestUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-test-user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test user for login testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Delete existing test user if exists
        Usuario::where('correo', 'admin@megaequipamiento.com')->delete();
        
        // Create new test user
        $user = Usuario::create([
            'nombre' => 'Admin Test',
            'correo' => 'admin@megaequipamiento.com',
            'contraseña' => Hash::make('password'),
            'nombre_usuario' => 'admin',
            'activo' => true,
        ]);

        $this->info('Test user created successfully!');
        $this->info('Email: admin@megaequipamiento.com');
        $this->info('Password: password');
        
        return 0;
    }
}
