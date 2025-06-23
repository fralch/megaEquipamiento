# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MegaEquipamiento is a Laravel 11 e-commerce application for laboratory equipment with React frontend using Inertia.js. The application features a comprehensive product catalog with categories, subcategories, brands, filtering capabilities, shopping cart, and multi-step checkout process.

## Development Commands

### Backend (Laravel)
- **Start development server**: `composer run dev` (runs Laravel server, queue worker, and Vite concurrently)
- **Run individual services**:
  - Laravel server: `php artisan serve`
  - Queue worker: `php artisan queue:listen --tries=1`
  - Frontend: `npm run dev`
- **Database migrations**: `php artisan migrate`
- **Testing**: 
  - Run all tests: `php artisan test` or `./vendor/bin/pest`
  - Run specific test: `php artisan test --filter TestName`
- **Code formatting**: `./vendor/bin/pint` (Laravel Pint for PHP)

### Frontend (React + Vite)
- **Development**: `npm run dev`
- **Build**: `npm run build`

## Architecture

### Backend Structure
- **Models**: Eloquent models in `app/Models/` for core entities:
  - `Producto.php` - Main product model with specifications and relationships
  - `Categoria.php`, `Subcategoria.php` - Product categorization
  - `Marca.php` - Product brands with video support
  - `CarritoCompra.php`, `DetalleCarrito.php` - Shopping cart system
  - `Pedido.php`, `DetallePedido.php` - Order management
  - `Filtro.php`, `OpcionFiltro.php` - Dynamic filtering system
  - `Usuario.php` - User management

- **Controllers**: RESTful controllers in `app/Http/Controllers/` handling:
  - Product CRUD operations and relationships
  - Category/subcategory management with image uploads
  - Brand management with video URLs
  - Advanced filtering and search functionality
  - Shopping cart and checkout process
  - Authentication and user management

- **Routes**: `routes/web.php` defines comprehensive API endpoints for all entities

### Frontend Structure
- **Pages**: Main views in `resources/js/Pages/`
  - `Welcome.jsx` - Homepage with product showcase
  - `Categoria.jsx` - Category listing with filtering
  - `Product.jsx` - Detailed product view with specifications
  - `Carrito.jsx` - Shopping cart management
  - `Crear.jsx` - Admin product/category creation

- **Components**: Reusable components in `resources/js/Components/`
  - `checkout/` - Multi-step checkout process with tabs
  - `product/` - Product display, specifications, related products
  - `home/` - Homepage sections (sliders, categories, brands)
  - `filtros/` - Dynamic filtering system
  - `create/` - Admin creation forms

- **Context**: State management in `resources/js/storage/`
  - `CartContext.jsx` - Shopping cart state
  - `ThemeContext.jsx` - Theme management

### Database Design
- **Product System**: Complex product relationships with technical specifications, categories, and dynamic filtering
- **E-commerce Features**: Complete cart, checkout, and order management
- **Media Management**: Image uploads for products/categories, video URLs for brands
- **Dynamic Filtering**: Flexible filter system with subcategory-specific options

## Key Features
- **Multi-step Checkout**: Tab-based checkout process with cart, shipping, payment, and confirmation steps
- **Product Relationships**: Products can be related to each other with different relationship types
- **Dynamic Filtering**: Subcategory-specific filters with multiple options
- **Image Management**: Comprehensive image upload and management system
- **Brand Integration**: Brand pages with video content support
- **Search & Discovery**: Advanced product search with initial letter filtering

## Development Notes
- Uses Inertia.js for seamless SPA experience with Laravel backend
- Tailwind CSS for styling with custom components
- Swiper.js for image carousels and sliders
- File uploads handled through Laravel's storage system
- Queue system available for background jobs
- Pest PHP for testing framework