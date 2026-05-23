import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Film, Shuffle, Star, Clock, Calendar, ChevronRight } from 'lucide-react'

const genres = [
    'Боевик', 'Комедия', 'Драма', 'Фантастика', 'Триллер',
    'Ужасы', 'Мелодрама', 'Детектив', 'Анимация', 'Документальный'
]

function RandomMovieModal({ isOpen, onClose, allMovies, onMovieClick }) {
    const [selectedGenre, setSelectedGenre] = useState(null)
    const [randomMovie, setRandomMovie] = useState(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const [showDetails, setShowDetails] = useState(false)

    const pickRandomMovie = () => {
        setIsAnimating(true)
        setShowDetails(false)

        // Фильтруем фильмы по жанру (если выбран)
        const filteredMovies = selectedGenre
            ? allMovies.filter(m => m.genre === selectedGenre)
            : allMovies

        // Если нет фильмов по фильтру — берём все
        const moviesToPick = filteredMovies.length > 0 ? filteredMovies : allMovies

        // Случайный выбор
        const randomIndex = Math.floor(Math.random() * moviesToPick.length)
        const movie = moviesToPick[randomIndex]

        // Анимация "перебора" перед показом
        let shuffleCount = 0
        const shuffleInterval = setInterval(() => {
            const tempIndex = Math.floor(Math.random() * moviesToPick.length)
            setRandomMovie(moviesToPick[tempIndex])
            shuffleCount++

            if (shuffleCount >= 8) {
                clearInterval(shuffleInterval)
                setRandomMovie(movie)
                setIsAnimating(false)
                setTimeout(() => setShowDetails(true), 300)
            }
        }, 150)
    }

    // Сброс при открытии
    useEffect(() => {
        if (isOpen) {
            setRandomMovie(null)
            setShowDetails(false)
            setSelectedGenre(null)
        }
    }, [isOpen])

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
                                        className={`genre-chip ${selectedGenre === null ? 'active' : ''}`}
                                        onClick={() => setSelectedGenre(null)}
                                    >
                                        ✨ Не важно
                                    </button>
                                    {genres.map(genre => (
                                        <button
                                            key={genre}
                                            className={`genre-chip ${selectedGenre === genre ? 'active' : ''}`}
                                            onClick={() => setSelectedGenre(genre)}
                                        >
                                            {genre}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Кнопка выбора */}
                            <button
                                className="btn-pick-random"
                                onClick={pickRandomMovie}
                                disabled={isAnimating}
                            >
                                <Sparkles size={22} />
                                {isAnimating ? 'Выбираю...' : 'Подобрать случайный фильм'}
                                <Sparkles size={22} />
                            </button>

                            {/* Результат */}
                            <AnimatePresence>
                                {randomMovie && !isAnimating && (
                                    <motion.div
                                        className="random-result"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div
                                            className="random-movie-card"
                                            style={{ background: randomMovie.gradient }}
                                            onMouseEnter={() => setShowDetails(true)}
                                            onMouseLeave={() => setShowDetails(false)}
                                            onClick={() => {
                                                onMovieClick(randomMovie)
                                                onClose()
                                            }}
                                        >
                                            <div className="movie-card-inner">
                                                <div className="movie-icon-placeholder">
                                                    <Film size={80} opacity={0.3} />
                                                </div>

                                                <AnimatePresence>
                                                    {showDetails && (
                                                        <motion.div
                                                            className="movie-details-overlay"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                        >
                                                            <h3 className="movie-title">{randomMovie.title}</h3>

                                                            <div className="movie-meta-row">
                                <span className="meta-item">
                                  <Star size={16} fill="#ffd700" color="#ffd700" />
                                    {randomMovie.rating}
                                </span>
                                                                <span className="meta-item">
                                  <Calendar size={16} />
                                                                    {randomMovie.year}
                                </span>
                                                                <span className="meta-item">
                                  <Clock size={16} />
                                                                    {randomMovie.duration}
                                </span>
                                                            </div>

                                                            <div className="movie-genre-tag">
                                                                <Film size={14} />
                                                                {randomMovie.genre}
                                                            </div>

                                                            <p className="movie-description">{randomMovie.description}</p>

                                                            <div className="click-hint">
                                                                <ChevronRight size={18} />
                                                                Нажмите, чтобы открыть
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <p className="result-hint">
                                            Наведите для подробностей • Нажмите для открытия
                                        </p>
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