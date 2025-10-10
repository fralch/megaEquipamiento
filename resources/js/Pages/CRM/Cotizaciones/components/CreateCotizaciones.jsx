import { useState, useEffect, useRef } from 'react';
import { FiX, FiCalendar, FiUser, FiDollarSign, FiMapPin, FiClock, FiCreditCard, FiShield, FiTruck, FiHome, FiPlus, FiTrash2, FiSearch } from "react-icons/fi";
import { useTheme } from '../../../../storage/ThemeContext';
import axios from 'axios';

export default function CreateCotizaciones({ isOpen, onClose, onSave }) {
    const { isDarkMode } = useTheme();

    const [formData, setFormData] = useState({
        fecha_cotizacion: new Date().toISOString().split('T')[0],
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
    const [clientesParticulares, setClientesParticulares] = useState([]);
    const [clientesEmpresas, setClientesEmpresas] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estados para búsqueda de productos
    const [searchProducto, setSearchProducto] = useState('');
    const [productosResultados, setProductosResultados] = useState([]);
    const [showProductoDropdown, setShowProductoDropdown] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    // Cargar datos iniciales cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            loadFormData();
        }
    }, [isOpen]);

    // Cerrar dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProductoDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadFormData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/crm/cotizaciones/create-data');
            if (response.data.success) {
                const data = response.data.data;
                setClientes(data.clientes || []);

                // Separar clientes por tipo
                const particulares = (data.clientes || []).filter(cliente => cliente.tipo === 'particular');
                const empresas = (data.clientes || []).filter(cliente => cliente.tipo === 'empresa');

                setClientesParticulares(particulares);
                setClientesEmpresas(empresas);
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

    // Buscar productos con debounce
    const buscarProductos = async (termino) => {
        if (termino.trim().length < 2) {
            setProductosResultados([]);
            setShowProductoDropdown(false);
            return;
        }

        setLoadingSearch(true);
        try {
            const response = await axios.get('/api/productos/crm/buscar', {
                params: { q: termino, limit: 20 }
            });

            if (response.data.success) {
                setProductosResultados(response.data.data || []);
                setShowProductoDropdown(true);
            }
        } catch (error) {
            console.error('Error al buscar productos:', error);
        } finally {
            setLoadingSearch(false);
        }
    };

    // Handler para búsqueda con debounce
    const handleSearchChange = (value) => {
        setSearchProducto(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            buscarProductos(value);
        }, 300);
    };

    // Seleccionar producto del dropdown
    const selectProducto = (producto) => {
        const newProducto = {
            id: producto.id,
            nombre: producto.nombre,
            cantidad: 1,
            precio_unitario: producto.precio || 0,
            subtotal: producto.precio || 0
        };

        setFormData(prev => ({
            ...prev,
            productos: [...prev.productos, newProducto]
        }));

        // Limpiar búsqueda
        setSearchProducto('');
        setProductosResultados([]);
        setShowProductoDropdown(false);
    };

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
                const cantidad = field === 'cantidad' ? parseFloat(value || 0) : parseFloat(newProductos[index].cantidad || 0);
                const precio = field === 'precio_unitario' ? parseFloat(value || 0) : parseFloat(newProductos[index].precio_unitario || 0);
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
                const cantidad = field === 'cantidad' ? parseFloat(value || 0) : parseFloat(newProductos[index].cantidad || 0);
                const precio = field === 'precio_unitario' ? parseFloat(value || 0) : parseFloat(newProductos[index].precio_unitario || 0);
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

        // Validar que haya al menos un producto
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
                    descripcion: p.descripcion || null
                })),
                productos_adicionales: formData.productos_adicionales.map(p => ({
                    nombre: p.nombre,
                    cantidad: parseInt(p.cantidad),
                    precio_unitario: parseFloat(p.precio_unitario),
                    descripcion: p.descripcion || null
                })),
                notas: formData.notas || null
            };

            const response = await axios.post('/crm/cotizaciones/store', dataToSend);

            if (response.data.success) {
                alert('Cotización creada exitosamente');
                onSave();
                onClose();
            } else {
                alert('Error al crear cotización: ' + (response.data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error al crear cotización:', error);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join('\n');
                alert('Errores de validación:\n' + errorMessages);
            } else {
                alert('Error al crear cotización: ' + (error.response?.data?.message || error.message));
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
            <div className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <FiDollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Nueva Cotización
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Crea una nueva cotización para tus clientes
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg hover:bg-gray-100 ${
                            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                        } transition-colors duration-200`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información General */}
                    <div>
                        <h4 className={`text-md font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Información General
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiCalendar className="inline w-4 h-4 mr-1" />
                                    Fecha de Cotización *
                                </label>
                                <input
                                    type="date"
                                    name="fecha_cotizacion"
                                    value={formData.fecha_cotizacion}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiClock className="inline w-4 h-4 mr-1" />
                                    Fecha de Vencimiento *
                                </label>
                                <input
                                    type="date"
                                    name="fecha_vencimiento"
                                    value={formData.fecha_vencimiento}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiDollarSign className="inline w-4 h-4 mr-1" />
                                    Moneda *
                                </label>
                                <select
                                    name="moneda"
                                    value={formData.moneda}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
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
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <FiDollarSign className="inline w-4 h-4 mr-1" />
                                    Tipo de Cambio *
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    name="tipo_cambio"
                                    value={formData.tipo_cambio}
                                    onChange={handleInputChange}
                                    className={`w-full md:w-1/3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
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
                            {/* Tipo de Cliente */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiUser className="inline w-4 h-4 mr-2" />
                                    Tipo de Cliente *
                                </label>
                                <select
                                    name="cliente_tipo"
                                    value={formData.cliente_tipo}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    required
                                >
                                    <option value="particular">👤 Cliente Particular</option>
                                    <option value="empresa">🏢 Cliente Empresa</option>
                                </select>
                            </div>

                            {/* Cliente */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiUser className="inline w-4 h-4 mr-2" />
                                    {formData.cliente_tipo === 'empresa' ? 'Empresa' : 'Cliente Particular'} *
                                </label>
                                {loading ? (
                                    <div className="flex items-center justify-center py-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : (
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
                                    >
                                        <option value="">
                                            {formData.cliente_tipo === 'empresa' ? 'Seleccionar empresa' : 'Seleccionar cliente'}
                                        </option>
                                        {formData.cliente_tipo === 'empresa'
                                            ? clientesEmpresas.map(cliente => (
                                                <option key={cliente.id} value={cliente.id}>
                                                    {cliente.nombre}
                                                </option>
                                            ))
                                            : clientesParticulares.map(cliente => (
                                                <option key={cliente.id} value={cliente.id}>
                                                    {cliente.nombre}
                                                </option>
                                            ))
                                        }
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FiUser className="inline w-4 h-4 mr-2" />
                                    Vendedor *
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
                                >
                                    <option value="">Seleccionar vendedor</option>
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
                                    Mi Empresa *
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
                                >
                                    <option value="">Seleccionar empresa</option>
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
                        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Productos
                        </h3>

                        {/* Búsqueda de productos */}
                        <div className="mb-4 relative" ref={dropdownRef}>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <FiSearch className="inline w-4 h-4 mr-2" />
                                Buscar y Agregar Producto
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchProducto}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                    placeholder="Buscar producto por nombre, SKU o descripción..."
                                />
                                {loadingSearch ? (
                                    <div className="absolute right-3 top-3">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : (
                                    <FiSearch className={`absolute right-3 top-3 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                )}

                                {/* Dropdown de productos filtrados */}
                                {showProductoDropdown && productosResultados.length > 0 && (
                                    <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border rounded-lg shadow-lg ${
                                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                    }`}>
                                        {productosResultados.map((producto) => (
                                            <div
                                                key={producto.id}
                                                onClick={() => selectProducto(producto)}
                                                className={`px-3 py-2 cursor-pointer hover:${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                } border-b last:border-b-0 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                                            >
                                                <div className="font-medium">{producto.nombre}</div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    {producto.sku && (
                                                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            SKU: {producto.sku}
                                                        </span>
                                                    )}
                                                    {producto.marca && (
                                                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Marca: {producto.marca}
                                                        </span>
                                                    )}
                                                    <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                        S/ {parseFloat(producto.precio || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lista de productos agregados */}
                        {formData.productos.map((producto, index) => (
                            <div key={index} className={`mb-4 p-3 border rounded-lg ${
                                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
                            }`}>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Producto
                                        </label>
                                        <input
                                            type="text"
                                            value={producto.nombre}
                                            onChange={(e) => updateProducto(index, 'nombre', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                isDarkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={producto.cantidad}
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
                                            value={producto.precio_unitario}
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
                                            value={producto.nombre}
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
                                            value={producto.cantidad}
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
                                            value={producto.precio_unitario}
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
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                                isDarkMode
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <FiDollarSign className="w-4 h-4 mr-2" />
                                    Guardar Cotización
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
