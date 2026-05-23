import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import MovieCarousel from './components/MovieCarousel'
import MovieModal from './components/MovieModal'
import FeatureModal from './components/FeatureModal'
import './App.css'
import SelectionModal from './components/SelectionModal'
import RandomMovieModal from './components/RandomMovieModal'
import ActorSearchModal from './components/ActorSearchModal'
import DirectorSearchModal from './components/DirectorSearchModal'
import UpcomingModal from './components/UpcomingModal'
import ActorCardModal from './components/ActorCardModal'
import DirectorCardModal from './components/DirectorCardModal'
import ProfilePage from './components/ProfilePage'
import AuthModal from './components/AuthModal'
import AddToCollectionModal from './components/AddToCollectionModal'

// === БАЗЫ ДАННЫХ (вынесены наверх, чтобы были доступны везде) ===
const actorsDB = [
    { id: 1, name: 'Леонардо ДиКаприо', avatar: '🎭', movies: [1, 2, 7] },
    { id: 2, name: 'Кристиан Бэйл', avatar: '🦇', movies: [3] },
    { id: 3, name: 'Джозеф Гордон-Левитт', avatar: '🎬', movies: [1, 3] },
    { id: 4, name: 'Том Харди', avatar: '🐯', movies: [3, 5] },
    { id: 5, name: 'Мэттью МакКонахи', avatar: '🤠', movies: [2, 5] },
    { id: 6, name: 'Хоакин Феникс', avatar: '🃏', movies: [6] },
    { id: 7, name: 'Тим Роббинс', avatar: '⚖️', movies: [7] },
    { id: 8, name: 'Джон Траволта', avatar: '💃', movies: [8] },
    { id: 9, name: 'Ума Турман', avatar: '⚔️', movies: [8] },
    { id: 10, name: 'Фрэнсис МакДорманд', avatar: '🎭', movies: [5, 7] }
]

const directorsDB = [
    { id: 1, name: 'Кристофер Нолан', avatar: '🎬', movies: [1, 2, 3] },
    { id: 2, name: 'Оливье Накаш', avatar: '🎥', movies: [4] },
    { id: 3, name: 'Питер Фаррелли', avatar: '🎞️', movies: [5] },
    { id: 4, name: 'Тодд Филлипс', avatar: '🎭', movies: [6] },
    { id: 5, name: 'Фрэнк Дарабонт', avatar: '🎬', movies: [7] },
    { id: 6, name: 'Квентин Тарантино', avatar: '🎥', movies: [8] }
]

