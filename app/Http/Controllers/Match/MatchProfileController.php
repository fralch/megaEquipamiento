<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Match\MatchUser;
use Illuminate\Support\Facades\Storage;

class MatchProfileController extends Controller
{
    // Helper to get current MatchUser from request
    // Since we don't have auth, we expect ?user_id=X
    private function getCurrentUser()
    {
        $id = request('user_id');
        if (!$id) return null;
        return MatchUser::find($id);
    }

    public function show(Request $request)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['message' => 'User not found or user_id missing', 'exists' => false], 404);
        }
        
        $user->load('photos');
        $user->exists = true; 
        return response()->json($user);
    }

    public function store(Request $request)
    {
        // Validation simplified as requested
        $data = $request->validate([
            'age' => 'required|integer|min:18',
            'gender' => 'required|string',
            'description' => 'nullable|string',
            'interested_in' => 'required|string',
            'instagram' => 'nullable|string', 
            'whatsapp' => 'nullable|string',
            // Optional fields not strictly in list but good to have
            'name' => 'nullable|string', 
        ]);

        // Logic to update if exists (if user_id provided) or create new
        if ($request->has('user_id')) {
             $user = MatchUser::find($request->user_id);
             if ($user) {
                 $user->update($data);
                 return response()->json($user);
             }
        }
        
        // Create new
        $user = MatchUser::create($data);
        return response()->json($user);
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
