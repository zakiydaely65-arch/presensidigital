/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1', // Indigo
                    dark: '#4f46e5',
                },
                secondary: '#f59e0b', // Amber
                success: '#10b981', // Green
                warning: '#f59e0b', // Orange
                danger: '#ef4444', // Red
            },
        },
    },
    plugins: [],
}
