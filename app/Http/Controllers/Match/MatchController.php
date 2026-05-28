<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use App\Models\Match\MatchNotification;
use App\Models\Match\MatchPair;
use App\Models\Match\MatchUser;
use App\Services\FirebaseNotificationService;
use Illuminate\Http\Request;
use Throwable;

class MatchController extends Controller
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

    public function index()
    {
        $currentUser = $this->getCurrentUser();
        if (! $currentUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $matches = MatchPair::where(function ($q) use ($currentUser) {
            $q->where('user_1_id', $currentUser->id)
                ->orWhere('user_2_id', $currentUser->id);
        })
            ->with(['user1.photos', 'user2.photos'])
            ->with(['messages' => function ($q) {
                $q->latest()->limit(1);
            }])
            ->get()
            ->map(function ($pair) use ($currentUser) {
                $other = $pair->user_1_id === $currentUser->id ? $pair->user2 : $pair->user1;

                if ($other) {
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
        if (! $currentUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

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
        if (! $currentUser) {
            return response()->json(['message' => 'User required'], 400);
        }

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
        if (! $currentUser) {
            return response()->json(['message' => 'User required'], 400);
        }

        $pair = MatchPair::findOrFail($id);

        if ($pair->user_1_id !== $currentUser->id && $pair->user_2_id !== $currentUser->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['content' => 'required|string']);

        $msg = $pair->messages()->create([
            'sender_id' => $currentUser->id,
            'content' => $request->content,
            'is_read' => false,
        ]);

        $recipientId = $pair->user_1_id === $currentUser->id ? $pair->user_2_id : $pair->user_1_id;
        $recipient = MatchUser::find($recipientId);

        MatchNotification::send($recipientId, 'message', 'Nuevo mensaje', "{$currentUser->name} te envió un mensaje", [
            'match_pair_id' => $pair->id,
            'sender_id' => $currentUser->id,
        ]);

        if ($recipient) {
            $this->sendPushNotification(
                $recipient,
                'Nuevo mensaje',
                "{$currentUser->name}: ".substr($request->content, 0, 50),
                ['type' => 'message_received', 'match_pair_id' => (string) $pair->id, 'sender_id' => (string) $currentUser->id]
            );
        }

        return response()->json($msg);
    }
}
