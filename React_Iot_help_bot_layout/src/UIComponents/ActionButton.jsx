import React from 'react';

export default function ActionButton({ text, backgroundColor, onClick, className = '' }) {
    // Map standard CSS colors used in the provided snippet to Tailwind equivalents
    const colorMap = {
        'CornflowerBlue': 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
        'Crimson': 'bg-red-500 hover:bg-red-600 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900',
        'Gray': 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800'
    };

    const baseStyle = colorMap[backgroundColor] || 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-300 dark:bg-indigo-600 dark:hover:bg-indigo-700';

    return (
        <button
            onClick={onClick}
            className={`text-white text-xs font-medium px-3 py-1.5 rounded shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none ${baseStyle} ${className}`}
        >
            {text}
        </button>
    );
}
