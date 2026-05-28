<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use App\Models\Match\MatchNotification;
use App\Models\Match\MatchPair;
use App\Models\Match\MatchSwipe;
use App\Models\Match\MatchUser;
use App\Services\FirebaseNotificationService;
use Illuminate\Http\Request;
use Throwable;

class MatchSwipeController extends Controller
{
    private function getCurrentUser()
    {
        return auth()->user();
    }

    private function sendPushNotification(MatchUser $user, string $title, string $body, array $data): void
    {
        if ($user->fcm_token) {
            try {
                app(FirebaseNotificationService::class)->sendToToken(
                    $user->fcm_token,
                    $title,
                    $body,
                    $data
                );
            } catch (Throwable $exception) {
                \Illuminate\Support\Facades\Log::error('Firebase notification failed', [
                    'match_user_id' => $user->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }
    }

    public function getCandidates(Request $request)
    {
        $currentUser = $this->getCurrentUser();
        if (! $currentUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $swipedIds = MatchSwipe::where('swiper_id', $currentUser->id)->pluck('swiped_id');

        $query = MatchUser::where('id', '!=', $currentUser->id)
            ->whereNotIn('id', $swipedIds)
            ->with('photos');

        if ($currentUser->interested_in !== 'everyone') {
            $query->where('gender', $currentUser->interested_in);
        }

        if ($currentUser->latitude && $currentUser->longitude) {
            $lat = $currentUser->latitude;
            $lng = $currentUser->longitude;
            $radius = $request->query('radius', 50);

            $query->selectRaw('*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance', [$lat, $lng, $lat])
                ->having('distance', '<=', $radius)
                ->orderBy('distance', 'asc');
        } else {
            $query->inRandomOrder();
        }

        $candidates = $query->limit(20)->get();

        return response()->json($candidates);
    }

    public function swipe(Request $request)
    {
        $currentUser = $this->getCurrentUser();
        if (! $currentUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'swiped_profile_id' => 'required|exists:match_users,id',
            'type' => 'required|in:like,dislike,superlike',
        ]);

        $swipedId = $request->swiped_profile_id;
        $type = $request->type;

        if ($currentUser->id === (int) $swipedId) {
            return response()->json(['message' => 'Cannot swipe on yourself'], 400);
        }

        if (MatchSwipe::where('swiper_id', $currentUser->id)->where('swiped_id', $swipedId)->exists()) {
            return response()->json(['message' => 'Already swiped'], 400);
        }

        $targetUser = MatchUser::find($swipedId);
        if (! $targetUser) {
            return response()->json(['message' => 'User not found'], 404);
        }

        try {
            MatchSwipe::create([
                'swiper_id' => $currentUser->id,
                'swiped_id' => $swipedId,
                'type' => $type,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error recording swipe'], 500);
        }

        $isMatch = false;

        if ($type === 'superlike') {
            MatchNotification::send(
                $swipedId,
                'superlike_received',
                '¡Nuevo Superlike!',
                'Alguien te hizo superlike. ¡Apurate a ver quién es!',
                ['swiper_id' => $currentUser->id]
            );
            $this->sendPushNotification(
                $targetUser,
                '¡Nuevo Superlike!',
                'Alguien te hizo superlike. ¡Apurate a ver quién es!',
                ['type' => 'superlike_received', 'swiper_id' => (string) $currentUser->id]
            );
        } elseif ($type === 'like') {
            MatchNotification::send(
                $swipedId,
                'like_received',
                '¡Nuevo Like!',
                'Alguien te dio like. Si también te gusta, ¡será match!',
                ['swiper_id' => $currentUser->id]
            );
            $this->sendPushNotification(
                $targetUser,
                '¡Nuevo Like!',
                'Alguien te dio like. Si también te gusta, ¡será match!',
                ['type' => 'like_received', 'swiper_id' => (string) $currentUser->id]
            );
        }

        if ($type === 'like' || $type === 'superlike') {
            $otherSwipe = MatchSwipe::where('swiper_id', $swipedId)
                ->where('swiped_id', $currentUser->id)
                ->whereIn('type', ['like', 'superlike'])
                ->first();

            if ($otherSwipe) {
                $id1 = min($currentUser->id, $swipedId);
                $id2 = max($currentUser->id, $swipedId);

                MatchPair::firstOrCreate([
                    'user_1_id' => $id1,
                    'user_2_id' => $id2,
                ]);

                $isMatch = true;

                MatchNotification::send($currentUser->id, 'match', '¡Nuevo Match!', "Has hecho match con {$targetUser->name}", ['match_user_id' => $targetUser->id]);
                MatchNotification::send($targetUser->id, 'match', '¡Nuevo Match!', "Has hecho match con {$currentUser->name}", ['match_user_id' => $currentUser->id]);

                $this->sendPushNotification(
                    $targetUser,
                    '¡Nuevo Match!',
                    "¡{$currentUser->name} también te dio like!",
                    ['type' => 'match_created', 'match_user_id' => (string) $currentUser->id]
                );
                $this->sendPushNotification(
                    $currentUser,
                    '¡Nuevo Match!',
                    "¡{$targetUser->name} también te dio like!",
                    ['type' => 'match_created', 'match_user_id' => (string) $targetUser->id]
                );
            }
        }

        return response()->json(['status' => 'success', 'match' => $isMatch]);
    }
}
