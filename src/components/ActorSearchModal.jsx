import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, User, Film, Star, ChevronRight } from 'lucide-react'
import { useSearch, usePerson } from '../hooks/useKinopoisk.js'

function ActorSearchModal({ isOpen, onClose, onMovieClick, onActorClick }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPerson, setSelectedPerson] = useState(null)
    const { data: searchResults, loading } = useSearch(searchQuery)

    const persons = searchResults?.persons || []

    // Загружаем детали персоны с фильмографией при выборе
    const selectedPersonId = selectedPerson?.kinopoiskId || selectedPerson?.personId || selectedPerson?.id
    const { data: personDetails } = usePerson(selectedPersonId)
    const filmography = personDetails?.films || []

    // Сброс состояния при открытии
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('')
            setSelectedPerson(null)
        }
    }, [isOpen])

    const handlePersonSelect = (person) => {
        setSelectedPerson(person)
    }

    const handleBack = () => {
        setSelectedPerson(null)
    }

    const handleOpenCard = () => {
        const personId = selectedPerson?.personId || selectedPerson?.id || selectedPerson?.kinopoiskId
        if (onActorClick && personId) {
            onActorClick(personId)
        }
        // Не закрываем окно поиска - карточка откроется поверх
    }

    // Фильтруем фильмы где персона была актёром и сортируем (сначала general=true)
    const actorFilms = (filmography || [])
        .filter(f => f.professionKey === 'ACTOR')
        .sort((a, b) => (b.general ? 1 : 0) - (a.general ? 1 : 0))
        .slice(0, 20)

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
                                <button className="modal-close" onClick={onClose}>
                                    <X size={20} />
                                </button>
                                {selectedPerson ? (
                                    <button className="back-btn" onClick={handleBack}>
                                        <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                                        Назад к поиску
                                    </button>
                                ) : (
                                    <h2 className="actor-title">Поиск по актёру</h2>
                                )}
                            </div>

                            {!selectedPerson ? (
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

                                    {/* Список персон */}
                                    <div className="actors-list">
                                        {loading && (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                                <p>Поиск...</p>
                                            </div>
                                        )}

                                        {!loading && persons.length > 0 && persons.map(person => (
                                            <button
                                                key={person.personId || person.id}
                                                className="actor-card"
                                                onClick={() => handlePersonSelect(person)}
                                            >
                                                <div className="actor-avatar">
                                                    {person.posterUrl ? (
                                                        <img src={person.posterUrl} alt={person.nameRu || person.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                    ) : (
                                                        (person.nameRu || person.nameEn || '?').charAt(0)
                                                    )}
                                                </div>
                                                <div className="actor-info">
                                                    <span className="actor-name">{person.nameRu || person.nameEn}</span>
                                                </div>
                                                <ChevronRight size={18} className="actor-arrow" />
                                            </button>
                                        ))}

                                        {!loading && searchQuery.trim() && persons.length === 0 && (
                                            <div className="empty-state">
                                                <User size={48} opacity={0.3} />
                                                <p>Актёры не найдены</p>
                                            </div>
                                        )}

                                        {!loading && !searchQuery.trim() && (
                                            <div className="empty-state">
                                                <Search size={48} opacity={0.3} />
                                                <p>Введите имя актёра для поиска</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // 🎬 Экран фильмографии
                                <div className="actor-filmography">
                                    <div className="actor-profile">
                                        <div className="actor-avatar-large">
                                            {personDetails?.posterUrl || personDetails?.photoUrl ? (
                                                <img src={personDetails.posterUrl || personDetails.photoUrl} alt={personDetails.nameRu || personDetails.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                            ) : (
                                                <span>{(selectedPerson.nameRu || selectedPerson.nameEn || '?').charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="actor-profile-name">{selectedPerson.nameRu || selectedPerson.nameEn}</h3>
                                            {personDetails?.profession && (
                                                <span className="actor-profile-profession">{personDetails.profession}</span>
                                            )}
                                        </div>
                                    </div>

                                    <button className="open-card-btn" onClick={handleOpenCard}>
                                        <User size={18} />
                                        Подробнее об актёре
                                    </button>

                                    <div className="filmography-section">
                                        <h3 className="filmography-title">
                                            <Film size={18} />
                                            Фильмы с участием актёра
                                        </h3>

                                        <div className="filmography-list">
                                            {!personDetails ? (
                                                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                                    <p>Загрузка фильмографии...</p>
                                                </div>
                                            ) : actorFilms.length > 0 ? (
                                                actorFilms.map(film => (
                                                    <div
                                                        key={film.filmId}
                                                        className="filmography-item"
                                                        onClick={() => {
                                                            onMovieClick({ kinopoiskId: film.filmId, nameRu: film.nameRu, nameEn: film.nameEn })
                                                            onClose()
                                                        }}
                                                    >
                                                        <div
                                                            className="film-poster-mini"
                                                            style={{
                                                                background: film.posterUrl
                                                                    ? `url(${film.posterUrl}) center/cover`
                                                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                            }}
                                                        >
                                                            {!film.posterUrl && <Film size={20} opacity={0.4} />}
                                                        </div>
                                                        <div className="film-info">
                                                            <h4>{film.nameRu || film.nameEn}</h4>
                                                            <div className="film-meta">
                                                                {film.rating && (
                                                                    <span className="rating">
                                                                        <Star size={12} fill="#ffd700" color="#ffd700" />
                                                                        {film.rating}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="film-arrow" />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="empty-films">Нет фильмов с участием этого актёра</p>
                                            )}
                                        </div>
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