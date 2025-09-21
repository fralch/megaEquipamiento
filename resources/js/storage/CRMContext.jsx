import { createContext, useContext, useState } from 'react';

const CRMContext = createContext();

export function CRMProvider({ children }) {
    // Estado para manejar qué secciones del menú están expandidas
    const [expandedMenus, setExpandedMenus] = useState({
        'usuarios-roles': true, // Expandido por defecto
        'empresas': false,
        'clientes': false,
        'productos': false,
        'cotizaciones': false,
        'apis': false
    });

    // Función para alternar la expansión de un menú
    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    return (
        <CRMContext.Provider value={{
            expandedMenus,
            setExpandedMenus,
            toggleMenu
        }}>
            {children}
        </CRMContext.Provider>
    );
}

export function useCRM() {
    const context = useContext(CRMContext);
    if (!context) {
        throw new Error('useCRM must be used within a CRMProvider');
    }
    return context;
}