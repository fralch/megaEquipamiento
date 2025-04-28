import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";

const RelatedProducts = ({ productId }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relationTypes, setRelationTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingRelations, setPendingRelations] = useState([]);
    const [loadingPending, setLoadingPending] = useState(true);

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

    // Nuevo efecto para obtener relaciones pendientes
    useEffect(() => {
        const fetchPendingRelations = async () => {
            try {
                setLoadingPending(true);
                const response = await axios.get(`/product/con-relacion/${productId}`);
                setPendingRelations(response.data);
                setLoadingPending(false);
            } catch (err) {
                console.error("Error fetching pending relations:", err);
                setLoadingPending(false);
            }
        };

        if (productId) {
            fetchPendingRelations();
        }
    }, [productId]);

    const renderProductCard = (product) => (
        <div key={product.id_producto} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <Link href={`/producto/${product.id_producto}`}>
                <div className="h-48 overflow-hidden">
                    <img 
                        src={product.imagen.startsWith('http') ? product.imagen : `/${product.imagen}`}
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

    const renderPendingRelations = () => {
        if (loadingPending) return null;
        if (pendingRelations.length === 0) return null;

        return (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h2 className="text-xl font-bold text-yellow-700 mb-4">
                    Relaciones Pendientes
                </h2>
                <p className="mb-4 text-yellow-600">
                    Los siguientes productos tienen relación con este producto, pero no existe la relación inversa:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {pendingRelations.map(product => renderProductCard(product))}
                </div>
                <div className="mt-4 text-sm text-yellow-600">
                    <p>Se recomienda establecer la relación inversa para mantener la consistencia de datos.</p>
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

    return (
        <div className="py-6">
            {renderPendingRelations()}
            
            {relatedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay productos relacionados disponibles.</div>
            ) : (
                relationTypes.map(type => (
                    renderProductGroup(type.nombre, groupedProducts[type.nombre])
                ))
            )}
        </div>
    );
};

export default RelatedProducts;