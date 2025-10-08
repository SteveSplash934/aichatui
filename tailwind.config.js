/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                light: {
                    bg: "var(--color-light-bg)",
                    button: {
                        text: "var(--color-light-button-text)",
                        bg: "var(--color-light-button-bg)",
                        muted: "var(--color-light-button-muted)",
                    },
                    placeholder: "var(--color-light-placeholder)",
                },
                dark: {
                    bg: "var(--color-dark-bg)",
                    button: {
                        text: "var(--color-dark-button-text)",
                        bg: "var(--color-dark-button-bg)",
                        muted: "var(--color-dark-button-muted)",
                    },
                    placeholder: "var(--color-dark-placeholder)",
                },
            },
            fontFamily: {
                heading: "var(--font-heading)",
                body: "var(--font-body)",
                caption: "var(--font-caption)",
            },
        },
    },
    darkMode: ["class", "[data-theme='dark']"],
    plugins: [],
};
