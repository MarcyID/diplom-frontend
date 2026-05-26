import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Clock, Calendar, Film, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePopularFilms } from '../hooks/useKinopoisk.js'
import { formatDuration, getRating, getTitle, generateGradient, getMainGenre, getMainCountry } from '../utils/kinopoisk.js'

function MovieCarousel({ onMovieClick }) {
    const scrollRef = useRef(null)
    const { data: films, loading, error } = usePopularFilms(1)

    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)
    const [posterErrors, setPosterErrors] = useState({})

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef
            const scrollAmount = direction === 'left' ? -400 : 400
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeftArrow(scrollLeft > 0)
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    // Loading state
    if (loading) {
        return (
            <section className="carousel-section">
                <div className="container">
                    <h2 className="section-title">Популярные фильмы</h2>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        <div style={{ 
                            display: 'inline-block',
                            width: '40px',
                            height: '40px',
                            border: '4px solid #333',
                            borderTop: '4px solid #8b5cf6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ marginTop: '20px' }}>Загрузка фильмов...</p>
                    </div>
                </div>
            </section>
        )
    }

    // Error state
    if (error) {
        return (
            <section className="carousel-section">
                <div className="container">
                    <h2 className="section-title">Популярные фильмы</h2>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                        <Film size={48} opacity={0.3} style={{ margin: '0 auto 20px' }} />
                        <h3>Ошибка загрузки</h3>
                        <p style={{ color: '#888', marginTop: '10px' }}>{error.message}</p>
                    </div>
                </div>
            </section>
        )
    }

    if (!films || films.length === 0) {
        return null
    }

    return (
        <section className="carousel-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Популярные фильмы</h2>
                    <div className="carousel-controls">
                        <button
                            className={`carousel-arrow left ${showLeftArrow ? 'visible' : ''}`}
                            onClick={() => scroll('left')}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            className={`carousel-arrow right ${showRightArrow ? 'visible' : ''}`}
                            onClick={() => scroll('right')}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div
                    className="carousel-container"
                    ref={scrollRef}
                    onScroll={handleScroll}
                >
                    {films.map((film, index) => (
                        <motion.div
                            key={film.kinopoiskId}
                            className="movie-card"
                            style={{ position: 'relative' }}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -10 }}
                            onClick={() => onMovieClick(film)}
                        >
                            {/* Постер */}
                            <div
                                className="movie-poster"
                                style={{
                                    background: film.posterUrl && !posterErrors[film.kinopoiskId] && film.posterUrl !== 'https://kinopoiskapiunofficial.tech/images/posters/kp/no-poster.png'
                                        ? `url(${film.posterUrl}) center/cover`
                                        : generateGradient(film.kinopoiskId)
                                }}
                            >
                                {(!film.posterUrl || posterErrors[film.kinopoiskId] || film.posterUrl === 'https://kinopoiskapiunofficial.tech/images/posters/kp/no-poster.png') && (
                                    <div className="poster-placeholder">
                                        <Film size={64} opacity={0.3} />
                                    </div>
                                )}
                                <div className="movie-overlay">
                                    <span className="watch-text">Подробнее</span>
                                </div>
                            </div>

                            {/* Информация */}
                            <div className="movie-info">
                                <h3>{getTitle(film)}</h3>
                                <div className="movie-meta">
                                    <span className="year">
                                        <Calendar size={14} /> {film.year}
                                    </span>
                                    {film.filmLength && film.filmLength > 0 && (
                                        <span className="duration">
                                            <Clock size={14} /> {formatDuration(film.filmLength)}
                                        </span>
                                    )}
                                    {film.countries && film.countries.length > 0 && (
                                        <span className="country">
                                            <MapPin size={12} /> {getMainCountry(film.countries)}
                                        </span>
                                    )}
                                </div>
                                <div className="movie-footer">
                                    <div className="rating">
                                        <Star size={16} fill="#ffd700" color="#ffd700" />
                                        <span>{getRating(film) > 0 ? getRating(film) : '—'}</span>
                                    </div>
                                    <span className="genre">
                                        {getMainGenre(film.genres)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default MovieCarousel
