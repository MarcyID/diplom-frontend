import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Film, Star, ChevronRight } from 'lucide-react'
import { usePremieres } from '../hooks/useKinopoisk.js'

// Форматирование даты: "2026-05-07" → "7 мая 2026"
const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
}

// Форматирование месяца: "2026-05" → "май 2026"
const formatMonthYear = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${month} ${year}`
}

function UpcomingModal({ isOpen, onClose, onMovieClick }) {
    const { data: premieres, loading, error } = usePremieres(1)

    // Фильтруем прошедшие премьеры (оставляем только будущие)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const filteredPremieres = premieres.filter(movie => {
        if (!movie.premiereRu) return true // Если нет даты, показываем
        const premiereDate = new Date(movie.premiereRu)
        premiereDate.setHours(0, 0, 0, 0)
        return premiereDate > today
    })

    // Определяем текущий и следующий месяц для заголовка
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const currentMonthStr = formatMonthYear(new Date().toISOString())
    const nextMonthStr = formatMonthYear(nextMonth.toISOString())
    
    // Если год одинаковый, объединяем (май-июнь 2026)
    const currentYear = new Date().getFullYear()
    const nextYear = nextMonth.getFullYear()
    const periodStr = currentYear === nextYear
        ? `${currentMonthStr.split(' ')[0]}-${nextMonthStr.split(' ')[0]} ${currentYear}`
        : `${currentMonthStr} — ${nextMonthStr}`

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
                            className="upcoming-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Шапка */}
                            <div className="upcoming-header">
                                <button className="modal-close" onClick={onClose}>
                                    <X size={20} />
                                </button>
                                <div className="upcoming-title-wrapper">
                                    <Calendar size={28} className="upcoming-icon" />
                                    <div>
                                        <h2 className="upcoming-title">Скоро в кино</h2>
                                        <p className="upcoming-subtitle">Премьеры {periodStr}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Список фильмов */}
                            <div className="upcoming-list">
                                {loading && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                        <div style={{
                                            display: 'inline-block',
                                            width: '40px',
                                            height: '40px',
                                            border: '4px solid #333',
                                            borderTop: '4px solid #8b5cf6',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        <p style={{ marginTop: '20px' }}>Загрузка премьер...</p>
                                    </div>
                                )}

                                {error && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                                        <p>Ошибка загрузки: {error.message}</p>
                                    </div>
                                )}

                                {!loading && !error && filteredPremieres.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                        <p>Премьер пока нет</p>
                                    </div>
                                )}

                                {!loading && !error && filteredPremieres.map((movie, index) => (
                                    <motion.div
                                        key={movie.kinopoiskId || movie.id}
                                        className="upcoming-item"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => { onMovieClick(movie); onClose(); }}
                                    >
                                        {/* Превью карточки */}
                                        <div className="upcoming-preview" style={{ 
                                            background: movie.posterUrl ? `url(${movie.posterUrlPreview || movie.posterUrl}) center/cover` : '#374151'
                                        }}>
                                            {!movie.posterUrl && (
                                                <div className="preview-placeholder">
                                                    <Film size={40} opacity={0.4} />
                                                </div>
                                            )}
                                            {(movie.ratingKinopoisk || movie.rating) && (
                                                <div className="preview-badge">
                                                    <Star size={12} fill="#ffd700" color="#ffd700" />
                                                    {movie.ratingKinopoisk || movie.rating}
                                                </div>
                                            )}
                                        </div>

                                        {/* Информация */}
                                        <div className="upcoming-info">
                                            <h3 className="upcoming-movie-title">{movie.nameRu || movie.title}</h3>

                                            <div className="upcoming-meta">
                                                {movie.premiereRu && (
                                                    <div className="meta-row">
                                                        <Calendar size={14} className="meta-icon" />
                                                        <span className="premiere-date">{formatDate(movie.premiereRu)}</span>
                                                    </div>
                                                )}

                                                {!movie.premiereRu && movie.year && (
                                                    <div className="meta-row">
                                                        <Calendar size={14} className="meta-icon" />
                                                        <span style={{ color: '#ef4444', fontWeight: 700 }}>{movie.year}</span>
                                                    </div>
                                                )}

                                                {movie.filmLength && (
                                                    <div className="meta-row">
                                                        <Clock size={14} className="meta-icon" />
                                                        <span>{movie.filmLength} мин</span>
                                                    </div>
                                                )}
                                            </div>

                                            {movie.genres && movie.genres.length > 0 && (
                                                <div className="upcoming-genre">
                                                    <Film size={12} />
                                                    {movie.genres[0].genre.charAt(0).toUpperCase() + movie.genres[0].genre.slice(1)}
                                                </div>
                                            )}

                                            <button className="details-btn">
                                                Подробнее
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Футер */}
                            <div className="upcoming-footer">
                                <p>Нажмите на фильм, чтобы узнать подробности</p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default UpcomingModal