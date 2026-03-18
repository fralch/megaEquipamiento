<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class UpdateAdminPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:update-admin-password';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update admin password';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Searching for user "admin"...');

        $user = Usuario::where('nombre_usuario', 'admin')->first();

        if (!$user) {
            $this->error('Usuario with nombre_usuario="admin" not found.');
            return 1;
        }

        $this->info('Found Usuario with ID: ' . $user->id_usuario);
        
        $user->contraseña = Hash::make('206002061E');
        $user->save();

        $this->info('Password updated successfully for user admin.');
        return 0;
    }
}
