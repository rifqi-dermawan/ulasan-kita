import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx');
        const exactPath = `./Pages/${name}.jsx`;
        if (pages[exactPath]) {
            return resolvePageComponent(exactPath, pages);
        }
        const lowerPath = exactPath.toLowerCase();
        const matchedKey = Object.keys(pages).find((key) => key.toLowerCase() === lowerPath);
        if (matchedKey) {
            return resolvePageComponent(matchedKey, pages);
        }
        return resolvePageComponent(exactPath, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
