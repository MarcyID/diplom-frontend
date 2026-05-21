import { motion, AnimatePresence } from 'framer-motion'
import { X, Film, Star, Calendar, Clock, Heart, ChevronRight } from 'lucide-react'

export default function FavoritesViewerModal({ isOpen, onClose, favorites, allMovies, onMovieClick }) {
    const favoriteFilms = favorites.map(id => allMovies.find(m => m.id === id)).filter(Boolean)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <div className="modal-container">
                        <motion.div
                            className="favorites-viewer-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <button className="modal-close" onClick={onClose}><X size={20} /></button>

                            <div className="viewer-header">
                                <div className="viewer-icon-wrapper">
                                    <Heart size={24} fill="#ec4899" color="#ec4899" />
                                </div>
                                <h2>Избранное</h2>
                                <p className="viewer-subtitle">{favoriteFilms.length} фильмов</p>
                            </div>

                            {favoriteFilms.length > 0 ? (
                                <div className="viewer-films-list">
                                    {favoriteFilms.map((movie, index) => (
                                        <motion.div
                                            key={movie.id}
                                            className="viewer-film-item favorite"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => { onMovieClick(movie); onClose(); }}
                                        >
                                            <div className="film-preview" style={{ background: movie.gradient }}>
                                                <Film size={32} opacity={0.4} />
                                                <div className="film-rating"><Star size={10} fill="#ffd700" color="#ffd700" /> {movie.rating}</div>
                                            </div>
                                            <div className="film-info">
                                                <h3>{movie.title}</h3>
                                                <div className="film-meta">
                                                    <span><Calendar size={12} /> {movie.year}</span>
                                                    <span><Clock size={12} /> {movie.duration}</span>
                                                </div>
                                                <span className="film-genre">{movie.genre}</span>
                                            </div>
                                            <ChevronRight size={16} className="film-arrow" />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="viewer-empty">
                                    <Heart size={48} opacity={0.3} />
                                    <p>В избранном пока пусто</p>
                                    <span>Добавляйте фильмы, чтобы смотреть их позже</span>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}