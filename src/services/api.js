/**
 * API service для работы с Go-бэкендом (Kinopoisk API proxy)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, {...defaultOptions, ...options});

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return null;
    } catch (error) {
        throw error;
    }
}

// ==================== FILMS ====================

export async function getFilmById(id) {
    return fetchApi(`/api/v1/movies/${id}`);
}

export async function getPopularFilms(page = 1) {
    const data = await fetchApi(`/api/v1/films/popular?page=${page}`);
    return data?.items || [];
}

export async function getUpcomingFilms(page = 1) {
    const data = await fetchApi(`/api/v1/films/upcoming?page=${page}`);
    return data?.items || [];
}

export async function getPremieres(page = 1) {
    const now = new Date()
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
    const month = monthNames[now.getMonth()]
    const nextMonthIndex = (now.getMonth() + 1) % 12
    const nextMonth = monthNames[nextMonthIndex]
    const year = now.getFullYear()
    const nextYear = nextMonthIndex === 0 ? year + 1 : year
    const [currentData, nextData] = await Promise.all([
        fetchApi(`/api/v1/films/premieres?page=${page}&month=${month}&year=${year}`).catch(() => ({items: []})),
        fetchApi(`/api/v1/films/premieres?page=${page}&month=${nextMonth}&year=${nextYear}`).catch(() => ({items: []}))
    ])
    return [...(currentData?.items || []), ...(nextData?.items || [])]
}

export async function getSimilarFilms(id) {
    const data = await fetchApi(`/api/v1/movies/${id}/similar`);
    return data?.items || [];
}

export async function searchFilmsByQuery(query, page = 1) {
    return fetchApi(`/api/v1/movies/search?query=${encodeURIComponent(query)}&page=${page}`);
}

export async function searchFilms(filters = {}, page = 1) {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters.genres && filters.genres.length > 0) {
        filters.genres.forEach(id => params.append('genre', id.toString()));
    }
    if (filters.countries && filters.countries.length > 0) {
        params.append('country', filters.countries[0].toString());
    }
    if (filters.yearFrom) params.append('year_from', filters.yearFrom.toString());
    if (filters.yearTo) params.append('year_to', filters.yearTo.toString());
    if (filters.ratingMin && filters.ratingMin > 0) params.append('rating_min', filters.ratingMin.toString());
    if (filters.ratingMax && filters.ratingMax > 0) params.append('rating_max', filters.ratingMax.toString());

    const query = params.toString();
    return fetchApi(`/api/v1/movies/search${query ? '?' + query : ''}`);
}

export async function getRandomFilm(genres = [], minRating = 7.5) {
    const params = new URLSearchParams();
    genres.forEach(id => params.append('genre', id.toString()));
    if (minRating && minRating > 0) params.append('min_rating', minRating.toString());

    const query = params.toString();
    return fetchApi(`/api/v1/movies/random${query ? '?' + query : ''}`);
}

export async function getFilmStaff(id) {
    return fetchApi(`/api/v1/movies/${id}/staff`);
}

// ==================== ACTORS / PERSONS ====================

export async function searchActors(query, page = 1) {
    const data = await fetchApi(`/api/v1/actors/search?q=${encodeURIComponent(query)}&page=${page}`);
    return data?.items || [];
}

export async function getPersonById(id) {
    return fetchApi(`/api/v1/persons/${id}`);
}

export async function searchDirectors(query) {
    const data = await searchActors(query);
    return data.filter(person =>
        person.professionKey === 'DIRECTOR' ||
        person.professionText?.includes('Режиссер')
    );
}

// ==================== GENRES / FILTERS ====================

export async function getFilters() {
    return fetchApi('/api/v1/genres');
}

// ==================== GLOBAL SEARCH ====================

export async function globalSearch(query) {
    const [filmResults, actorResults] = await Promise.all([
        searchFilms(query, 1).catch(() => ({films: [], items: []})),
        searchActors(query, 1).catch(() => ({items: []})),
    ]);

    const films = Array.isArray(filmResults) ? filmResults : (filmResults.films || filmResults.items || []);

    const directorResults = (actorResults.items || []).filter(person =>
        person.professionKey === 'DIRECTOR' ||
        person.professionText?.includes('Режиссер')
    );

    return {
        films: films,
        actors: (actorResults.items || []).filter(p => p.professionKey === 'ACTOR'),
        directors: directorResults,
    };
}

// ==================== UTILITY FUNCTIONS ====================

export function formatDuration(minutes) {
    if (!minutes) return '—';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
}

export function generateGradient(id) {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    return gradients[(id || 0) % gradients.length];
}

export function getEmojiAvatar(name) {
    const emojis = ['🎭', '🎬', '🎥', '🎞️', '⭐', '🌟', '🎪', '🎨'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
}

export function getMainGenre(genres) {
    return genres?.[0]?.genre || '—';
}

export function getMainCountry(countries) {
    return countries?.[0]?.country || '—';
}

export function getRating(film) {
    return film.ratingKinopoisk || film.ratingImdb || 0;
}

export function getTitle(film) {
    return film.nameRu || film.nameEn || 'Без названия';
}
