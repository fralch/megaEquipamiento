<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        
        <!-- SEO Meta Tags -->
        @if(isset($page['props']['seo']))
            <title>{{ $page['props']['seo']['title'] }}</title>
            <meta name="description" content="{{ $page['props']['seo']['description'] }}">
            <meta name="keywords" content="{{ $page['props']['seo']['keywords'] }}">
            
            <!-- Open Graph / Facebook -->
            <meta property="og:type" content="{{ $page['props']['seo']['type'] }}">
            <meta property="og:url" content="{{ $page['props']['seo']['url'] }}">
            <meta property="og:title" content="{{ $page['props']['seo']['title'] }}">
            <meta property="og:description" content="{{ $page['props']['seo']['description'] }}">
            <meta property="og:image" content="{{ $page['props']['seo']['image'] }}">
            <meta property="og:site_name" content="MegaEquipamiento">
            <meta property="og:locale" content="es_PE">
            
            <!-- Twitter -->
            <meta property="twitter:card" content="summary_large_image">
            <meta property="twitter:url" content="{{ $page['props']['seo']['url'] }}">
            <meta property="twitter:title" content="{{ $page['props']['seo']['title'] }}">
            <meta property="twitter:description" content="{{ $page['props']['seo']['description'] }}">
            <meta property="twitter:image" content="{{ $page['props']['seo']['image'] }}">
        @else
            <title inertia>{{ config('app.name') }}</title>
            <meta name="description" content="Encuentra los mejores equipos de laboratorio, instrumentos científicos y suministros para tu laboratorio. Calidad garantizada y envío a todo el país.">
            <meta name="keywords" content="equipos laboratorio, instrumentos científicos, suministros laboratorio, equipamiento médico">
        @endif
        
        <!-- Canonical URL -->
        <link rel="canonical" href="{{ request()->url() }}">
        
        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="apple-touch-icon" href="{{ asset('img/logo2.png') }}">
        
        <!-- Robots -->
        <meta name="robots" content="index, follow">
        <meta name="googlebot" content="index, follow">
        
        <!-- Google Site Verification -->
        <meta name="google-site-verification" content="HQUWgHksZ__OtAxWHg5vQ_URrg9g1Ub5lSQIakNWb00" />
        
        <!-- Language and Region -->
        <meta name="language" content="Spanish">
        <meta name="geo.region" content="PE">
        <meta name="geo.country" content="Peru">
        
        <!-- Schema.org structured data -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MegaEquipamiento",
            "url": "{{ url('/') }}",
            "logo": "{{ asset('img/logo2.png') }}",
            "description": "Líder en equipos de laboratorio en Perú. Amplio catálogo de instrumentos científicos, equipamiento médico y suministros para laboratorios.",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "PE"
            },
            "sameAs": [
                "{{ url('/') }}"
            ]
        }
        </script>

        <!-- DNS Prefetch y Preconnect para recursos externos -->
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link rel="dns-prefetch" href="https://www.youtube.com">
        <link rel="dns-prefetch" href="https://megaequipamiento.com">
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>

        <!-- Preload imágenes críticas del slider -->
        <link rel="preload" as="image" href="{{ asset('img/slider-img1.webp') }}" type="image/webp" fetchpriority="high">
        <link rel="preload" as="image" href="{{ asset('img/logo2.jpg') }}" type="image/jpeg">

        <!-- Fonts con display=swap para evitar FOIT -->
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
