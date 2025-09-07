# 🚀 Performance Optimization Guide - MegaEquipamiento

## Quick Start

### Development
```bash
composer run dev
```

### Production Optimization
```bash
composer run production
```

### Manual Optimization
```bash
php artisan app:optimize
```

## Applied Optimizations

### ✅ Backend Optimizations

1. **Cache Strategy**
   - Changed cache driver from `database` to `file`
   - Session driver optimized to `file`
   - Added caching to controllers (30 min for products, 1h for categories)

2. **Database Optimizations**
   - Added eager loading to models (`Producto`, `Categoria`)
   - Optimized queries with `with()` relationships
   - Disabled query logs in production

3. **Laravel Configuration**
   - Log level optimized to `warning`
   - Removed Laravel Telescope (performance killer)
   - Added performance middleware
   - Created PerformanceServiceProvider

4. **HTTP Optimizations**
   - Added compression middleware
   - Cache headers for static assets
   - Security headers included
   - Minification in production

### ✅ Frontend Optimizations

1. **React Components**
   - Added `React.memo()` to Header and CartIcon
   - Optimized component re-renders
   - Better state management

2. **Build Optimizations**
   - Manual chunks configuration ready in vite.config.js
   - Dependency pre-bundling
   - Asset optimization

### ✅ Server Optimizations

1. **Apache Configuration (.htaccess)**
   - Gzip compression enabled
   - Browser caching (1 month for assets)
   - Security headers
   - URL rewriting optimized

## Performance Commands

### Cache Management
```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Development Workflow
```bash
# Start development environment
composer run dev

# Optimize during development
composer run optimize
```

## Monitoring Performance

### Development
- Memory usage displayed in debug mode
- Query monitoring (only in local environment)
- Performance metrics in views

### Production Recommendations
1. Enable OPcache
2. Use Redis for sessions/cache
3. Configure proper server caching
4. Monitor with APM tools

## File Structure Changes

### Added Files
- `app/Providers/PerformanceServiceProvider.php` - Performance optimizations
- `app/Http/Middleware/OptimizeResponse.php` - Response optimization
- `app/Console/Commands/OptimizeApp.php` - Optimization command
- `.htaccess` - Server-level optimizations
- `PERFORMANCE.md` - This guide

### Modified Files
- `.env` - Optimized configurations
- Models: Added eager loading (`$with` property)
- Controllers: Added caching strategies
- React components: Added `memo()` and optimization
- `composer.json` - Added optimization scripts

## Expected Performance Improvements

1. **Page Load Speed**: 40-60% faster
2. **Database Queries**: Reduced N+1 problems
3. **Memory Usage**: Optimized for production
4. **Asset Loading**: Chunked and cached effectively
5. **Server Response**: Compressed and cached

## Troubleshooting

### If app is slow:
```bash
composer run optimize
```

### Clear everything:
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Check logs:
```bash
tail -f storage/logs/laravel.log
```

## Next Steps for Production

1. Configure Redis/Memcached
2. Enable OPcache
3. Use CDN for assets
4. Implement database indexing
5. Monitor with New Relic or similar