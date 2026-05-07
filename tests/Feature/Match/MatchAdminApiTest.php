<?php

namespace Tests\Feature\Match;

use App\Models\Match\MatchAdmin;
use App\Models\Match\MatchPair;
use App\Models\Match\MatchPhoto;
use App\Models\Match\MatchSetting;
use App\Models\Match\MatchUser;
use Tests\TestCase;

class MatchAdminApiTest extends TestCase
{
    protected function tearDown(): void
    {
        MatchPair::query()
            ->whereHas('user1', fn ($query) => $query->where('email', 'like', '%@admin-api-match.test'))
            ->orWhereHas('user2', fn ($query) => $query->where('email', 'like', '%@admin-api-match.test'))
            ->delete();
        MatchPhoto::query()->whereHas('user', fn ($query) => $query->where('email', 'like', '%@admin-api-match.test'))->delete();
        MatchUser::query()->where('email', 'like', '%@admin-api-match.test')->delete();
        MatchAdmin::query()
            ->where('email', 'like', '%@admin-api-match.test')
            ->orWhere('email', MatchAdmin::DEFAULT_EMAIL)
            ->delete();
        MatchSetting::query()->delete();

        parent::tearDown();
    }

    public function test_logs_in_the_single_match_admin(): void
    {
        $this->postJson('/admin-api-match/auth/login', [
            'email' => MatchAdmin::DEFAULT_EMAIL,
            'password' => MatchAdmin::DEFAULT_PASSWORD,
        ])
            ->assertOk()
            ->assertJsonStructure(['token', 'admin' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('admin.role', 'super_admin');
    }

    public function test_rejects_match_user_tokens_on_match_admin_endpoints(): void
    {
        $user = $this->matchUser();
        $token = $user->createToken('match-app-test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/admin-api-match/dashboard/stats')
            ->assertForbidden();
    }

    public function test_lists_and_bans_only_match_users(): void
    {
        $token = $this->matchAdminToken();
        $user = $this->matchUser([
            'name' => 'Juan Perez',
            'email' => 'juan@admin-api-match.test',
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/admin-api-match/users?search=juan&status=all')
            ->assertOk()
            ->assertJsonPath('data.0.email', 'juan@admin-api-match.test')
            ->assertJsonStructure(['data', 'meta']);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/admin-api-match/users/{$user->id}/ban", [
                'reason' => 'Incumplimiento de normas',
                'notes' => 'Detalle interno',
            ])
            ->assertOk()
            ->assertJsonPath('status', 'banned');

        $this->assertSame('banned', $user->fresh()->status);
    }

    public function test_unbans_match_users(): void
    {
        $token = $this->matchAdminToken();
        $user = $this->matchUser([
            'status' => 'banned',
            'banned_at' => now(),
            'ban_reason' => 'Test',
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/admin-api-match/users/{$user->id}/unban")
            ->assertOk()
            ->assertJsonPath('status', 'active');

        $user->refresh();

        $this->assertSame('active', $user->status);
        $this->assertNull($user->banned_at);
        $this->assertNull($user->ban_reason);
    }

    public function test_moderates_match_photos(): void
    {
        $token = $this->matchAdminToken();
        $user = $this->matchUser();
        $photo = MatchPhoto::create([
            'match_user_id' => $user->id,
            'url' => '/storage/match_photos/test.jpg',
            'order' => 0,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/admin-api-match/moderation/photos?status=pending')
            ->assertOk()
            ->assertJsonPath('data.0.status', 'pending');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/admin-api-match/moderation/photos/{$photo->id}/approve")
            ->assertOk()
            ->assertJsonPath('status', 'approved');

        $this->assertSame('approved', $photo->fresh()->status);
    }

    public function test_updates_match_settings_and_returns_dashboard_stats(): void
    {
        $token = $this->matchAdminToken();
        $userA = $this->matchUser(['email' => 'user-a@admin-api-match.test']);
        $userB = $this->matchUser(['email' => 'user-b@admin-api-match.test']);
        $existingMatches = MatchPair::query()->count();

        MatchPair::create(['user_1_id' => $userA->id, 'user_2_id' => $userB->id]);
        MatchSetting::current();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/admin-api-match/settings', [
                'discovery_default_radius_km' => 80,
                'daily_swipe_limit' => 150,
                'maintenance_mode' => true,
            ])
            ->assertOk()
            ->assertJsonPath('discovery_default_radius_km', 80)
            ->assertJsonPath('maintenance_mode', true);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/admin-api-match/dashboard/stats')
            ->assertOk()
            ->assertJsonPath('active_matches', $existingMatches + 1);
    }

    private function matchAdminToken(?MatchAdmin $admin = null): string
    {
        $admin ??= MatchAdmin::create([
            'name' => 'Match Admin',
            'email' => uniqid('admin-', true).'@admin-api-match.test',
            'password' => 'password123',
            'is_active' => true,
        ]);

        return $admin->createToken('admin-api-match-test')->plainTextToken;
    }

    private function matchUser(array $attributes = []): MatchUser
    {
        $adminOnlyAttributes = array_intersect_key($attributes, array_flip([
            'status',
            'banned_at',
            'ban_reason',
            'ban_notes',
            'last_active_at',
        ]));

        $user = MatchUser::create(array_merge([
            'name' => 'Match User',
            'email' => uniqid('user-', true).'@admin-api-match.test',
            'password' => 'password123',
            'age' => 25,
            'gender' => 'male',
            'interested_in' => 'female',
        ], array_diff_key($attributes, $adminOnlyAttributes)));

        if ($adminOnlyAttributes !== []) {
            $user->forceFill($adminOnlyAttributes)->save();
        }

        return $user;
    }
}
