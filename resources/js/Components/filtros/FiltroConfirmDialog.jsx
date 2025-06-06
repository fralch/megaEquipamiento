import React from "react";

export default function FiltroConfirmDialog({ open, onCancel, onConfirm, filtro }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                <h4 className="text-lg font-semibold mb-4">¿Eliminar filtro?</h4>
                <p className="mb-6">¿Estás seguro que deseas eliminar el filtro <b>{filtro?.nombre}</b>?</p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={onConfirm}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
