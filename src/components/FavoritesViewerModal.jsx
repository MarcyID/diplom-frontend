import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Film, Heart, User, Trash2, LogIn } from 'lucide-react'
import { getFavorites, toggleFilm, togglePerson } from '../services/favorites'
import { isAuthenticated } from '../services/auth'

export default function FavoritesViewerModal({
                                                 isOpen, onClose,
                                                 favoriteMovies = [],
                                                 favoriteActors = [],
                                                 favoriteDirectors = [],
                                                 onMovieClick,
                                                 onActorClick,
                                                 onDirectorClick,
                                                 onUpdateFavorites
                                             }) {
    const [activeTab, setActiveTab] = useState('all') // 'all' | 'movies' | 'people'
    const [favoritesData, setFavoritesData] = useState([])
    const [loading, setLoading] = useState(false)
    const [authError, setAuthError] = useState(false)
    const favoritePeople = [...favoriteActors, ...favoriteDirectors]
    const totalCount = favoriteMovies.length + favoritePeople.length

    // Загружаем данные из API при открытии модалки
    useEffect(() => {
        if (isOpen) {
            loadFavorites()
        }
    }, [isOpen])

    const loadFavorites = async () => {
        // Проверяем авторизацию
        if (!isAuthenticated()) {
            setAuthError(true)
            return
        }

        setAuthError(false)
        setLoading(true)
        try {
            const data = await getFavorites(1, 20)
            setFavoritesData(data.items || [])
        } catch (error) {
            console.error('Failed to load favorites:', error)
            if (error.message?.includes('Необходима авторизация') || error.message?.includes('401')) {
                setAuthError(true)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleToggleFavorite = async (item) => {
        try {
            const isFilm = item.object_type === 'film'
            const id = isFilm ? (item.film_data?.kinopoiskId || item.object_id) : (item.person_data?.kinopoiskId || item.object_id)

            await (isFilm ? toggleFilm(id) : togglePerson(id))

            // Обновляем локальный список
            setFavoritesData(prev => prev.filter(i => 
                i.object_id !== item.object_id || i.object_type !== item.object_type
            ))

            // Уведомляем родительский компонент
            if (onUpdateFavorites) {
                onUpdateFavorites()
            }
        } catch (error) {
            console.error('Failed to remove from favorites:', error)
        }
    }

    const renderFavoriteItem = (item) => {
        const isFilm = item.object_type === 'film'
        const data = isFilm ? item.film_data : (item.person_data || {})
        const id = isFilm ? (data.kinopoiskId || item.object_id) : (data.kinopoiskId || item.object_id)
        const name = isFilm ? (data.nameRu || data.nameEn || 'Без названия') : (data.name || data.fullName || 'Без имени')
        const posterUrl = isFilm ? (data.posterUrlPreview || data.posterUrl) : null
        const profession = data.profession || (data.professions?.[0] || '')
        
        return (
            <div key={item.object_id} className="favorite-item-card">
                <div className="favorite-item-poster">
                    {posterUrl ? (
                        <img src={posterUrl} alt={name} onError={(e) => { e.target.style.display = 'none' }} />
                    ) : (
                        <div className="favorite-item-poster-placeholder">
                            {isFilm ? <Film size={32} /> : <User size={32} />}
                        </div>
                    )}
                </div>
                <div className="favorite-item-info">
                    <h4 className="favorite-item-title">{name}</h4>
                    {isFilm ? (
                        <p className="favorite-item-meta">
                            <Film size={14} /> {data.year || '—'} • {data.type === 'FILM' ? 'Фильм' : data.type === 'TV_SHOW' ? 'Сериал' : 'Другое'}
                        </p>
                    ) : (
                        <p className="favorite-item-meta">
                            <User size={14} /> {profession || 'Персона'}
                        </p>
                    )}
                </div>
                <button 
                    className="favorite-item-remove-btn"
                    onClick={() => handleToggleFavorite(item)}
                    title="Удалить из избранного"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        )
    }

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
                            </div>

                            {/* Переключатель табов */}
                            <div className="favorites-tabs">
                                <button
                                    className={`fav-tab ${activeTab === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    Все ({totalCount})
                                </button>
                                <button
                                    className={`fav-tab ${activeTab === 'movies' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('movies')}
                                >
                                    <Film size={14} /> Фильмы ({favoriteMovies.length})
                                </button>
                                <button
                                    className={`fav-tab ${activeTab === 'people' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('people')}
                                >
                                    <User size={14} /> Персоны ({favoritePeople.length})
                                </button>
                            </div>

                            <div className="favorites-content-list">
                                {authError ? (
                                    <div className="favorites-auth-error">
                                        <LogIn size={48} opacity={0.3} />
                                        <p>Требуется авторизация</p>
                                        <span>Войдите, чтобы управлять избранным</span>
                                    </div>
                                ) : loading ? (
                                    <div className="favorites-loading">
                                        <div className="spinner" />
                                        <p>Загрузка...</p>
                                    </div>
                                ) : totalCount === 0 ? (
                                    <div className="favorites-empty-state">
                                        <Heart size={48} opacity={0.3} />
                                        <p>В избранном пока пусто</p>
                                        <span>Добавляйте фильмы, актёров и режиссёров в избранное</span>
                                    </div>
                                ) : (
                                    <div className="favorites-grid-list">
                                        {activeTab === 'all' && favoritesData
                                            .filter(item => 
                                                (item.object_type === 'film' && favoriteMovies.includes(Number(item.film_data?.kinopoiskId || item.object_id))) ||
                                                (item.object_type === 'person' && favoritePeople.includes(Number(item.person_data?.kinopoiskId || item.object_id)))
                                            )
                                            .map(item => renderFavoriteItem(item))
                                        }
                                        {activeTab === 'movies' && favoritesData
                                            .filter(item => item.object_type === 'film' && favoriteMovies.includes(Number(item.film_data?.kinopoiskId || item.object_id)))
                                            .map(item => renderFavoriteItem(item))
                                        }
                                        {activeTab === 'people' && favoritesData
                                            .filter(item => item.object_type === 'person' && favoritePeople.includes(Number(item.person_data?.kinopoiskId || item.object_id)))
                                            .map(item => renderFavoriteItem(item))
                                        }
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
