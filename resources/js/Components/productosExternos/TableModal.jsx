import { useEffect } from 'react';
import { useTheme } from '../../storage/ThemeContext';

export default function TableModal({ isOpen, onClose, tables, title = "Tablas" }) {
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const handleEscape = (e) => {
            if (isOpen && e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (e) => {
            if (isOpen && e.target === e.currentTarget) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const normalizeCell = (cell) => {
        if (cell == null) return '';
        if (typeof cell === 'string') return cell.trim();
        try {
            const s = JSON.stringify(cell);
            return s === '{}' || s === '[]' || s === 'null' ? '' : s.trim();
        } catch {
            return '';
        }
    };

    const isRowEmpty = (row) => {
        const arr = Array.isArray(row) ? row : [row];
        return arr.every((c) => normalizeCell(c) === '');
    };

    const renderTable = (table, index) => {
        if (!table) return null;

        const rawHeaders = Array.isArray(table.headers) ? table.headers : [];
        const rawRows = Array.isArray(table.rows) ? table.rows : [];

        const headers = rawHeaders.map((h) => (typeof h === 'string' ? h.trim() : ''));
        const allHeadersEmpty = headers.length > 0 && headers.every((h) => h === '');

        const rows = [];
        let prevEmpty = false;
        for (const r of rawRows) {
            const empty = isRowEmpty(r);
            if (empty) {
                if (prevEmpty) continue;
                prevEmpty = true;
                continue;
            }
            prevEmpty = false;
            rows.push(r);
        }

        if ((rows.length === 0) && (allHeadersEmpty || rawHeaders.length === 0)) return null;

        return (
            <div key={index} className="overflow-x-auto mb-6 last:mb-0">
                <table
                    className={`w-full border-collapse text-sm ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-300'
                    }`}
                    role="table"
                    aria-label={`Tabla ${index + 1}`}
                >
                    {!allHeadersEmpty && headers.length > 0 && (
                        <thead>
                            <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                                {headers.map((header, idx) => (
                                    <th
                                        key={idx}
                                        className={`border px-3 py-2 text-left font-semibold ${
                                            isDarkMode
                                                ? 'border-gray-700 text-gray-200'
                                                : 'border-gray-300 text-gray-900'
                                        }`}
                                        scope="col"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    {rows.length > 0 && (
                        <tbody>
                            {rows.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className={`${
                                        isDarkMode
                                            ? 'odd:bg-gray-800/40 hover:bg-gray-800/60'
                                            : 'odd:bg-gray-50 hover:bg-gray-100'
                                    } transition-colors`}
                                >
                                    {(Array.isArray(row) ? row : [row]).map((cell, cellIdx) => (
                                        <td
                                            key={cellIdx}
                                            className={`border px-3 py-2 ${
                                                isDarkMode
                                                    ? 'border-gray-700 text-gray-300'
                                                    : 'border-gray-300 text-gray-700'
                                            }`}
                                        >
                                            {normalizeCell(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
        );
    };

    if (!isOpen) return null;

    const tableNodes = tables.map((t, idx) => renderTable(t, idx)).filter(Boolean);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div
                className={`absolute inset-0 transition-opacity ${
                    isDarkMode ? 'bg-black/70' : 'bg-black/50'
                }`}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                className={`relative w-full max-w-6xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${
                    isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${
                    isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                    <h3
                        id="modal-title"
                        className={`text-lg font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                        {title} {tableNodes.length > 0 && `(${tableNodes.length})`}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        }`}
                        aria-label="Cerrar modal"
                    >
                        Cerrar
                    </button>
                </div>

                {/* Content */}
                <div className={`p-6 overflow-y-auto ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                }`} style={{ maxHeight: 'calc(90vh - 80px)' }}>
                    {tableNodes.length > 0 ? (
                        <div className="space-y-6">
                            {tableNodes}
                        </div>
                    ) : (
                        <div className={`text-center py-12 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            <p className="text-base">No hay tablas con contenido disponibles.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
