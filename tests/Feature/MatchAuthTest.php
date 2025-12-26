<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Match\MatchUser;

class MatchAuthTest extends TestCase
{
    // Using RefreshDatabase might be risky if I don't want to wipe the main DB, 
    // but tests usually use a separate DB or in-memory sqlite.
    // I'll avoid RefreshDatabase and manually cleanup.
    
    protected function tearDown(): void
    {
        MatchUser::where('email', 'test@match.com')->delete();
        parent::tearDown();
    }

    public function test_can_register_match_user()
    {
        $response = $this->postJson('/match-api/register', [
            'email' => 'test@match.com',
            'password' => 'password123',
            'age' => 25,
            'gender' => 'male',
            'interested_in' => 'female',
            'name' => 'Test User'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
            
        $this->assertDatabaseHas('match_users', ['email' => 'test@match.com']);
    }

    public function test_can_login_match_user()
    {
        // Create user
        $user = MatchUser::create([
            'email' => 'test@match.com',
            'password' => 'password123', // Model casts to hash
            'age' => 25,
            'gender' => 'male',
            'interested_in' => 'female',
        ]);

        $response = $this->postJson('/match-api/login', [
            'email' => 'test@match.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_protected_route_requires_auth()
    {
        $response = $this->getJson('/match-api/profile');
        $response->assertStatus(401);
    }

    public function test_can_access_protected_route_with_token()
    {
        $user = MatchUser::create([
            'email' => 'test@match.com',
            'password' => 'password123',
            'age' => 25,
            'gender' => 'male',
            'interested_in' => 'female',
        ]);
        
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/match-api/profile');
            
        $response->assertStatus(200);
    }
}
