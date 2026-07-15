import { useState, useEffect } from "react";
import axios from "axios";

const URL_API = import.meta.env.VITE_API_URL || "";
const CACHE_KEY = "mega_secciones";
const CACHE_TS_KEY = "mega_secciones_ts";
const TTL_MS = 60 * 60 * 1000;

const readCache = () => {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        const ts = localStorage.getItem(CACHE_TS_KEY);
        if (!raw || !ts) return null;
        if (Date.now() - parseInt(ts, 10) >= TTL_MS) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

export default function useSecciones() {
    const [secciones, setSecciones] = useState(() => readCache() || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (secciones.length > 0) return;

        const controller = new AbortController();
        setLoading(true);

        axios
            .get(`${URL_API}/api/secciones`, { signal: controller.signal })
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : [];
                setSecciones(data);
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
                } catch {
                    /* localStorage full or disabled, ignore */
                }
            })
            .catch((err) => {
                if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
                    console.error("useSecciones: error fetching secciones", err);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, []);

    return { secciones, loading };
}
