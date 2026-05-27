import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import MovieCarousel from './components/MovieCarousel'
import MovieModal from './components/MovieModal'
import FeatureModal from './components/FeatureModal'
import './App.css'
import SelectionModal from './components/SelectionModal'
import RandomMovieModal from './components/RandomMovieModal'
import UpcomingModal from './components/UpcomingModal'
import ActorSearchModal from './components/ActorSearchModal'
import DirectorSearchModal from './components/DirectorSearchModal'
import ActorCardModal from './components/ActorCardModal'
import ProfilePage from './components/ProfilePage'
import AuthModal from './components/AuthModal'
import { isAuthenticated, getUser, getMe, clearAuthData, ensureValidToken } from './services/auth'
import { getProfile, updateProfile } from './services/profile'
import { getMyCollections, createCollection, updateCollection as apiUpdateCollection, deleteCollection as apiDeleteCollection, addFilmToCollection, removeFilmFromCollection, getCollection } from './services/collections'
import { getFavorites, toggleFilm, togglePerson } from './services/favorites'

// Ключ для localStorage избранного
const FAVORITES_KEY = 'favorites_cache'

// === ПРОСТОЙ КОМПОНЕНТ ГЛАВНОЙ ===
function Home({ onMovieClick, onOpenFeatureModal }) {
    return (
        <>
            <Hero onOpenModal={onOpenFeatureModal} />
            <MovieCarousel title="🔥 Популярное сейчас" onMovieClick={onMovieClick} />
        </>
    )
}

