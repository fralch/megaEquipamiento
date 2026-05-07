<?php

namespace App\Http\Controllers\Match\Admin;

use App\Http\Controllers\Controller;
use App\Models\Match\MatchUser;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MatchAdminUserController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['active', 'banned', 'inactive', 'all'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $users = MatchUser::query()
            ->when($validated['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(($validated['status'] ?? 'all') !== 'all', function ($query) use ($validated): void {
                $query->where('status', $validated['status']);
            })
            ->latest()
            ->paginate($validated['per_page'] ?? 20);

        return response()->json([
            'data' => $users->getCollection()->map(fn (MatchUser $user): array => $this->summary($user))->values(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function show(int $userId)
    {
        $user = MatchUser::query()
            ->withCount('photos')
            ->findOrFail($userId);

        $matchesCount = $user->matches()->count();

        return response()->json([
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'bio' => $user->description,
            'phone' => $user->whatsapp,
            'photos_count' => $user->photos_count,
            'matches_count' => $matchesCount,
            'reports_count' => 0,
            'created_at' => optional($user->created_at)->toJSON(),
            'last_active_at' => optional($user->last_active_at)->toJSON(),
        ]);
    }

    public function ban(Request $request, int $userId)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = MatchUser::query()->findOrFail($userId);

        $user->forceFill([
            'status' => 'banned',
            'banned_at' => now(),
            'ban_reason' => $validated['reason'],
            'ban_notes' => $validated['notes'] ?? null,
        ])->save();

        $user->tokens()->delete();

        return response()->json([
            'id' => (string) $user->id,
            'status' => $user->status,
            'banned_at' => optional($user->banned_at)->toJSON(),
            'message' => 'Usuario baneado correctamente',
        ]);
    }

    public function unban(int $userId)
    {
        $user = MatchUser::query()->findOrFail($userId);

        $user->forceFill([
            'status' => 'active',
            'banned_at' => null,
            'ban_reason' => null,
            'ban_notes' => null,
        ])->save();

        return response()->json([
            'id' => (string) $user->id,
            'status' => $user->status,
            'message' => 'Usuario reactivado correctamente',
        ]);
    }

    private function summary(MatchUser $user): array
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'created_at' => optional($user->created_at)->toJSON(),
            'last_active_at' => optional($user->last_active_at)->toJSON(),
        ];
    }
}
