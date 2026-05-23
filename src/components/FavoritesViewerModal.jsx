import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Film, Heart, Clapperboard, Star, Calendar, Clock } from 'lucide-react'

export default function FavoritesViewerModal({
                                                 isOpen, onClose,
                                                 favoriteMovies = [],
                                                 favoriteActors = [],
                                                 favoriteDirectors = [],
                                                 allMovies,
                                                 onMovieClick,
                                                 onActorClick,
                                                 onDirectorClick,
                                                 actorsDB = [],
                                                 directorsDB = []
                                             }) {
    const [activeTab, setActiveTab] = useState('all') // 'all' | 'movies' | 'actors' | 'directors'

    // Получаем полные данные
    const moviesList = favoriteMovies.map(id => allMovies.find(m => m.id === id)).filter(Boolean)
    const actorsList = favoriteActors.map(id => actorsDB.find(a => a.id === id)).filter(Boolean)
    const directorsList = favoriteDirectors.map(id => directorsDB.find(d => d.id === id)).filter(Boolean)

    const totalCount = moviesList.length + actorsList.length + directorsList.length

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
                            className="favorites-viewer-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <button className="modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>

                            <div className="favorites-header">
                                <div className="favorites-icon-wrapper">
                                    <Heart size={24} fill="#ec4899" color="#ec4899" />
                                </div>
                                <h2>В избранном</h2>
                                <p className="favorites-subtitle">{totalCount} элементов</p>

                                {/* Переключатель табов */}
                                <div className="favorites-tabs">
                                    <button
                                        className={`fav-tab ${activeTab === 'all' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('all')}
                                    >
                                        Всё ({totalCount})
                                    </button>
                                    <button
                                        className={`fav-tab ${activeTab === 'movies' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('movies')}
                                    >
                                        <Film size={14} /> Фильмы ({moviesList.length})
                                    </button>
                                    <button
                                        className={`fav-tab ${activeTab === 'actors' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('actors')}
                                    >
                                        <Heart size={14} /> Актёры ({actorsList.length})
                                    </button>
                                    <button
                                        className={`fav-tab ${activeTab === 'directors' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('directors')}
                                    >
                                        <Clapperboard size={14} /> Режиссёры ({directorsList.length})
                                    </button>
                                </div>
                            </div>

                            <div className="favorites-content-list">
                                {/* ВСЁ ВМЕСТЕ */}
                                {activeTab === 'all' && (
                                    <div className="favorites-all-section">
                                        {totalCount === 0 ? (
                                            <div className="favorites-empty-state">
                                                <Heart size={48} opacity={0.3} />
                                                <p>В избранном пока пусто</p>
                                                <span>Добавляйте фильмы, актёров и режиссёров в избранное</span>
                                            </div>
                                        ) : (
                                            <>
                                                {moviesList.length > 0 && (
                                                    <div className="favorites-category">
                                                        <h3 className="category-title"><Film size={16} /> Фильмы</h3>
                                                        <div className="favorites-films-grid">
                                                            {moviesList.map(movie => (
                                                                <motion.div
                                                                    key={movie.id}
                                                                    className="favorite-film-card"
                                                                    style={{ background: movie.gradient }}
                                                                    whileHover={{ scale: 1.03 }}
                                                                    onClick={() => { onMovieClick(movie); onClose(); }}
                                                                >
                                                                    <div className="film-card-content">
                                                                        <h4>{movie.title}</h4>
                                                                        <div className="film-card-meta">
                                                                            <span>{movie.year}</span>
                                                                            <span className="rating">
                                                                                <Star size={10} fill="#ffd700" color="#ffd700" />
                                                                                {movie.rating}
                                                                            </span>
                                                                        </div>
                                                                        <span className="film-card-genre">{movie.genre}</span>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {actorsList.length > 0 && (
                                                    <div className="favorites-category">
                                                        <h3 className="category-title"><Heart size={16} /> Актёры</h3>
                                                        <div className="favorites-people-grid">
                                                            {actorsList.map(actor => (
                                                                <motion.div
                                                                    key={actor.id}
                                                                    className="favorite-person-item"
                                                                    whileHover={{ scale: 1.02 }}
                                                                    onClick={() => { onActorClick(actor.id); onClose(); }}
                                                                >
                                                                    <div className="person-avatar">
                                                                        <span>{actor.avatar}</span>
                                                                    </div>
                                                                    <div className="person-info">
                                                                        <h4>{actor.name}</h4>
                                                                        <span>{actor.movies?.length || 0} фильмов</span>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {directorsList.length > 0 && (
                                                    <div className="favorites-category">
                                                        <h3 className="category-title"><Clapperboard size={16} /> Режиссёры</h3>
                                                        <div className="favorites-people-grid">
                                                            {directorsList.map(director => (
                                                                <motion.div
                                                                    key={director.id}
                                                                    className="favorite-person-item director"
                                                                    whileHover={{ scale: 1.02 }}
                                                                    onClick={() => { onDirectorClick(director.id); onClose(); }}
                                                                >
                                                                    <div className="person-avatar">
                                                                        <span>{director.avatar}</span>
                                                                    </div>
                                                                    <div className="person-info">
                                                                        <h4>{director.name}</h4>
                                                                        <span>{director.movies?.length || 0} фильмов</span>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ТОЛЬКО ФИЛЬМЫ */}
                                {activeTab === 'movies' && (
                                    <div className="favorites-films-grid">
                                        {moviesList.length > 0 ? moviesList.map(movie => (
                                            <motion.div
                                                key={movie.id}
                                                className="favorite-film-card"
                                                style={{ background: movie.gradient }}
                                                whileHover={{ scale: 1.03 }}
                                                onClick={() => { onMovieClick(movie); onClose(); }}
                                            >
                                                <div className="film-card-content">
                                                    <h4>{movie.title}</h4>
                                                    <div className="film-card-meta">
                                                        <span>{movie.year}</span>
                                                        <span className="rating">
                                                            <Star size={10} fill="#ffd700" color="#ffd700" />
                                                            {movie.rating}
                                                        </span>
                                                    </div>
                                                    <span className="film-card-genre">{movie.genre}</span>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="favorites-empty-state">
                                                <Film size={48} opacity={0.3} />
                                                <p>Нет избранных фильмов</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ТОЛЬКО АКТЁРЫ */}
                                {activeTab === 'actors' && (
                                    <div className="favorites-people-grid">
                                        {actorsList.length > 0 ? actorsList.map(actor => (
                                            <motion.div
                                                key={actor.id}
                                                className="favorite-person-item"
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => { onActorClick(actor.id); onClose(); }}
                                            >
                                                <div className="person-avatar">
                                                    <span>{actor.avatar}</span>
                                                </div>
                                                <div className="person-info">
                                                    <h4>{actor.name}</h4>
                                                    <span>{actor.movies?.length || 0} фильмов</span>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="favorites-empty-state">
                                                <Heart size={48} opacity={0.3} />
                                                <p>Нет избранных актёров</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ТОЛЬКО РЕЖИССЁРЫ */}
                                {activeTab === 'directors' && (
                                    <div className="favorites-people-grid">
                                        {directorsList.length > 0 ? directorsList.map(director => (
                                            <motion.div
                                                key={director.id}
                                                className="favorite-person-item director"
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => { onDirectorClick(director.id); onClose(); }}
                                            >
                                                <div className="person-avatar">
                                                    <span>{director.avatar}</span>
                                                </div>
                                                <div className="person-info">
                                                    <h4>{director.name}</h4>
                                                    <span>{director.movies?.length || 0} фильмов</span>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="favorites-empty-state">
                                                <Clapperboard size={48} opacity={0.3} />
                                                <p>Нет избранных режиссёров</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}