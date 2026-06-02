/**
 * API Core - базовая функция для API запросов
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

let onAuthExpiredCallback = null
let isRefreshing = false
let refreshPromise = null

export function setAuthExpiredCallback(callback) {
    onAuthExpiredCallback = callback
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Обновить пару токенов
 */
async function refreshTokens() {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
        throw new Error('No refresh token')
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
        throw new Error('Token refresh failed')
    }

    const data = await response.json()
    
    // Сохраняем новые токены
    localStorage.setItem(ACCESS_TOKEN_KEY, data.data.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refresh_token)
    if (data.data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.data.user))
    }

    return data.data.access_token
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

        // Если получили 401 и это не запрос на refresh
        if (response.status === 401 && !endpoint.includes('/refresh') && requiresAuth) {
            // Если уже идёт обновление токена - ждём его
            if (isRefreshing) {
                await refreshPromise
                // Повторяем запрос с новым токеном
                const newToken = getAccessToken()
                headers['Authorization'] = `Bearer ${newToken}`
                const retryResponse = await fetch(url, {
                    ...options,
                    headers,
                })
                return handleResponse(retryResponse, endpoint)
            }

            // Запускаем обновление токена
            isRefreshing = true
            refreshPromise = refreshTokens()
                .catch(err => {
                    // Ошибка обновления - выходим
                    localStorage.removeItem(ACCESS_TOKEN_KEY)
                    localStorage.removeItem(REFRESH_TOKEN_KEY)
                    localStorage.removeItem('auth_user')
                    if (onAuthExpiredCallback) {
                        onAuthExpiredCallback()
                    }
                    throw err
                })
                .finally(() => {
                    isRefreshing = false
                    refreshPromise = null
                })

            const newToken = await refreshPromise
            
            // Повторяем запрос с новым токеном
            headers['Authorization'] = `Bearer ${newToken}`
            const retryResponse = await fetch(url, {
                ...options,
                headers,
            })
            return handleResponse(retryResponse, endpoint)
        }

        return handleResponse(response, endpoint)
    } catch (error) {
        throw error
    }
}

/**
 * Обработка ответа
 */
async function handleResponse(response, endpoint) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        let errorMessage = errorData.message || errorData.error || `API Error: ${response.status}`

        if (response.status === 401) {
            if (endpoint.includes('/login')) {
                errorMessage = 'Неверный email или пароль'
            } else if (endpoint.includes('/register')) {
                errorMessage = 'Пользователь с таким email уже существует'
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
}
