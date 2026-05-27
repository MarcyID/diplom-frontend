import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Edit3, Plus, Film, Pencil, Trash2,
    Heart, Bookmark, Clock, LogIn,
    Calendar, MapPin, Camera, Image,
    ChevronRight, X, Star, LogOut, Popcorn
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import CreateCollectionModal from './CreateCollectionModal'
import SingleCollectionModal from './SingleCollectionModal'
import { logout } from '../services/auth'
import { getFavorites, toggleFilm, togglePerson } from '../services/favorites'
import { isAuthenticated } from '../services/auth'
import { getGenrePreferences, updateGenrePreferences } from '../services/genrePreferences'
import { updateProfile } from '../services/profile'
import { uploadAvatar, uploadBanner, deleteAvatar, deleteBanner } from '../services/profileUpload'


export default function ProfilePage({
                                        user, setUser, isLoggedIn, collectionsLoading, onMovieClick,
                                        onActorClick, onOpenAuthModal, onCreateCollection,
                                        onUpdateCollection, onDeleteCollection, onRemoveMovieFromCollection
                                    }) {
    const navigate = useNavigate()
    const location = useLocation()
    const avatarInputRef = useRef(null)
    const bannerInputRef = useRef(null)
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempName, setTempName] = useState(user.name)
    
    // Синхронизием tempName с user.name при загрузке данных пользователя
    useEffect(() => {
        setTempName(user.name)
    }, [user.name])

    // Обработка навигации с открытием модалки создания подборки
    useEffect(() => {
        if (location.state?.openCreateCollection) {
            // Очищаем состояние навигации
            window.history.replaceState({}, document.title)
            // Открываем модалку создания
            setIsCreateModalOpen(true)
        }
    }, [location.state])

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [isSingleCollectionOpen, setIsSingleCollectionOpen] = useState(false)
    const [startInEditMode, setStartInEditMode] = useState(false)
    
    // ❤️ Состояние для вкладок избранного
    const [activeFavoriteTab, setActiveFavoriteTab] = useState('all') // 'all' | 'movies' | 'people'
    const [favoritesData, setFavoritesData] = useState([])
    const [favoritesLoading, setFavoritesLoading] = useState(false)
    const [favoritesAuthError, setFavoritesAuthError] = useState(false)

    // 🎬 Жанровые предпочтения
    const [genrePreferences, setGenrePreferences] = useState([])

    // 📸 Загрузка изображений
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [isUploadingBanner, setIsUploadingBanner] = useState(false)
    const [uploadError, setUploadError] = useState(null)

    // 🎬 Загрузка жанровых предпочтений
    useEffect(() => {
        loadGenrePreferences()
    }, [isLoggedIn])

    const loadGenrePreferences = async () => {
        if (!isAuthenticated()) {
            setGenrePreferences([])
            return
        }

        try {
            const prefs = await getGenrePreferences()
            setGenrePreferences(prefs)
        } catch (error) {
            console.error('Failed to load genre preferences:', error)
            setGenrePreferences([])
        }
    }

    const handleToggleGenrePreference = async (genreId) => {
        // Оптимистичное обновление UI
        const newPreferences = genrePreferences.includes(genreId)
            ? genrePreferences.filter(id => id !== genreId)
            : [...genrePreferences, genreId]
        
        setGenrePreferences(newPreferences)

        try {
            await updateGenrePreferences(newPreferences)
            
            // Обновляем состояние пользователя в App.jsx
            setUser(prev => ({
                ...prev,
                genre_preferences: newPreferences
            }))
        } catch (error) {
            console.error('Failed to save genre preferences:', error)
            // Откат при ошибке
            setGenrePreferences(genrePreferences)
        }
    }

    // 📸 Загрузка аватара
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Проверка размера (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Размер файла не должен превышать 5MB')
            return
        }

        // Проверка типа файла
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
            setUploadError('Допустимые форматы: JPEG, PNG, WebP, GIF')
            return
        }

        setIsUploadingAvatar(true)
        setUploadError(null)

        try {
            const result = await uploadAvatar(file)
            setUser(prev => ({
                ...prev,
                avatar: result.avatar_url
            }))
        } catch (error) {
            console.error('Failed to upload avatar:', error)
            setUploadError(error.message)
        } finally {
            setIsUploadingAvatar(false)
            e.target.value = '' // Сбросить input
        }
    }

    // 📸 Загрузка фона
    const handleBannerChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Проверка размера (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Размер файла не должен превышать 5MB')
            return
        }

        // Проверка типа файла
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
            setUploadError('Допустимые форматы: JPEG, PNG, WebP, GIF')
            return
        }

        setIsUploadingBanner(true)
        setUploadError(null)

        try {
            const result = await uploadBanner(file)
            setUser(prev => ({
                ...prev,
                banner: result.banner_url
            }))
        } catch (error) {
            console.error('Failed to upload banner:', error)
            setUploadError(error.message)
        } finally {
            setIsUploadingBanner(false)
            e.target.value = '' // Сбросить input
        }
    }

    // 📸 Удаление аватара
    const handleDeleteAvatar = async () => {
        setIsUploadingAvatar(true)
        setUploadError(null)

        try {
            const updatedUser = await deleteAvatar()
            setUser(prev => ({
                ...prev,
                avatar: null
            }))
        } catch (error) {
            console.error('Failed to delete avatar:', error)
            setUploadError(error.message)
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    // 📸 Удаление фона
    const handleDeleteBanner = async () => {
        setIsUploadingBanner(true)
        setUploadError(null)

        try {
            await deleteBanner()
            setUser(prev => ({
                ...prev,
                banner: null
            }))
        } catch (error) {
            console.error('Failed to delete banner:', error)
            setUploadError(error.message)
        } finally {
            setIsUploadingBanner(false)
        }
    }

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
            const data = await getFavorites(1, 20)
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

    // 🎬 Жанры с ID для API
    const allGenres = [
        { id: 11, label: 'Боевик' },
        { id: 13, label: 'Комедия' },
        { id: 2, label: 'Драма' },
        { id: 6, label: 'Фантастика' },
        { id: 1, label: 'Триллер' },
        { id: 17, label: 'Ужасы' },
        { id: 4, label: 'Мелодрама' },
        { id: 5, label: 'Детектив' },
        { id: 12, label: 'Фэнтези' },
        { id: 7, label: 'Приключения' },
        { id: 18, label: 'Мультфильм' },
        { id: 24, label: 'Аниме' }
    ]

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
    const saveName = async () => {
        if (tempName.trim()) {
            const newName = tempName.trim()
            
            // Оптимистичное обновление UI
            const previousName = user.name
            setUser(prev => ({ ...prev, name: newName }))
            
            try {
                await updateProfile({ full_name: newName })
            } catch (error) {
                console.error('Failed to update name:', error)
                // Откат при ошибке
                setUser(prev => ({ ...prev, name: previousName }))
            }
        }
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

    const addCollection = async (newCol) => {
        try {
            await onCreateCollection(newCol)
            setIsCreateModalOpen(false)
        } catch (error) {
            console.error('[ProfilePage] Failed to create collection:', error)
            alert('Не удалось создать подборку: ' + (error.message || 'Ошибка API'))
            // Модалка остаётся открытой, пользователь может попробовать снова
        }
    }

    const openCollection = (collection) => {
        setSelectedCollection(collection)
        setIsSingleCollectionOpen(true)
    }

    const deleteCollection = async (collectionId) => {
        if (window.confirm('Удалить эту подборку?')) {
            try {
                await onDeleteCollection(collectionId)
                setUser(prev => ({
                    ...prev,
                    collections: prev.collections.filter(c => c.id !== collectionId)
                }))
                setIsSingleCollectionOpen(false)
            } catch (error) {
                console.error('[ProfilePage] Failed to delete collection:', error)
            }
        }
    }

    const removeFilmFromCollection = async (collectionId, movieId) => {
        try {
            await onRemoveMovieFromCollection(collectionId, movieId)
            setUser(prev => ({
                ...prev,
                collections: prev.collections.map(c => {
                    if (c.id === collectionId) {
                        const newMovieIds = (c.movieIds || []).filter(id => id !== movieId)
                        return {
                            ...c,
                            movieIds: newMovieIds,
                            films: Math.max(0, (c.films || 0) - 1)
                        }
                    }
                    return c
                })
            }))
        } catch (error) {
            console.error('[ProfilePage] Failed to remove film from collection:', error)
        }
    }

    const editCollection = (collection) => {
        // Устанавливаем данные и режим редактирования
        setSelectedCollection(collection)
        setStartInEditMode(true)
        // Открываем модалку в следующем тике event loop
        setTimeout(() => {
            setIsSingleCollectionOpen(true)
        }, 0)
    }

    const closeSingleCollectionModal = () => {
        setIsSingleCollectionOpen(false)
        setStartInEditMode(false)
        setSelectedCollection(null)
    }

    const handleStartInEditModeApplied = () => {
        setStartInEditMode(false)
    }

    // 🔥 Обновление подборки
    const updateCollection = async (collectionId, updates) => {
        try {
            await onUpdateCollection(collectionId, updates)
            // Состояние обновится в App.jsx
        } catch (error) {
            console.error('[ProfilePage] Failed to update collection:', error)
            throw error
        }
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

    // 📅 Дней с нами
    const calculateDaysWithUs = () => {
        if (!user.createdAt) return 0
        const registrationDate = new Date(user.createdAt)
        const now = new Date()
        const diffTime = Math.abs(now - registrationDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }
    const daysWithUs = calculateDaysWithUs()
    
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
            <div key={`${item.object_type}-${item.object_id}`} className="favorite-item-card clickable" onClick={handleClick}>
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
                <div className="banner-actions">
                    <button className="banner-edit-btn" onClick={() => bannerInputRef.current.click()} disabled={isUploadingBanner}>
                        {isUploadingBanner ? 'Загрузка...' : <><Image size={16} /> Изменить фон</>}
                    </button>
                    {user.banner && (
                        <button className="banner-delete-btn" onClick={handleDeleteBanner} disabled={isUploadingBanner}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="profile-container">
                {/* Шапка */}
                <div className="profile-header">
                    <div className="avatar-section">
                        <div className="profile-avatar" onClick={() => !isUploadingAvatar && avatarInputRef.current.click()} style={{ opacity: isUploadingAvatar ? 0.6 : 1 }}>
                            {isUploadingAvatar ? (
                                <div className="avatar-loading">
                                    <div className="spinner" />
                                </div>
                            ) : user.avatar ? (
                                <img src={user.avatar} alt="avatar" />
                            ) : (
                                <User size={36} />
                            )}
                        </div>
                        {user.avatar && (
                            <button className="avatar-delete-btn" onClick={handleDeleteAvatar} disabled={isUploadingAvatar}>
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button className="avatar-edit-btn" onClick={() => !isUploadingAvatar && avatarInputRef.current.click()} disabled={isUploadingAvatar}>
                            {isUploadingAvatar ? <div className="spinner-small" /> : <Camera size={16} />}
                        </button>
                    </div>

                    <div className="profile-main-info">
                        <div className="name-row">
                            {isEditingName ? (
                                <div className="profile-name-edit">
                                    <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="name-input" autoFocus onBlur={saveName} onKeyDown={(e) => e.key === 'Enter' && saveName()} maxLength={30} />
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
                    <div className="stat-card">
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
                        <div className="stat-icon green"><Calendar size={20} /></div>
                        <div className="stat-value">{daysWithUs}</div>
                        <div className="stat-label">Дней с нами</div>
                    </div>
                </div>

                {/* Сетка */}
                <div className="profile-grid">
                    <div className="profile-sidebar">
                        {/* Ошибка загрузки */}
                        {uploadError && (
                            <div className="upload-error-card">
                                <span>{uploadError}</span>
                                <button onClick={() => setUploadError(null)}><X size={16} /></button>
                            </div>
                        )}

                        {/* Жанровые предпочтения */}
                        <div className="sidebar-card">
                            <h3 className="sidebar-title"><Popcorn size={18} /> Жанровые предпочтения</h3>
                            <p className="sidebar-hint">
                                {genrePreferences.length > 0 
                                    ? `Выбрано жанров: ${genrePreferences.length}`
                                    : 'Нажмите на жанр, чтобы добавить'}
                            </p>
                            <div className="genre-cloud">
                                {allGenres.map(genre => (
                                    <span
                                        key={genre.id}
                                        className={`genre-tag ${genrePreferences.includes(genre.id) ? 'active' : ''}`}
                                        onClick={() => {
                                            if (isLoggedIn) {
                                                handleToggleGenrePreference(genre.id)
                                            } else {
                                                onOpenAuthModal?.()
                                            }
                                        }}
                                    >
                                        {genre.label}
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

                        {collectionsLoading ? (
                            <div className="collections-loading">
                                <div className="spinner" />
                                <p>Загрузка подборок...</p>
                            </div>
                        ) : user.collections.length > 0 ? (
                            <div className="collections-grid">
                                {user.collections.map((col, index) => {
                                    const gradientClass = `gradient-${(index % 5) + 1}`
                                    return (
                                        <motion.div
                                            key={col.id}
                                            className={`collection-card clickable ${gradientClass}`}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            onClick={() => openCollection(col)}
                                        >
                                            <div className="collection-overlay"></div>
                                            <div className="collection-content">
                                                <h3>{col.title}</h3>
                                                {col.description && <p>{col.description}</p>}
                                                <div className="collection-footer">
                                                    <span className="film-count"><Film size={14} /> {col.films || 0} фильмов</span>
                                                    <div className="collection-actions" onClick={(e) => e.stopPropagation()}>
                                                        <button title="Редактировать" onClick={() => editCollection(col)}><Pencil size={14} /></button>
                                                        <button title="Удалить" onClick={(e) => { e.stopPropagation(); deleteCollection(col.id); }}><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="empty-collections">
                                <h3>Пока пусто</h3>
                                <p>Создайте первую подборку</p>
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

            <SingleCollectionModal
                isOpen={isSingleCollectionOpen}
                onClose={closeSingleCollectionModal}
                collection={user.collections.find(c => c.id === selectedCollection?.id) || selectedCollection}
                userCollections={user.collections}
                onMovieClick={onMovieClick}
                onDelete={deleteCollection}
                onEdit={editCollection}
                onUpdate={updateCollection}
                onRemoveFilm={removeFilmFromCollection}
                startInEditMode={startInEditMode}
                onStartInEditModeApplied={handleStartInEditModeApplied}
            />
        </div>
    )
}