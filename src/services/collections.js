/**
 * Collections API service
 * Backend: http://localhost:5454
 */

import { fetchApi } from './api-core.js'

/**
 * Получить все подборки текущего пользователя
 * @param {number} page - Номер страницы
 * @param {number} pageSize - Размер страницы
 * @returns {Promise<{items: Array, total: number, page: number}>}
 */
export async function getMyCollections(page = 1, pageSize = 20) {
    const response = await fetchApi(`/api/v1/collections/my?page=${page}&page_size=${pageSize}`, {}, true)
    return {
        items: response?.items || [],
        total: response?.total || 0,
        page: response?.page || 1
    }
}

/**
 * Создать новую подборку
 * @param {Object} collectionData - Данные подборки
 * @param {string} collectionData.title - Название
 * @param {string} [collectionData.description] - Описание
 * @param {boolean} [collectionData.is_public=true] - Публичная ли подборка
 * @returns {Promise<Object>} Созданная подборка
 */
export async function createCollection(collectionData) {
    const response = await fetchApi('/api/v1/collections', {
        method: 'POST',
        body: JSON.stringify({
            title: collectionData.title,
            description: collectionData.description || '',
            is_public: collectionData.is_public !== false
        }),
    }, true)
    return response?.collection || null
}

/**
 * Получить подборку по ID
 * @param {number|string} collectionId - ID подборки
 * @returns {Promise<Object>} Подборка с фильмами
 */
export async function getCollection(collectionId) {
    const response = await fetchApi(`/api/v1/collections/${collectionId}`, {}, false)
    return response?.collection || null
}

/**
 * Обновить подборку
 * @param {number|string} collectionId - ID подборки
 * @param {Object} updates - Поля для обновления
 * @param {string} [updates.title] - Название
 * @param {string} [updates.description] - Описание
 * @param {boolean} [updates.is_public] - Публичность
 * @returns {Promise<Object>} Обновлённая подборка
 */
export async function updateCollection(collectionId, updates) {
    const response = await fetchApi(`/api/v1/collections/${collectionId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    }, true)
    return response?.collection || null
}

/**
 * Удалить подборку
 * @param {number|string} collectionId - ID подборки
 * @returns {Promise<void>}
 */
export async function deleteCollection(collectionId) {
    await fetchApi(`/api/v1/collections/${collectionId}`, {
        method: 'DELETE',
    }, true)
}

/**
 * Добавить фильм в подборку
 * @param {number|string} collectionId - ID подборки
 * @param {number|string} filmId - ID фильма
 * @param {number} [position] - Позиция фильма
 * @returns {Promise<void>}
 */
export async function addFilmToCollection(collectionId, filmId, position) {
    await fetchApi(`/api/v1/collections/${collectionId}/films`, {
        method: 'POST',
        body: JSON.stringify({
            film_id: filmId,
            position: position || 0
        }),
    }, true)
}

/**
 * Удалить фильм из подборки
 * @param {number|string} collectionId - ID подборки
 * @param {number|string} filmId - ID фильма
 * @returns {Promise<void>}
 */
export async function removeFilmFromCollection(collectionId, filmId) {
    await fetchApi(`/api/v1/collections/${collectionId}/films/${filmId}`, {
        method: 'DELETE',
    }, true)
}

/**
 * Изменить порядок фильмов в подборке
 * @param {number|string} collectionId - ID подборки
 * @param {Object.<number, number>} filmPositions - { filmId: position }
 * @returns {Promise<void>}
 */
export async function reorderCollectionFilms(collectionId, filmPositions) {
    await fetchApi(`/api/v1/collections/${collectionId}/films/reorder`, {
        method: 'PUT',
        body: JSON.stringify({
            film_positions: filmPositions
        }),
    }, true)
}

/**
 * Получить публичные подборки пользователя
 * @param {number|string} userId - ID пользователя
 * @param {number} page - Номер страницы
 * @param {number} pageSize - Размер страницы
 * @returns {Promise<{items: Array, total: number, page: number}>}
 */
export async function getUserCollections(userId, page = 1, pageSize = 20) {
    const response = await fetchApi(`/api/v1/users/${userId}/collections?page=${page}&page_size=${pageSize}`, {}, false)
    return {
        items: response?.items || [],
        total: response?.total || 0,
        page: response?.page || 1
    }
}
