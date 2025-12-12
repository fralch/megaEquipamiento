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

class MatchFeatureTest extends TestCase
{
    // use RefreshDatabase; // Removed to avoid running all project migrations
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Manually migrate only the match module tables
        $this->artisan('migrate', [
             '--path' => 'database/migrations/2025_12_12_000000_create_match_users_table.php',
             '--realpath' => true,
        ]);

        // Cleanup tables from previous runs
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        MatchMessage::truncate();
        MatchPair::truncate();
        MatchSwipe::truncate();
        MatchPhoto::truncate();
        MatchUser::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    }

    public function test_can_create_match_profile()
    {
        $response = $this->postJson(route('match.profile.store'), [
            'name' => 'John Doe',
            'age' => 25,
            'gender' => 'male',
            'description' => 'A test user',
            'interested_in' => 'female',
            'instagram' => 'john_doe',
            'whatsapp' => '123456789'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'name', 'age']); 

        $this->assertDatabaseHas('match_users', [
            'name' => 'John Doe',
            'gender' => 'male'
        ]);
    }

    public function test_can_update_profile()
    {
        $user = MatchUser::create([
            'name' => 'Jane Doe',
            'age' => 22,
            'gender' => 'female',
            'interested_in' => 'male',
            'description' => 'Original'
        ]);

        $response = $this->patchJson(route('match.profile.update') . '?user_id=' . $user->id, [
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
            'name' => 'Photo User',
            'age' => 20,
            'gender' => 'male',
            'interested_in' => 'female',
            'description' => 'Test'
        ]);

        $file = UploadedFile::fake()->image('profile.jpg');

        $response = $this->postJson(route('match.profile.photo') . '?user_id=' . $user->id, [
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
        $me = MatchUser::create(['name' => 'Me', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);
        
        // Candidate 1: Female (Should show)
        $c1 = MatchUser::create(['name' => 'C1', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);
        
        // Candidate 2: Male (Should NOT show based on gender preference)
        $c2 = MatchUser::create(['name' => 'C2', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);

        // Candidate 3: Female, but already swiped (Should NOT show)
        $c3 = MatchUser::create(['name' => 'C3', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);
        MatchSwipe::create(['swiper_id' => $me->id, 'swiped_id' => $c3->id, 'type' => 'dislike']);

        // Candidate 4: Female, not swiped (Should show) - Adding another to be sure
        $c4 = MatchUser::create(['name' => 'C4', 'age' => 22, 'gender' => 'female', 'interested_in' => 'male']);

        $response = $this->getJson(route('match.candidates') . '?user_id=' . $me->id);

        $response->assertStatus(200);
        $data = $response->json();
        
        // We expect C1 and C4
        $ids = collect($data)->pluck('id')->sort()->values()->all();
        $expected = collect([$c1->id, $c4->id])->sort()->values()->all();
        
        $this->assertEquals($expected, $ids);
    }

    public function test_swipe_creates_match_if_reciprocal()
    {
        $me = MatchUser::create(['name' => 'Me', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);
        $her = MatchUser::create(['name' => 'Her', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);

        // She likes me first
        MatchSwipe::create(['swiper_id' => $her->id, 'swiped_id' => $me->id, 'type' => 'like']);

        // I like her back
        $response = $this->postJson(route('match.swipe') . '?user_id=' . $me->id, [
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
        $me = MatchUser::create(['name' => 'Me', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);
        $her = MatchUser::create(['name' => 'Her', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);

        // I like her, she hasn't swiped yet
        $response = $this->postJson(route('match.swipe') . '?user_id=' . $me->id, [
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
        $me = MatchUser::create(['name' => 'Me', 'age' => 20, 'gender' => 'male', 'interested_in' => 'female']);
        $her = MatchUser::create(['name' => 'Her', 'age' => 20, 'gender' => 'female', 'interested_in' => 'male']);
        
        $pair = MatchPair::create([
            'user_1_id' => min($me->id, $her->id),
            'user_2_id' => max($me->id, $her->id)
        ]);

        // Send message
        $response = $this->postJson(route('match.matches.send', $pair->id) . '?user_id=' . $me->id, [
            'content' => 'Hello there!'
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('match_messages', [
            'match_pair_id' => $pair->id,
            'sender_id' => $me->id,
            'content' => 'Hello there!'
        ]);

        // Get messages
        $response = $this->getJson(route('match.matches.messages', $pair->id) . '?user_id=' . $her->id);
        
        $response->assertStatus(200);
        $this->assertCount(1, $response->json());
        $this->assertEquals('Hello there!', $response->json()[0]['content']);
    }
}
