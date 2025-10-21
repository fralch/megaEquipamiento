import { createContext, useContext, useState } from 'react';

const CRMContext = createContext();

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM debe ser usado dentro de un CRMProvider');
  }
  return context;
};

export const CRMProvider = ({ children }) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const expandMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: true
    }));
  };

  const collapseMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: false
    }));
  };

  const collapseAllMenus = () => {
    setExpandedMenus({});
  };

  return (
    <CRMContext.Provider value={{ 
      expandedMenus, 
      toggleMenu, 
      expandMenu, 
      collapseMenu, 
      collapseAllMenus 
    }}>
      {children}
    </CRMContext.Provider>
  );
};