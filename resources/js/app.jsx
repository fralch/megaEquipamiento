import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { CartProvider } from './storage/CartContext';
import { CompareProvider } from './storage/CompareContext';
import { ThemeProvider } from './storage/ThemeContext';
import { CurrencyProvider } from './storage/CurrencyContext';
import { RecentlyViewedProvider } from './storage/RecentlyViewedContext';
import { CRMProvider } from './storage/CRMContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <CurrencyProvider>
                    <CartProvider>
                        <CompareProvider>
                            <RecentlyViewedProvider>
                                <CRMProvider>
                                    <App {...props} />
                                </CRMProvider>
                            </RecentlyViewedProvider>
                        </CompareProvider>
                    </CartProvider>
                </CurrencyProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
