<?php

namespace App\Http\Controllers\Match\Admin;

use App\Http\Controllers\Controller;
use App\Models\Match\MatchNotification;
use App\Models\Match\MatchPhoto;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MatchAdminPhotoModerationController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $photos = MatchPhoto::query()
            ->with('user:id,name')
            ->when($validated['status'] ?? 'pending', fn ($query, string $status) => $query->where('status', $status))
            ->latest()
            ->paginate($validated['per_page'] ?? 20);

        return response()->json([
            'data' => $photos->getCollection()->map(fn (MatchPhoto $photo): array => [
                'id' => (string) $photo->id,
                'user_id' => (string) $photo->match_user_id,
                'user_name' => $photo->user?->name,
                'url' => $photo->url,
                'status' => $photo->status,
                'created_at' => optional($photo->created_at)->toJSON(),
            ])->values(),
            'meta' => [
                'current_page' => $photos->currentPage(),
                'per_page' => $photos->perPage(),
                'total' => $photos->total(),
                'last_page' => $photos->lastPage(),
            ],
        ]);
    }

    public function approve(Request $request, int $photoId)
    {
        $photo = MatchPhoto::query()->findOrFail($photoId);

        $photo->forceFill([
            'status' => 'approved',
            'moderated_at' => now(),
            'moderation_reason' => null,
            'moderated_by' => $request->user()->id,
        ])->save();

        return response()->json([
            'id' => (string) $photo->id,
            'status' => $photo->status,
            'moderated_at' => optional($photo->moderated_at)->toJSON(),
            'message' => 'Foto aprobada correctamente',
        ]);
    }

    public function reject(Request $request, int $photoId)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $photo = MatchPhoto::query()->findOrFail($photoId);

        $photo->forceFill([
            'status' => 'rejected',
            'moderated_at' => now(),
            'moderation_reason' => $validated['reason'],
            'moderated_by' => $request->user()->id,
        ])->save();

        MatchNotification::send(
            $photo->match_user_id,
            'photo_rejected',
            'Tu foto fue rechazada',
            "Tu foto no fue aprobada. Motivo: {$validated['reason']}",
            ['photo_id' => $photo->id, 'reason' => $validated['reason']]
        );

        return response()->json([
            'id' => (string) $photo->id,
            'status' => $photo->status,
            'moderated_at' => optional($photo->moderated_at)->toJSON(),
            'message' => 'Foto rechazada correctamente',
        ]);
    }
}
