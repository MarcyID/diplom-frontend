import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Edit3, Plus, Film, Pencil, Trash2,
    Heart, Bookmark, Clock, LogIn,
    Calendar, MapPin, Camera, Image,
    ChevronRight, X, Star, LogOut
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import CreateCollectionModal from './CreateCollectionModal'
import CollectionsViewerModal from './CollectionsViewerModal'
import SingleCollectionModal from './SingleCollectionModal'
import { logout } from '../services/auth'
import { getFavorites, toggleFilm, togglePerson } from '../services/favorites'
import { isAuthenticated } from '../services/auth'


export default function ProfilePage({
                                        user, setUser, isLoggedIn, onMovieClick,
                                        onActorClick
                                    }) {
    const navigate = useNavigate()
    const location = useLocation()
    const avatarInputRef = useRef(null)
    const bannerInputRef = useRef(null)
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempName, setTempName] = useState(user.name)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isCollectionsViewerOpen, setIsCollectionsViewerOpen] = useState(false)
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [isSingleCollectionOpen, setIsSingleCollectionOpen] = useState(false)
    
    // ❤️ Состояние для вкладок избранного
    const [activeFavoriteTab, setActiveFavoriteTab] = useState('all') // 'all' | 'movies' | 'people'
    const [favoritesData, setFavoritesData] = useState([])
    const [favoritesLoading, setFavoritesLoading] = useState(false)
    const [favoritesAuthError, setFavoritesAuthError] = useState(false)
    
    // ❤️ Загрузка избранного при монтировании
    useEffect(() => {
        loadFavorites()
    }, [isLoggedIn])
    
    const loadFavorites = async () => {
        if (!isAuthenticated()) {
            setFavoritesAuthError(true)
            return
        }

        setFavoritesAuthError(false)
        setFavoritesLoading(true)
        try {
            const data = await getFavorites(1, 100)
            setFavoritesData(data.items || [])
        } catch (error) {
            console.error('Failed to load favorites:', error)
            if (error.message?.includes('Необходима авторизация') || error.message?.includes('401')) {
                setFavoritesAuthError(true)
            }
        } finally {
            setFavoritesLoading(false)
        }
    }
    
    // ❤️ Удаление из избранного
    const handleRemoveFromFavorites = async (item) => {
        try {
            const isFilm = item.object_type === 'film'
            const id = isFilm ? (item.film_data?.kinopoiskId || item.object_id) : (item.person_data?.kinopoiskId || item.object_id)

            await (isFilm ? toggleFilm(id) : togglePerson(id))

            // Обновляем локальный список
            setFavoritesData(prev => prev.filter(i =>
                i.object_id !== item.object_id || i.object_type !== item.object_type
            ))
            
            // Обновляем состояние пользователя
            if (isFilm) {
                removeFromFavorites('movie', Number(id))
            } else {
                // Проверяем, актёр или режиссёр
                const data = item.person_data || {}
                const profession = data.profession || data.professionText || (data.professions?.[0] || '')
                const isDirector = profession?.toLowerCase().includes('режиссёр')
                removeFromFavorites(isDirector ? 'director' : 'actor', Number(id))
            }
        } catch (error) {
            console.error('Failed to remove from favorites:', error)
        }
    }
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const collectionId = params.get('collection');

        if (collectionId && user.collections.length > 0) {
            const target = user.collections.find(c => c.id === Number(collectionId));
            if (target) {
                setTimeout(() => {
                    openCollection(target);
                    // Очистить параметр из URL
                    window.history.replaceState({}, '', window.location.pathname);
                }, 500);
            }
        }
    }, [user.collections]);

    const allGenres = ['Боевик', 'Комедия', 'Драма', 'Фантастика', 'Триллер', 'Ужасы', 'Мелодрама', 'Детектив', 'Фэнтези', 'Приключения', 'Мультфильм', 'Аниме']

    // Выход из аккаунта
    const handleLogout = async () => {
        try {
            await logout()
            navigate('/')
            window.location.reload()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    // Сохранение имени
    const saveName = () => {
        if (tempName.trim()) setUser(prev => ({ ...prev, name: tempName }))
        setIsEditingName(false)
    }

    // Переключение жанра
    const toggleGenre = (genre) => {
        setUser(prev => {
            const current = prev.genres || []
            const updated = current.includes(genre)
                ? current.filter(g => g !== genre)
                : [...current, genre]
            return { ...prev, genres: updated }
        })
    }

    // Загрузка аватара
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => setUser(prev => ({ ...prev, avatar: reader.result }))
        reader.readAsDataURL(file)
    }

    // Загрузка баннера
    const handleBannerChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => setUser(prev => ({ ...prev, banner: reader.result }))
        reader.readAsDataURL(file)
    }

    const addCollection = (newCol) => {
        setUser(prev => ({
            ...prev,
            collections: [...prev.collections, { ...newCol, id: Date.now(), films: 0, movieIds: [] }]
        }))
        setIsCreateModalOpen(false)
    }

    const openCollection = (collection) => {
        setSelectedCollection(collection)
        setIsSingleCollectionOpen(false)
        setIsSingleCollectionOpen(true)
    }

    const deleteCollection = (collectionId) => {
        if (window.confirm('Удалить эту подборку?')) {
            setUser(prev => ({
                ...prev,
                collections: prev.collections.filter(c => c.id !== collectionId)
            }))
            setIsSingleCollectionOpen(false)
        }
    }

    const editCollection = (collection) => {
        alert(`Редактирование: ${collection.title}\n(Функция в разработке)`)
    }

    // 🔥 Обновление подборки
    const updateCollection = (collectionId, updates) => {
        setUser(prev => ({
            ...prev,
            collections: prev.collections.map(c =>
                c.id === collectionId ? { ...c, ...updates, films: updates.movieIds?.length || c.films } : c
            )
        }))
    }

    // 🔥 Удаление из избранного
    const removeFromFavorites = (type, id) => {
        if (type === 'movie') {
            setUser(prev => ({
                ...prev,
                favoriteMovies: (prev.favoriteMovies || []).filter(mid => mid !== id)
            }))
        } else if (type === 'actor') {
            setUser(prev => ({
                ...prev,
                favoriteActors: (prev.favoriteActors || []).filter(aid => aid !== id)
            }))
        } else if (type === 'director') {
            setUser(prev => ({
                ...prev,
                favoriteDirectors: (prev.favoriteDirectors || []).filter(did => did !== id)
            }))
        }
    }

    const totalFilms = user.collections.reduce((a, c) => a + (c.films || 0), 0)

    // Избранные элементы
    const favoriteMoviesCount = (user.favoriteMovies || []).length
    const favoritePeopleCount = (user.favoriteActors?.length || 0) + (user.favoriteDirectors?.length || 0)
    
    // Форматируем дату регистрации
    const formatRegistrationDate = (dateString) => {
        if (!dateString) return null
        const date = new Date(dateString)
        const year = date.getFullYear()
        return `с ${year} года`
    }
    const registrationText = formatRegistrationDate(user.createdAt)
    
    // ❤️ Рендер элемента избранного
    const renderFavoriteItem = (item) => {
        const isFilm = item.object_type === 'film'
        const data = isFilm ? item.film_data : (item.person_data || {})
        const id = isFilm ? (data.kinopoiskId || item.object_id) : (data.personId || item.object_id)
        const name = isFilm 
            ? (data.nameRu || data.nameEn || 'Без названия')
            : (data.nameRu || data.nameEn || data.fullName || data.name || 'Без имени')
        const posterUrl = data.posterUrlPreview || data.posterUrl || null
        const profession = data.profession || data.professionText || (data.professions?.[0] || '')

        const handleClick = () => {
            if (isFilm) {
                onMovieClick?.({ kinopoiskId: id })
            } else {
                onActorClick?.(id)
            }
        }

        return (
            <div key={item.object_id} className="favorite-item-card clickable" onClick={handleClick}>
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
                            <Film size={14} /> {data.year || '—'} • ⭐ {data.ratingKinopoisk || '—'}
                        </p>
                    ) : (
                        <p className="favorite-item-meta">
                            <User size={14} /> {profession || 'Персона'}
                        </p>
                    )}
                </div>
                <button
                    className="favorite-item-remove-btn"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromFavorites(item)
                    }}
                    title="Удалить из избранного"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        )
    }

    return (
        <div className="profile-page">
            <input type="file" ref={avatarInputRef} className="hidden-input" accept="image/*" onChange={handleAvatarChange} />
            <input type="file" ref={bannerInputRef} className="hidden-input" accept="image/*" onChange={handleBannerChange} />

            {/* Баннер */}
            <div
                className="profile-banner"
                style={{ backgroundImage: user.banner ? `url(${user.banner})` : 'url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop)' }}
            >
                <div className="banner-overlay"></div>
                <button className="banner-edit-btn" onClick={() => bannerInputRef.current.click()}>
                    <Image size={16} /> Изменить фон
                </button>
            </div>

            <div className="profile-container">
                {/* Шапка */}
                <div className="profile-header">
                    <div className="avatar-section">
                        <div className="profile-avatar" onClick={() => avatarInputRef.current.click()}>
                            {user.avatar ? <img src={user.avatar} alt="avatar" /> : <User size={36} />}
                        </div>
                        <button className="avatar-edit-btn" onClick={() => avatarInputRef.current.click()}>
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="profile-main-info">
                        <div className="name-row">
                            {isEditingName ? (
                                <div className="name-edit-input">
                                    <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="name-input" autoFocus onBlur={saveName} onKeyDown={(e) => e.key === 'Enter' && saveName()} />
                                    <button className="save-name-btn" onClick={saveName}>✓</button>
                                </div>
                            ) : (
                                <h1 className="profile-name" onClick={() => setIsEditingName(true)}>
                                    {user.name} <Edit3 size={18} className="edit-icon" />
                                </h1>
                            )}
                        </div>
                        {registrationText && (
                            <div className="profile-meta">
                                <span><Calendar size={14} /> Киноман {registrationText}</span>
                            </div>
                        )}
                    </div>

                    <div className="profile-actions">
                        {isLoggedIn && (
                            <button className="action-btn danger" onClick={handleLogout}>
                                <LogOut size={16} /> Выйти
                            </button>
                        )}
                    </div>
                </div>

                {/* Статистика */}
                <div className="stats-row">
                    <div className="stat-card clickable" onClick={() => setIsCollectionsViewerOpen(true)}>
                        <div className="stat-icon blue"><Film size={20} /></div>
                        <div className="stat-value">{totalFilms}</div>
                        <div className="stat-label">Фильмов в подборках</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><Film size={20} /></div>
                        <div className="stat-value">{user.collections.length}</div>
                        <div className="stat-label">Подборок создано</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon pink"><Heart size={20} /></div>
                        <div className="stat-value">{(user.favoriteMovies?.length || 0) + (user.favoriteActors?.length || 0) + (user.favoriteDirectors?.length || 0)}</div>
                        <div className="stat-label">Всего в избранном</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><Clock size={20} /></div>
                        <div className="stat-value">186ч</div>
                        <div className="stat-label">Время просмотра</div>
                    </div>
                </div>

                {/* Сетка */}
                <div className="profile-grid">
                    <div className="profile-sidebar">
                        {/* Жанровые предпочтения */}
                        <div className="sidebar-card">
                            <h3 className="sidebar-title"><Heart size={18} /> Жанровые предпочтения</h3>
                            <p className="sidebar-hint">Нажмите, чтобы добавить или убрать</p>
                            <div className="genre-cloud">
                                {allGenres.map(g => (
                                    <span
                                        key={g}
                                        className={`genre-tag ${user.genres?.includes(g) ? 'active' : ''}`}
                                        onClick={() => toggleGenre(g)}
                                    >
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка: Подборки + Избранное */}
                    <div className="profile-main">
                        {/* Подборки */}
                        <div className="collections-header">
                            <h2>Мои подборки</h2>
                            <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}><Plus size={18} /> Создать подборку</button>
                        </div>

                        {user.collections.length > 0 ? (
                            <div className="collections-grid">
                                {user.collections.map(col => (
                                    <motion.div
                                        key={col.id}
                                        className="collection-card clickable"
                                        style={{ background: col.gradient }}
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        onClick={() => openCollection(col)}
                                    >
                                        <div className="collection-overlay"></div>
                                        <div className="collection-content">
                                            <h3>{col.title}</h3>
                                            <p>{col.description || 'Без описания'}</p>
                                            <div className="collection-footer">
                                                <span className="film-count"><Film size={14} /> {col.films || 0} фильмов</span>
                                                <div className="collection-actions" onClick={(e) => e.stopPropagation()}>
                                                    <button title="Редактировать" onClick={() => editCollection(col)}><Pencil size={14} /></button>
                                                    <button title="Удалить" onClick={(e) => { e.stopPropagation(); deleteCollection(col.id); }}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-collections">
                                <Film size={48} opacity={0.3} />
                                <h3>Пока пусто</h3>
                                <p>Создайте первую подборку</p>
                                <button className="create-btn-empty" onClick={() => setIsCreateModalOpen(true)}><Plus size={16} /> Создать подборку</button>
                            </div>
                        )}

                        {/* В избранном */}
                        <div className="favorites-section">
                            <div className="favorites-header-simple">
                                <h2><Heart size={20} fill="#ec4899" color="#ec4899" /> В избранном</h2>
                            </div>
                            
                            {/* Переключатель табов */}
                            <div className="favorites-tabs">
                                <button
                                    className={`fav-tab ${activeFavoriteTab === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveFavoriteTab('all')}
                                >
                                    Все ({favoritesData.length})
                                </button>
                                <button
                                    className={`fav-tab ${activeFavoriteTab === 'movies' ? 'active' : ''}`}
                                    onClick={() => setActiveFavoriteTab('movies')}
                                >
                                    <Film size={14} /> Фильмы ({favoritesData.filter(i => i.object_type === 'film').length})
                                </button>
                                <button
                                    className={`fav-tab ${activeFavoriteTab === 'people' ? 'active' : ''}`}
                                    onClick={() => setActiveFavoriteTab('people')}
                                >
                                    <User size={14} /> Персоны ({favoritesData.filter(i => i.object_type === 'person').length})
                                </button>
                            </div>
                            
                            <div className="favorites-content-list">
                                {favoritesAuthError ? (
                                    <div className="favorites-auth-error">
                                        <LogIn size={48} opacity={0.3} />
                                        <p>Требуется авторизация</p>
                                        <span>Войдите, чтобы управлять избранным</span>
                                    </div>
                                ) : favoritesLoading ? (
                                    <div className="favorites-loading">
                                        <div className="spinner" />
                                        <p>Загрузка...</p>
                                    </div>
                                ) : favoritesData.length === 0 ? (
                                    <div className="favorites-empty-state">
                                        <Heart size={48} opacity={0.3} />
                                        <p>В избранном пока пусто</p>
                                        <span>Добавляйте фильмы, актёров и режиссёров в избранное</span>
                                    </div>
                                ) : (
                                    <div className="favorites-grid-list">
                                        {activeFavoriteTab === 'all' && favoritesData.map(item => renderFavoriteItem(item))}
                                        {activeFavoriteTab === 'movies' && favoritesData
                                            .filter(item => item.object_type === 'film')
                                            .map(item => renderFavoriteItem(item))
                                        }
                                        {activeFavoriteTab === 'people' && favoritesData
                                            .filter(item => item.object_type === 'person')
                                            .map(item => renderFavoriteItem(item))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модалки */}
            <CreateCollectionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={addCollection} />

            <CollectionsViewerModal
                isOpen={isCollectionsViewerOpen}
                onClose={() => setIsCollectionsViewerOpen(false)}
                collections={user.collections}
            />

            <SingleCollectionModal
                isOpen={isSingleCollectionOpen}
                onClose={() => setIsSingleCollectionOpen(false)}
                collection={user.collections.find(c => c.id === selectedCollection?.id) || selectedCollection}
                onMovieClick={onMovieClick}
                onDelete={deleteCollection}
                onEdit={editCollection}
                onUpdate={updateCollection}
            />
        </div>
    )
}