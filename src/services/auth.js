/**
 * Auth API service для работы с Go-бэкендом
 * Backend: http://localhost:5454
 */

const API_BASE_URL = 'http://localhost:5454';

// Ключи для localStorage
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

/**
 * Base fetch wrapper с обработкой ошибок и авторизацией
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @param {boolean} requiresAuth - Требуется ли авторизация
 * @returns {Promise<any>} Response data
 */
async function fetchApi(endpoint, options = {}, requiresAuth = false) {
    const url = `${API_BASE_URL}${endpoint}`;

    let headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Добавляем токен авторизации если требуется
    if (requiresAuth) {
        const token = getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // Формируем понятные сообщения об ошибках
            let errorMessage = errorData.message || `API Error: ${response.status}`;
            
            if (response.status === 401) {
                if (endpoint.includes('/login')) {
                    errorMessage = 'Неверный email или пароль';
                } else if (endpoint.includes('/register')) {
                    errorMessage = 'Пользователь с таким email уже существует';
                } else {
                    errorMessage = 'Необходима авторизация';
                }
            } else if (response.status === 400) {
                errorMessage = errorData.message || 'Некорректные данные';
            } else if (response.status === 403) {
                errorMessage = 'Доступ запрещён';
            } else if (response.status === 404) {
                errorMessage = 'Ресурс не найден';
            } else if (response.status === 500) {
                errorMessage = 'Ошибка сервера. Попробуйте позже';
            }
            
            throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const jsonData = await response.json();
            console.log('[Auth API] Raw response:', jsonData)
            // Backend возвращает { data: {...}, message: "..." } - разворачиваем data
            const unwrapped = jsonData.data || jsonData;
            console.log('[Auth API] Unwrapped data:', unwrapped)
            return unwrapped;
        }

        return null;
    } catch (error) {
        console.error(`Auth API request failed [${endpoint}]:`, error);
        throw error;
    }
}

// ==================== TOKEN MANAGEMENT ====================

/**
 * Сохранить токены и данные пользователя
 */
export function saveAuthData(tokens, user) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Получить access token
 */
export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Получить refresh token
 */
export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

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
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// ==================== AUTH ENDPOINTS ====================

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
    console.log('[Auth API] Register request:', credentials.email)
    const response = await fetchApi('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
    console.log('[Auth API] Register response:', response)

    // Register endpoint возвращает { message, user: {...} } без токенов
    // После регистрации нужно автоматически выполнить вход
    if (response?.user) {
        console.log('[Auth API] Auto-login after registration...')
        // Автоматический вход после успешной регистрации
        const loginResponse = await login({
            email: credentials.email,
            password: credentials.password,
        });
        console.log('[Auth API] Auto-login response:', loginResponse)
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
            console.error('Logout API call failed:', error);
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
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<{user: Object, access_token: string, refresh_token: string}>}
 */
export async function refreshToken(refreshToken) {
    const response = await fetchApi('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
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
 * @returns {Promise<string|null>} Новый access token или null
 */
export async function ensureValidToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return null;
    }

    try {
        const response = await refreshToken(refreshToken);
        return response?.access_token || null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        clearAuthData();
        return null;
    }
}
