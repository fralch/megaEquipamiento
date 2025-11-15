<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class TranslationService
{
    public static function translateText(?string $text, string $to = 'es', string $from = 'auto'): string
    {
        $t = trim((string) $text);
        if ($t === '') return '';

        // Si el texto es muy corto o parece ser código/números, no traducir
        if (strlen($t) < 3 || preg_match('/^[\d\s\-\.\,]+$/', $t)) {
            return $t;
        }

        $cacheKey = 'translate:' . md5($from . '|' . $to . '|' . $t);
        $compute = function () use ($t, $to, $from) {
            try {
                $resp = Http::timeout(10)->retry(2, 100)->get('https://translate.googleapis.com/translate_a/single', [
                    'client' => 'gtx',
                    'sl' => $from,
                    'tl' => $to,
                    'dt' => 't',
                    'q' => $t,
                ]);

                if (!$resp->successful()) {
                    \Log::warning("Translation API failed with status {$resp->status()} for text: " . substr($t, 0, 50));
                    return $t;
                }

                $json = $resp->json();
                if (!is_array($json) || !isset($json[0])) {
                    \Log::warning("Translation API returned unexpected format for text: " . substr($t, 0, 50));
                    return $t;
                }

                $segments = $json[0];
                $out = '';
                foreach ($segments as $seg) {
                    if (is_array($seg) && isset($seg[0])) {
                        $out .= $seg[0];
                    }
                }
                return $out !== '' ? $out : $t;
            } catch (\Throwable $e) {
                \Log::error("Translation exception: " . $e->getMessage() . " for text: " . substr($t, 0, 50));
                return $t;
            }
        };

        try {
            return Cache::store('file')->remember($cacheKey, now()->addDays(7), $compute);
        } catch (\Throwable $e) {
            \Log::error("Cache error during translation: " . $e->getMessage());
            return $compute();
        }
    }

    public static function translateArray($items, string $to = 'es', string $from = 'auto'): array
    {
        if ($items === null) return [];
        if (is_string($items)) {
            return [self::translateText($items, $to, $from)];
        }
        if (!is_array($items)) return [];
        $out = [];
        foreach ($items as $item) {
            if (is_string($item)) {
                $out[] = self::translateText($item, $to, $from);
            } else {
                $out[] = $item;
            }
        }
        return $out;
    }

    public static function translateTables($tables, string $to = 'es', string $from = 'auto'): array
    {
        if ($tables === null) return [];
        if (!is_array($tables)) return [];
        $out = [];
        foreach ($tables as $table) {
            if (!is_array($table)) {
                $out[] = $table;
                continue;
            }
            $headers = isset($table['headers']) && is_array($table['headers'])
                ? array_map(function ($h) use ($to, $from) {
                    return is_string($h) ? self::translateText($h, $to, $from) : $h;
                }, $table['headers'])
                : (isset($table['headers']) ? $table['headers'] : []);
            $rows = isset($table['rows']) && is_array($table['rows'])
                ? array_map(function ($row) use ($to, $from) {
                    if (is_array($row)) {
                        return array_map(function ($cell) use ($to, $from) {
                            return is_string($cell) ? self::translateText($cell, $to, $from) : $cell;
                        }, $row);
                    }
                    return is_string($row) ? self::translateText($row, $to, $from) : $row;
                }, $table['rows'])
                : (isset($table['rows']) ? $table['rows'] : []);
            $out[] = [
                'headers' => $headers,
                'rows' => $rows,
            ];
        }
        return $out;
    }
}