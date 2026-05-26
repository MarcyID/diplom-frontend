import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api.js';

/**
 * Хук для загрузки фильма по ID
 * @param {number|string|null} filmId - Kinopoisk film ID
 */
export function useFilm(filmId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadFilm = useCallback(async () => {
        if (!filmId) {
            setData(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const film = await api.getFilmById(filmId);
            setData(film);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [filmId]);

    useEffect(() => {
        loadFilm();
    }, [loadFilm]);

    return { data, loading, error, refetch: loadFilm };
}

/**
 * Хук для загрузки популярных фильмов
 * @param {number} page - Page number
 */
export function usePopularFilms(page = 1) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadFilms = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const films = await api.getPopularFilms(page);
            setData(films);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadFilms();
    }, [loadFilms]);

    return { data, loading, error, refetch: loadFilms };
}

/**
 * Хук для загрузки премьер (Скоро в кино)
 * @param {number} page - Page number
 */
export function usePremieres(page = 1) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadFilms = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const films = await api.getPremieres(page);
            setData(films);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadFilms();
    }, [loadFilms]);

    return { data, loading, error, refetch: loadFilms };
}

/**
 * Хук для поиска фильмов/персон
 * @param {string} query - Search query
 * @param {number} debounceMs - Debounce delay in ms
 */
export function useSearch(query, debounceMs = 200) {
    const [data, setData] = useState({ films: [], persons: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Кэш для результатов поиска
    const cacheRef = useRef({});
    const abortControllerRef = useRef(null);

    useEffect(() => {
        if (!query || query.trim().length < 2) {
            setData({ films: [], persons: [] });
            return;
        }

        // Проверяем кэш
        if (cacheRef.current[query]) {
            setData(cacheRef.current[query]);
            setLoading(false);
            return;
        }

        // Отменяем предыдущий запрос
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Создаём новый AbortController
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setLoading(true);
        setError(null);

        const timer = setTimeout(async () => {
            try {
                const [filmResults, personResults] = await Promise.all([
                    api.searchFilmsByQuery(query, 1).catch(() => []),
                    api.searchActors(query, 1).catch(() => []),
                ]);

                // Проверяем, не был ли запрос отменён
                if (abortController.signal.aborted) {
                    return;
                }

                // API возвращает { items: [...], total: N } или { films: [...] }
                const films = Array.isArray(filmResults) ? filmResults : (filmResults?.films || filmResults?.items || []);

                // API не возвращает professionKey в поиске, показываем всех персон
                const persons = personResults || [];

                const result = { films, persons };
                cacheRef.current[query] = result;
                setData(result);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Search error:', err);
                    setError(err);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        }, debounceMs);

        return () => {
            clearTimeout(timer);
            abortController.abort();
        };
    }, [query, debounceMs]);

    return { data, loading, error };
}

/**
 * Хук для загрузки персоны (актёр/режиссёр) по ID
 * @param {number|string|null} personId - Kinopoisk person ID
 */
export function usePerson(personId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadPerson = useCallback(async () => {
        if (!personId) {
            setData(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const person = await api.getPersonById(personId);
            setData(person);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [personId]);

    useEffect(() => {
        loadPerson();
    }, [loadPerson]);

    return { data, loading, error, refetch: loadPerson };
}

/**
 * Хук для загрузки похожих фильмов
 * @param {number|string|null} filmId - Film ID
 */
export function useSimilarFilms(filmId) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!filmId) {
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        api.getSimilarFilms(filmId)
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [filmId]);

    return { data, loading, error };
}

/**
 * Хук для загрузки предстоящих премьер
 * @param {number} page - Page number
 */
export function useUpcomingFilms(page = 1) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        api.getUpcomingFilms(page)
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [page]);

    return { data, loading, error };
}

/**
 * Хук для загрузки случайного фильма
 * @param {number[]} genres - Optional genre IDs (e.g., [1, 4, 17])
 * @param {number} minRating - Optional minimum rating (default: 7.5)
 */
export function useRandomFilm(genres = [], minRating = 7.5) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadFilm = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const film = await api.getRandomFilm(genres, minRating);
            setData(film);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [genres, minRating]);

    return { data, loading, error, refetch: loadFilm };
}

/**
 * Хук для поиска фильмов по фильтрам
 * @param {Object} initialFilters - Начальные фильтры поиска
 */
export function useFilmSearch(initialFilters = null) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const search = useCallback(async (filters = initialFilters || {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await api.searchFilms(filters, 1);
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [initialFilters]);

    useEffect(() => {
        if (initialFilters) {
            search(initialFilters);
        }
    }, [initialFilters, search]);

    return { data, loading, error, refetch: search };
}

/**
 * Хук для загрузки жанров и стран
 */
export function useFilters() {
    const [data, setData] = useState({ genres: [], countries: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getFilters()
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading, error };
}
