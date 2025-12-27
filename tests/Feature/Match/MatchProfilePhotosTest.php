<?php

namespace Tests\Feature\Match;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Match\MatchUser;
use App\Models\Match\MatchPhoto;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;

class MatchProfilePhotosTest extends TestCase
{
    // Since existing tests use manual truncation instead of RefreshDatabase, 
    // I will follow the pattern from MatchFeatureTest.php to avoid issues.
    protected function setUp(): void
    {
        parent::setUp();
        
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        MatchPhoto::truncate();
        MatchUser::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    }

    public function test_can_view_own_profile_with_photos()
    {
        // 1. Create User
        $user = MatchUser::create([
            'email' => 'photos_test@example.com',
            'password' => 'secret123',
            'name' => 'Photo Test User',
            'age' => 25,
            'gender' => 'female',
            'interested_in' => 'male',
            'description' => 'Testing photos',
            'instagram' => 'test_gram',
            'whatsapp' => '123456789'
        ]);

        // 2. Create Photos
        $photo1 = $user->photos()->create([
            'url' => '/storage/match_photos/photo1.jpg',
            'order' => 0
        ]);
        
        $photo2 = $user->photos()->create([
            'url' => '/storage/match_photos/photo2.jpg',
            'order' => 1
        ]);

        // 3. Authenticate
        Sanctum::actingAs($user, ['*']);

        // 4. Call Endpoint
        $response = $this->getJson(route('match.profile.show'));

        // 5. Assertions
        $response->assertStatus(200);
        
        $response->assertJson([
            'id' => $user->id,
            'name' => 'Photo Test User',
            'email' => 'photos_test@example.com',
            'photos' => [
                [
                    'id' => $photo1->id,
                    'url' => '/storage/match_photos/photo1.jpg',
                    'order' => 0
                ],
                [
                    'id' => $photo2->id,
                    'url' => '/storage/match_photos/photo2.jpg',
                    'order' => 1
                ]
            ]
        ]);
        
        // Ensure structure is exact
        $response->assertJsonCount(2, 'photos');
    }

    public function test_upload_photo_returns_correct_structure()
    {
        Storage::fake('public');
        
        $user = MatchUser::create([
            'email' => 'uploader@example.com',
            'password' => 'secret123',
            'name' => 'Uploader',
            'age' => 30,
            'gender' => 'male',
            'interested_in' => 'female'
        ]);

        Sanctum::actingAs($user, ['*']);

        $file = UploadedFile::fake()->image('my_photo.jpg');

        $response = $this->postJson(route('match.profile.photo'), [
            'photo' => $file
        ]);

        $response->assertStatus(200);
        
        // Assert response has photo fields
        $response->assertJsonStructure([
            'id',
            'match_user_id',
            'url',
            'order',
            'created_at',
            'updated_at'
        ]);

        // Assert database
        $this->assertDatabaseHas('match_photos', [
            'match_user_id' => $user->id,
            // We don't check exact URL as it contains hash
        ]);
        
        // Verify user relationship immediately reflects changes
        // (Though in a real app, client would likely reload profile)
        $this->assertEquals(1, $user->fresh()->photos()->count());
    }
}
