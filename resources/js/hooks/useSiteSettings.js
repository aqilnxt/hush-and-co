import { useCallback, useEffect, useState } from 'react';
import api, { backendBaseUrl } from '../api/axios';

const defaultSettings = {
    logo: '/images/hush-co-logo.png',
    hero_image: '/images/hush-co-lifestyle.png',
    about_image: '/images/hush-co-about.png',
    auth_bg: '/images/hush-co-cafe.png',
};

let cachedSettings = null;
let cachedPromise = null;

export function resolveSiteImage(url, fallback) {
    if (!url) {
        return fallback;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    if (url.startsWith('/storage/')) {
        return `${backendBaseUrl}${url}`;
    }

    if (url.startsWith('/')) {
        return url;
    }

    if (url.startsWith('storage/')) {
        return `${backendBaseUrl}/${url}`;
    }

    return `${backendBaseUrl}/${url}`;
}

export default function useSiteSettings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (cachedSettings) {
            setSettings(cachedSettings);
            setLoading(false);
            return cachedSettings;
        }

        if (!cachedPromise) {
            cachedPromise = api
                .get('/site-settings')
                .then((response) => {
                    const data = response.data?.data || {};
                    const merged = {
                        ...defaultSettings,
                        ...data,
                    };
                    cachedSettings = merged;
                    return merged;
                })
                .catch(() => {
                    return defaultSettings;
                });
        }

        const result = await cachedPromise;
        setSettings(result);
        setLoading(false);
        return result;
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { settings, loading, refresh };
}
