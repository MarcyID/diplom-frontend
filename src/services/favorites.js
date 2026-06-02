/**
 * Favorites API service
 */

import { fetchApi } from './api-core.js'

/**
 * Получить всё избранное пользователя
 * @param {number} page - Номер страницы
 * @param {number} pageSize - Размер страницы
 * @returns {Promise<{items: Array, total: number, page: number}>}
 */
export async function getFavorites(page = 1, pageSize = 20) {
    const response = await fetchApi(`/api/v1/favorites?page=${page}&page_size=${pageSize}`, {}, true)
    return {
        items: response?.items || [],
        total: response?.total || 0,
        page: response?.page || 1
    }
}

/**
 * Переключить фильм в избранном (добавить/удалить)
 * @param {number|string} filmId - ID фильма
 * @returns {Promise<{added: boolean}>}
 */
export async function toggleFilm(filmId) {
    const response = await fetchApi(`/api/v1/favorites/toggle/film/${filmId}`, {
        method: 'POST',
    }, true)
    return {
        added: response?.in_favorites ?? true
    }
}

/**
 * Переключить персону в избранном (добавить/удалить)
 * @param {number|string} personId - ID персоны
 * @returns {Promise<{added: boolean}>}
 */
export async function togglePerson(personId) {
    const response = await fetchApi(`/api/v1/favorites/toggle/person/${personId}`, {
        method: 'POST',
    }, true)
    return {
        added: response?.in_favorites ?? true
    }
}

/**
 * Добавить фильм в избранное
 * @param {number|string} filmId - ID фильма
 * @returns {Promise<void>}
 */
export async function addFilm(filmId) {
    await fetchApi(`/api/v1/favorites/film/${filmId}`, {
        method: 'POST',
    }, true)
}

/**
 * Удалить фильм из избранного
 * @param {number|string} filmId - ID фильма
 * @returns {Promise<void>}
 */
export async function removeFilm(filmId) {
    await fetchApi(`/api/v1/favorites/film/${filmId}`, {
        method: 'DELETE',
    }, true)
}

/**
 * Добавить персону в избранное
 * @param {number|string} personId - ID персоны
 * @returns {Promise<void>}
 */
export async function addPerson(personId) {
    await fetchApi(`/api/v1/favorites/person/${personId}`, {
        method: 'POST',
    }, true)
}

/**
 * Удалить персону из избранного
 * @param {number|string} personId - ID персоны
 * @returns {Promise<void>}
 */
export async function removePerson(personId) {
    await fetchApi(`/api/v1/favorites/person/${personId}`, {
        method: 'DELETE',
    }, true)
}
