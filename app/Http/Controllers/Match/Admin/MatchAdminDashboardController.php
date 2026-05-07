<?php

namespace App\Http\Controllers\Match\Admin;

use App\Http\Controllers\Controller;
use App\Models\Match\MatchPair;
use App\Models\Match\MatchPhoto;
use App\Models\Match\MatchUser;

class MatchAdminDashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_users' => MatchUser::query()->count(),
            'active_matches' => MatchPair::query()->count(),
            'pending_reports' => 0,
            'pending_photos' => MatchPhoto::query()->where('status', 'pending')->count(),
            'banned_users' => MatchUser::query()->where('status', 'banned')->count(),
        ]);
    }
}
