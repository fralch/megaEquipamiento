<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SitemapController extends Controller
{
    public function show()
    {
        $sitemapPath = public_path('sitemap.xml');
        
        if (!file_exists($sitemapPath)) {
            abort(404, 'Sitemap not found');
        }
        
        return response()->file($sitemapPath, [
            'Content-Type' => 'application/xml'
        ]);
    }
}