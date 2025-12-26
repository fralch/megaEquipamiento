<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Match\MatchUser;
use Illuminate\Support\Facades\Storage;

class MatchProfileController extends Controller
{
    private function getCurrentUser()
    {
        return auth()->user();
    }

    public function show(Request $request)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $user->load('photos');
        return response()->json($user);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Please use /register to create an account'], 405);
    }

    public function update(Request $request)
    {
        $user = $this->getCurrentUser();
        if (!$user) return response()->json(['message' => 'User not found'], 404);
        
        $user->update($request->all());
        
        return response()->json($user);
    }

    public function uploadPhoto(Request $request)
    {
        $user = $this->getCurrentUser();
        if (!$user) return response()->json(['message' => 'User not found'], 404);
        
        $request->validate([
            'photo' => 'required|image|max:10240' 
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('match_photos', 'public');
            $photo = $user->photos()->create([
                'url' => '/storage/' . $path,
                'order' => $user->photos()->count()
            ]);
            return response()->json($photo);
        }
        
        return response()->json(['message' => 'No photo uploaded'], 400);
    }
}
