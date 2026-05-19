import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, User, Film, Star, ChevronRight } from 'lucide-react'

// 🎬 База актёров (можно заменить на реальный API позже)
const actorsDB = [
    { id: 1, name: 'Леонардо ДиКаприо', movies: [1, 2, 7] },
    { id: 2, name: 'Кристиан Бэйл', movies: [3] },
    { id: 3, name: 'Джозеф Гордон-Левитт', movies: [1, 3] },
    { id: 4, name: 'Том Харди', movies: [3, 5] },
    { id: 5, name: 'Мэттью МакКонахи', movies: [2, 5] },
    { id: 6, name: 'Хоакин Феникс', movies: [6] },
    { id: 7, name: 'Тим Роббинс', movies: [7] },
    { id: 8, name: 'Джон Траволта', movies: [8] },
    { id: 9, name: 'Ума Турман', movies: [8] },
    { id: 10, name: 'Фрэнсис МакДорманд', movies: [5, 7] }
]

function ActorSearchModal({ isOpen, onClose, allMovies, onMovieClick }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedActor, setSelectedActor] = useState(null)

    // Фильтрация актёров по поиску
    const filteredActors = useMemo(() => {
        if (!searchQuery.trim()) return actorsDB
        return actorsDB.filter(actor =>
            actor.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    // Фильмы выбранного актёра
    const actorMovies = useMemo(() => {
        if (!selectedActor) return []
        return allMovies.filter(movie => selectedActor.movies.includes(movie.id))
    }, [selectedActor, allMovies])

    const handleActorSelect = (actor) => {
        setSelectedActor(actor)
        setSearchQuery('')
    }

    const handleBack = () => setSelectedActor(null)

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
                            className="actor-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Шапка */}
                            <div className="actor-header">
                                <button className="modal-close" onClick={onClose}><X size={20} /></button>
                                {selectedActor ? (
                                    <button className="back-btn" onClick={handleBack}>
                                        <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                                        Назад к поиску
                                    </button>
                                ) : (
                                    <h2 className="actor-title">Поиск по актёру</h2>
                                )}
                            </div>

                            {!selectedActor ? (
                                // 🔍 Экран поиска
                                <div className="actor-search-view">
                                    <div className="search-wrapper">
                                        <Search size={20} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Введите имя актёра..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="actor-search-input"
                                        />
                                    </div>

                                    <div className="actors-list">
                                        {filteredActors.length > 0 ? filteredActors.map(actor => (
                                            <button key={actor.id} className="actor-card" onClick={() => handleActorSelect(actor)}>
                                                <div className="actor-avatar">{actor.name.charAt(0)}</div>
                                                <div className="actor-info">
                                                    <span className="actor-name">{actor.name}</span>

                                                </div>
                                                <ChevronRight size={18} className="actor-arrow" />
                                            </button>
                                        )) : (
                                            <div className="empty-state">
                                                <User size={48} opacity={0.3} />
                                                <p>Актёр не найден</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // 🎬 Экран фильмографии
                                <div className="actor-filmography">
                                    <div className="actor-profile">
                                        <div className="actor-avatar large">{selectedActor.name.charAt(0)}</div>
                                        <div>
                                            <h3 className="actor-profile-name">{selectedActor.name}</h3>
                                        </div>
                                    </div>

                                    <div className="filmography-list">
                                        {actorMovies.length > 0 ? actorMovies.map(movie => (
                                            <div key={movie.id} className="filmography-item" onClick={() => { onMovieClick(movie); onClose(); }}>
                                                <div className="film-poster-mini" style={{ background: movie.gradient }} />
                                                <div className="film-info">
                                                    <h4>{movie.title}</h4>
                                                    <div className="film-meta">
                                                        <span>{movie.year}</span>
                                                        <span className="rating">
                              <Star size={12} fill="#ffd700" color="#ffd700" /> {movie.rating}
                            </span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="film-arrow" />
                                            </div>
                                        )) : (
                                            <p className="empty-films">Нет фильмов этого актёра в базе</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ActorSearchModal