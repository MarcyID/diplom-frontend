import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Film, Star, ChevronRight } from 'lucide-react'

// Форматирование даты
const formatDate = (dateString) => {
    const date = new Date(dateString)
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
}

function UpcomingModal({ isOpen, onClose, allMovies, onMovieClick }) {
    // Берём первые 10 фильмов и добавляем им даты премьер
    const upcomingMovies = allMovies.slice(0, 10).map((movie, index) => ({
        ...movie,
        premiereDate: new Date(2026, 5 + index, 10 + index * 3) // Даты с июня 2026 по март 2027
    }))

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
                                        <p className="upcoming-subtitle">Премьеры 2026-2027</p>
                                    </div>
                                </div>
                            </div>

                            {/* Список фильмов */}
                            <div className="upcoming-list">
                                {upcomingMovies.map((movie, index) => (
                                    <motion.div
                                        key={movie.id}
                                        className="upcoming-item"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => { onMovieClick(movie); onClose(); }}
                                    >
                                        {/* Превью карточки */}
                                        <div className="upcoming-preview" style={{ background: movie.gradient }}>
                                            <div className="preview-placeholder">
                                                <Film size={40} opacity={0.4} />
                                            </div>
                                            <div className="preview-badge">
                                                <Star size={12} fill="#ffd700" color="#ffd700" />
                                                {movie.rating}
                                            </div>
                                        </div>

                                        {/* Информация */}
                                        <div className="upcoming-info">
                                            <h3 className="upcoming-movie-title">{movie.title}</h3>

                                            <div className="upcoming-meta">
                                                <div className="meta-row">
                                                    <Calendar size={14} className="meta-icon" />
                                                    <span className="premiere-date">{formatDate(movie.premiereDate)}</span>
                                                </div>

                                                <div className="meta-row">
                                                    <Clock size={14} className="meta-icon" />
                                                    <span>{movie.duration}</span>
                                                </div>
                                            </div>

                                            <div className="upcoming-genre">
                                                <Film size={12} />
                                                {movie.genre}
                                            </div>

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