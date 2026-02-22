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
                    DEFAULT: '#0F172A', // Slate 900
                    dark: '#020617', // Slate 950
                    light: '#334155', // Slate 700
                },
                accent: {
                    DEFAULT: '#2563EB', // Blue 600
                    dark: '#1D4ED8', // Blue 700
                    light: '#3B82F6', // Blue 500
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    muted: '#F8FAFC', // Slate 50
                    dark: '#F1F5F9', // Slate 100
                }
            },
            fontFamily: {
                sans: ['var(--font-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'premium-hover': '0 10px 40px -4px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
}
