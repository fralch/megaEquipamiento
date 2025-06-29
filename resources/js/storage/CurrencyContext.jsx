import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState('USD');
    const [locale, setLocale] = useState('en-US');

    // Mapeo de monedas con tasas de cambio
    const currencyMap = {
        'dollar': { code: 'USD', locale: 'en-US', symbol: '$', rate: 1 },
        'sol': { code: 'PEN', locale: 'es-PE', symbol: 'S/', rate: 3.55 },
        'euro': { code: 'EUR', locale: 'de-DE', symbol: '€', rate: 0.85 }
    };

    const changeCurrency = (currencyType) => {
        const currencyInfo = currencyMap[currencyType];
        if (currencyInfo) {
            setCurrency(currencyInfo.code);
            setLocale(currencyInfo.locale);
        }
    };

    const convertPrice = (priceInUSD, targetCurrencyType = null) => {
        // Si no se especifica moneda objetivo, usar la actual
        const targetCurrency = targetCurrencyType || Object.keys(currencyMap).find(key => currencyMap[key].code === currency);
        const currencyInfo = currencyMap[targetCurrency];
        
        if (currencyInfo) {
            return priceInUSD * currencyInfo.rate;
        }
        return priceInUSD;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatPrice = (priceInUSD) => {
        const convertedPrice = convertPrice(priceInUSD);
        return formatCurrency(convertedPrice);
    };

    const value = {
        currency,
        locale,
        changeCurrency,
        formatCurrency,
        formatPrice,
        convertPrice,
        currencyMap
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export default CurrencyContext;