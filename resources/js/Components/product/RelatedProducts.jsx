import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";

const RelatedProducts = ({ productId }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relationTypes, setRelationTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener tipos de relaciones y agrupar productos
    const groupedProducts = relationTypes.reduce((acc, type) => {
        acc[type.nombre] = relatedProducts.filter(
            product => product.pivot.tipo === type.nombre
        );
        return acc;
    }, {});

    useEffect(() => {
        const fetchRelationTypes = async () => {
            try {
                const response = await axios.get('/tipos-relacion-productos');
                setRelationTypes(response.data);
            } catch (err) {
                console.error("Error fetching relation types:", err);
            }
        };

        fetchRelationTypes();
    }, []);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/product/relacion/${productId}`);
                setRelatedProducts(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching related products:", err);
                setError("No se pudieron cargar los productos relacionados.");
                setLoading(false);
            }
        };

        if (productId) {
            fetchRelatedProducts();
        }
    }, [productId]);

    const renderProductCard = (product) => (
        <div key={product.id_producto} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <Link href={`/producto/${product.id_producto}`}>
                <div className="h-48 overflow-hidden">
                    <img 
                        src={product.imagen} 
                        alt={product.nombre} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{product.nombre}</h3>
                    <div className="mt-2 flex justify-between items-center">
                        <p className="text-lg font-semibold text-green-600">S/ {product.precio_sin_ganancia}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                </div>
            </Link>
        </div>
    );

    const renderProductGroup = (type, products) => {
        if (products?.length === 0) return null;
        
        return (
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => renderProductCard(product))}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="text-center py-8">Cargando productos relacionados...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    if (relatedProducts.length === 0) {
        return <div className="text-center py-8 text-gray-500">No hay productos relacionados disponibles.</div>;
    }

    return (
        <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Productos Relacionados</h1>
            
            {relationTypes.map(type => (
                renderProductGroup(type.nombre, groupedProducts[type.nombre])
            ))}
        </div>
    );
};

export default RelatedProducts;