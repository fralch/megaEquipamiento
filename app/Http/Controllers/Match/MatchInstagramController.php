<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MatchInstagramController extends Controller
{
    public function getProfilePicture(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
        ]);

        $username = $request->input('username');
        $url = "https://www.instagram.com/{$username}/";

        try {
            // Using a mobile User-Agent seems to yield better results for public profiles
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language' => 'en-US,en;q=0.5',
            ])->get($url);

            if ($response->successful()) {
                $html = $response->body();

                // 1. Try og:image meta tag
                if (preg_match('/<meta property="og:image" content="([^"]+)"/i', $html, $matches)) {
                    return response()->json([
                        'username' => $username,
                        'profile_picture_url' => html_entity_decode($matches[1])
                    ]);
                }
                
                // 2. Try searching for profile_pic_url in JSON blobs
                if (preg_match('/"profile_pic_url":"([^"]+)"/i', $html, $matches)) {
                    // The URL in JSON might be escaped, e.g. \/ instead of /
                    $jsonUrl = '"' . $matches[1] . '"';
                    $decodedUrl = json_decode($jsonUrl);
                    if ($decodedUrl) {
                        return response()->json([
                            'username' => $username,
                            'profile_picture_url' => $decodedUrl
                        ]);
                    }
                }

                return response()->json([
                    'message' => 'Profile picture not found. The profile might be private or Instagram structure changed.',
                    'username' => $username
                ], 404);
            } else {
                Log::warning("Instagram fetch failed for user {$username}: " . $response->status());
                return response()->json([
                    'message' => 'Failed to fetch Instagram profile.',
                    'status' => $response->status()
                ], $response->status());
            }

        } catch (\Exception $e) {
            Log::error("Instagram fetch error: " . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching the profile picture.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
