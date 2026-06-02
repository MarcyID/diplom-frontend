/**
 * API Core - базовая функция для API запросов
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

let onAuthExpiredCallback = null

export function setAuthExpiredCallback(callback) {
    onAuthExpiredCallback = callback
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export async function fetchApi(endpoint, options = {}, requiresAuth = false) {
    const url = `${API_BASE_URL}${endpoint}`

    let headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (requiresAuth) {
        const token = getAccessToken()
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))

            let errorMessage = errorData.message || errorData.error || `API Error: ${response.status}`

            if (response.status === 401) {
                if (endpoint.includes('/login')) {
                    errorMessage = 'Неверный email или пароль'
                } else if (endpoint.includes('/register')) {
                    errorMessage = 'Пользователь с таким email уже существует'
                } else if (endpoint.includes('/refresh')) {
                    errorMessage = 'Сессия истекла, выполните вход заново'
                    localStorage.removeItem(ACCESS_TOKEN_KEY)
                    localStorage.removeItem(REFRESH_TOKEN_KEY)
                    localStorage.removeItem('auth_user')
                    if (onAuthExpiredCallback) {
                        onAuthExpiredCallback()
                    }
                } else {
                    errorMessage = 'Необходима авторизация'
                }
            } else if (response.status === 400) {
                errorMessage = errorData.message || errorData.error || 'Некорректные данные'
            } else if (response.status === 403) {
                errorMessage = 'Доступ запрещён'
            } else if (response.status === 404) {
                errorMessage = 'Ресурс не найден'
            } else if (response.status === 409) {
                errorMessage = errorData.message || errorData.error || 'Конфликт данных'
            } else if (response.status === 500) {
                errorMessage = 'Ошибка сервера. Попробуйте позже'
            }

            throw new Error(errorMessage)
        }

        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            const jsonData = await response.json()
            return jsonData.data || jsonData
        }

        return null
    } catch (error) {
        throw error
    }
}
