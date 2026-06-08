# AGENTS.md

## Stack
- Laravel 11 (PHP 8.2) + Inertia.js + React 18 + Vite 5
- MySQL primary DB; Sanctum (API) + Breeze (auth scaffolding present, but custom `AuthController` in `app/Http/Controllers/AuthController.php` handles the main web login/register/logout — see routes/web.php:36)
- Pest 3 (PHPUnit-compatible). Tests are in `tests/Feature` and `tests/Unit`
- Spatie medialibrary, DomPDF, FPDF/FPDI, Kreait Firebase, Sitemap packages installed

## Project shape
- Main app: e-commerce catalog (productos, categorías, subcategorías, marcas, cotizaciones, carrito, comparaciones) — controllers in `app/Http/Controllers`
- CRM module: `app/Http/Controllers/CRM/*` and `resources/js/Pages/CRM/*`, all behind `auth` middleware and `/crm/...` prefix (routes/web.php:59). `/crm/usuarios/...` routes additionally require `role.admin`
- `lang/es` is the only translation directory; `APP_LOCALE` is `es` (config/app.php:81)
- `config-local/` contains reference/old copies of `AppServiceProvider` and `vite.config.js` — NOT loaded by the app. Ignore unless comparing with current versions in `app/Providers/` and `vite.config.js`

## Common commands

### Dev server (runs server + queue + vite concurrently)
```
composer run dev
```
This is the canonical all-in-one dev command (defined in composer.json:65). Individual alternatives:
- `php artisan serve`
- `php artisan queue:listen --tries=1`
- `npm run dev` (vite only)

### Build / production
```
npm run build
php artisan config:cache && php artisan route:cache && php artisan view:cache
```
See `.github/workflows/deploy.yml` for the full deploy order used in production.

### Tests
- Full suite: `php artisan test` or `vendor/bin/pest`
- Single file: `vendor/bin/pest tests/Feature/Auth/AuthenticationTest.php`
- Single test: `vendor/bin/pest --filter profile_page_is_displayed`
- Pest is configured in `tests/Pest.php` to apply `RefreshDatabase` only to `Feature` tests
- `phpunit.xml` has SQLite-in-memory lines COMMENTED OUT — tests run against the real `.env` connection (MySQL by default in `.env.example`). Be aware tests will touch the dev DB unless you override `DB_CONNECTION`/`DB_DATABASE` in a `phpunit.xml` env block

### Lint / format
- `vendor/bin/pint` (Laravel Pint is the only formatter; no ESLint/Prettier config in repo)
- No separate typecheck step on the PHP side; no TS on the React side

## Quirks that will bite you

- **CSRF disabled globally** (bootstrap/app.php:31). Do not "fix" this — it's intentional for the CRM's mixed-method routes
- **CSRF caveat**: the same route can be hit with `PUT` or `POST` (e.g. `Route::match(['put', 'post'], '/{id}', ...)`) throughout the CRM. Don't assume REST verbs when calling these endpoints
- **`AppServiceProvider` forces HTTPS** in production AND when the request is secure (app/Providers/AppServiceProvider.php:25). Local HTTP still works, but if you proxy or use `php artisan serve` behind a TLS proxy, URLs will be generated as https
- **Vite dev server is pinned** to `127.0.0.1:5173` with `strictPort: true` (vite.config.js:7). If 5173 is taken, vite will fail rather than pick another port
- **JS path alias**: `@/*` maps to `resources/js/*` (jsconfig.json:5) and `ziggy-js` resolves to the vendored package — use these in React imports
- **Performance optimizations** (file cache, eager loading, response middleware) are baked in — see `PERFORMANCE.md` for the full list. Don't blindly switch cache driver to `database` in `.env` without re-reading that file
- **`config-local/`** is NOT autoloaded; it's leftover reference material. Edits go in `config/` and `app/Providers/`

## Firebase
- Config is in `config/firebase.php`; credentials come from `FIREBASE_CREDENTIALS` (JSON string) and `FIREBASE_PROJECT_ID` env vars (see `.env.example:66`)
- Service: `App\Services\FirebaseNotificationService`
- Test script: `test_firebase_temp.php` at repo root — throwaway, not a real test

## Scheduled tasks
- `cotizaciones:generar-notificaciones` runs hourly (bootstrap/app.php:41). Source: `app/Console/Commands/GenerarNotificacionesCotizaciones.php`

## Environment files
- `.env` is tracked alongside `.env.example`, `.env copy`, and `.env.back` — assume `.env` is dev-only and not a secret source of truth. Real secrets come from the deploy workflow
- DB defaults in `.env.example`: MySQL on `127.0.0.1:3306`, db `megaequipamiento`, user `frank`/`123456` — local-only

## Things that are NOT here
- No `package.json` test script (use `vendor/bin/pest`)
- No TypeScript
- No ESLint/Prettier
- No CI on PRs — only the `deploy.yml` on push to `main`
- No OpenCode config (`opencode.json`) at the repo root
- `README.md` is the default Laravel boilerplate — ignore it for project context
