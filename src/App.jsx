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
import AuthModal from './components/AuthModal'
import ProfilePage from './components/ProfilePage'

// === ДАННЫЕ ===
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

// === ПРОСТОЙ КОМПОНЕНТ ГЛАВНОЙ (только отображение) ===
function Home({ onMovieClick, onOpenFeatureModal }) {
    return (
        <>
            <Hero onOpenModal={onOpenFeatureModal} />
            <MovieCarousel movies={moviesData} onMovieClick={onMovieClick} />
        </>
    )
}

const Catalog = () => <h2>Страница Каталога (в разработке)</h2>
const SelectionPage = () => <h2>Страница Подбора (в разработке)</h2>

// === ГЛАВНОЕ ПРИЛОЖЕНИЕ (здесь живёт всё состояние) ===
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
    const [selectedDirectorId, setSelectedDirectorId] = useState(null)
    const [isDirectorCardOpen, setIsDirectorCardOpen] = useState(false)

    // 🎭 Состояние карточки актёра
    const [selectedActorId, setSelectedActorId] = useState(null)
    const [isActorCardOpen, setIsActorCardOpen] = useState(false)

    // 🔓 Открыть модалку фильма
    const handleOpenMovieModal = (movie) => {
        setSelectedMovie(movie)
        setIsMovieModalOpen(true)
    }
    const handleOpenDirectorCard = (directorId) => {
        setSelectedDirectorId(directorId)
        setIsDirectorCardOpen(true)
    }

    // 🎭 Открыть карточку актёра ← ЭТОЙ ФУНКЦИИ НЕ ХВАТАЛО!
    const handleOpenActorCard = (actorId) => {
        setSelectedActorId(actorId)
        setIsActorCardOpen(true)
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
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState({
        name: 'Гость',
        avatar: null,
        banner: null,
        genres: ['Драма', 'Фантастика'],
        favorites: [1, 3, 6],
        collections: [
            {
                id: 1,
                title: 'Вечерний релакс',
                description: 'Фильмы для спокойного вечера с чашкой чая и пледом',
                films: 2,
                movieIds: [1, 4], // Начало, 1+1
                gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
            },
            {
                id: 2,
                title: 'Нолан-марафон',
                description: 'Все фильмы Кристофера Нолана в хронологическом порядке',
                films: 3,
                movieIds: [1, 2, 3], // Начало, Интерстеллар, Тёмный рыцарь
                gradient: 'linear-gradient(135deg, #f093fb, #f5576c)'
            }
        ]
    })

    return (
        <Router>
            <div className="app">
                {/* Фоновые эффекты */}
                <div className="background-effects">
                    <div className="glow-left"></div>
                    <div className="glow-right"></div>
                </div>

                {/* Шапка с поиском */}
                <Header
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    onActorClick={handleOpenActorCard} // ← Теперь функция существует!
                    onDirectorClick={handleOpenDirectorCard} // ← ДОБАВЬ
                />

                <Routes>
                    <Route path="/" element={
                        <Home
                            onMovieClick={handleOpenMovieModal}
                            onOpenFeatureModal={handleOpenFeatureModal}
                        />
                    } />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/selection" element={<SelectionPage />} />
                    <Route path="/auth" element={
                        <AuthModal
                            setIsLoggedIn={setIsLoggedIn}
                            setUser={setUser}  // ← Передаем функцию обновления пользователя
                        />
                    } />
                    <Route path="/" element={
                        isLoggedIn ? (
                            <Home onMovieClick={handleOpenMovieModal} onOpenFeatureModal={handleOpenFeatureModal} />
                        ) : (
                            <Navigate to="/auth" replace />
                        )
                    } />
                    <Route path="/auth" element={<AuthModal setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/profile" element={
                        <ProfilePage
                            user={user}
                            setUser={setUser}
                            allMovies={moviesData}
                            onMovieClick={handleOpenMovieModal}
                        />
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
                />

                <FeatureModal type={featureModalType} isOpen={!!featureModalType} onClose={() => setFeatureModalType(null)} />
                <SelectionModal isOpen={isSelectionOpen} onClose={() => setIsSelectionOpen(false)} allMovies={moviesData} onMovieClick={handleOpenMovieModal} />
                <RandomMovieModal isOpen={isRandomOpen} onClose={() => setIsRandomOpen(false)} allMovies={moviesData} onMovieClick={handleOpenMovieModal} />
                <ActorSearchModal
                    isOpen={isActorOpen}
                    onClose={() => setIsActorOpen(false)}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    onActorClick={handleOpenActorCard} // ← ДОБАВЬ ЭТУ СТРОКУ
                />

                <DirectorSearchModal
                    isOpen={isDirectorOpen}
                    onClose={() => setIsDirectorOpen(false)}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                    onDirectorClick={handleOpenDirectorCard} // ← ДОБАВЬ
                />
                <UpcomingModal isOpen={isUpcomingOpen} onClose={() => setIsUpcomingOpen(false)} allMovies={moviesData} onMovieClick={handleOpenMovieModal} />

                {/* Карточка актёра */}
                <ActorCardModal
                    isOpen={isActorCardOpen}
                    onClose={() => setIsActorCardOpen(false)}
                    actorId={selectedActorId}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                />

                <DirectorCardModal
                    isOpen={isDirectorCardOpen}
                    onClose={() => setIsDirectorCardOpen(false)}
                    directorId={selectedDirectorId}
                    allMovies={moviesData}
                    onMovieClick={handleOpenMovieModal}
                />

            </div>
        </Router>

    )
}

export default App