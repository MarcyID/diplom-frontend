/**
 * Collections API service
 * Backend: http://localhost:5454
 */

import { fetchApi } from './api-core.js'

const API_BASE_URL = 'http://localhost:5454'

/**
 * Получить все подборки текущего пользователя
 * @param {number} page - Номер страницы (начиная с 1)
 * @param {number} pageSize - Количество элементов на странице
 * @returns {Promise<{items: Array, total: number, page: number}>}
 */
export async function getMyCollections(page = 1, pageSize = 20) {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/my?page=${page}&page_size=${pageSize}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось загрузить подборки')
    }

    const data = await response.json()
    return data.data || { items: [], total: 0, page }
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
    const response = await fetch(`${API_BASE_URL}/api/v1/collections`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
            title: collectionData.title,
            description: collectionData.description || null,
            is_public: collectionData.is_public !== false
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось создать подборку')
    }

    const data = await response.json()
    return data.data?.collection || null
}

/**
 * Получить подборку по ID
 * @param {number|string} collectionId - ID подборки
 * @returns {Promise<Object>} Подборка с фильмами
 */
export async function getCollection(collectionId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось загрузить подборку')
    }

    const data = await response.json()
    return data.data?.collection || null
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
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(updates),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось обновить подборку')
    }

    const data = await response.json()
    return data.data?.collection || null
}

/**
 * Удалить подборку
 * @param {number|string} collectionId - ID подборки
 * @returns {Promise<void>}
 */
export async function deleteCollection(collectionId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось удалить подборку')
    }
}

/**
 * Добавить фильм в подборку
 * @param {number|string} collectionId - ID подборки
 * @param {number|string} filmId - ID фильма (kinopoiskId)
 * @returns {Promise<void>}
 */
export async function addFilmToCollection(collectionId, filmId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}/films`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
            film_id: filmId
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось добавить фильм в подборку')
    }
}

/**
 * Удалить фильм из подборки
 * @param {number|string} collectionId - ID подборки
 * @param {number|string} filmId - ID фильма
 * @returns {Promise<void>}
 */
export async function removeFilmFromCollection(collectionId, filmId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}/films/${filmId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось удалить фильм из подборки')
    }
}

/**
 * Изменить порядок фильмов в подборке
 * @param {number|string} collectionId - ID подборки
 * @param {Object.<number, number>} filmPositions - { filmId: position }
 * @returns {Promise<void>}
 */
export async function reorderCollectionFilms(collectionId, filmPositions) {
    const response = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}/films/reorder`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
            film_positions: filmPositions
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось изменить порядок фильмов')
    }
}

/**
 * Получить публичные подборки пользователя
 * @param {number|string} userId - ID пользователя
 * @param {number} page - Номер страницы (начиная с 1)
 * @param {number} pageSize - Количество элементов на странице
 * @returns {Promise<{items: Array, total: number, page: number}>}
 */
export async function getUserCollections(userId, page = 1, pageSize = 20) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/collections?page=${page}&page_size=${pageSize}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось загрузить подборки пользователя')
    }

    const data = await response.json()
    return data.data || { items: [], total: 0, page }
}
