<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use App\Models\Match\MatchUser;
use App\Services\FirebaseNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class MatchTestNotificationController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:120'],
            'body' => ['nullable', 'string', 'max:255'],
        ]);

        $tokens = MatchUser::query()
            ->whereNotNull('fcm_token')
            ->where('fcm_token', '!=', '')
            ->distinct()
            ->pluck('fcm_token');

        if ($tokens->isEmpty()) {
            return response()->json([
                'status' => 'no_devices',
                'message' => 'No hay dispositivos registrados con fcm_token.',
                'devices_targeted' => 0,
                'sent' => 0,
                'failed' => 0,
            ]);
        }

        try {
            $firebase = app(FirebaseNotificationService::class);
        } catch (Throwable $exception) {
            \Illuminate\Support\Facades\Log::error('Error inicializando Firebase:', [
                'message' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'firebase_unavailable',
                'message' => 'No se pudo inicializar Firebase: ' . $exception->getMessage(),
                'devices_targeted' => $tokens->count(),
                'sent' => 0,
                'failed' => $tokens->count(),
                'error_detail' => $exception->getMessage(), // Added for debugging
            ], 500);
        }

        $title = $validated['title'] ?? 'Prueba de notificaciones';
        $body = $validated['body'] ?? 'Si ves esto, las notificaciones de la app de citas funcionan.';
        $testId = (string) Str::uuid();

        $sent = 0;
        $failed = 0;

        foreach ($tokens as $token) {
            $wasSent = $firebase->sendToToken($token, $title, $body, [
                'type' => 'test_notification',
                'test_id' => $testId,
                'sent_at' => now()->toIso8601String(),
            ]);

            $wasSent ? $sent++ : $failed++;
        }

        return response()->json([
            'status' => $failed === 0 ? 'success' : 'partial_failure',
            'message' => 'Notificacion de prueba enviada a los dispositivos registrados.',
            'test_id' => $testId,
            'devices_targeted' => $tokens->count(),
            'sent' => $sent,
            'failed' => $failed,
        ]);
    }
}