// === ГЛАВНОЕ ПРИЛОЖЕНИЕ ===
function App() {
    // 🔐 Состояние авторизации
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // 🎬 Состояние модалки фильма
    const [selectedFilmId, setSelectedFilmId] = useState(null)
    const [isMovieModalOpen, setIsMovieModalOpen] = useState(false)

    // 🎭 Состояние карточек актёров/режиссёров
    const [selectedActorId, setSelectedActorId] = useState(null)
    const [isActorCardOpen, setIsActorCardOpen] = useState(false)
    const [selectedDirectorId, setSelectedDirectorId] = useState(null)
    const [isDirectorCardOpen, setIsDirectorCardOpen] = useState(false)

    // 👤 Профиль пользователя
    const [user, setUser] = useState({
        name: '',
        avatar: null,
        banner: null,
        genres: [],
        favoriteMovies: [],
        favoriteActors: [],
        favoriteDirectors: [],
        favorites: [],
        collections: []
    })
    const [collectionsLoading, setCollectionsLoading] = useState(isAuthenticated() !== null)

    // 🔐 Проверка авторизации при загрузке
    useEffect(() => {
        const checkAuth = async () => {
            const token = isAuthenticated()

            // Пробуем загрузить избранное из localStorage (для всех)
            const cached = localStorage.getItem(FAVORITES_KEY)
            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    setUser(prev => ({
                        ...prev,
                        favoriteMovies: parsed.favoriteMovies || [],
                        favoriteActors: parsed.favoriteActors || [],
                        favoriteDirectors: parsed.favoriteDirectors || []
                    }))
                } catch (e) {
                    console.error('[Auth] Failed to parse cached favorites:', e)
                }
            }

            if (!token) {
                // Нет токена - проверяем, есть ли сохранённый пользователь
                const savedUser = getUser()
                if (savedUser) {
                    // Пользователь был сохранён, но токена нет - возможно истёк
                    // Пробуем обновить токен
                    const newToken = await ensureValidToken()
                    if (newToken) {
                        setIsLoggedIn(true)
                        // Загружаем актуальные данные профиля
                        try {
                            const profileData = await getProfile()
                            if (profileData) {
                                setUser(prev => ({
                                    ...prev,
                                    ...profileData,
                                    avatar: profileData.avatar_url,
                                    banner: profileData.banner_url
                                }))
                            }

                            // Загружаем подборки
                            setCollectionsLoading(true)
                            try {
                                const collectionsData = await getMyCollections(1, 100)
                                const items = collectionsData.items || []
                                const collections = items.map(col => ({
                                    id: col.id,
                                    title: col.title,
                                    description: col.description || '',
                                    is_public: col.is_public,
                                    movieIds: [],
                                    films: col.films_count || 0,
                                    created_at: col.created_at,
                                    updated_at: col.updated_at
                                }))
                                setUser(prev => ({ ...prev, collections }))
                            } catch (err) {
                                console.error('[Auth] Failed to load collections:', err)
                            } finally {
                                setCollectionsLoading(false)
                            }
                        } catch (err) {
                            console.error('[Auth] Failed to load profile:', err)
                        }
                        return
                    }
                }
                // Если нет сохранённого пользователя или токен не обновился - сбрасываем loading
                setCollectionsLoading(false)
                return
            }

            // Токен есть - проверяем его валидность через getMe
            try {
                const userData = await getMe()
                if (userData) {
                    setIsLoggedIn(true)
                    // Начинаем загрузку подборок
                    setCollectionsLoading(true)
                    setUser(prev => ({
                        ...prev,
                        id: userData.id,
                        name: userData.full_name || userData.username,
                        email: userData.email,
                        username: userData.username,
                        createdAt: userData.created_at,
                        avatar: userData.avatar_url,
                        banner: userData.banner_url
                    }))

                    // Загружаем избранное с бэкенда (ВРЕМЕННО ОТКЛЮЧЕНО - бэкенд не отвечает)
                    /*
                    try {
                        const favoritesData = await getFavorites(1, 20)
                        const items = favoritesData.items || []

                        // Разделяем на фильмы и персоны
                        const favoriteMovies = []
                        const favoritePeople = []

                        items.forEach(item => {
                            if (item.object_type === 'film') {
                                // Бэкенд возвращает object_id и film_data.kinopoiskId
                                const filmId = item.film_data?.kinopoiskId || item.object_id
                                if (filmId) {
                                    favoriteMovies.push(Number(filmId))
                                }
                            } else if (item.object_type === 'person') {
                                const personId = item.object_id || item.person_data?.kinopoiskId
                                if (personId) {
                                    favoritePeople.push(Number(personId))
                                }
                            }
                        })

                        setUser(prev => ({
                            ...prev,
                            favoriteMovies,
                            favoriteActors: favoritePeople,
                            favoriteDirectors: []
                        }))

                        // Сохраняем в localStorage для быстрого доступа
                        localStorage.setItem(FAVORITES_KEY, JSON.stringify({
                            favoriteMovies,
                            favoriteActors: favoritePeople,
                            favoriteDirectors: []
                        }))
                    } catch (favError) {
                        console.error('[Auth] Failed to load favorites:', favError)
                    }
                    */

                    // Загружаем подборки с бэкенда
                    try {
                        const collectionsData = await getMyCollections(1, 100)
                        const items = collectionsData.items || []

                        // Загружаем фильмы для каждой подборки
                        const collections = await Promise.all(items.map(async (col) => {
                            const collectionDetail = await getCollection(col.id)
                            return {
                                id: col.id,
                                title: col.title,
                                description: col.description || '',
                                is_public: col.is_public,
                                movieIds: collectionDetail?.films?.map(f => f.film_id) || [],
                                films: collectionDetail?.films?.length || col.films_count || 0,
                                created_at: col.created_at,
                                updated_at: col.updated_at
                            }
                        }))

                        setUser(prev => ({
                            ...prev,
                            collections
                        }))
                    } catch (colError) {
                        console.error('[Auth] Failed to load collections:', colError)
                    } finally {
                        setCollectionsLoading(false)
                    }
                } else {
                    setCollectionsLoading(false)
                }
            } catch (error) {
                // Если ошибка 401 или "Необходима авторизация", пробуем обновить токен
                const isAuthError = error.message?.includes('401') || error.message?.includes('Необходима авторизация')
                if (isAuthError) {
                    const newToken = await ensureValidToken()
                    if (newToken) {
                        // Токен обновлён, пробуем ещё раз получить пользователя
                        try {
                            const userData = await getMe()
                            if (userData) {
                                setIsLoggedIn(true)
                                setUser(prev => ({
                                    ...prev,
                                    id: userData.id,
                                    name: userData.full_name || userData.username,
                                    email: userData.email,
                                    username: userData.username,
                                    avatar: userData.avatar_url,
                                    banner: userData.banner_url,
                                    createdAt: userData.created_at
                                }))

                                // Загружаем подборки
                                setCollectionsLoading(true)
                                try {
                                    const collectionsData = await getMyCollections(100, 0)
                                    const items = collectionsData.collections || []
                                    const collections = items.map(col => ({
                                        id: col.id,
                                        title: col.title,
                                        description: col.description || '',
                                        is_public: col.is_public,
                                        movieIds: [],
                                        films: col.films_count || 0,
                                        created_at: col.created_at,
                                        updated_at: col.updated_at
                                    }))
                                    setUser(prev => ({ ...prev, collections }))
                                } catch (err) {
                                    console.error('[Auth] Failed to load collections:', err)
                                } finally {
                                    setCollectionsLoading(false)
                                }
                            }
                        } catch (retryError) {
                            clearAuthData()
                            // Открываем окно входа
                            setIsAuthModalOpen(true)
                        }
                    } else {
                        clearAuthData()
                        // Открываем окно входа
                        setIsAuthModalOpen(true)
                    }
                } else {
                    clearAuthData()
                    // Открываем окно входа
                    setIsAuthModalOpen(true)
                }
                setIsLoggedIn(false)
                setCollectionsLoading(false)
            }
        }
        checkAuth()
    }, [])

    // 🔓 Открыть модалку фильма
    const handleOpenMovieModal = (movie) => {
        if (movie?.kinopoiskId || movie?.id) {
            setSelectedFilmId(movie.kinopoiskId || movie.id)
            setIsMovieModalOpen(true)
        }
    }

    // 🎭 Открыть карточку актёра
    const handleOpenActorCard = (actorId) => {
        if (actorId) {
            setSelectedActorId(actorId)
            setIsActorCardOpen(true)
        }
    }

    // 🎬 Открыть карточку режиссёра
    const handleOpenDirectorCard = (directorId) => {
        if (directorId) {
            setSelectedDirectorId(directorId)
            setIsDirectorCardOpen(true)
        }
    }

    // ❤️ Переключатель избранного для фильмов
    const toggleFavoriteMovie = async (movieId) => {
        const numericId = Number(movieId)
        
        if (!isLoggedIn) {
            // Если не авторизован - просто обновляем локально (как было)
            setUser(prev => {
                const list = prev.favoriteMovies || []
                const updated = list.includes(numericId)
                    ? list.filter(id => id !== numericId)
                    : [...list, numericId]
                return { ...prev, favoriteMovies: updated }
            })
            return
        }

        // Оптимистичное обновление UI
        let previousState
        setUser(prev => {
            const list = prev.favoriteMovies || []
            previousState = list
            const updated = list.includes(numericId)
                ? list.filter(id => id !== numericId)
                : [...list, numericId]
            
            // Сохраняем в localStorage сразу
            const newFavorites = {
                ...JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}'),
                favoriteMovies: updated
            }
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
            
            return { ...prev, favoriteMovies: updated }
        })

        try {
            const result = await toggleFilm(numericId)
            // Если API вернул неожиданный результат - синхронизируем
            if (result.added !== !previousState.includes(numericId)) {
                setUser(prev => {
                    const list = prev.favoriteMovies || []
                    const updated = result.added
                        ? [...list, numericId]
                        : list.filter(id => id !== numericId)
                    return { ...prev, favoriteMovies: updated }
                })
            }
        } catch (error) {
            console.error('Failed to toggle movie favorite:', error)
            // Откат при ошибке
            setUser(prev => ({
                ...prev,
                favoriteMovies: previousState
            }))
        }
    }

    // ❤️ Переключатель избранного для актёров
    const toggleFavoriteActor = async (actorId) => {
        const numericId = Number(actorId)
        
        if (!isLoggedIn) {
            setUser(prev => {
                const list = prev.favoriteActors || []
                const updated = list.includes(numericId)
                    ? list.filter(id => id !== numericId)
                    : [...list, numericId]
                return { ...prev, favoriteActors: updated }
            })
            return
        }

        // Оптимистичное обновление UI
        let previousState
        setUser(prev => {
            const list = prev.favoriteActors || []
            previousState = list
            const updated = list.includes(numericId)
                ? list.filter(id => id !== numericId)
                : [...list, numericId]

            // Сохраняем в localStorage сразу
            const newFavorites = {
                ...JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}'),
                favoriteActors: updated
            }
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))

            return { ...prev, favoriteActors: updated }
        })

        try {
            const result = await togglePerson(numericId)
            if (result.added !== !previousState.includes(numericId)) {
                setUser(prev => {
                    const list = prev.favoriteActors || []
                    const updated = result.added
                        ? [...list, numericId]
                        : list.filter(id => id !== numericId)
                    return { ...prev, favoriteActors: updated }
                })
            }
        } catch (error) {
            console.error('Failed to toggle actor favorite:', error)
            setUser(prev => ({
                ...prev,
                favoriteActors: previousState
            }))
        }
    }

    // ❤️ Переключатель избранного для режиссёров
    const toggleFavoriteDirector = async (directorId) => {
        const numericId = Number(directorId)
        
        if (!isLoggedIn) {
            setUser(prev => {
                const list = prev.favoriteDirectors || []
                const updated = list.includes(numericId)
                    ? list.filter(id => id !== numericId)
                    : [...list, numericId]
                return { ...prev, favoriteDirectors: updated }
            })
            return
        }

        // Оптимистичное обновление UI
        let previousState
        setUser(prev => {
            const list = prev.favoriteDirectors || []
            previousState = list
            const updated = list.includes(numericId)
                ? list.filter(id => id !== numericId)
                : [...list, numericId]

            // Сохраняем в localStorage сразу
            const newFavorites = {
                ...JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}'),
                favoriteDirectors: updated
            }
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))

            return { ...prev, favoriteDirectors: updated }
        })

        try {
            const result = await togglePerson(numericId)
            if (result.added !== !previousState.includes(numericId)) {
                setUser(prev => {
                    const list = prev.favoriteDirectors || []
                    const updated = result.added
                        ? [...list, numericId]
                        : list.filter(id => id !== numericId)
                    return { ...prev, favoriteDirectors: updated }
                })
            }
        } catch (error) {
            console.error('Failed to toggle director favorite:', error)
            setUser(prev => ({
                ...prev,
                favoriteDirectors: previousState
            }))
        }
    }

    // ✏️ Обновление подборки
    const updateCollection = async (collectionId, updates) => {
        try {
            const updated = await apiUpdateCollection(collectionId, updates)

            if (updated) {
                setUser(prev => ({
                    ...prev,
                    collections: prev.collections.map(c =>
                        c.id === collectionId ? {
                            ...c,
                            title: updated.title || c.title,
                            description: updated.description !== undefined ? updated.description : c.description,
                            is_public: updated.is_public !== undefined ? updated.is_public : c.is_public,
                            films: updated.films_count ?? c.films,
                            updated_at: updated.updated_at
                        } : c
                    )
                }))
            }
        } catch (error) {
            console.error('[App] Failed to update collection:', error)
            throw error
        }
    }

    // 🗑️ Удаление подборки
    const deleteCollection = async (collectionId) => {
        try {
            await apiDeleteCollection(collectionId)
            setUser(prev => ({
                ...prev,
                collections: prev.collections.filter(c => c.id !== collectionId)
            }))
        } catch (error) {
            console.error('[App] Failed to delete collection:', error)
            throw error
        }
    }

    // ➕ Добавить фильм в подборки
    const addMovieToCollections = async (collectionIds, movieId) => {
        for (const collectionId of collectionIds) {
            try {
                await addFilmToCollection(collectionId, movieId)
                setUser(prev => ({
                    ...prev,
                    collections: prev.collections.map(c => {
                        if (c.id === collectionId) {
                            const movieIds = c.movieIds || []
                            if (!movieIds.includes(movieId)) {
                                return { ...c, movieIds: [...movieIds, movieId], films: (c.films || 0) + 1 }
                            }
                        }
                        return c
                    })
                }))
            } catch (error) {
                console.error('[App] Failed to add film to collection:', error)
            }
        }
    }

    // ➖ Удалить фильм из подборки
    const removeMovieFromCollection = async (collectionId, movieId) => {
        try {
            await removeFilmFromCollection(collectionId, movieId)
            setUser(prev => ({
                ...prev,
                collections: prev.collections.map(c => {
                    if (c.id === collectionId) {
                        const movieIds = c.movieIds || []
                        return {
                            ...c,
                            movieIds: movieIds.filter(id => id !== movieId),
                            films: Math.max(0, (c.films || 0) - 1)
                        }
                    }
                    return c
                })
            }))
        } catch (error) {
            console.error('[App] Failed to remove film from collection:', error)
            throw error
        }
    }

    // ✨ Создать новую подборку
    const createNewCollection = async (newColData) => {
        try {
            const newCollection = await createCollection({
                title: newColData.title,
                description: newColData.description?.trim() || null,
                is_public: newColData.is_public !== false
            })

            if (newCollection) {
                // Если указаны фильмы для добавления
                if (newColData.filmIds && newColData.filmIds.length > 0) {
                    for (const filmId of newColData.filmIds) {
                        await addFilmToCollection(newCollection.id, filmId)
                    }
                }

                // Преобразуем в формат фронтенда
                const frontendCollection = {
                    id: newCollection.id,
                    title: newCollection.title,
                    description: newCollection.description || '',
                    is_public: newCollection.is_public,
                    movieIds: newColData.filmIds || [],
                    films: newColData.filmIds?.length || 0,
                    created_at: newCollection.created_at,
                    updated_at: newCollection.updated_at
                }

                setUser(prev => ({ ...prev, collections: [...prev.collections, frontendCollection] }))
                return frontendCollection
            }
        } catch (error) {
            console.error('[App] Failed to create collection:', error)
            throw error
        }
    }

    return (
        <Router>
            <AppContent
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                user={user}
                setUser={setUser}
                selectedFilmId={selectedFilmId}
                setSelectedFilmId={setSelectedFilmId}
                isMovieModalOpen={isMovieModalOpen}
                setIsMovieModalOpen={setIsMovieModalOpen}
                handleOpenMovieModal={handleOpenMovieModal}
                handleOpenActorCard={handleOpenActorCard}
                handleOpenDirectorCard={handleOpenDirectorCard}
                toggleFavoriteMovie={toggleFavoriteMovie}
                toggleFavoriteActor={toggleFavoriteActor}
                toggleFavoriteDirector={toggleFavoriteDirector}
                updateCollection={updateCollection}
                deleteCollection={deleteCollection}
                addMovieToCollections={addMovieToCollections}
                removeMovieFromCollection={removeMovieFromCollection}
                createNewCollection={createNewCollection}
                selectedActorId={selectedActorId}
                setSelectedActorId={setSelectedActorId}
                isActorCardOpen={isActorCardOpen}
                setIsActorCardOpen={setIsActorCardOpen}
                selectedDirectorId={selectedDirectorId}
                isDirectorCardOpen={isDirectorCardOpen}
                setIsDirectorCardOpen={setIsDirectorCardOpen}
                collectionsLoading={collectionsLoading}
                setCollectionsLoading={setCollectionsLoading}
            />
        </Router>
    )
}

