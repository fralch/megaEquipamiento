<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Match\MatchUser;
use App\Models\Match\MatchSwipe;
use App\Models\Match\MatchPair;

class MatchSwipeController extends Controller
{
    private function getCurrentUser()
    {
        return auth()->user();
    }

    public function getCandidates(Request $request)
    {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser) return response()->json(['message' => 'Unauthorized'], 401);
        
        // Get IDs of profiles already swiped
        $swipedIds = MatchSwipe::where('swiper_id', $currentUser->id)->pluck('swiped_id');
        
        $query = MatchUser::where('id', '!=', $currentUser->id)
            ->whereNotIn('id', $swipedIds)
            ->with('photos');

        // Apply gender preference
        if ($currentUser->interested_in !== 'everyone') {
            $query->where('gender', $currentUser->interested_in);
        }
        
        $candidates = $query->inRandomOrder()
            ->limit(20)
            ->get();
            
        return response()->json($candidates);
    }

    public function swipe(Request $request)
    {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser) return response()->json(['message' => 'Unauthorized'], 401);

        $request->validate([
            'swiped_profile_id' => 'required|exists:match_users,id',
            'type' => 'required|in:like,dislike,superlike'
        ]);
        
        $swipedId = $request->swiped_profile_id;
        $type = $request->type;
        
        // Prevent duplicate swipes
        if (MatchSwipe::where('swiper_id', $currentUser->id)->where('swiped_id', $swipedId)->exists()) {
             return response()->json(['message' => 'Already swiped'], 400);
        }

        // Record swipe
        try {
            MatchSwipe::create([
                'swiper_id' => $currentUser->id,
                'swiped_id' => $swipedId,
                'type' => $type
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error recording swipe'], 500);
        }
        
        $isMatch = false;
        
        // Check match logic
        if ($type === 'like' || $type === 'superlike') {
            // Check if they liked me
            $otherSwipe = MatchSwipe::where('swiper_id', $swipedId)
                ->where('swiped_id', $currentUser->id)
                ->whereIn('type', ['like', 'superlike'])
                ->first();
                
            if ($otherSwipe) {
                // IT'S A MATCH!
                $id1 = min($currentUser->id, $swipedId);
                $id2 = max($currentUser->id, $swipedId);
                
                MatchPair::firstOrCreate([
                    'user_1_id' => $id1,
                    'user_2_id' => $id2
                ]);
                
                $isMatch = true;
            }
        }
        
        return response()->json(['status' => 'success', 'match' => $isMatch]);
    }
}
