<?php

namespace Tests\Feature\Match;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Match\MatchUser;
use App\Models\Match\MatchPair;
use App\Models\Match\MatchSwipe;
use App\Models\Match\MatchMessage;
use App\Models\Match\MatchPhoto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

class MatchFeatureTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Manually migrate only the match module tables
        // Note: Since we modified the migration to drop tables first, this should be safe to run repeatedly
        $this->artisan('migrate', [
             '--path' => 'database/migrations/2025_12_13_000000_add_auth_fields_to_match_users_table.php',
             '--realpath' => true,
        ]);

        // Also run the base table migration if needed, but in this environment usually tables exist.
        // For safety in this specific test environment where we might want isolation:
        // However, standard `RefreshDatabase` trait is better if configured. 
        // Given previous setup, I'll stick to manual cleanup to avoid wiping the whole project DB.

        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        MatchMessage::truncate();
        MatchPair::truncate();
        MatchSwipe::truncate();
        MatchPhoto::truncate();
        MatchUser::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    }

    public function test_can_register_match_user()
    {
        $response = $this->postJson(route('match.register'), [
            'email' => 'john@example.com',
            'password' => 'secret123',
            'name' => 'John Doe',
            'age' => 25,
            'gender' => 'male',
            'description' => 'A test user',
            'interested_in' => 'female',
            'instagram' => 'john_doe',
            'whatsapp' => '123456789'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']); 

        $this->assertDatabaseHas('match_users', [
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'gender' => 'male'
        ]);
    }

    public function test_can_login_match_user()
    {
        $user = MatchUser::create([
            'email' => 'jane@example.com',
            'password' => 'secret123',
            'name' => 'Jane Doe',
            'age' => 22,
            'gender' => 'female',
            'interested_in' => 'male'
        ]);

        $response = $this->postJson(route('match.login'), [
            'email' => 'jane@example.com',
            'password' => 'secret123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_can_update_profile()
    {
        $user = MatchUser::create([
            'email' => 'jane@example.com',
            'password' => 'secret123',
            'name' => 'Jane Doe',
            'age' => 22,
            'gender' => 'female',
            'interested_in' => 'male',
            'description' => 'Original'
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->patchJson(route('match.profile.update'), [
            'description' => 'Updated Description'
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('match_users', [
            'id' => $user->id,
            'description' => 'Updated Description'
        ]);
    }

    public function test_can_upload_photo()
    {
        Storage::fake('public');
        $user = MatchUser::create([
            'email' => 'photo@example.com',
            'password' => 'secret123',
            'name' => 'Photo User',
            'age' => 20,
            'gender' => 'male',
            'interested_in' => 'female',
            'description' => 'Test'
        ]);

        Sanctum::actingAs($user, ['*']);

        $file = UploadedFile::fake()->image('profile.jpg');

        $response = $this->postJson(route('match.profile.photo'), [
            'photo' => $file
        ]);

        $response->assertStatus(200);
        
        $photoInDb = $user->photos()->first();
        $this->assertNotNull($photoInDb);
        
        // Controller stores as '/storage/' . $path
        $path = str_replace('/storage/', '', $photoInDb->url);
        Storage::disk('public')->assertExists($path);
    }

    public function test_get_candidates_filters_correctly()
    {
        // Me
        $me = MatchUser::create(['email' => 'me@ex.com', 'password' => '123', 'name' => 'Me', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);
        
        // Candidate 1: Female (Should show)
        $c1 = MatchUser::create(['email' => 'c1@ex.com', 'password' => '123', 'name' => 'C1', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);
        
        // Candidate 2: Male (Should NOT show based on gender preference)
        $c2 = MatchUser::create(['email' => 'c2@ex.com', 'password' => '123', 'name' => 'C2', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);

        // Candidate 3: Female, but already swiped (Should NOT show)
        $c3 = MatchUser::create(['email' => 'c3@ex.com', 'password' => '123', 'name' => 'C3', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);
        MatchSwipe::create(['swiper_id' => $me->id, 'swiped_id' => $c3->id, 'type' => 'dislike']);

        // Candidate 4: Female, not swiped (Should show)
        $c4 = MatchUser::create(['email' => 'c4@ex.com', 'password' => '123', 'name' => 'C4', 'age' => 22, 'gender' => 'female', 'interested_in' => 'male']);

        Sanctum::actingAs($me, ['*']);

        $response = $this->getJson(route('match.candidates'));

        $response->assertStatus(200);
        $data = $response->json();
        
        // We expect C1 and C4
        $ids = collect($data)->pluck('id')->sort()->values()->all();
        $expected = collect([$c1->id, $c4->id])->sort()->values()->all();
        
        $this->assertEquals($expected, $ids);
    }

    public function test_swipe_creates_match_if_reciprocal()
    {
        $me = MatchUser::create(['email' => 'me@ex.com', 'password' => '123', 'name' => 'Me', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);
        $her = MatchUser::create(['email' => 'her@ex.com', 'password' => '123', 'name' => 'Her', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);

        // She likes me first
        MatchSwipe::create(['swiper_id' => $her->id, 'swiped_id' => $me->id, 'type' => 'like']);

        Sanctum::actingAs($me, ['*']);

        // I like her back
        $response = $this->postJson(route('match.swipe'), [
            'swiped_profile_id' => $her->id,
            'type' => 'like'
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success', 'match' => true]);

        $this->assertDatabaseHas('match_pairs', [
            'user_1_id' => min($me->id, $her->id),
            'user_2_id' => max($me->id, $her->id)
        ]);
    }

    public function test_swipe_no_match_if_not_reciprocal()
    {
        $me = MatchUser::create(['email' => 'me@ex.com', 'password' => '123', 'name' => 'Me', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);
        $her = MatchUser::create(['email' => 'her@ex.com', 'password' => '123', 'name' => 'Her', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);

        Sanctum::actingAs($me, ['*']);

        // I like her, she hasn't swiped yet
        $response = $this->postJson(route('match.swipe'), [
            'swiped_profile_id' => $her->id,
            'type' => 'like'
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success', 'match' => false]);
            
        $this->assertDatabaseMissing('match_pairs', [
            'user_1_id' => min($me->id, $her->id),
            'user_2_id' => max($me->id, $her->id)
        ]);
    }

    public function test_messaging_flow()
    {
        $me = MatchUser::create(['email' => 'me@ex.com', 'password' => '123', 'name' => 'Me', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);
        $her = MatchUser::create(['email' => 'her@ex.com', 'password' => '123', 'name' => 'Her', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);
        
        $pair = MatchPair::create([
            'user_1_id' => min($me->id, $her->id),
            'user_2_id' => max($me->id, $her->id)
        ]);

        Sanctum::actingAs($me, ['*']);

        // Send message
        $response = $this->postJson(route('match.matches.send', $pair->id), [
            'content' => 'Hello there!'
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('match_messages', [
            'match_pair_id' => $pair->id,
            'sender_id' => $me->id,
            'content' => 'Hello there!'
        ]);

        Sanctum::actingAs($her, ['*']);

        // Get messages
        $response = $this->getJson(route('match.matches.messages', $pair->id));
        
        $response->assertStatus(200);
        $this->assertCount(1, $response->json());
        $this->assertEquals('Hello there!', $response->json()[0]['content']);
    }

    public function test_get_profile_returns_photo()
    {
        Storage::fake('public');
        $user = MatchUser::create([
            'email' => 'photo_get@example.com',
            'password' => 'secret123',
            'name' => 'Photo User Get',
            'age' => 20,
            'gender' => 'male',
            'interested_in' => 'female',
            'description' => 'Test'
        ]);
        
        $user->photos()->create(['url' => '/storage/test.jpg', 'order' => 0]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson(route('match.profile.show'));
        
        $response->assertStatus(200);
        $this->assertEquals('/storage/test.jpg', $response->json('photo'));
    }
}
