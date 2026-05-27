/**
 * Profile API service
 * Backend: http://localhost:5454
 */

import { fetchApi } from './api-core.js'

/**
 * Получить данные профиля текущего пользователя
 * @returns {Promise<Object>} Данные профиля
 */
export async function getProfile() {
    const response = await fetchApi('/api/v1/profile/me', {}, true)
    return response?.user || null
}

/**
 * Обновить данные профиля
 * @param {Object} updates - Поля для обновления
 * @param {string} [updates.full_name] - Полное имя
 * @param {string} [updates.avatar_url] - URL аватара
 * @param {string} [updates.banner_url] - URL баннера
 * @returns {Promise<Object>} Обновлённые данные пользователя
 */
export async function updateProfile(updates) {
    const response = await fetchApi('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
    }, true)
    return response?.user || null
}
