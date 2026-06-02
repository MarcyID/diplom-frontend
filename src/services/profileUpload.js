/**
 * Profile upload API service
 */

import { fetchApi } from './api-core.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

/**
 * Загрузить аватар пользователя
 * @param {File} file - Файл аватара
 * @returns {Promise<{avatar_url: string, user: Object}>}
 */
export async function uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch(`${API_BASE_URL}/api/v1/profile/avatar`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось загрузить аватар')
    }

    const data = await response.json()
    return {
        avatar_url: data.data?.avatar_url,
        user: data.data?.user
    }
}

/**
 * Загрузить фоновое изображение профиля
 * @param {File} file - Файл баннера
 * @returns {Promise<{banner_url: string, user: Object}>}
 */
export async function uploadBanner(file) {
    const formData = new FormData()
    formData.append('banner', file)

    const response = await fetch(`${API_BASE_URL}/api/v1/profile/banner`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось загрузить фон')
    }

    const data = await response.json()
    return {
        banner_url: data.data?.banner_url,
        user: data.data?.user
    }
}

/**
 * Удалить аватар пользователя
 * @returns {Promise<{message: string, user: Object}>}
 */
export async function deleteAvatar() {
    const response = await fetch(`${API_BASE_URL}/api/v1/profile/avatar`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось удалить аватар')
    }

    const data = await response.json()
    return {
        message: data.data?.message,
        user: data.data?.user
    }
}

/**
 * Удалить фоновое изображение профиля
 * @returns {Promise<{message: string, user: Object}>}
 */
export async function deleteBanner() {
    const response = await fetch(`${API_BASE_URL}/api/v1/profile/banner`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Не удалось удалить фон')
    }

    const data = await response.json()
    return {
        message: data.data?.message,
        user: data.data?.user
    }
}
