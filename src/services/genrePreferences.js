import { fetchApi } from './api-core.js'

/**
 * Получить жанровые предпочтения пользователя
 * @returns {Promise<number[]>} Массив ID жанров
 */
export async function getGenrePreferences() {
    const response = await fetchApi('/api/v1/profile/genres', {}, true)
    return response?.genre_preferences || []
}

/**
 * Обновить жанровые предпочтения пользователя
 * @param {number[]} genrePreferences - Массив ID жанров
 * @returns {Promise<number[]>} Обновлённый массив ID жанров
 */
export async function updateGenrePreferences(genrePreferences) {
    const response = await fetchApi('/api/v1/profile/genres', {
        method: 'PUT',
        body: JSON.stringify({
            genre_preferences: genrePreferences
        })
    }, true)
    return response?.genre_preferences || []
}