// === ДАННЫЕ ФИЛЬМОВ ===
const moviesData = [
    { id: 1, title: 'Начало', year: 2010, rating: 8.8, duration: '2ч 28м', genre: 'Фантастика', country: 'США', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', description: 'Кобб — талантливый вор, лучший из лучших в опасном искусстве извлечения: он крадёт ценные секреты из глубин подсознания во время сна.' },
    { id: 2, title: 'Интерстеллар', year: 2014, rating: 8.6, duration: '2ч 49м', genre: 'Фантастика', country: 'США', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', description: 'Когда засуха и пыльные бури приводят человечество к продовольственному кризису, коллектив исследователей и учёных отправляется в путешествие.' },
    { id: 3, title: 'Тёмный рыцарь', year: 2008, rating: 9.0, duration: '2ч 32м', genre: 'Боевик', country: 'США', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', description: 'Бэтмен поднимает ставки в войне с криминалом. С помощью лейтенанта Джима Гордона и прокурора Харви Дента он намерен очистить улицы Готэма.' },
    { id: 4, title: '1+1', year: 2011, rating: 8.5, duration: '1ч 52м', genre: 'Драма', country: 'Франция', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', description: 'Пострадав в результате несчастного случая, богатый аристократ Филипп нанимает в помощники человека, который менее всего подходит для этой работы.' },
    { id: 5, title: 'Зелёная книга', year: 2018, rating: 8.2, duration: '2ч 10м', genre: 'Драма', country: 'США', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', description: 'История о путешествии утончённого афроамериканского пианиста и его водителя-вышибалы из итальянско-американского квартала.' },
    { id: 6, title: 'Джокер', year: 2019, rating: 8.4, duration: '2ч 02м', genre: 'Триллер', country: 'США', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', description: 'Готэм, начало 1980-х годов. Комик Артур Флек следует призванию и мечтает стать стендап-комиками, но его ожидает лишь жестокость мира.' },
    { id: 7, title: 'Побег из Шоушенка', year: 1994, rating: 9.3, duration: '2ч 22м', genre: 'Драма', country: 'США', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', description: 'Бухгалтер Энди Дюфрейн обвинён в убийстве жены и её любовника и осуждён на два пожизненных заключения.' },
    { id: 8, title: 'Криминальное чтиво', year: 1994, rating: 8.9, duration: '2ч 34м', genre: 'Криминал', country: 'США', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', description: 'Два бандита Винсент Вега и Джулс Винфилд ведут философские беседы в перерывах между разборками и решением проблем с должниками.' }
]

// === ПРОСТОЙ КОМПОНЕНТ ГЛАВНОЙ ===
function Home({ onMovieClick, onOpenFeatureModal }) {
    return (
        <>
            <Hero onOpenModal={onOpenFeatureModal} />
            <MovieCarousel
                movies={moviesData}
                onMovieClick={onMovieClick}
                favoriteMovies={[]}
                onToggleFavorite={() => {}}
            />
        </>
    )
}

const Catalog = () => <h2>Страница Каталога (в разработке)</h2>
const SelectionPage = () => <h2>Страница Подбора (в разработке)</h2>

// === ГЛАВНОЕ ПРИЛОЖЕНИЕ ===
function App() {
    // 🎬 Состояние модалки фильма
    const [selectedMovie, setSelectedMovie] = useState(null)
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

    // 👤 Авторизация и профиль
    const [isLoggedIn, setIsLoggedIn] = useState(false)
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

    // 🔓 Открыть модалку фильма
    const handleOpenMovieModal = (movie) => {
        setSelectedMovie(movie)
        setIsMovieModalOpen(true)
    }

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
        else setFeatureModalType(type)
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
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    onActorClick={handleOpenActorCard}
                    onDirectorClick={handleOpenDirectorCard}
                    actorsDB={actorsDB}
                    directorsDB={directorsDB}
                />

                <Routes>
                    <Route path="/" element={
                        isLoggedIn ? (
                            <Home
                                onMovieClick={handleOpenMovieModal}
                                onOpenFeatureModal={handleOpenFeatureModal}
                            />
                        ) : (
                            <Navigate to="/auth" replace />
                        )
                    } />
                    <Route path="/auth" element={
                        <AuthModal setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
                    } />
                    <Route path="/profile" element={
                        isLoggedIn ? (
                            <ProfilePage
                                user={user}
                                setUser={setUser}
                                allMovies={moviesData}
                                onMovieClick={handleOpenMovieModal}
                                onActorClick={handleOpenActorCard}
                                onDirectorClick={handleOpenDirectorCard}
                                actorsDB={actorsDB}
                                directorsDB={directorsDB}
                            />
                        ) : (
                            <Navigate to="/auth" replace />
                        )
                    } />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/selection" element={<SelectionPage />} />
                </Routes>

                {/* === МОДАЛКИ === */}
                <MovieModal
                    movie={selectedMovie}
                    isOpen={isMovieModalOpen}
                    onClose={() => setIsMovieModalOpen(false)}
                    allMovies={moviesData}
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
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    favoriteMovies={user.favoriteMovies}
                    onToggleFavorite={toggleFavoriteMovie}
                />

                <RandomMovieModal
                    isOpen={isRandomOpen}
                    onClose={() => setIsRandomOpen(false)}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    favoriteMovies={user.favoriteMovies}
                    onToggleFavorite={toggleFavoriteMovie}
                />

                <ActorSearchModal
                    isOpen={isActorOpen}
                    onClose={() => setIsActorOpen(false)}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    onActorClick={handleOpenActorCard}
                    favoriteMovies={user.favoriteMovies}
                    onToggleFavorite={toggleFavoriteMovie}
                    actors={actorsDB}
                />

                <DirectorSearchModal
                    isOpen={isDirectorOpen}
                    onClose={() => setIsDirectorOpen(false)}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    onDirectorClick={handleOpenDirectorCard}
                    favoriteMovies={user.favoriteMovies}
                    onToggleFavorite={toggleFavoriteMovie}
                    directors={directorsDB}
                />

                <UpcomingModal
                    isOpen={isUpcomingOpen}
                    onClose={() => setIsUpcomingOpen(false)}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    favoriteMovies={user.favoriteMovies}
                    onToggleFavorite={toggleFavoriteMovie}
                />

                <ActorCardModal
                    isOpen={isActorCardOpen}
                    onClose={() => setIsActorCardOpen(false)}
                    actorId={selectedActorId}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    isFavorite={user.favoriteActors?.includes(selectedActorId)}
                    onToggleFavorite={toggleFavoriteActor}
                />

                <DirectorCardModal
                    isOpen={isDirectorCardOpen}
                    onClose={() => setIsDirectorCardOpen(false)}
                    directorId={selectedDirectorId}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    isFavorite={user.favoriteDirectors?.includes(selectedDirectorId)}
                    onToggleFavorite={toggleFavoriteDirector}
                />
            </div>
        </Router>
    )
}

export default App