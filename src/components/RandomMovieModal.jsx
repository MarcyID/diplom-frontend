import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Film, Shuffle, Star, Clock, Calendar, Loader } from 'lucide-react'
import { useRandomFilm } from '../hooks/useKinopoisk.js'
import { generateGradient } from '../utils/kinopoisk.js'

const genreMap = {
    'ACTION': 'Боевик',
    'COMEDY': 'Комедия',
    'DRAMA': 'Драма',
    'SCI_FI': 'Фантастика',
    'THRILLER': 'Триллер',
    'HORROR': 'Ужасы',
    'ROMANCE': 'Мелодрама',
    'MYSTERY': 'Детектив',
    'ANIMATION': 'Анимация',
    'DOCUMENTARY': 'Документальный',
    'FANTASY': 'Фэнтези',
    'ADVENTURE': 'Приключения',
    'CRIME': 'Криминал',
    'FAMILY': 'Семейный',
    'WAR': 'Военный',
    'HISTORY': 'Исторический',
    'MUSIC': 'Музыкальный',
    'SPORT': 'Спорт',
    'BIOGRAPHY': 'Биография',
    'SHORT': 'Короткометражка'
}

// Жанры с ID для API (из /api/v1/genres)
const genres = [
    { id: 11, label: 'Боевик' },
    { id: 13, label: 'Комедия' },
    { id: 2, label: 'Драма' },
    { id: 6, label: 'Фантастика' },
    { id: 1, label: 'Триллер' },
    { id: 17, label: 'Ужасы' },
    { id: 4, label: 'Мелодрама' },
    { id: 5, label: 'Детектив' },
    { id: 12, label: 'Фэнтези' },
    { id: 7, label: 'Приключения' },
    { id: 18, label: 'Мультфильм' },
    { id: 24, label: 'Аниме' }
]

function RandomMovieModal({ isOpen, onClose, onMovieClick }) {
    const [selectedGenreId, setSelectedGenreId] = useState(null)
    
    const { data: randomMovie, loading, error, refetch } = useRandomFilm(
        selectedGenreId ? [selectedGenreId] : [],
        7.5
    )

    const handlePickRandom = () => {
        refetch()
    }

    // Маппинг данных API в формат компонента
    const mappedMovie = randomMovie ? {
        kinopoiskId: randomMovie.kinopoiskId,
        title: randomMovie.nameRu || randomMovie.nameEn || 'Без названия',
        year: randomMovie.year || '—',
        rating: randomMovie.ratingKinopoisk?.toFixed(1) || '—',
        duration: randomMovie.filmLength ? `${randomMovie.filmLength} мин` : '—',
        genre: randomMovie.genres?.map(g => genreMap[g.genre] || g.genre).join(', ') || '—',
        description: randomMovie.shortDescription || randomMovie.description || 'Описание недоступно',
        posterUrl: randomMovie.posterUrl,
        gradient: generateGradient(randomMovie.kinopoiskId)
    } : null

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
                            className="random-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Шапка */}
                            <div className="random-header">
                                <button className="modal-close" onClick={onClose}>
                                    <X size={20} />
                                </button>
                                <div className="random-title-wrapper">
                                    <Shuffle size={28} className="random-icon" />
                                    <h2 className="random-title">Случайный фильм</h2>
                                </div>
                            </div>

                            {/* Выбор жанра */}
                            <div className="random-genre-section">
                                <p className="genre-label">Фильтр по жанру (необязательно)</p>
                                <div className="genre-chips-scroll">
                                    <button
                                        className={`genre-chip ${selectedGenreId === null ? 'active' : ''}`}
                                        onClick={() => setSelectedGenreId(null)}
                                    >
                                        ✨ Не важно
                                    </button>
                                    {genres.map(genre => (
                                        <button
                                            key={genre.id}
                                            className={`genre-chip ${selectedGenreId === genre.id ? 'active' : ''}`}
                                            onClick={() => setSelectedGenreId(genre.id)}
                                        >
                                            {genre.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Кнопка выбора */}
                            <button
                                className="btn-pick-random"
                                onClick={handlePickRandom}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader size={22} className="spinner-icon" />
                                ) : (
                                    <Sparkles size={22} />
                                )}
                                {loading ? 'Выбираю...' : 'Подобрать случайный фильм'}
                                {!loading && <Sparkles size={22} />}
                            </button>

                            {/* Ошибка */}
                            {error && (
                                <motion.div
                                    className="random-error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <p>⚠️ Не удалось подобрать фильм</p>
                                    <p className="error-hint">Попробуйте выбрать другой жанр или повторите попытку</p>
                                </motion.div>
                            )}

                            {/* Результат */}
                            <AnimatePresence>
                                {mappedMovie && !loading && (
                                    <motion.div
                                        className="random-result"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div
                                            className="random-movie-card carousel-style"
                                            onClick={() => {
                                                onMovieClick({ kinopoiskId: mappedMovie.kinopoiskId })
                                                onClose()
                                            }}
                                        >
                                            {/* Постер */}
                                            <div
                                                className="movie-poster"
                                                style={{
                                                    background: mappedMovie.posterUrl
                                                        ? `url(${mappedMovie.posterUrl}) center/cover`
                                                        : mappedMovie.gradient
                                                }}
                                            >
                                                {(!mappedMovie.posterUrl) && (
                                                    <div className="poster-placeholder">
                                                        <Film size={64} opacity={0.3} />
                                                    </div>
                                                )}
                                                <div className="movie-overlay">
                                                    <span className="watch-text">Подробнее</span>
                                                </div>
                                            </div>

                                            {/* Информация */}
                                            <div className="movie-info">
                                                <h3 className="movie-title-random">{mappedMovie.title}</h3>
                                                <div className="movie-meta">
                                                    <span className="year">
                                                        <Calendar size={14} /> {mappedMovie.year}
                                                    </span>
                                                    {mappedMovie.duration !== '—' && (
                                                        <span className="duration">
                                                            <Clock size={14} /> {mappedMovie.duration}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="movie-footer">
                                                    <div className="rating">
                                                        <Star size={16} fill="#ffd700" color="#ffd700" />
                                                        <span>{mappedMovie.rating}</span>
                                                    </div>
                                                    <span className="genre">{mappedMovie.genre}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default RandomMovieModal