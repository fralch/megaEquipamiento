<?php

namespace App\Services;

class TranslationService
{
    public static function translateText(?string $text, string $to = 'es', string $from = 'auto'): string
    {
        return (string) ($text ?? '');
    }

    public static function translateArray($items, string $to = 'es', string $from = 'auto'): array
    {
        if ($items === null) return [];
        if (is_string($items)) return [$items];
        if (!is_array($items)) return [];
        return $items;
    }

    public static function translateTables($tables, string $to = 'es', string $from = 'auto'): array
    {
        if ($tables === null) return [];
        if (!is_array($tables)) return [];
        return $tables;
    }
}