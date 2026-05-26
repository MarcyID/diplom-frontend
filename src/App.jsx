import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import { isAuthenticated, getUser, getMe, clearAuthData } from './services/auth'

// === ПРОСТОЙ КОМПОНЕНТ ГЛАВНОЙ ===
function Home({ onMovieClick, onOpenFeatureModal }) {
    return (
        <>
            <Hero onOpenModal={onOpenFeatureModal} />
            <MovieCarousel
                onMovieClick={onMovieClick}
                favoriteMovies={[]}
                onToggleFavorite={() => {}}
            />
        </>
    )
}

// === ГЛАВНОЕ ПРИЛОЖЕНИЕ ===
function App() {
    // 🔐 Состояние авторизации
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    // 🎬 Состояние модалки фильма
    const [selectedFilmId, setSelectedFilmId] = useState(null)
    const [isMovieModalOpen, setIsMovieModalOpen] = useState(false)

    // 🎯 Состояние фич-модалок
    const [featureModalType, setFeatureModalType] = useState(null)
    const [isSelectionOpen, setIsSelectionOpen] = useState(false)
    const [isRandomOpen, setIsRandomOpen] = useState(false)
    const [isActorOpen, setIsActorOpen] = useState(false)
    const [isDirectorOpen, setIsDirectorOpen] = useState(false)
    const [isUpcomingOpen, setIsUpcomingOpen] = useState(false)

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
            if (isAuthenticated()) {
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
                } catch (error) {
                    console.error('Auth check failed:', error)
                    clearAuthData()
                    setIsLoggedIn(false)
                }
            }
        }
        checkAuth()
    }, [])

    // 🔓 Открыть модалку фильма
    const handleOpenMovieModal = useCallback((film) => {
        const newFilmId = film.kinopoiskId || film.id
        // Если кликнули на тот же фильм - ничего не делаем
        if (newFilmId === selectedFilmId && isMovieModalOpen) return

        // Сначала закрываем текущую модалку, затем открываем новую
        setIsMovieModalOpen(false)
        setSelectedFilmId(null)

        setTimeout(() => {
            setSelectedFilmId(newFilmId)
            setIsMovieModalOpen(true)
        }, 100)
    }, [selectedFilmId, isMovieModalOpen])

    // 🎭 Открыть карточку актёра
    const handleOpenActorCard = (actorId) => {
        setSelectedActorId(actorId)
        setIsActorCardOpen(true)
    }

    // 🎬 Открыть карточку режиссёра
    const handleOpenDirectorCard = (directorId) => {
        setSelectedDirectorId(directorId)
        setIsDirectorCardOpen(true)
    }

    // 🎪 Открыть фич-модалку по типу
    const handleOpenFeatureModal = (type) => {
        if (type === 'selection') setIsSelectionOpen(true)
        else if (type === 'random') setIsRandomOpen(true)
        else if (type === 'actor') setIsActorOpen(true)
        else if (type === 'director') setIsDirectorOpen(true)
        else if (type === 'upcoming') setIsUpcomingOpen(true)
        else if (type === 'playlist') setFeatureModalType('playlist')
    }

    // 👤 Клик по профилю — проверяем авторизацию
    const handleProfileClick = () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true)
        }
        // Если авторизован — переход идёт через Link в Header
    }

    // ❤️ Переключатель избранного для фильмов
    const toggleFavoriteMovie = (movieId) => {
        setUser(prev => {
            const list = prev.favoriteMovies || []
            const updated = list.includes(movieId)
                ? list.filter(id => id !== movieId)
                : [...list, movieId]
            return { ...prev, favoriteMovies: updated }
        })
    }

    // ❤️ Переключатель избранного для актёров
    const toggleFavoriteActor = (actorId) => {
        setUser(prev => {
            const list = prev.favoriteActors || []
            const updated = list.includes(actorId)
                ? list.filter(id => id !== actorId)
                : [...list, actorId]
            return { ...prev, favoriteActors: updated }
        })
    }

    // ❤️ Переключатель избранного для режиссёров
    const toggleFavoriteDirector = (directorId) => {
        setUser(prev => {
            const list = prev.favoriteDirectors || []
            const updated = list.includes(directorId)
                ? list.filter(id => id !== directorId)
                : [...list, directorId]
            return { ...prev, favoriteDirectors: updated }
        })
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
                            onDirectorClick={handleOpenDirectorCard}
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

                <FeatureModal type={featureModalType} isOpen={!!featureModalType} onClose={() => setFeatureModalType(null)} />

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
                    onClose={() => setIsAuthModalOpen(false)}
                    setIsLoggedIn={setIsLoggedIn}
                    setUser={setUser}
                />
            </div>
        </Router>
    )
}

export default App