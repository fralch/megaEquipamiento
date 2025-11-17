/**
 * Sistema de gestión de cache para productos, categorías y marcas
 * Permite invalidar el cache cuando se crean/modifican datos
 */

// Claves de cache en localStorage
const CACHE_KEYS = {
    PRODUCTS: 'products',
    PRODUCTS_TIMESTAMP: 'productsTimestamp',
    CATEGORIES: 'categoriasCompleta',
    CATEGORIES_TIMESTAMP: 'categoriasTimestamp',
    BRANDS: 'brandsData',
    BRANDS_TIMESTAMP: 'brandsDataTimestamp',
};

/**
 * Limpia el cache de productos
 */
export const clearProductsCache = () => {
    try {
        localStorage.removeItem(CACHE_KEYS.PRODUCTS);
        localStorage.removeItem(CACHE_KEYS.PRODUCTS_TIMESTAMP);
        console.log('✅ Cache de productos limpiado');
        return true;
    } catch (error) {
        console.error('❌ Error limpiando cache de productos:', error);
        return false;
    }
};

/**
 * Limpia el cache de categorías y subcategorías
 * IMPORTANTE: Este cache incluye tanto categorías como subcategorías
 */
export const clearCategoriesCache = () => {
    try {
        localStorage.removeItem(CACHE_KEYS.CATEGORIES);
        localStorage.removeItem(CACHE_KEYS.CATEGORIES_TIMESTAMP);
        console.log('✅ Cache de categorías y subcategorías limpiado');
        return true;
    } catch (error) {
        console.error('❌ Error limpiando cache de categorías y subcategorías:', error);
        return false;
    }
};

/**
 * Limpia el cache de marcas
 */
export const clearBrandsCache = () => {
    try {
        localStorage.removeItem(CACHE_KEYS.BRANDS);
        localStorage.removeItem(CACHE_KEYS.BRANDS_TIMESTAMP);
        console.log('✅ Cache de marcas limpiado');
        return true;
    } catch (error) {
        console.error('❌ Error limpiando cache de marcas:', error);
        return false;
    }
};

/**
 * Limpia TODO el cache de la aplicación
 */
export const clearAllCache = () => {
    try {
        const cleared = {
            products: clearProductsCache(),
            categories: clearCategoriesCache(),
            brands: clearBrandsCache(),
        };

        console.log('✅ Cache completo limpiado', cleared);
        return cleared;
    } catch (error) {
        console.error('❌ Error limpiando cache completo:', error);
        return false;
    }
};

/**
 * Invalida el cache y recarga la página
 * Útil después de crear/editar productos, categorías o marcas
 */
export const invalidateCacheAndReload = (cacheType = 'all') => {
    console.log(`🔄 Invalidando cache: ${cacheType}`);

    switch (cacheType) {
        case 'products':
            clearProductsCache();
            break;
        case 'categories':
            clearCategoriesCache();
            break;
        case 'brands':
            clearBrandsCache();
            break;
        case 'all':
        default:
            clearAllCache();
            break;
    }

    // Recargar la página para que se obtengan datos frescos
    window.location.reload();
};

/**
 * Verifica si el cache está expirado
 */
export const isCacheExpired = (timestampKey, maxAge) => {
    try {
        const timestamp = localStorage.getItem(timestampKey);
        if (!timestamp) return true;

        const age = Date.now() - parseInt(timestamp);
        return age > maxAge;
    } catch (error) {
        console.error('Error verificando expiración de cache:', error);
        return true;
    }
};

/**
 * Obtiene información del estado del cache
 */
export const getCacheInfo = () => {
    const info = {
        products: {
            exists: !!localStorage.getItem(CACHE_KEYS.PRODUCTS),
            timestamp: localStorage.getItem(CACHE_KEYS.PRODUCTS_TIMESTAMP),
            age: null,
        },
        categories: {
            exists: !!localStorage.getItem(CACHE_KEYS.CATEGORIES),
            timestamp: localStorage.getItem(CACHE_KEYS.CATEGORIES_TIMESTAMP),
            age: null,
        },
        brands: {
            exists: !!localStorage.getItem(CACHE_KEYS.BRANDS),
            timestamp: localStorage.getItem(CACHE_KEYS.BRANDS_TIMESTAMP),
            age: null,
        },
    };

    // Calcular edad del cache
    Object.keys(info).forEach(key => {
        if (info[key].timestamp) {
            const age = Date.now() - parseInt(info[key].timestamp);
            info[key].age = Math.floor(age / 60000); // En minutos
        }
    });

    return info;
};

/**
 * Muestra información del cache en consola
 */
export const logCacheInfo = () => {
    const info = getCacheInfo();
    console.table(info);
};

export default {
    clearProductsCache,
    clearCategoriesCache,
    clearBrandsCache,
    clearAllCache,
    invalidateCacheAndReload,
    isCacheExpired,
    getCacheInfo,
    logCacheInfo,
};
