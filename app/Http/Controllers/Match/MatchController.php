<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Match\MatchUser;
use App\Models\Match\MatchPair;
use App\Models\Match\MatchMessage;

class MatchController extends Controller
{
    private function getCurrentUser()
    {
        return auth()->user();
    }

    public function index()
    {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser) return response()->json(['message' => 'Unauthorized'], 401);
        
        // Find pairs where I am p1 or p2
        $matches = MatchPair::where(function($q) use ($currentUser) {
                $q->where('user_1_id', $currentUser->id)
                  ->orWhere('user_2_id', $currentUser->id);
            })
            ->with(['user1.photos', 'user2.photos'])
            ->with(['messages' => function($q) {
                $q->latest()->limit(1);
            }])
            ->get()
            ->map(function($pair) use ($currentUser) {
                $other = $pair->user_1_id === $currentUser->id ? $pair->user2 : $pair->user1;
                
                if($other) {
                    $other->photo = $other->photos->first() ? $other->photos->first()->url : null;
                    $pair->other_profile = $other;
                }
                
                unset($pair->user1);
                unset($pair->user2);
                return $pair;
            });
            
        return response()->json($matches);
    }

    public function getMatchProfile($id)
    {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser) return response()->json(['message' => 'Unauthorized'], 401);

        $pair = MatchPair::with(['user1.photos', 'user2.photos'])->findOrFail($id);
        
        if ($pair->user_1_id !== $currentUser->id && $pair->user_2_id !== $currentUser->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $otherProfile = $pair->user_1_id === $currentUser->id ? $pair->user2 : $pair->user1;
        
        return response()->json($otherProfile);
    }

    public function getMessages($id)
    {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser) return response()->json(['message' => 'User required'], 400);

        $pair = MatchPair::findOrFail($id);
        
        if ($pair->user_1_id !== $currentUser->id && $pair->user_2_id !== $currentUser->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $messages = $pair->messages()->orderBy('created_at', 'asc')->get();
        
        return response()->json($messages);
    }

    public function sendMessage(Request $request, $id)
    {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser) return response()->json(['message' => 'User required'], 400);
        
        $pair = MatchPair::findOrFail($id);
        
        if ($pair->user_1_id !== $currentUser->id && $pair->user_2_id !== $currentUser->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $request->validate(['content' => 'required|string']);
        
        $msg = $pair->messages()->create([
            'sender_id' => $currentUser->id,
            'content' => $request->content,
            'is_read' => false
        ]);
        
        return response()->json($msg);
    }
}
