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
import { getMyCollections, createCollection, updateCollection as apiUpdateCollection, deleteCollection as apiDeleteCollection } from './services/collections'
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
        name: 'Гость',
        avatar: null,
        banner: null,
        genres: ['Драма', 'Фантастика'],
        favoriteMovies: [],
        favoriteActors: [],
        favoriteDirectors: [],
        favorites: [1, 3, 6],
        collections: [
            { id: 1, title: 'Вечерний релакс', description: 'Фильмы для спокойного вечера', films: 2, movieIds: [1, 4], gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
            { id: 2, title: 'Нолан-марафон', description: 'Всё от Кристофера Нолана', films: 3, movieIds: [1, 2, 3], gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' }
        ]
    })

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
                                    ...profileData
                                }))
                            }
                        } catch (err) {
                            console.error('[Auth] Failed to load profile:', err)
                        }
                        return
                    }
                }
                return
            }

            // Токен есть - проверяем его валидность через getMe
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
                        createdAt: userData.created_at
                    }))
                    
                    // Загружаем избранное с бэкенда
                    try {
                        const favoritesData = await getFavorites(1, 100)
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
                                    username: userData.username
                                }))
                            }
                        } catch (retryError) {
                            clearAuthData()
                        }
                    } else {
                        clearAuthData()
                    }
                } else {
                    clearAuthData()
                }
                setIsLoggedIn(false)
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
    const updateCollection = (collectionId, updates) => {
        setUser(prev => ({
            ...prev,
            collections: prev.collections.map(c =>
                c.id === collectionId ? { ...c, ...updates, films: updates.movieIds?.length || c.films } : c
            )
        }))
    }

    // 🗑️ Удаление подборки
    const deleteCollection = (collectionId) => {
        setUser(prev => ({
            ...prev,
            collections: prev.collections.filter(c => c.id !== collectionId)
        }))
    }

    // ➕ Добавить фильм в подборки
    const addMovieToCollections = (collectionIds, movieId) => {
        setUser(prev => ({
            ...prev,
            collections: prev.collections.map(c => {
                if (collectionIds.includes(c.id)) {
                    const movieIds = c.movieIds || []
                    if (!movieIds.includes(movieId)) {
                        return { ...c, movieIds: [...movieIds, movieId], films: (c.films || 0) + 1 }
                    }
                }
                return c
            })
        }))
    }

    // ✨ Создать новую подборку
    const createNewCollection = (newColData) => {
        const newCollection = {
            id: Date.now(),
            title: newColData.title,
            description: newColData.description,
            gradient: newColData.gradient,
            movieIds: newColData.movieIds || [],
            films: newColData.movieIds?.length || 0
        }
        setUser(prev => ({ ...prev, collections: [...prev.collections, newCollection] }))
        return newCollection
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
                createNewCollection={createNewCollection}
                selectedActorId={selectedActorId}
                setSelectedActorId={setSelectedActorId}
                isActorCardOpen={isActorCardOpen}
                setIsActorCardOpen={setIsActorCardOpen}
                selectedDirectorId={selectedDirectorId}
                isDirectorCardOpen={isDirectorCardOpen}
                setIsDirectorCardOpen={setIsDirectorCardOpen}
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
    createNewCollection,
    selectedActorId,
    setSelectedActorId,
    isActorCardOpen,
    setIsActorCardOpen,
    selectedDirectorId,
    isDirectorCardOpen,
    setIsDirectorCardOpen
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
                            onMovieClick={handleOpenMovieModal}
                            onActorClick={handleOpenActorCard}
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
