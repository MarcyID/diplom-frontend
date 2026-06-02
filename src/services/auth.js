/**
 * Auth API service для работы с Go-бэкендом
 */

import { fetchApi, getAccessToken, getRefreshToken } from './api-core.js'

// Ключ для localStorage
const USER_KEY = 'auth_user'

/**
 * Сохранить токены и данные пользователя
 */
export function saveAuthData(tokens, user) {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Получить access token (экспорт для совместимости)
 */
export { getAccessToken } from './api-core.js'

/**
 * Получить refresh token (экспорт для совместимости)
 */
export { getRefreshToken } from './api-core.js'

/**
 * Получить данные пользователя
 */
export function getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Проверить, авторизован ли пользователь
 */
export function isAuthenticated() {
    return !!getAccessToken();
}

/**
 * Очистить данные авторизации (logout)
 */
export function clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(USER_KEY);
}

/**
 * Регистрация нового пользователя
 * @param {Object} credentials - Данные регистрации
 * @param {string} credentials.email - Email
 * @param {string} credentials.username - Имя пользователя (3-50 символов)
 * @param {string} credentials.password - Пароль (6-72 символа)
 * @param {string} [credentials.full_name] - Полное имя (опционально)
 * @returns {Promise<{user: Object, access_token: string, refresh_token: string}>}
 */
export async function register(credentials) {
    const response = await fetchApi('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

    if (response?.user) {
        // Автоматический вход после успешной регистрации
        const loginResponse = await login({
            email: credentials.email,
            password: credentials.password,
        });
        return loginResponse;
    }

    return response;
}

/**
 * Вход пользователя
 * @param {Object} credentials - Данные для входа
 * @param {string} credentials.email - Email
 * @param {string} credentials.password - Пароль
 * @returns {Promise<{user: Object, access_token: string, refresh_token: string}>}
 */
export async function login(credentials) {
    const response = await fetchApi('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

    // Сохраняем токены и данные пользователя
    if (response?.user && response?.access_token && response?.refresh_token) {
        saveAuthData(
            { access_token: response.access_token, refresh_token: response.refresh_token },
            response.user
        );
    }

    return response;
}

/**
 * Выход пользователя
 * @returns {Promise<void>}
 */
export async function logout() {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
        try {
            await fetchApi('/api/v1/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
        } catch (error) {
            // Продолжаем очистку даже если API вызов не удался
        }
    }

    clearAuthData();
}

/**
 * Получить данные текущего пользователя
 * @returns {Promise<Object>} Данные пользователя
 */
export async function getMe() {
    const response = await fetchApi('/api/v1/auth/me', {}, true);
    return response;
}

/**
 * Обновить пару токенов
 * @param {string} token - Refresh token
 * @returns {Promise<{user: Object, access_token: string, refresh_token: string}>}
 */
export async function refreshAuthTokens(token) {
    const response = await fetchApi('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: token }),
    });

    // Сохраняем новые токены
    if (response?.user && response?.access_token && response?.refresh_token) {
        saveAuthData(
            { access_token: response.access_token, refresh_token: response.refresh_token },
            response.user
        );
    }

    return response;
}

/**
 * Обновить токен если он истёк
 * @param {Function} onAuthExpired - Callback для открытия окна логина
 * @returns {Promise<string|null>} Новый access token или null
 */
export async function ensureValidToken(onAuthExpired) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        if (onAuthExpired) onAuthExpired();
        return null;
    }

    try {
        const response = await refreshAuthTokens(refreshToken);
        return response?.access_token || null;
    } catch (error) {
        console.error('[Auth API] Token refresh failed:', error);
        clearAuthData();
        if (onAuthExpired) onAuthExpired();
        return null;
    }
}
