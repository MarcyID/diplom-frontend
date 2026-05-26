/**
 * API service для работы с Go-бэкендом (Kinopoisk API proxy)
 * Backend: http://localhost:5454
 */

const API_BASE_URL = 'http://localhost:5454';

/**
 * Base fetch wrapper с обработкой ошибок
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
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
        console.error(`API request failed [${endpoint}]:`, error);
        throw error;
    }
}

// ==================== FILMS ====================

/**
 * Получить фильм по ID
 * @param {number|string} id - Kinopoisk film ID
 * @returns {Promise<import('../../internal/model/kinopoisk/film').KinopoiskFilm>}
 */
export async function getFilmById(id) {
    return fetchApi(`/api/v1/movies/${id}`);
}

/**
 * Получить популярные фильмы (топ)
 * @param {number} page - Page number
 */
export async function getPopularFilms(page = 1) {
    const data = await fetchApi(`/api/v1/films/popular?page=${page}`);
    return data?.items || [];
}

/**
 * Получить предстоящие премьеры
 * @param {number} page - Page number
 */
export async function getUpcomingFilms(page = 1) {
    const data = await fetchApi(`/api/v1/films/upcoming?page=${page}`);
    return data?.items || [];
}

/**
 * Получить премьеры (Скоро в кино)
 * @param {number} page - Page number
 */
export async function getPremieres(page = 1) {
    const now = new Date()
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
    const month = monthNames[now.getMonth()]
    const nextMonthIndex = (now.getMonth() + 1) % 12
    const nextMonth = monthNames[nextMonthIndex]
    const year = now.getFullYear()
    const nextYear = nextMonthIndex === 0 ? year + 1 : year
    // Получаем премьеры текущего и следующего месяца
    const [currentData, nextData] = await Promise.all([
        fetchApi(`/api/v1/films/premieres?page=${page}&month=${month}&year=${year}`).catch(() => ({ items: [] })),
        fetchApi(`/api/v1/films/premieres?page=${page}&month=${nextMonth}&year=${nextYear}`).catch(() => ({ items: [] }))
    ])
    return [...(currentData?.items || []), ...(nextData?.items || [])]
}

/**
 * Получить похожие фильмы
 * @param {number|string} id - Film ID
 */
export async function getSimilarFilms(id) {
    const data = await fetchApi(`/api/v1/movies/${id}/similar`);
    return data?.items || [];
}

/**
 * Текстовый поиск фильмов
 * @param {string} query - Search query
 * @param {number} page - Page number
 */
export async function searchFilmsByQuery(query, page = 1) {
    return fetchApi(`/api/v1/movies/search?query=${encodeURIComponent(query)}&page=${page}`);
}

/**
 * Поиск фильмов по фильтрам
 * @param {Object} filters - Фильтры поиска
 * @param {number[]} filters.genres - Genre IDs
 * @param {number[]} filters.countries - Country IDs (API supports only one)
 * @param {number} filters.yearFrom - Year from
 * @param {number} filters.yearTo - Year to
 * @param {number} filters.ratingMin - Minimum rating
 * @param {number} filters.ratingMax - Maximum rating
 * @param {number} filters.page - Page number
 */
export async function searchFilms(filters = {}, page = 1) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    if (filters.genres && filters.genres.length > 0) {
        filters.genres.forEach(id => params.append('genre', id.toString()));
    }
    if (filters.countries && filters.countries.length > 0) {
        params.append('country', filters.countries[0].toString()); // API supports only one country
    }
    if (filters.yearFrom) params.append('year_from', filters.yearFrom.toString());
    if (filters.yearTo) params.append('year_to', filters.yearTo.toString());
    if (filters.ratingMin && filters.ratingMin > 0) params.append('rating_min', filters.ratingMin.toString());
    if (filters.ratingMax && filters.ratingMax > 0) params.append('rating_max', filters.ratingMax.toString());
    
    const query = params.toString();
    return fetchApi(`/api/v1/movies/search${query ? '?' + query : ''}`);
}

/**
 * Получить случайный фильм
 * @param {number[]} genres - Optional genre IDs (e.g., [1, 4, 17])
 * @param {number} minRating - Optional minimum rating (default: 7.5)
 */
export async function getRandomFilm(genres = [], minRating = 7.5) {
    const params = new URLSearchParams();
    genres.forEach(id => params.append('genre', id.toString()));
    if (minRating && minRating > 0) params.append('min_rating', minRating.toString());
    
    const query = params.toString();
    return fetchApi(`/api/v1/movies/random${query ? '?' + query : ''}`);
}

/**
 * Получить актёров и режиссёров фильма
 * @param {number|string} id - Film ID
 */
export async function getFilmStaff(id) {
    return fetchApi(`/api/v1/movies/${id}/staff`);
}

// ==================== ACTORS / PERSONS ====================

/**
 * Поиск актёров по имени
 * @param {string} query - Search query
 * @param {number} page - Page number
 */
export async function searchActors(query, page = 1) {
    const data = await fetchApi(`/api/v1/actors/search?q=${encodeURIComponent(query)}&page=${page}`);
    return data?.items || [];
}

/**
 * Получить данные об актёре/персоне по ID
 * @param {number|string} id - Kinopoisk person ID
 */
export async function getPersonById(id) {
    return fetchApi(`/api/v1/persons/${id}`);
}

/**
 * Получить режиссёров по имени (фильтр по professionKey)
 * @param {string} query - Search query
 */
export async function searchDirectors(query) {
    const data = await searchActors(query);
    // Фильтруем только режиссёров (бэкенд возвращает всех персон)
    return data.filter(person => 
        person.professionKey === 'DIRECTOR' || 
        person.professionText?.includes('Режиссер')
    );
}

// ==================== GENRES / FILTERS ====================

/**
 * Получить жанры и страны для фильтров
 */
export async function getFilters() {
    return fetchApi('/api/v1/genres');
}

// ==================== GLOBAL SEARCH ====================

/**
 * Глобальный поиск по фильмам и персонам
 * @param {string} query - Search query
 */
export async function globalSearch(query) {
    const [filmResults, actorResults] = await Promise.all([
        searchFilms(query, 1).catch(() => ({ films: [], items: [] })),
        searchActors(query, 1).catch(() => ({ items: [] })),
    ]);

    // filmResults может быть объектом { films: [... } или массивом
    const films = Array.isArray(filmResults) ? filmResults : (filmResults.films || filmResults.items || []);

    // Фильтруем режиссёров
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

/**
 * Форматирует длительность из минут в "Xч Yм"
 * @param {number} minutes 
 */
export function formatDuration(minutes) {
    if (!minutes) return '—';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
}

/**
 * Генерирует градиент на основе ID
 * @param {number} id 
 */
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

/**
 * Получает эмодзи-аватар на основе имени
 */
export function getEmojiAvatar(name) {
    const emojis = ['🎭', '🎬', '🎥', '🎞️', '⭐', '🌟', '🎪', '🎨'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
}

/**
 * Helper для получения основного жанра
 * @param {Array} genres 
 */
export function getMainGenre(genres) {
    return genres?.[0]?.genre || '—';
}

/**
 * Helper для получения основной страны
 * @param {Array} countries 
 */
export function getMainCountry(countries) {
    return countries?.[0]?.country || '—';
}

/**
 * Helper для получения рейтинга
 * @param {Object} film 
 */
export function getRating(film) {
    return film.ratingKinopoisk || film.ratingImdb || 0;
}

/**
 * Helper для получения названия
 * @param {Object} film 
 */
export function getTitle(film) {
    return film.nameRu || film.nameEn || 'Без названия';
}
