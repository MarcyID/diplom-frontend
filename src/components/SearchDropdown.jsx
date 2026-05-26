import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Film, User, Star } from 'lucide-react'
import { useSearch } from '../hooks/useKinopoisk.js'
import { getTitle, getRating, getMainGenre, generateGradient } from '../utils/kinopoisk.js'

function SearchDropdown({ onMovieClick, onActorClick }) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Поиск через API хук
    const { data: searchResults, loading } = useSearch(query)

    // Преобразуем результаты API в удобный формат
    const films = searchResults?.films?.slice(0, 5) || []
    const persons = searchResults?.persons?.slice(0, 6) || []

    const hasResults = films.length > 0 || persons.length > 0
    const isSearching = loading && query.trim().length >= 2

    // Закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // 🔥 ЕДИНАЯ ФУНКЦИЯ ОБРАБОТКИ КЛИКА
    const handleSelect = (type, item) => {
        if (type === 'movie') {
            onMovieClick(item)
        } else if (type === 'person') {
            const personId = item.kinopoiskId || item.id
            if (onActorClick) onActorClick(personId)
        }
        setQuery('')
        setIsOpen(false)
    }

    return (
        <div className="search-dropdown-wrapper" ref={dropdownRef}>
            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder="Поиск фильмов, актёров, режиссёров..."
                    value={query}
                    onChange={(e) => {
                        const newValue = e.target.value
                        setQuery(newValue)
                        if (newValue.trim().length >= 2) {
                            setIsOpen(true)
                        }
                    }}
                    onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
                    className="search-input"
                />
                {query && (
                    <button className="clear-search" onClick={() => { setQuery(''); setIsOpen(false); }}>
                        ×
                    </button>
                )}
                {loading && (
                    <div className="search-loading">
                        <div className="spinner"></div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && isSearching && (
                    <motion.div
                        className="search-dropdown search-loading-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="loading-content">
                            <div className="spinner-large"></div>
                            <p>Поиск...</p>
                        </div>
                    </motion.div>
                )}

                {isOpen && hasResults && !loading && (
                    <motion.div
                        className="search-dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Фильмы */}
                        {films.length > 0 && (
                            <div className="search-section">
                                <div className="search-section-title">
                                    <Film size={16} />
                                    <span>Фильмы</span>
                                </div>
                                {films.map(film => (
                                    <div
                                        key={film.filmId || film.id}
                                        className="search-item movie-item"
                                        onClick={() => handleSelect('movie', film)}
                                    >
                                        <div
                                            className="movie-preview"
                                            style={{
                                                background: film.posterUrl
                                                    ? `url(${film.posterUrl}) center/cover`
                                                    : generateGradient(film.filmId || film.id)
                                            }}
                                        >
                                            {!film.posterUrl && (
                                                <Film size={24} opacity={0.5} />
                                            )}
                                        </div>
                                        <div className="movie-info">
                                            <h4>{getTitle(film)}</h4>
                                            <div className="movie-meta">
                                                <span>{film.year || '—'}</span>
                                                <span className="rating">
                                                    <Star size={10} fill="#ffd700" color="#ffd700" />
                                                    {getRating(film) > 0 ? getRating(film) : '—'}
                                                </span>
                                                <span>{getMainGenre(film.genres)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Персоны */}
                        {persons.length > 0 && (
                            <div className="search-section">
                                <div className="search-section-title">
                                    <User size={16} />
                                    <span>Персоны</span>
                                </div>
                                <div className="people-grid">
                                    {persons.map(person => (
                                        <div
                                            key={person.kinopoiskId || person.id}
                                            className="person-item"
                                            onClick={() => handleSelect('person', person)}
                                        >
                                            <div className="person-avatar actor">
                                                {person.posterUrl ? (
                                                    <img src={person.posterUrl} alt={person.nameRu || person.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                ) : (
                                                    (person.nameRu || person.nameEn || '?').charAt(0)
                                                )}
                                            </div>
                                            <span className="person-name">{person.nameRu || person.nameEn}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Подсказка при пустом поиске */}
            {isOpen && query.trim().length < 2 && (
                <motion.div
                    className="search-dropdown search-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <p>Введите минимум 2 символа для поиска</p>
                </motion.div>
            )}

            {/* Нет результатов */}
            {isOpen && query.trim().length >= 2 && !hasResults && !loading && (
                <motion.div
                    className="search-dropdown search-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <Search size={32} opacity={0.3} />
                    <p>Ничего не найдено</p>
                    <span>Попробуйте другой запрос</span>
                </motion.div>
            )}
        </div>
    )
}

export default SearchDropdown