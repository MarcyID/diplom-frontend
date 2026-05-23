import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Star, Clock, Calendar, Film, ChevronRight, Plus } from 'lucide-react'
import AddToCollectionModal from './AddToCollectionModal'

function MovieModal({
                        movie, isOpen, onClose, allMovies, onMovieClick,
                        favoriteMovies = [], onToggleFavorite,
                        userCollections = [], onAddToCollection, onCreateCollection
                    }) {
    if (!movie) return null

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const similarMovies = allMovies
        ? allMovies.filter(m => m.id !== movie.id && m.genre === movie.genre).slice(0, 4)
        : []

    const isFavorite = favoriteMovies?.includes(movie.id)

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

                                    {/* Основные действия */}
                                    <div className="modal-actions">
                                        <button
                                            className="btn-watch"
                                            onClick={() => window.open(`https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(movie.title)}`, '_blank')}
                                        >
                                            <Film size={20} />
                                            Смотреть на Кинопоиске
                                        </button>

                                        {/* 🔥 КНОПКА "ДОБАВИТЬ В ПОДБОРКУ" */}
                                        <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>
                                            <Plus size={20} /> Добавить в подборку
                                        </button>
                                    </div>

                                    {/* 🔥 КНОПКА "В ИЗБРАННОЕ" */}
                                    <button
                                        className={`favorite-action-btn ${isFavorite ? 'active' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(movie.id); }}
                                    >
                                        <Heart size={18} fill={isFavorite ? "#fff" : "none"} />
                                        <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
                                    </button>

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
                                                        onClick={() => onMovieClick(similar)}
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

                    {/* 🔥 САМА МОДАЛКА ДОБАВЛЕНИЯ В ПОДБОРКУ (была пропущена!) */}
                    <AddToCollectionModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        movie={movie}
                        collections={userCollections}
                        onAddToCollection={onAddToCollection}
                        onCreateCollection={onCreateCollection}
                    />
                </>
            )}
        </AnimatePresence>
    )
}

export default MovieModal