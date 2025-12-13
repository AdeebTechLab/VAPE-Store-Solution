/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#10B981', // emerald-500
                    dark: '#059669', // emerald-600
                    light: '#34D399', // emerald-400
                },
                secondary: {
                    DEFAULT: '#14532D', // green-900 (dark sidebar)
                    dark: '#0D3B2D', // custom dark green
                    light: '#166534', // green-800
                },
                accent: {
                    DEFAULT: '#059669', // emerald-600
                    dark: '#047857', // emerald-700
                    light: '#10B981', // emerald-500
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
