import React, { createContext, useReducer, useEffect } from 'react';

export const CheckoutContext = createContext();

const initialState = {
  customerData: {
    fullName: '',
    address: '',
    district: '',
    city: 'Lima',
    phone: '',
    reference: '',
    saveAddress: false,
    company: '',
    department: '',
    rucDni: '',
    email: ''
  },
  shippingData: {
    method: '',
    cost: 0,
    estimatedDays: 0
  },
  paymentData: {
    method: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  },
  orderSummary: {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  },
  currentStep: 1,
  completedSteps: []
};

const checkoutReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CUSTOMER_DATA':
      return {
        ...state,
        customerData: {
          ...state.customerData,
          ...action.payload
        }
      };
    
    case 'UPDATE_SHIPPING_DATA':
      return {
        ...state,
        shippingData: {
          ...state.shippingData,
          ...action.payload
        }
      };
    
    case 'UPDATE_PAYMENT_DATA':
      return {
        ...state,
        paymentData: {
          ...state.paymentData,
          ...action.payload
        }
      };
    
    case 'UPDATE_ORDER_SUMMARY':
      return {
        ...state,
        orderSummary: {
          ...state.orderSummary,
          ...action.payload
        }
      };
    
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    
    case 'ADD_COMPLETED_STEP':
      return {
        ...state,
        completedSteps: [...new Set([...state.completedSteps, action.payload])]
      };
    
    case 'RESET_CHECKOUT':
      return initialState;
    
    case 'LOAD_SAVED_DATA':
      return {
        ...state,
        ...action.payload
      };
    
    default:
      return state;
  }
};

export const CheckoutProvider = ({ children }) => {
  const [checkoutState, dispatch] = useReducer(checkoutReducer, initialState, () => {
    try {
      const stored = localStorage.getItem('checkoutData');
      return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
    } catch (error) {
      console.error('Error loading checkout data from localStorage:', error);
      return initialState;
    }
  });

  // Guardar en localStorage cuando el estado cambie
  useEffect(() => {
    try {
      localStorage.setItem('checkoutData', JSON.stringify(checkoutState));
    } catch (error) {
      console.error('Error saving checkout data to localStorage:', error);
    }
  }, [checkoutState]);

  // Funciones helper para facilitar el uso del contexto
  const updateCustomerData = (data) => {
    dispatch({ type: 'UPDATE_CUSTOMER_DATA', payload: data });
  };

  const updateShippingData = (data) => {
    dispatch({ type: 'UPDATE_SHIPPING_DATA', payload: data });
  };

  const updatePaymentData = (data) => {
    dispatch({ type: 'UPDATE_PAYMENT_DATA', payload: data });
  };

  const updateOrderSummary = (data) => {
    dispatch({ type: 'UPDATE_ORDER_SUMMARY', payload: data });
  };

  const setCurrentStep = (step) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const addCompletedStep = (step) => {
    dispatch({ type: 'ADD_COMPLETED_STEP', payload: step });
  };

  const resetCheckout = () => {
    dispatch({ type: 'RESET_CHECKOUT' });
  };

  const loadSavedData = (data) => {
    dispatch({ type: 'LOAD_SAVED_DATA', payload: data });
  };

  const contextValue = {
    checkoutState,
    dispatch,
    updateCustomerData,
    updateShippingData,
    updatePaymentData,
    updateOrderSummary,
    setCurrentStep,
    addCompletedStep,
    resetCheckout,
    loadSavedData
  };

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCheckout = () => {
  const context = React.useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout debe ser usado dentro de un CheckoutProvider');
  }
  return context;
};