import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Star, Clock, Calendar, Film, MapPin, ChevronRight } from 'lucide-react'
import { useFilm, useSimilarFilms } from '../hooks/useKinopoisk.js'
import { formatDuration, getRating, getTitle, getMainCountry, getMainGenre, generateGradient } from '../utils/kinopoisk.js'
import AddToCollectionModal from './AddToCollectionModal'

function MovieModal({
    filmId, isOpen, onClose, onMovieClick,
    favoriteMovies = [], onToggleFavorite,
    userCollections = [], onAddToCollection, onCreateCollection
}) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [similarExpanded, setSimilarExpanded] = useState(true)
    const [posterError, setPosterError] = useState(false)
    const [similarPosterErrors, setSimilarPosterErrors] = useState({})

    // Загружаем фильм и похожие через API
    const { data: film, loading: filmLoading, error: filmError } = useFilm(filmId)
    const { data: similarFilms, loading: similarLoading } = useSimilarFilms(filmId)

    // Сбрасываем ошибку постера при смене фильма
    useEffect(() => {
        setPosterError(false)
    }, [filmId])

    if (!filmId || !isOpen) return null

    // Loading state
    if (filmLoading) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                        <div className="modal-container">
                            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                <div style={{
                                    display: 'inline-block',
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid #333',
                                    borderTop: '4px solid #8b5cf6',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                <p style={{ marginTop: '20px' }}>Загрузка фильма...</p>
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        )
    }

    // Error state
    if (filmError || !film) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                        <div className="modal-container">
                            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                                <Film size={48} opacity={0.3} style={{ margin: '0 auto 20px' }} />
                                <h3>Ошибка загрузки</h3>
                                <p style={{ color: '#888', marginTop: '10px' }}>{filmError?.message || 'Фильм не найден'}</p>
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        )
    }

    const isFavorite = favoriteMovies?.includes(film.kinopoiskId)
    const similarList = similarFilms?.slice(0, 4) || []

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            onClose()
                        }}
                    />

                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                        >
                            <button className="modal-close" onClick={onClose}>
                                <X size={24} />
                            </button>

                            <div className="modal-body">
                                <div className="modal-poster">
                                    <div
                                        className="poster-image"
                                        style={{
                                            background: film.posterUrl && !posterError && film.posterUrl !== 'https://kinopoiskapiunofficial.tech/images/posters/kp/no-poster.png'
                                                ? `url(${film.posterUrl}) center/cover`
                                                : generateGradient(film.kinopoiskId)
                                        }}
                                    >
                                        {(!film.posterUrl || posterError || film.posterUrl === 'https://kinopoiskapiunofficial.tech/images/posters/kp/no-poster.png') && (
                                            <div className="poster-placeholder">
                                                <Film size={64} opacity={0.3} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="modal-info">
                                    <h2>{getTitle(film)}</h2>

                                    <div className="modal-meta">
                                        <div className="meta-item">
                                            <Star size={18} fill="#ffd700" color="#ffd700" />
                                            <span>{getRating(film) > 0 ? getRating(film) : '—'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Calendar size={18} />
                                            <span>{film.year}</span>
                                        </div>
                                        {film.filmLength && film.filmLength > 0 && (
                                            <div className="meta-item">
                                                <Clock size={18} />
                                                <span>{formatDuration(film.filmLength)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-genres">
                                        <div className="modal-genre">
                                            <Film size={18} />
                                            <span>{getMainGenre(film.genres)}</span>
                                        </div>
                                        {film.countries && film.countries.length > 0 && (
                                            <div className="modal-country">
                                                <MapPin size={18} />
                                                <span>{getMainCountry(film.countries)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="modal-description">
                                        {film.description || 'Описание отсутствует'}
                                    </p>

                                    {/* Основные действия */}
                                    <div className="modal-actions">
                                        <button
                                            className="btn-watch"
                                            onClick={() => window.open(`https://www.kinopoisk.ru/film/${film.kinopoiskId}`, '_blank')}
                                        >
                                            <Film size={20} />
                                            Смотреть на Кинопоиске
                                        </button>

                                        <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>
                                            Добавить в подборку
                                        </button>
                                    </div>

                                    {/* 🔥 КНОПКА "В ИЗБРАННОЕ" */}
                                    <button
                                        className={`favorite-action-btn ${isFavorite ? 'active' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(film.kinopoiskId); }}
                                    >
                                        <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} color={isFavorite ? '#ef4444' : '#888'} />
                                        <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
                                    </button>

                                    {/* Похожие фильмы - горизонтальный список */}
                                    {similarList.length > 0 && (
                                        <div className="modal-similar">
                                            <div 
                                                className="modal-similar-header" 
                                                onClick={() => setSimilarExpanded(!similarExpanded)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <ChevronRight 
                                                    size={20} 
                                                    color="#8b5cf6"
                                                    style={{ 
                                                        transform: similarExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s'
                                                    }} 
                                                />
                                                <h3>Похожие фильмы</h3>
                                            </div>
                                            {similarExpanded && (
                                                <div className="similar-list">
                                                    {similarList.map((similar, index) => (
                                                        <div
                                                            key={similar.filmId || similar.kinopoiskId || index}
                                                            className="similar-item"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                onMovieClick?.({
                                                                    ...similar,
                                                                    kinopoiskId: similar.filmId || similar.kinopoiskId
                                                                })
                                                            }}
                                                        >
                                                            <div
                                                                className="similar-poster"
                                                                style={{
                                                                    background: similar.posterUrl && !similarPosterErrors[similar.filmId || similar.kinopoiskId] && similar.posterUrl !== 'https://kinopoiskapiunofficial.tech/images/posters/kp/no-poster.png'
                                                                        ? `url(${similar.posterUrl}) center/cover`
                                                                        : generateGradient(similar.filmId || similar.kinopoiskId || index)
                                                                }}
                                                            >
                                                                {(!similar.posterUrl || similarPosterErrors[similar.filmId || similar.kinopoiskId] || similar.posterUrl === 'https://kinopoiskapiunofficial.tech/images/posters/kp/no-poster.png') && (
                                                                    <div className="poster-placeholder">
                                                                        <Film size={48} opacity={0.3} />
                                                                    </div>
                                                                )}
                                                                <div className="similar-overlay">
                                                                    <span className="similar-watch-text">Подробнее</span>
                                                                </div>
                                                            </div>
                                                            <div className="similar-info">
                                                                <h4>{getTitle(similar)}</h4>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Модалка добавления в подборку */}
                    <AddToCollectionModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        movie={film}
                        collections={userCollections}
                        onAddToCollection={onAddToCollection}
                        onCreateCollection={onCreateCollection}
                    />
                </>
            )}
        </AnimatePresence>
    )
}

export default MovieModal
