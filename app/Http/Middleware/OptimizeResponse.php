<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OptimizeResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Solo aplicar optimizaciones a respuestas HTML y JSON
        if ($this->shouldOptimize($response)) {
            $content = $response->getContent();
            
            // Minimizar HTML/JSON si no es debug mode
            if (!config('app.debug')) {
                $content = $this->minifyContent($content, $response);
            }

            // Agregar headers de cache para assets estáticos
            if ($request->is('build/*') || $request->is('storage/*')) {
                $response->header('Cache-Control', 'public, max-age=31536000, immutable');
                $response->header('Expires', now()->addYear()->toRfc7231String());
            }

            // Headers de seguridad y rendimiento
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
            $response->headers->set('X-XSS-Protection', '1; mode=block');
            
            $response->setContent($content);
        }

        return $response;
    }

    private function shouldOptimize(Response $response): bool
    {
        $contentType = $response->headers->get('content-type', '');
        return str_contains($contentType, 'text/html') || 
               str_contains($contentType, 'application/json');
    }

    private function minifyContent(string $content, Response $response): string
    {
        $contentType = $response->headers->get('content-type', '');
        
        if (str_contains($contentType, 'text/html')) {
            // Minificar HTML básico
            $content = preg_replace('/\s+/', ' ', $content);
            $content = preg_replace('/> </', '><', $content);
        }
        
        return $content;
    }
}