// Компонент внутри Router контекста
function AppContent({
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    selectedFilmId,
    setSelectedFilmId,
    isMovieModalOpen,
    setIsMovieModalOpen,
    handleOpenMovieModal,
    handleOpenActorCard,
    handleOpenDirectorCard,
    toggleFavoriteMovie,
    toggleFavoriteActor,
    toggleFavoriteDirector,
    updateCollection,
    deleteCollection,
    addMovieToCollections,
    removeMovieFromCollection,
    createNewCollection,
    selectedActorId,
    setSelectedActorId,
    isActorCardOpen,
    setIsActorCardOpen,
    selectedDirectorId,
    isDirectorCardOpen,
    setIsDirectorCardOpen,
    collectionsLoading,
    setCollectionsLoading
}) {
    const navigate = useNavigate()
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authNavigateTo, setAuthNavigateTo] = useState(null)
    const [featureModalType, setFeatureModalType] = useState(null)
    const [isSelectionOpen, setIsSelectionOpen] = useState(false)
    const [isRandomOpen, setIsRandomOpen] = useState(false)
    const [isActorOpen, setIsActorOpen] = useState(false)
    const [isDirectorOpen, setIsDirectorOpen] = useState(false)
    const [isUpcomingOpen, setIsUpcomingOpen] = useState(false)
    const [pendingCollectionCreate, setPendingCollectionCreate] = useState(false)

    // 🎪 Открыть фич-модалку по типу
    const handleOpenFeatureModal = (type) => {
        if (type === 'selection') setIsSelectionOpen(true)
        else if (type === 'random') setIsRandomOpen(true)
        else if (type === 'actor') setIsActorOpen(true)
        else if (type === 'director') setIsDirectorOpen(true)
        else if (type === 'upcoming') setIsUpcomingOpen(true)
        else if (type === 'playlist') {
            // Показываем FeatureModal для всех (и авторизованных, и нет)
            setFeatureModalType('playlist')
        }
    }

    // 👤 Клик по профилю
    const handleProfileClick = () => {
        if (!isLoggedIn) {
            // Запоминаем, что после логина нужно перейти в профиль
            setPendingCollectionCreate(false) // Сбрасываем флаг подборки если был
            setAuthNavigateTo('/profile')
            setIsAuthModalOpen(true)
        } else {
            navigate('/profile')
        }
    }

    return (
        <div className="app">
            {/* Фоновые эффекты */}
            <div className="background-effects">
                <div className="glow-left"></div>
                <div className="glow-right"></div>
            </div>

            {/* Шапка */}
            <Header
                    onMovieClick={handleOpenMovieModal}
                    onActorClick={handleOpenActorCard}
                    onProfileClick={handleProfileClick}
                    isLoggedIn={isLoggedIn}
                />

                <Routes>
                    <Route path="/" element={
                        <Home
                            onMovieClick={handleOpenMovieModal}
                            onOpenFeatureModal={handleOpenFeatureModal}
                        />
                    } />
                    <Route path="/profile" element={
                        <ProfilePage
                            user={user}
                            setUser={setUser}
                            isLoggedIn={isLoggedIn}
                            collectionsLoading={collectionsLoading}
                            onMovieClick={handleOpenMovieModal}
                            onActorClick={handleOpenActorCard}
                            onOpenAuthModal={() => setIsAuthModalOpen(true)}
                            onCreateCollection={createNewCollection}
                            onUpdateCollection={updateCollection}
                            onDeleteCollection={deleteCollection}
                            onRemoveMovieFromCollection={removeMovieFromCollection}
                        />
                    } />
                </Routes>

                {/* === МОДАЛКИ === */}
                <MovieModal
                    key={selectedFilmId}
                    filmId={selectedFilmId}
                    isOpen={isMovieModalOpen}
                    onClose={() => {
                        setIsMovieModalOpen(false)
                        setSelectedFilmId(null)
                    }}
                    onMovieClick={handleOpenMovieModal}
                    favoriteMovies={user.favoriteMovies}
                    onToggleFavorite={toggleFavoriteMovie}
                    userCollections={user.collections}
                    onAddToCollection={addMovieToCollections}
                    onRemoveFromCollection={removeMovieFromCollection}
                    onCreateCollection={createNewCollection}
                />

                <FeatureModal
                    type={featureModalType}
                    isOpen={!!featureModalType}
                    onClose={() => setFeatureModalType(null)}
                    isLoggedIn={isLoggedIn}
                    onNavigateToProfile={() => {
                        setFeatureModalType(null)
                        if (isLoggedIn) {
                            // Авторизован — сразу в профиль с модалкой создания
                            navigate('/profile', { state: { openCreateCollection: true } })
                        } else {
                            // Не авторизован — запоминаем для создания подборки после логина
                            setPendingCollectionCreate(true)
                            setAuthNavigateTo('/profile')
                            setIsAuthModalOpen(true)
                        }
                    }}
                />

                <SelectionModal
                    isOpen={isSelectionOpen}
                    onClose={() => setIsSelectionOpen(false)}
                    onMovieClick={handleOpenMovieModal}
                />

                <RandomMovieModal
                    isOpen={isRandomOpen}
                    onClose={() => setIsRandomOpen(false)}
                    onMovieClick={handleOpenMovieModal}
                />

                <ActorSearchModal
                    isOpen={isActorOpen}
                    onClose={() => setIsActorOpen(false)}
                    onMovieClick={handleOpenMovieModal}
                    onActorClick={handleOpenActorCard}
                />

                <DirectorSearchModal
                    isOpen={isDirectorOpen}
                    onClose={() => setIsDirectorOpen(false)}
                    onMovieClick={handleOpenMovieModal}
                    onDirectorClick={handleOpenDirectorCard}
                />

                <UpcomingModal
                    isOpen={isUpcomingOpen}
                    onClose={() => setIsUpcomingOpen(false)}
                    onMovieClick={handleOpenMovieModal}
                />

                <ActorCardModal
                    isOpen={isActorCardOpen}
                    onClose={() => setIsActorCardOpen(false)}
                    actorId={selectedActorId}
                    onMovieClick={handleOpenMovieModal}
                    isFavorite={user.favoriteActors?.includes(selectedActorId)}
                    onToggleFavorite={toggleFavoriteActor}
                />

                <ActorCardModal
                    isOpen={isDirectorCardOpen}
                    onClose={() => setIsDirectorCardOpen(false)}
                    actorId={selectedDirectorId}
                    onMovieClick={handleOpenMovieModal}
                    isFavorite={user.favoriteDirectors?.includes(selectedDirectorId)}
                    onToggleFavorite={toggleFavoriteDirector}
                />

                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => {
                        setIsAuthModalOpen(false)
                        setAuthNavigateTo(null)
                    }}
                    setIsLoggedIn={setIsLoggedIn}
                    setUser={setUser}
                    setCollectionsLoading={setCollectionsLoading}
                    navigateTo={authNavigateTo}
                    onAfterLogin={() => {
                        if (pendingCollectionCreate) {
                            setPendingCollectionCreate(false)
                            navigate('/profile', { state: { openCreateCollection: true } })
                            return true // Обработали навигацию
                        }
                        // Если есть navigateTo (например, из профиля), используем его
                        if (authNavigateTo) {
                            return false // Пусть AuthModal сам обработает навигацию
                        }
                        return false
                    }}
                />
            </div>
    )
}

export default App
