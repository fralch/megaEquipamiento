<?php

namespace App\Http\Controllers;

class SitemapController extends Controller
{
    public function show()
    {
        $sitemapPath = public_path('sitemap.xml');

        if (! file_exists($sitemapPath)) {
            abort(404, 'Sitemap not found');
        }

        return response()->file($sitemapPath, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
