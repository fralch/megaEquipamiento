#!/bin/bash

echo "================================"
echo "Instalador de Extensiones PHP"
echo "================================"
echo ""

# Detectar versión de PHP
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "✓ Versión de PHP detectada: $PHP_VERSION"
echo ""

# Lista de extensiones necesarias
EXTENSIONS="xml dom gd mbstring"

echo "Instalando extensiones necesarias..."
echo ""

# Instalar cada extensión
for EXT in $EXTENSIONS; do
    PACKAGE="php${PHP_VERSION}-${EXT}"
    echo "→ Instalando $PACKAGE..."
    sudo apt-get install -y "$PACKAGE"
done

echo ""
echo "================================"
echo "Verificando instalación..."
echo "================================"
echo ""

php -m | grep -E 'dom|xml|SimpleXML|gd|mbstring'

echo ""
echo "================================"
echo "✓ Instalación completada!"
echo "================================"
echo ""
echo "Ahora ejecuta:"
echo "  php artisan config:clear"
echo "  php artisan cache:clear"
echo "  php artisan serve"
echo ""
