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

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'age' => $user->age,
            'gender' => $user->gender,
            'description' => $user->description,
            'interested_in' => $user->interested_in,
            'instagram' => $user->instagram,
            'whatsapp' => $user->whatsapp,
            'latitude' => $user->latitude,
            'longitude' => $user->longitude,
            'city' => $user->city,
            'photos' => $user->photos,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Please use /register to create an account'], 405);
    }

    public function update(Request $request)
    {
        $user = $this->getCurrentUser();
        if (!$user) return response()->json(['message' => 'User not found'], 404);
        
        $request->validate([
            'name' => 'nullable|string',
            'age' => 'nullable|integer|min:18',
            'gender' => 'nullable|string',
            'interested_in' => 'nullable|string',
            'description' => 'nullable|string',
            'instagram' => 'nullable|string',
            'whatsapp' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'city' => 'nullable|string',
            'fcm_token' => 'nullable|string',
        ]);

        $user->update($request->all());
        
        return response()->json($user);
    }

    public function getNotifications()
    {
        $user = $this->getCurrentUser();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $notifications = $user->notifications;

        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $user = $this->getCurrentUser();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $notification = $user->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->update(['is_read' => true]);
        }

        return response()->json(['status' => 'success']);
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
