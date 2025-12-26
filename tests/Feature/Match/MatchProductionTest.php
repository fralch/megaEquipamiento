<?php

namespace Tests\Feature\Match;

use Tests\TestCase;
use Illuminate\Support\Facades\Http;

class MatchProductionTest extends TestCase
{
    // WARNING: This test runs against the PRODUCTION server.
    // It creates real users and data.
    
    protected $baseUrl = 'https://megaequipamiento.pe/match-api';

    public function test_production_full_flow()
    {
        // Skip this test if we are not explicitly running production tests
        // You can enable this by setting an env var or just commenting this out
        if (env('APP_ENV') !== 'production' && !env('RUN_PROD_TESTS')) {
            $this->markTestSkipped('Skipping production test. Set RUN_PROD_TESTS=true to run.');
        }

        // Unique suffix to avoid collisions
        $suffix = uniqid();

        // 1. Register User A (Male)
        $userAData = [
            'email' => 'prod_test_a_' . $suffix . '@example.com',
            'password' => 'password123',
            'name' => 'ProdTest User A ' . $suffix,
            'age' => 25,
            'gender' => 'male',
            'description' => 'Production Test User A - Auto Generated',
            'interested_in' => 'female',
            'instagram' => 'test_a_' . $suffix,
            'whatsapp' => '111111'
        ];
        
        $responseA = Http::post($this->baseUrl . '/register', $userAData);

        if ($responseA->status() !== 200) {
             dump($responseA->body());
        }
        $this->assertEquals(200, $responseA->status(), 'Failed to register User A');
        $dataA = $responseA->json();
        $this->assertArrayHasKey('token', $dataA);
        $tokenA = $dataA['token'];
        $idA = $dataA['user']['id'];
        
        echo "\nCreated User A: ID $idA (" . $dataA['user']['name'] . ")\n";

        // 2. Register User B (Female)
        $userBData = [
            'email' => 'prod_test_b_' . $suffix . '@example.com',
            'password' => 'password123',
            'name' => 'ProdTest User B ' . $suffix,
            'age' => 24,
            'gender' => 'female',
            'description' => 'Production Test User B - Auto Generated',
            'interested_in' => 'male',
            'instagram' => 'test_b_' . $suffix,
            'whatsapp' => '222222'
        ];

        $responseB = Http::post($this->baseUrl . '/register', $userBData);
        
        if ($responseB->status() !== 200) {
             dump($responseB->body());
        }
        $this->assertEquals(200, $responseB->status(), 'Failed to register User B');
        $dataB = $responseB->json();
        $this->assertArrayHasKey('token', $dataB);
        $tokenB = $dataB['token'];
        $idB = $dataB['user']['id'];

        echo "Created User B: ID $idB (" . $dataB['user']['name'] . ")\n";

        // 3. User A swipes User B (Like)
        $responseSwipeA = Http::withToken($tokenA)->post($this->baseUrl . '/swipe', [
            'swiped_profile_id' => $idB,
            'type' => 'like'
        ]);
        
        $this->assertEquals(200, $responseSwipeA->status(), 'User A failed to swipe B');
        $this->assertFalse($responseSwipeA->json()['match'], 'Should not match yet');
        echo "User A swiped User B (Like)\n";

        // 4. User B swipes User A (Like)
        $responseSwipeB = Http::withToken($tokenB)->post($this->baseUrl . '/swipe', [
            'swiped_profile_id' => $idA,
            'type' => 'like'
        ]);

        $this->assertEquals(200, $responseSwipeB->status(), 'User B failed to swipe A');
        $this->assertTrue($responseSwipeB->json()['match'], 'Should be a match now');
        echo "User B swiped User A (Like) -> MATCH!\n";

        // 5. Check Matches List for A
        $responseMatchesA = Http::withToken($tokenA)->get($this->baseUrl . '/matches');
        $this->assertEquals(200, $responseMatchesA->status());
        $matchesA = $responseMatchesA->json();
        
        $matchPairId = null;
        foreach ($matchesA as $m) {
            // Check if other_profile exists and matches B
            if (isset($m['other_profile']) && $m['other_profile']['id'] == $idB) {
                $matchPairId = $m['id'];
                break;
            }
        }
        
        $this->assertNotNull($matchPairId, 'Match with User B not found in User A matches list');
        echo "Match Pair ID: $matchPairId\n";

        // 6. Send Message from A to B
        $msgContent = "Hello from Prod Test " . $suffix;
        $responseMsg = Http::withToken($tokenA)->post($this->baseUrl . "/matches/{$matchPairId}/messages", [
            'content' => $msgContent
        ]);
        
        $this->assertEquals(200, $responseMsg->status(), 'Failed to send message');
        echo "Message sent from A to B\n";

        // 7. Get Messages for B
        $responseGetMsg = Http::withToken($tokenB)->get($this->baseUrl . "/matches/{$matchPairId}/messages");
        $this->assertEquals(200, $responseGetMsg->status());
        $messages = $responseGetMsg->json();
        
        $this->assertNotEmpty($messages);
        $lastMsg = end($messages);
        $this->assertEquals($msgContent, $lastMsg['content']);
        echo "Message received by B verified\n";
    }
}
