<?php

namespace Database\Seeders;

use App\Models\Match\MatchAdmin;
use Illuminate\Database\Seeder;

class MatchAdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = MatchAdmin::query()->updateOrCreate(
            ['email' => MatchAdmin::DEFAULT_EMAIL],
            [
                'name' => MatchAdmin::DEFAULT_NAME,
                'password' => MatchAdmin::DEFAULT_PASSWORD,
                'is_active' => true,
            ]
        );

        MatchAdmin::query()
            ->whereKeyNot($admin->id)
            ->delete();
    }
}
