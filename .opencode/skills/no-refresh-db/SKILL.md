---
name: no-refresh-db
description: Use when writing or modifying tests. This project MUST NEVER use RefreshDatabase or migrate:fresh because the dev database contains real data. Tests run against the live MySQL DB. Do NOT add RefreshDatabase, DatabaseMigrations, or call artisan migrate:fresh in tests.
---

# No Refresh Database

## Regla absoluta

**JAMÁS** uses `RefreshDatabase`, `DatabaseMigrations` ni ejecutes `php artisan migrate:fresh` en este proyecto. La base de datos de desarrollo contiene datos reales que NO deben borrarse.

## Contexto

- `tests/Pest.php` ya aplica `RefreshDatabase` solo a tests en `Feature/`, pero `phpunit.xml` tiene las líneas de SQLite-in-memory COMENTADAS.
- Los tests corren contra la conexión real de MySQL definida en `.env`.
- Cualquier test que use `RefreshDatabase` o `migrate:fresh` **borrará datos reales**.

## Qué hacer al escribir tests

- **NUNCA** agregues `use RefreshDatabase;` ni `use DatabaseMigrations;` en archivos de test.
- Usa `Illuminate\Foundation\Testing\RefreshDatabase` solo si estás absolutamente seguro de que hay una base de datos SQLite en memoria configurada. Si no, NO lo uses.
- Si necesitas limpiar datos después de un test, hazlo manualmente eliminando los registros creados en el test.
- Usa `Cache::flush()` si necesitas limpiar caché entre tests (como ya se hace en `ProductoImportTest`).
- Si un test necesita una base de datos limpia, configura `DB_CONNECTION=sqlite` y `DB_DATABASE=:memory:` en el bloque `<env>` de `phpunit.xml` **primero**, y confirma con el usuario antes de hacerlo.
- Si necesitas crear datos de prueba, usa `Model::create()` o `Model::factory()->create()` dentro del test y elimínalos al terminar.

## Qué NO hacer

- ❌ `php artisan migrate:fresh`
- ❌ `php artisan db:wipe`
- ❌ Agregar `RefreshDatabase` en cualquier archivo de test nuevo
- ❌ Agregar `DatabaseMigrations` en cualquier archivo de test nuevo
- ❌ Ejecutar seeders que borren datos existentes (`db:seed --force` sin `--class` específica)
- ❌ Cambiar `DB_CONNECTION` en `.env` a `sqlite` sin advertir al usuario
