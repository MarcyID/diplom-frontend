import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../services/auth'

// Импорты иконок
import googleIcon from '../assets/icons/google.svg'
import vkIcon from '../assets/icons/vk.svg'
import yandexIcon from '../assets/icons/yandex.svg'

// Принимаем setUser, чтобы сохранять имя
function AuthModal({ isOpen, onClose, setIsLoggedIn, setUser }) {
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)

    // Состояния полей
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')
    const [apiError, setApiError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const handleEmailChange = (e) => {
        const val = e.target.value
        setEmail(val)
        setApiError('')
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (val && !emailRegex.test(val)) {
            setEmailError('Неверный формат email')
        } else {
            setEmailError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Проверка: если есть ошибка email, или email пуст, или пароль пуст
        if (emailError || !email || !password) return

        setIsLoading(true)
        setApiError('')

        try {
            let response
            if (isLogin) {
                // Вход
                console.log('[AuthModal] Logging in with:', email)
                response = await login({ email, password })
                console.log('[AuthModal] Login response:', response)
            } else {
                // Регистрация
                console.log('[AuthModal] Registering with:', email, name)
                response = await register({
                    email,
                    username: name,
                    password,
                    full_name: name || undefined
                })
                console.log('[AuthModal] Register response:', response)
            }

            if (response?.user) {
                console.log('[AuthModal] Auth successful, user:', response.user)
                // Успешная авторизация
                setIsLoggedIn(true)
                setUser(prev => ({
                    ...prev,
                    id: response.user.id,
                    email: response.user.email,
                    username: response.user.username,
                    name: response.user.full_name || name
                }))

                // Закрываем модалку и переходим в профиль
                onClose()
                navigate('/profile')
            } else {
                console.error('[AuthModal] No user in response')
                setApiError('Ошибка: не удалось получить данные пользователя')
            }
        } catch (error) {
            console.error('[AuthModal] Auth error:', error)
            setApiError(error.message || 'Произошла ошибка при авторизации')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className="modal-container">
                        <motion.div
                            className="auth-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            {/* Фоновые эффекты */}
                            <div className="background-effects">
                                <div className="glow-left"></div>
                                <div className="glow-right"></div>
                            </div>

                            <button className="modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>

                            <div className="auth-content">
                                <div className="auth-tabs">
                                    <button className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Вход</button>
                                    <button className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Регистрация</button>
                                    <div className="tab-indicator" style={{ left: isLogin ? '0' : '50%' }} />
                                </div>

                                <h2 className="auth-title">{isLogin ? 'С возвращением!' : 'Присоединяйся'}</h2>
                                <p className="auth-subtitle">{isLogin ? 'Введите свои данные для входа' : 'Создайте аккаунт за 30 секунд'}</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {/* Поле Имя (только при регистрации) */}
                    {!isLogin && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="input-group">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Ваше имя"
                                className="auth-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </motion.div>
                    )}

                    {/* Поле Email */}
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            className={`auth-input ${emailError ? 'error' : ''}`}
                            value={email}
                            onChange={handleEmailChange}
                        />
                        <span className={`error-message ${emailError ? 'show' : ''}`}>
              {emailError || '\u00A0'}
            </span>
                    </div>

                    {/* Поле Пароль */}
                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Пароль"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {isLogin && <div className="forgot-link">Забыли пароль?</div>}

                    {/* API Error Message */}
                    {apiError && (
                        <div className="api-error-message">
                            {apiError}
                        </div>
                    )}

                    {/* Кнопка активна только если нет ошибок и заполнены поля */}
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={emailError !== '' || !email || !password || isLoading}
                    >
                        {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
                        {!isLoading && <ChevronRight size={18} />}
                    </button>
                </form>

                <div className="auth-divider"><span>или войти через</span></div>

                <div className="social-grid">
                    <button className="social-btn google"><img src={googleIcon} alt="Google" /></button>
                    <button className="social-btn vk"><img src={vkIcon} alt="VK" /></button>
                    <button className="social-btn yandex"><img src={yandexIcon} alt="Yandex" /></button>
                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default AuthModal