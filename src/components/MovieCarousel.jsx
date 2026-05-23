import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, Clock, Calendar, Film, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

function MovieCarousel({ movies, onMovieClick, favoriteMovies = [], onToggleFavorite }) {
    const scrollRef = useRef(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

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
                    {movies.map((movie, index) => (
                        <motion.div
                            key={movie.id}
                            className="movie-card"
                            style={{ position: 'relative' }}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            onClick={() => onMovieClick(movie)}
                        >
                            {/* Постер */}
                            <div className="movie-poster" style={{ background: movie.gradient }}>
                                <div className="poster-placeholder">
                                    <Film size={64} opacity={0.3} />
                                </div>
                                <div className="movie-overlay">
                                    <span className="watch-text">Подробнее</span>
                                </div>
                            </div>

                            {/* Информация */}
                            <div className="movie-info">
                                <h3>{movie.title}</h3>
                                <div className="movie-meta">
                                    <span className="year">
                                        <Calendar size={14} /> {movie.year}
                                    </span>
                                    <span className="duration">
                                        <Clock size={14} /> {movie.duration}
                                    </span>
                                </div>
                                <div className="movie-footer">
                                    <div className="rating">
                                        <Star size={16} fill="#ffd700" color="#ffd700" />
                                        <span>{movie.rating}</span>
                                    </div>
                                    <span className="genre">{movie.genre}</span>
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