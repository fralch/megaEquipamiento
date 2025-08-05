import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/storage/ThemeContext';

export default function AuthenticatedLayout({ children, header }) {
    const { auth } = usePage().props;
    const { isDarkMode } = useTheme();

    const handleLogout = () => {
        window.location.href = '/logout';
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
        }`}>
            <nav className={`border-b transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className={`text-xl font-semibold transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}
                            >
                                MegaEquipamiento
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            {auth.user && (
                                <>
                                    <span className={`text-sm transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {auth.user.name || auth.user.nombre_usuario}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                                            isDarkMode 
                                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                : 'bg-red-500 hover:bg-red-600 text-white'
                                        }`}
                                    >
                                        Cerrar Sesión
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className={`shadow transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}