<?php

namespace App\Http\Controllers\Match\Admin;

use App\Http\Controllers\Controller;
use App\Models\Match\MatchSetting;
use Illuminate\Http\Request;

class MatchAdminSettingsController extends Controller
{
    public function show()
    {
        return response()->json($this->payload(MatchSetting::current()));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'discovery_default_radius_km' => ['required', 'integer', 'min:1', 'max:500'],
            'daily_swipe_limit' => ['required', 'integer', 'min:1', 'max:10000'],
            'maintenance_mode' => ['required', 'boolean'],
        ]);

        $settings = MatchSetting::current();
        $settings->update($validated);

        return response()->json([
            ...$this->payload($settings),
            'message' => 'Configuracion actualizada correctamente',
        ]);
    }

    private function payload(MatchSetting $settings): array
    {
        return [
            'discovery_default_radius_km' => $settings->discovery_default_radius_km,
            'daily_swipe_limit' => $settings->daily_swipe_limit,
            'maintenance_mode' => $settings->maintenance_mode,
        ];
    }
}
