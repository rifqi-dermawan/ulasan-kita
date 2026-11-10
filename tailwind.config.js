import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    white: '#FFFFFF',
                    'mint-light': '#E8F5F1',
                    'mint-medium': '#B2DFDB',
                    'mint-primary': '#26A69A',
                    'mint-dark': '#1E6B65',
                    'dark-text': '#2C3E50',
                },
                mint: {
                    light: '#E8F5F1',
                    medium: '#B2DFDB',
                    primary: '#26A69A',
                    dark: '#1E6B65',
                },
                'dark-text': '#2C3E50',
            },
            borderRadius: {
                'card': '8px',
                'modal': '16px',
            },
            boxShadow: {
                'soft': '0 2px 8px -1px rgba(38, 166, 154, 0.08), 0 1px 4px -1px rgba(44, 62, 80, 0.06)',
                'soft-lg': '0 10px 25px -5px rgba(38, 166, 154, 0.1), 0 8px 10px -6px rgba(44, 62, 80, 0.05)',
            },
        },
    },

    plugins: [forms],
};
