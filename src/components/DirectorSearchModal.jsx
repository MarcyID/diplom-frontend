import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Clapperboard, Film, Star, ChevronRight } from 'lucide-react'

// 🎬 База режиссёров (ID фильмов совпадают с moviesData в App.jsx)
const directorsDB = [
    { id: 1, name: 'Кристофер Нолан', movies: [1, 2, 3] },
    { id: 2, name: 'Оливье Накаш', movies: [4] },
    { id: 3, name: 'Питер Фаррелли', movies: [5] },
    { id: 4, name: 'Тодд Филлипс', movies: [6] },
    { id: 5, name: 'Фрэнк Дарабонт', movies: [7] },
    { id: 6, name: 'Квентин Тарантино', movies: [8] }
]

function DirectorSearchModal({ isOpen, onClose, allMovies, onMovieClick, onDirectorClick }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDirector, setSelectedDirector] = useState(null)

    // Фильтрация режиссёров
    const filteredDirectors = useMemo(() => {
        if (!searchQuery.trim()) return directorsDB
        return directorsDB.filter(dir =>
            dir.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    // Фильмы выбранного режиссёра
    const directorMovies = useMemo(() => {
        if (!selectedDirector) return []
        return allMovies.filter(movie => selectedDirector.movies.includes(movie.id))
    }, [selectedDirector, allMovies])

    const handleSelect = (director) => {
        // 🔥 Открываем карточку режиссёра
        if (onDirectorClick) {
            onDirectorClick(director.id)
        }
        // Закрываем текущую модалку поиска
        onClose()
    }

    const handleBack = () => setSelectedDirector(null)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

                    <div className="modal-container">
                        <motion.div
                            className="director-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Шапка */}
                            <div className="director-header">
                                <button className="modal-close" onClick={onClose}><X size={20} /></button>
                                {selectedDirector ? (
                                    <button className="back-btn" onClick={handleBack}>
                                        <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                                        Назад к поиску
                                    </button>
                                ) : (
                                    <h2 className="director-title">Поиск по режиссёру</h2>
                                )}
                            </div>

                            {!selectedDirector ? (
                                // 🔍 Экран поиска
                                <div className="director-search-view">
                                    <div className="search-wrapper">
                                        <Search size={20} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Введите имя режиссёра..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="director-search-input"
                                        />
                                    </div>

                                    <div className="directors-list">
                                        {filteredDirectors.length > 0 ? filteredDirectors.map(dir => (
                                            <button key={dir.id} className="director-card" onClick={() => handleSelect(dir)}>
                                                <div className="director-avatar"><Clapperboard size={20} /></div>
                                                <div className="director-info">
                                                    <span className="director-name">{dir.name}</span>
                                                </div>
                                                <ChevronRight size={18} className="director-arrow" />
                                            </button>
                                        )) : (
                                            <div className="empty-state">
                                                <Clapperboard size={48} opacity={0.3} />
                                                <p>Режиссёр не найден</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // 🎬 Экран фильмографии
                                <div className="director-filmography">
                                    <div className="director-profile">
                                        <div className="director-avatar large"><Clapperboard size={28} /></div>
                                        <div>
                                            <h3 className="director-profile-name">{selectedDirector.name}</h3>
                                        </div>
                                    </div>

                                    <div className="filmography-list">
                                        {directorMovies.length > 0 ? directorMovies.map(movie => (
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
                                            <p className="empty-films">Нет фильмов этого режиссёра в базе</p>
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

export default DirectorSearchModal