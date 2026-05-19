import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Film, User, Clapperboard, Star, Calendar, Clock } from 'lucide-react'

function SearchDropdown({ allMovies, onMovieClick, actors, directors }) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [results, setResults] = useState({ movies: [], actors: [], directors: [] })
    const dropdownRef = useRef(null)

    // Поиск при изменении запроса
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults({ movies: [], actors: [], directors: [] })
            return
        }

        const lowerQuery = query.toLowerCase()

        // Поиск фильмов
        const movieResults = allMovies.filter(m =>
            m.title.toLowerCase().includes(lowerQuery) ||
            m.genre.toLowerCase().includes(lowerQuery)
        ).slice(0, 5)

        // Поиск актёров
        const actorResults = actors.filter(a =>
            a.name.toLowerCase().includes(lowerQuery)
        ).slice(0, 3)

        // Поиск режиссёров
        const directorResults = directors.filter(d =>
            d.name.toLowerCase().includes(lowerQuery)
        ).slice(0, 3)

        setResults({
            movies: movieResults,
            actors: actorResults,
            directors: directorResults
        })

        setIsOpen(true)
    }, [query, allMovies, actors, directors])

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

    const handleSelect = (type, item) => {
        if (type === 'movie') {
            onMovieClick(item)
        }
        setQuery('')
        setIsOpen(false)
    }

    const hasResults = results.movies.length > 0 || results.actors.length > 0 || results.directors.length > 0

    return (
        <div className="search-dropdown-wrapper" ref={dropdownRef}>
            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder="Поиск фильмов, актёров, режиссёров..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
                    className="search-input"
                />
                {query && (
                    <button className="clear-search" onClick={() => { setQuery(''); setIsOpen(false); }}>
                        ×
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && hasResults && (
                    <motion.div
                        className="search-dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Фильмы */}
                        {results.movies.length > 0 && (
                            <div className="search-section">
                                <div className="search-section-title">
                                    <Film size={16} />
                                    <span>Фильмы</span>
                                </div>
                                {results.movies.map(movie => (
                                    <div
                                        key={movie.id}
                                        className="search-item movie-item"
                                        onClick={() => handleSelect('movie', movie)}
                                    >
                                        <div className="movie-preview" style={{ background: movie.gradient }}>
                                            <Film size={24} opacity={0.5} />
                                        </div>
                                        <div className="movie-info">
                                            <h4>{movie.title}</h4>
                                            <div className="movie-meta">
                                                <span>{movie.year}</span>
                                                <span className="rating">
                          <Star size={10} fill="#ffd700" color="#ffd700" />
                                                    {movie.rating}
                        </span>
                                                <span>{movie.genre}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Актёры */}
                        {results.actors.length > 0 && (
                            <div className="search-section">
                                <div className="search-section-title">
                                    <User size={16} />
                                    <span>Актёры</span>
                                </div>
                                <div className="people-grid">
                                    {results.actors.map(actor => (
                                        <div key={actor.id} className="person-item">
                                            <div className="person-avatar actor">
                                                {actor.name.charAt(0)}
                                            </div>
                                            <span className="person-name">{actor.name}</span>
                                            <span className="person-films">{actor.movies.length} фильмов</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Режиссёры */}
                        {results.directors.length > 0 && (
                            <div className="search-section">
                                <div className="search-section-title">
                                    <Clapperboard size={16} />
                                    <span>Режиссёры</span>
                                </div>
                                <div className="people-grid">
                                    {results.directors.map(director => (
                                        <div key={director.id} className="person-item">
                                            <div className="person-avatar director">
                                                <Clapperboard size={18} />
                                            </div>
                                            <span className="person-name">{director.name}</span>
                                            <span className="person-films">{director.movies.length} фильмов</span>
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
            {isOpen && query.trim().length >= 2 && !hasResults && (
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