import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Clock, Calendar, Film, ChevronRight } from 'lucide-react'

function MovieModal({ movie, isOpen, onClose, allMovies, onMovieClick }) {
    if (!movie) return null

    // Находим похожие фильмы (по жанру, исключая текущий)
    const similarMovies = allMovies
        ? allMovies.filter(m => m.id !== movie.id && m.genre === movie.genre).slice(0, 4)
        : []

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Затемнение фона */}
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Модальное окно */}
                    <div className="modal-container">
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                        >
                            <button className="modal-close" onClick={onClose}>
                                <X size={24} />
                            </button>

                            <div className="modal-body">
                                <div className="modal-poster">
                                    <div
                                        className="poster-gradient"
                                        style={{ background: movie.gradient || '#1a1a2e' }}
                                    >
                                        <Film size={64} opacity={0.3} />
                                    </div>
                                </div>

                                <div className="modal-info">
                                    <h2>{movie.title}</h2>

                                    <div className="modal-meta">
                                        <div className="meta-item">
                                            <Star size={18} fill="#ffd700" color="#ffd700" />
                                            <span>{movie.rating}/10</span>
                                        </div>
                                        <div className="meta-item">
                                            <Calendar size={18} />
                                            <span>{movie.year}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Clock size={18} />
                                            <span>{movie.duration}</span>
                                        </div>
                                    </div>

                                    <div className="modal-genre">
                                        <Film size={18} />
                                        <span>{movie.genre}</span>
                                    </div>

                                    <p className="modal-description">{movie.description}</p>

                                    <div className="modal-actions">
                                        <button
                                            className="btn-watch"
                                            onClick={() => window.open(`https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(movie.title)}`, '_blank')}
                                        >
                                            <Film size={20} />
                                            Смотреть на Кинопоиске
                                        </button>
                                        <button className="btn-add">
                                            Добавить в подборку
                                        </button>
                                    </div>

                                    {/* Секция похожих фильмов */}
                                    {similarMovies.length > 0 && (
                                        <div className="similar-section">
                                            <h3 className="similar-title">
                                                <ChevronRight size={20} color="#8b5cf6" />
                                                Похожие фильмы
                                            </h3>
                                            <div className="similar-list">
                                                {similarMovies.map(similar => (
                                                    <div
                                                        key={similar.id}
                                                        className="similar-card"
                                                        style={{ background: similar.gradient || '#1a1a2e' }}
                                                        onClick={() => onMovieClick(similar)} // ← ДОБАВЬ ЭТО
                                                    >
                                                        <div className="similar-info">
                                                            <span className="similar-title-text">{similar.title}</span>
                                                            <div className="similar-meta">
                                                                <span>{similar.year}</span>
                                                                <span className="similar-rating">
                                  <Star size={12} fill="#ffd700" color="#ffd700" />
                                                                    {similar.rating}
                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default MovieModal