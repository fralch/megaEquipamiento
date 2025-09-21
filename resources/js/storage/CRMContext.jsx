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

    // Función para alternar la expansión de un menú (comportamiento acordeón)
    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => {
            const isCurrentlyExpanded = prev[menuKey];

            // Si el menú actual está expandido, lo cerramos
            if (isCurrentlyExpanded) {
                return {
                    ...prev,
                    [menuKey]: false
                };
            }

            // Si el menú actual está cerrado, cerramos todos los demás y abrimos este
            const newState = {};
            Object.keys(prev).forEach(key => {
                newState[key] = key === menuKey;
            });

            return newState;
        });
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