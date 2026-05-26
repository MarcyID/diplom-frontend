import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Film, Heart, Clapperboard } from 'lucide-react'

export default function FavoritesViewerModal({
                                                 isOpen, onClose,
                                                 favoriteMovies = [],
                                                 favoriteActors = [],
                                                 favoriteDirectors = [],
                                                 onMovieClick,
                                                 onActorClick,
                                                 onDirectorClick
                                             }) {
    const [activeTab, setActiveTab] = useState('movies') // 'movies' | 'actors' | 'directors'

    const totalCount = favoriteMovies.length + favoriteActors.length + favoriteDirectors.length

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
                                        className={`fav-tab ${activeTab === 'movies' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('movies')}
                                    >
                                        <Film size={14} /> Фильмы ({favoriteMovies.length})
                                    </button>
                                    <button
                                        className={`fav-tab ${activeTab === 'actors' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('actors')}
                                    >
                                        <Heart size={14} /> Актёры ({favoriteActors.length})
                                    </button>
                                    <button
                                        className={`fav-tab ${activeTab === 'directors' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('directors')}
                                    >
                                        <Clapperboard size={14} /> Режиссёры ({favoriteDirectors.length})
                                    </button>
                                </div>
                            </div>

                            <div className="favorites-content-list">
                                {totalCount === 0 ? (
                                    <div className="favorites-empty-state">
                                        <Heart size={48} opacity={0.3} />
                                        <p>В избранном пока пусто</p>
                                        <span>Добавляйте фильмы, актёров и режиссёров в избранное</span>
                                    </div>
                                ) : (
                                    <div className="favorites-info">
                                        <p className="favorites-hint-title">Для просмотра деталей используйте поиск:</p>
                                        {activeTab === 'movies' && (
                                            <div className="favorites-hint">
                                                <Film size={16} />
                                                <span>ID фильмов: {favoriteMovies.join(', ') || '—'}</span>
                                            </div>
                                        )}
                                        {activeTab === 'actors' && (
                                            <div className="favorites-hint">
                                                <Heart size={16} />
                                                <span>ID актёров: {favoriteActors.join(', ') || '—'}</span>
                                            </div>
                                        )}
                                        {activeTab === 'directors' && (
                                            <div className="favorites-hint">
                                                <Clapperboard size={16} />
                                                <span>ID режиссёров: {favoriteDirectors.join(', ') || '—'}</span>
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
