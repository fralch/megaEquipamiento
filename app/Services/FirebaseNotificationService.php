<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Illuminate\Support\Facades\Log;

class FirebaseNotificationService
{
    private $messaging;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount(base_path(env('FIREBASE_CREDENTIALS')));
        $this->messaging = $factory->createMessaging();
    }

    public function sendToToken(string $token, string $title, string $body, array $data = []): bool
    {
        try {
            $message = CloudMessage::withTarget('token', $token)
                ->withNotification([
                    'title' => $title,
                    'body' => $body,
                ])
                ->withData($data);

            $this->messaging->send($message);

            Log::info('Firebase notification sent', ['token' => substr($token, 0, 20) . '...', 'title' => $title]);
            return true;
        } catch (\Exception $e) {
            Log::error('Firebase notification failed', ['error' => $e->getMessage(), 'token' => substr($token, 0, 20) . '...']);
            return false;
        }
    }
}