import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiUser, FiDollarSign, FiMapPin, FiClock, FiCreditCard, FiShield, FiTruck, FiHome, FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { useTheme } from '../../../../storage/ThemeContext';
import axios from 'axios';

export default function EditCotizaciones({ isOpen, onClose, onSave, cotizacion }) {
    const { isDarkMode } = useTheme();
    
    const [formData, setFormData] = useState({
        id: '',
        fecha_cotizacion: '',
        fecha_vencimiento: '',
        entrega: '',
        lugar_entrega: '',
        garantia: '',
        forma_pago: '',
        cliente_id: '',
        cliente_tipo: 'particular',
        usuario_id: '',
        miempresa_id: '',
        moneda: 'soles',
        tipo_cambio: 1.0,
        productos: [],
        total_monto_productos: 0,
        productos_adicionales: [],
        total_adicionales_monto: 0,
        total: 0,
        notas: ''
    });

    const [clientes, setClientes] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingProductos, setLoadingProductos] = useState(false);

    // Load form data (clientes, vendedores, empresas)
    const loadFormData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/crm/cotizaciones/create-data');
            if (response.data.success) {
                const data = response.data.data;
                setClientes(data.clientes || []);
                setVendedores(data.vendedores || []);
                setEmpresas(data.empresas || []);
            }
        } catch (error) {
            console.error('Error al cargar datos del formulario:', error);
            alert('Error al cargar datos. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Load productos disponibles
    const loadProductos = async () => {
        setLoadingProductos(true);
        try {
            const response = await axios.get('/api/productos/excluye-servicios');
            if (response.data) {
                const productos = response.data.map(p => ({
                    id: p.id_producto,
                    nombre: p.nombre,
                    precio: p.precio || 0
                }));
                setProductosDisponibles(productos);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
        } finally {
            setLoadingProductos(false);
        }
    };

    // Load initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            loadFormData();
            loadProductos();
        }
    }, [isOpen]);

    // Load cotizacion data when modal opens
    useEffect(() => {
        if (isOpen && cotizacion) {
            // Mapear productos - soportar tanto detalles_productos como productos (nuevo formato)
            const productosData = cotizacion.productos || cotizacion.detalles_productos || [];
            const productos = productosData.map(detalle => ({
                id: detalle.id || detalle.producto_id,
                nombre: detalle.nombre,
                cantidad: detalle.cantidad,
                precio_unitario: detalle.precio_unitario,
                subtotal: detalle.subtotal
            }));

            // Mapear productos adicionales - soportar tanto detalles_adicionales como productos_adicionales
            const productosAdicionalesData = cotizacion.productos_adicionales || cotizacion.detalles_adicionales || [];
            const productosAdicionales = productosAdicionalesData.map(detalle => ({
                nombre: detalle.nombre,
                cantidad: detalle.cantidad,
                precio_unitario: detalle.precio_unitario,
                subtotal: detalle.subtotal
            }));

            setFormData({
                id: cotizacion.id || '',
                fecha_cotizacion: cotizacion.fecha_cotizacion || '',
                fecha_vencimiento: cotizacion.fecha_vencimiento || '',
                entrega: cotizacion.entrega || '',
                lugar_entrega: cotizacion.lugar_entrega || '',
                garantia: cotizacion.garantia || '',
                forma_pago: cotizacion.forma_pago || '',
                cliente_id: cotizacion.cliente_id || '',
                cliente_tipo: cotizacion.cliente_tipo || 'particular',
                usuario_id: cotizacion.usuario_id || '',
                miempresa_id: cotizacion.miempresa_id || '',
                moneda: cotizacion.moneda || 'soles',
                tipo_cambio: cotizacion.tipo_cambio || 1.0,
                productos: productos,
                total_monto_productos: cotizacion.total_monto_productos || 0,
                productos_adicionales: productosAdicionales,
                total_adicionales_monto: cotizacion.total_adicionales_monto || 0,
                total: cotizacion.total || 0,
                notas: cotizacion.notas || ''
            });
        }
    }, [isOpen, cotizacion]);

    // Calculate totals when products change
    useEffect(() => {
        const totalProductos = formData.productos.reduce((sum, producto) => 
            sum + (parseFloat(producto.cantidad || 0) * parseFloat(producto.precio_unitario || 0)), 0);
        
        const totalAdicionales = formData.productos_adicionales.reduce((sum, producto) => 
            sum + (parseFloat(producto.cantidad || 0) * parseFloat(producto.precio_unitario || 0)), 0);
        
        const total = totalProductos + totalAdicionales;

        setFormData(prev => ({
            ...prev,
            total_monto_productos: totalProductos,
            total_adicionales_monto: totalAdicionales,
            total: total
        }));
    }, [formData.productos, formData.productos_adicionales]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClienteChange = (e) => {
        const value = e.target.value;
        if (value) {
            const selectedCliente = clientes.find(c => c.id == value);
            if (selectedCliente) {
                setFormData(prev => ({
                    ...prev,
                    cliente_id: value,
                    cliente_tipo: selectedCliente.tipo || 'particular'
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                cliente_id: '',
                cliente_tipo: 'particular'
            }));
        }
    };

    const addProducto = () => {
        setFormData(prev => ({
            ...prev,
            productos: [...prev.productos, {
                id: '',
                nombre: '',
                cantidad: 1,
                precio_unitario: 0,
                subtotal: 0
            }]
        }));
    };

    const removeProducto = (index) => {
        setFormData(prev => ({
            ...prev,
            productos: prev.productos.filter((_, i) => i !== index)
        }));
    };

    const updateProducto = (index, field, value) => {
        setFormData(prev => {
            const newProductos = [...prev.productos];
            newProductos[index] = {
                ...newProductos[index],
                [field]: value
            };
            
            // Calculate subtotal
            if (field === 'cantidad' || field === 'precio_unitario') {
                const cantidad = field === 'cantidad' ? parseFloat(value) : parseFloat(newProductos[index].cantidad || 0);
                const precio = field === 'precio_unitario' ? parseFloat(value) : parseFloat(newProductos[index].precio_unitario || 0);
                newProductos[index].subtotal = cantidad * precio;
            }

            return {
                ...prev,
                productos: newProductos
            };
        });
    };

    const addProductoAdicional = () => {
        setFormData(prev => ({
            ...prev,
            productos_adicionales: [...prev.productos_adicionales, {
                nombre: '',
                cantidad: 1,
                precio_unitario: 0,
                subtotal: 0
            }]
        }));
    };

    const removeProductoAdicional = (index) => {
        setFormData(prev => ({
            ...prev,
            productos_adicionales: prev.productos_adicionales.filter((_, i) => i !== index)
        }));
    };

    const updateProductoAdicional = (index, field, value) => {
        setFormData(prev => {
            const newProductos = [...prev.productos_adicionales];
            newProductos[index] = {
                ...newProductos[index],
                [field]: value
            };
            
            // Calculate subtotal
            if (field === 'cantidad' || field === 'precio_unitario') {
                const cantidad = field === 'cantidad' ? parseFloat(value) : parseFloat(newProductos[index].cantidad || 0);
                const precio = field === 'precio_unitario' ? parseFloat(value) : parseFloat(newProductos[index].precio_unitario || 0);
                newProductos[index].subtotal = cantidad * precio;
            }

            return {
                ...prev,
                productos_adicionales: newProductos
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que haya al menos 1 producto
        if (formData.productos.length === 0) {
            alert('Debe agregar al menos un producto a la cotización');
            return;
        }

        try {
            setLoading(true);

            // Preparar datos para enviar
            const dataToSend = {
                fecha_cotizacion: formData.fecha_cotizacion,
                fecha_vencimiento: formData.fecha_vencimiento,
                entrega: formData.entrega || null,
                lugar_entrega: formData.lugar_entrega || null,
                garantia: formData.garantia || null,
                forma_pago: formData.forma_pago || null,
                cliente_id: parseInt(formData.cliente_id),
                cliente_tipo: formData.cliente_tipo,
                usuario_id: parseInt(formData.usuario_id),
                miempresa_id: parseInt(formData.miempresa_id),
                moneda: formData.moneda,
                tipo_cambio: parseFloat(formData.tipo_cambio),
                productos: formData.productos.map(p => ({
                    producto_id: p.id || null,
                    nombre: p.nombre,
                    cantidad: parseInt(p.cantidad),
                    precio_unitario: parseFloat(p.precio_unitario),
                })),
                productos_adicionales: formData.productos_adicionales.map(p => ({
                    nombre: p.nombre,
                    cantidad: parseInt(p.cantidad),
                    precio_unitario: parseFloat(p.precio_unitario),
                })),
                notas: formData.notas || null
            };

            // Enviar actualización al backend
            const response = await axios.put(`/crm/cotizaciones/${formData.id}`, dataToSend);

            if (response.data.success) {
                alert('Cotización actualizada exitosamente');
                onSave(); // Llamar callback para recargar datos
                onClose();
            }
        } catch (error) {
            console.error('Error al actualizar cotización:', error);

            // Mostrar errores de validación si existen
            if (error.response && error.response.data && error.response.data.errors) {
                const errores = Object.values(error.response.data.errors).flat().join('\n');
                alert(`Error de validación:\n${errores}`);
            } else if (error.response && error.response.data && error.response.data.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Error al actualizar cotización. Por favor, intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        const symbol = formData.moneda === 'dolares' ? '$' : 'S/';
        return `${symbol} ${parseFloat(amount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
                isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
                {/* Header */}
                <div className={`sticky top-0 px-6 py-4 border-b flex items-center justify-between ${
                    isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
                }`}>
                    <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Editar Cotización #{cotizacion?.numero || formData.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg hover:bg-gray-100 ${
                            isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'text-gray-500'
                        }`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información General */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Información General
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiCalendar className="inline w-4 h-4 mr-2" />
                                    Fecha de Cotización
                                </label>
                                <input
                                    type="date"
                                    name="fecha_cotizacion"
                                    value={formData.fecha_cotizacion}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiClock className="inline w-4 h-4 mr-2" />
                                    Fecha de Vencimiento
                                </label>
                                <input
                                    type="date"
                                    name="fecha_vencimiento"
                                    value={formData.fecha_vencimiento}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiDollarSign className="inline w-4 h-4 mr-2" />
                                    Moneda
                                </label>
                                <select
                                    name="moneda"
                                    value={formData.moneda}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    required
                                >
                                    <option value="soles">Soles (PEN)</option>
                                    <option value="dolares">Dólares (USD)</option>
                                </select>
                            </div>
                        </div>
                        {formData.moneda === 'dolares' && (
                            <div className="mt-4">
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiDollarSign className="inline w-4 h-4 mr-2" />
                                    Tipo de Cambio
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    name="tipo_cambio"
                                    value={formData.tipo_cambio}
                                    onChange={handleInputChange}
                                    className={`w-full md:w-1/3 px-3 py-2 border rounded-lg ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="3.750"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {/* Cliente y Vendedor */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Cliente y Vendedor
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiUser className="inline w-4 h-4 mr-2" />
                                    Cliente
                                </label>
                                <select
                                    name="cliente_id"
                                    value={formData.cliente_id}
                                    onChange={handleClienteChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">
                                        {loading ? 'Cargando...' : 'Seleccionar cliente'}
                                    </option>
                                    {clientes.map(cliente => (
                                        <option key={`${cliente.tipo}-${cliente.id}`} value={cliente.id}>
                                            {cliente.tipo === 'empresa' ? '🏢 ' : '👤 '}{cliente.nombre}
                                        </option>
                                    ))}
                                </select>
                                {formData.cliente_id && (
                                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Tipo: {formData.cliente_tipo === 'empresa' ? 'Empresa' : 'Particular'}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiUser className="inline w-4 h-4 mr-2" />
                                    Vendedor
                                </label>
                                <select
                                    name="usuario_id"
                                    value={formData.usuario_id}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">
                                        {loading ? 'Cargando...' : 'Seleccionar vendedor'}
                                    </option>
                                    {vendedores.map(vendedor => (
                                        <option key={vendedor.id} value={vendedor.id}>
                                            {vendedor.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiHome className="inline w-4 h-4 mr-2" />
                                    Mi Empresa
                                </label>
                                <select
                                    name="miempresa_id"
                                    value={formData.miempresa_id}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">
                                        {loading ? 'Cargando...' : 'Seleccionar empresa'}
                                    </option>
                                    {empresas.map(empresa => (
                                        <option key={empresa.id} value={empresa.id}>
                                            {empresa.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Condiciones Comerciales */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Condiciones Comerciales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiTruck className="inline w-4 h-4 mr-2" />
                                    Entrega
                                </label>
                                <input
                                    type="text"
                                    name="entrega"
                                    value={formData.entrega}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Ej: 15 días hábiles"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiMapPin className="inline w-4 h-4 mr-2" />
                                    Lugar de Entrega
                                </label>
                                <input
                                    type="text"
                                    name="lugar_entrega"
                                    value={formData.lugar_entrega}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Ej: Lima, Perú"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiShield className="inline w-4 h-4 mr-2" />
                                    Garantía
                                </label>
                                <input
                                    type="text"
                                    name="garantia"
                                    value={formData.garantia}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Ej: 12 meses"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiCreditCard className="inline w-4 h-4 mr-2" />
                                    Forma de Pago
                                </label>
                                <input
                                    type="text"
                                    name="forma_pago"
                                    value={formData.forma_pago}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Ej: 50% adelanto, 50% contra entrega"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Productos */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Productos
                            </h3>
                            <button
                                type="button"
                                onClick={addProducto}
                                className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                                    isDarkMode 
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                            >
                                <FiPlus className="w-4 h-4" />
                                Agregar Producto
                            </button>
                        </div>
                        
                        {formData.productos.map((producto, index) => (
                            <div key={index} className={`mb-4 p-3 border rounded-lg ${
                                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
                            }`}>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Producto
                                        </label>
                                        {producto.nombre ? (
                                            <div className={`w-full px-3 py-2 border rounded-lg ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-100 border-gray-300 text-gray-900'
                                            }`}>
                                                {producto.nombre}
                                                {producto.id && (
                                                    <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        (ID: {producto.id})
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <select
                                                value={producto.id || ''}
                                                onChange={(e) => {
                                                    const selectedProduct = productosDisponibles.find(p => p.id == e.target.value);
                                                    if (selectedProduct) {
                                                        updateProducto(index, 'id', selectedProduct.id);
                                                        updateProducto(index, 'nombre', selectedProduct.nombre);
                                                        updateProducto(index, 'precio_unitario', selectedProduct.precio);
                                                    }
                                                }}
                                                className={`w-full px-3 py-2 border rounded-lg ${
                                                    isDarkMode
                                                        ? 'bg-gray-600 border-gray-500 text-white'
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                            >
                                                <option value="">Seleccionar producto</option>
                                                {productosDisponibles.map(prod => (
                                                    <option key={prod.id} value={prod.id}>
                                                        {prod.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={producto.cantidad || 1}
                                            onChange={(e) => updateProducto(index, 'cantidad', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                isDarkMode 
                                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Precio Unit.
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={producto.precio_unitario || 0}
                                            onChange={(e) => updateProducto(index, 'precio_unitario', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                isDarkMode 
                                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() => removeProducto(index)}
                                            className={`w-full px-3 py-2 rounded-lg flex items-center justify-center ${
                                                isDarkMode 
                                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                            }`}
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-right">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Subtotal: {formatCurrency(producto.subtotal || 0)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Total Productos:
                                </span>
                                <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {formatCurrency(formData.total_monto_productos)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Productos Adicionales */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Productos Adicionales
                            </h3>
                            <button
                                type="button"
                                onClick={addProductoAdicional}
                                className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                                    isDarkMode 
                                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                            >
                                <FiPlus className="w-4 h-4" />
                                Agregar Adicional
                            </button>
                        </div>
                        
                        {formData.productos_adicionales.map((producto, index) => (
                            <div key={index} className={`mb-4 p-3 border rounded-lg ${
                                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
                            }`}>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Producto Adicional
                                        </label>
                                        <input
                                            type="text"
                                            value={producto.nombre || ''}
                                            onChange={(e) => updateProductoAdicional(index, 'nombre', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                isDarkMode 
                                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            placeholder="Nombre del producto adicional"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={producto.cantidad || 1}
                                            onChange={(e) => updateProductoAdicional(index, 'cantidad', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                isDarkMode 
                                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Precio Unit.
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={producto.precio_unitario || 0}
                                            onChange={(e) => updateProductoAdicional(index, 'precio_unitario', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                isDarkMode 
                                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() => removeProductoAdicional(index)}
                                            className={`w-full px-3 py-2 rounded-lg flex items-center justify-center ${
                                                isDarkMode 
                                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                            }`}
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-right">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Subtotal: {formatCurrency(producto.subtotal || 0)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Total Adicionales:
                                </span>
                                <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {formatCurrency(formData.total_adicionales_monto)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Total General */}
                    <div className={`p-4 rounded-lg border-2 ${isDarkMode ? 'bg-gray-800 border-blue-600' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex justify-between items-center">
                            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Total General:
                            </span>
                            <span className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {formatCurrency(formData.total)}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`flex justify-end gap-3 pt-4 border-t ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                isDarkMode 
                                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : isDarkMode
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            <FiSave className="w-4 h-4" />
                            {loading ? 'Actualizando...' : 'Actualizar Cotización'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}