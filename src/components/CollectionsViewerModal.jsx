import { motion, AnimatePresence } from 'framer-motion'
import { X, Film, Star, Calendar, Clock, ChevronRight } from 'lucide-react'

export default function CollectionsViewerModal({ isOpen, onClose, collections, allMovies, onMovieClick }) {
    // Собираем все фильмы из всех подборок
    const allCollectionFilms = collections.flatMap(col =>
        col.movieIds?.map(id => allMovies.find(m => m.id === id)).filter(Boolean) || []
    )

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <div className="modal-container">
                        <motion.div
                            className="collections-viewer-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <button className="modal-close" onClick={onClose}><X size={20} /></button>

                            <div className="viewer-header">
                                <h2>Все фильмы из подборок</h2>
                                <p className="viewer-subtitle">{allCollectionFilms.length} фильмов в {collections.length} подборках</p>
                            </div>

                            {allCollectionFilms.length > 0 ? (
                                <div className="viewer-films-list">
                                    {allCollectionFilms.map((movie, index) => (
                                        <motion.div
                                            key={`${movie.id}-${index}`}
                                            className="viewer-film-item"
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
                                    <Film size={48} opacity={0.3} />
                                    <p>В подборках пока нет фильмов</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}