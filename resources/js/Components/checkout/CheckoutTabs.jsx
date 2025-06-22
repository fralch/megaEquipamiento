import React, { useState } from 'react';
import { useTheme } from '../../storage/ThemeContext';
import CartStep from './steps/CartStep';
import AddressStep from './steps/AddressStep';
import ShippingStep from './steps/ShippingStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmStep from './steps/ConfirmStep';

const CheckoutTabs = ({ cartItems, onUpdateQuantity, onRemoveItem }) => {
    const { isDarkMode } = useTheme();
    const [activeStep, setActiveStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [stepData, setStepData] = useState({
        address: null,
        shipping: null,
        payment: null
    });

    const steps = [
        { id: 1, name: 'Carrito', icon: 'cart' },
        { id: 2, name: 'Dirección', icon: 'location' },
        { id: 3, name: 'Envío', icon: 'shipping' },
        { id: 4, name: 'Pago', icon: 'payment' },
        { id: 5, name: 'Confirmar', icon: 'check' }
    ];

    const getStepIcon = (stepId, isCompleted, isCurrent) => {
        if (isCompleted) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        }
        
        const iconMap = {
            cart: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
            ),
            location: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            shipping: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            payment: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            check: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        };

        return iconMap[steps.find(s => s.id === stepId)?.icon] || <span className="text-sm font-bold">{stepId}</span>;
    };

    const handleStepComplete = (stepId, data = null) => {
        if (!completedSteps.includes(stepId)) {
            setCompletedSteps([...completedSteps, stepId]);
        }
        
        if (data) {
            setStepData(prev => ({ ...prev, ...data }));
        }
        
        // Avanzar al siguiente paso
        if (stepId < 5) {
            setActiveStep(stepId + 1);
        }
    };

    const handleStepClick = (stepId) => {
        // Solo permitir navegar a pasos completados o el siguiente paso
        if (completedSteps.includes(stepId) || stepId === activeStep || stepId === activeStep - 1) {
            setActiveStep(stepId);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return (
                    <CartStep
                        cartItems={cartItems}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemoveItem={onRemoveItem}
                        onComplete={() => handleStepComplete(1)}
                        isDarkMode={isDarkMode}
                    />
                );
            case 2:
                return (
                    <AddressStep
                        onComplete={(data) => handleStepComplete(2, { address: data })}
                        initialData={stepData.address}
                        isDarkMode={isDarkMode}
                    />
                );
            case 3:
                return (
                    <ShippingStep
                        onComplete={(data) => handleStepComplete(3, { shipping: data })}
                        initialData={stepData.shipping}
                        addressData={stepData.address}
                        isDarkMode={isDarkMode}
                    />
                );
            case 4:
                return (
                    <PaymentStep
                        onComplete={(data) => handleStepComplete(4, { payment: data })}
                        initialData={stepData.payment}
                        orderData={{ ...stepData, cartItems }}
                        isDarkMode={isDarkMode}
                    />
                );
            case 5:
                return (
                    <ConfirmStep
                        orderData={{ ...stepData, cartItems }}
                        onComplete={() => handleStepComplete(5)}
                        isDarkMode={isDarkMode}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        Proceso de compra
                    </h1>
                </div>

                {/* Stepper Navigation */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        {/* Línea de progreso */}
                        <div className={`absolute top-6 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div 
                                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                                style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
                            />
                        </div>
                        
                        {steps.map((step) => {
                            const isCompleted = completedSteps.includes(step.id);
                            const isCurrent = step.id === activeStep;
                            const isClickable = isCompleted || step.id === activeStep || step.id === activeStep - 1;
                            
                            return (
                                <div key={step.id} className="flex flex-col items-center relative z-10">
                                    <button
                                        onClick={() => handleStepClick(step.id)}
                                        disabled={!isClickable}
                                        className={`
                                            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                                            ${isCompleted 
                                                ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
                                                : isCurrent 
                                                    ? 'bg-blue-50 border-blue-600 text-blue-600 hover:bg-blue-100' 
                                                    : isDarkMode 
                                                        ? 'bg-gray-800 border-gray-600 text-gray-400'
                                                        : 'bg-white border-gray-300 text-gray-400'
                                            }
                                            ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                                        `}
                                    >
                                        {getStepIcon(step.id, isCompleted, isCurrent)}
                                    </button>
                                    <span className={`
                                        mt-2 text-xs font-medium transition-colors duration-300
                                        ${isCurrent || isCompleted 
                                            ? 'text-blue-600' 
                                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }
                                    `}>
                                        {step.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-transparent">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                    <button
                        onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                        disabled={activeStep === 1}
                        className={`
                            px-6 py-3 rounded-lg font-medium transition-all duration-200
                            ${activeStep === 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isDarkMode
                                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }
                        `}
                    >
                        Anterior
                    </button>
                    
                    <div className="text-sm text-gray-500">
                        Paso {activeStep} de {steps.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutTabs;