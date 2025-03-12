import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [showOptionalFields, setShowOptionalFields] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    
    const loginForm = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const registerForm = useForm({
        nombre_usuario: '',
        correo: '',
        contraseña: '',
        nombre: '',
        direccion: '',
        telefono: '',
    });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        loginForm.post(route('login.submit'));
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        registerForm.post(route('register'));
    };

    const buttonClasses = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#005dad] hover:bg-[#004c8e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005dad] disabled:opacity-50 transition-colors duration-200";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                    </h2>
                </div>

                {isLogin ? (
                    <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">Correo Electrónico</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#005dad] focus:border-[#005dad] focus:z-10 sm:text-sm"
                                    placeholder="Correo Electrónico"
                                    value={loginForm.data.email}
                                    onChange={e => loginForm.setData('email', e.target.value)}
                                />
                                {loginForm.errors.email && <div className="text-red-500 text-sm mt-1">{loginForm.errors.email}</div>}
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#005dad] focus:border-[#005dad] focus:z-10 sm:text-sm pr-10"
                                    placeholder="Contraseña"
                                    value={loginForm.data.password}
                                    onChange={e => loginForm.setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                                {loginForm.errors.password && <div className="text-red-500 text-sm mt-1">{loginForm.errors.password}</div>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#005dad] focus:ring-[#005dad] border-gray-300 rounded"
                                    checked={loginForm.data.remember}
                                    onChange={e => loginForm.setData('remember', e.target.checked)}
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                                    Recordarme
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-[#005dad] hover:text-[#004c8e]">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loginForm.processing}
                                className={buttonClasses}
                            >
                                {loginForm.processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#005dad] focus:border-[#005dad] focus:z-10 sm:text-sm"
                                    placeholder="Usuario"
                                    value={registerForm.data.nombre_usuario}
                                    onChange={e => registerForm.setData('nombre_usuario', e.target.value)}
                                />
                                {registerForm.errors.nombre_usuario && <div className="text-red-500 text-sm mt-1">{registerForm.errors.nombre_usuario}</div>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#005dad] focus:border-[#005dad] focus:z-10 sm:text-sm"
                                    placeholder="Nombre"
                                    value={registerForm.data.nombre}
                                    onChange={e => registerForm.setData('nombre', e.target.value)}
                                />
                                {registerForm.errors.nombre && <div className="text-red-500 text-sm mt-1">{registerForm.errors.nombre}</div>}
                            </div>
                            <div>
                                <input
                                    type="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#005dad] focus:border-[#005dad] focus:z-10 sm:text-sm"
                                    placeholder="Correo Electrónico"
                                    value={registerForm.data.correo}
                                    onChange={e => registerForm.setData('correo', e.target.value)}
                                />
                                {registerForm.errors.correo && <div className="text-red-500 text-sm mt-1">{registerForm.errors.correo}</div>}
                            </div>
                            <div className="relative">
                                <input
                                    type={showRegisterPassword ? "text" : "password"}
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#005dad] focus:border-[#005dad] focus:z-10 sm:text-sm pr-10"
                                    placeholder="Contraseña"
                                    value={registerForm.data.contraseña}
                                    onChange={e => registerForm.setData('contraseña', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                >
                                    {showRegisterPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                                {registerForm.errors.contraseña && <div className="text-red-500 text-sm mt-1">{registerForm.errors.contraseña}</div>}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                                    className="text-sm font-medium text-[#005dad] hover:text-[#004c8e] focus:outline-none"
                                >
                                    {showOptionalFields ? 'Ocultar campos opcionales' : 'Mostrar campos opcionales'}
                                </button>
                            </div>

                            {showOptionalFields && (
                                <>
                                    <div>
                                        <input
                                            type="text"
                                            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#005dad] focus:border-[#005dad] focus:z-10 sm:text-sm"
                                            placeholder="Dirección (Opcional)"
                                            value={registerForm.data.direccion}
                                            onChange={e => registerForm.setData('direccion', e.target.value)}
                                        />
                                        {registerForm.errors.direccion && <div className="text-red-500 text-sm mt-1">{registerForm.errors.direccion}</div>}
                                    </div>
                                    <div>
                                        <input
                                            type="tel"
                                            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#005dad] focus:border-[#005dad] focus:z-10 sm:text-sm"
                                            placeholder="Teléfono (Opcional)"
                                            value={registerForm.data.telefono}
                                            onChange={e => registerForm.setData('telefono', e.target.value)}
                                        />
                                        {registerForm.errors.telefono && <div className="text-red-500 text-sm mt-1">{registerForm.errors.telefono}</div>}
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={registerForm.processing}
                                className={buttonClasses}
                            >
                                {registerForm.processing ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-medium text-[#005dad] hover:text-[#004c8e]"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
}