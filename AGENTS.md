# Repository Guidelines

## Project Structure & Modules
- `app/`: Laravel application code (HTTP controllers, console, models).
- `routes/`: HTTP routes (`web.php`, `auth.php`, `console.php`).
- `resources/js`: Inertia + React SPA (Components, Pages, Layouts, hooks).
- `resources/views`: Blade entrypoints (e.g., `app.blade.php`).
- `resources/css`: Tailwind and custom styles.
- `database/`: Migrations, seeders, SQL dumps.
- `config/`, `public/`, `storage/`, `tests/`, `docs/`: Standard Laravel locations.

## Build, Test, and Development
- Install: `composer install` and `npm ci`.
- Dev (serve + queue + Vite): `composer run dev` (uses `concurrently`).
- Frontend only: `npm run dev`. Production build: `npm run build`.
- Migrations/seed: `php artisan migrate` / `php artisan db:seed`.
- Tests: `php artisan test` or `./vendor/bin/pest`.

## Coding Style & Naming
- PHP: PSR-12 via Pint. Format with `./vendor/bin/pint` (CI-safe).
- JS/TS/React: Follow idiomatic React, function components, PascalCase components, camelCase vars. Keep files under `resources/js/{Components,Pages,Layouts}`.
- Tailwind: Prefer utility-first, extract to components when reused.
- EditorConfig: 4-space indent, LF, trim EOL whitespace (see `.editorconfig`).
- Naming: snake_case DB columns; StudlyCase models; Controller names end with `Controller`.

## Testing Guidelines
- Framework: Pest on top of PHPUnit (see `tests/Pest.php`).
- Location: `tests/Feature` for HTTP/integration; `tests/Unit` for pure logic.
- Style: Pest expectations (`it('creates product', ...)`).
- Run focused tests: `./vendor/bin/pest --filter Producto`.
- Optional coverage: `./vendor/bin/pest --coverage` (requires Xdebug/PCOV).

## Commit & Pull Requests
- Commits: imperative mood, concise scope. Example: `feat(products): add comparison API`.
- PRs: include summary, screenshots for UI, steps to test, linked issues.
- Keep PRs focused; add migrations and model changes in separate commits when possible.

## Security & Config Tips
- Do not commit secrets. Use `.env`; update `.env.example` when adding required vars.
- Storage symlink: `php artisan storage:link` for local assets.
- Queues: dev script runs `queue:listen`; ensure drivers are set in `.env`.
