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
                    DEFAULT: '#000000',
                    dark: '#111111',
                    light: '#333333',
                },
                accent: {
                    DEFAULT: '#FF90E8',
                    dark: '#FF70E0',
                    light: '#FFA8EE',
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    muted: '#FFE600',
                    dark: '#F0E000',
                }
            },
            fontFamily: {
                sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                mono: ['"Space Mono"', 'monospace'],
            },
            boxShadow: {
                'neo':    '6px 6px 0px 0px #000000',
                'neo-sm': '3px 3px 0px 0px #000000',
                'neo-lg': '8px 8px 0px 0px #000000',
                'neo-xl': '12px 12px 0px 0px #000000',
                'neo-pink': '6px 6px 0px 0px #FF90E8',
                'neo-yellow': '6px 6px 0px 0px #FFE600',
                'premium': '4px 4px 0px 0px #000000',
                'premium-hover': '2px 2px 0px 0px #000000',
            }
        },
    },
    plugins: [],
}
