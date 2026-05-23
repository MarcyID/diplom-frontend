import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Film, Star, Calendar, MapPin, Ruler, Briefcase } from 'lucide-react'

// 🎬 Расширенная база режиссёров с биографией
const directorsDetails = {
    1: {
        id: 1, name: 'Кристофер Нолан', avatar: '🎬',
        career: ['Режиссер', 'Сценарист', 'Продюсер'],
        height: '1.81 м', birthDate: '30 июля, 1970', zodiac: 'Лев', age: 55,
        birthPlace: 'Лондон, Великобритания',
        genres: ['фантастика', 'боевик', 'триллер', 'драма'],
        filmsCount: 12, filmsPeriod: '1998 — 2026', movies: [1, 2, 3]
    },
    2: {
        id: 2, name: 'Оливье Накаш', avatar: '🎥',
        career: ['Режиссер', 'Сценарист'],
        height: '1.78 м', birthDate: '14 апреля, 1973', zodiac: 'Овен', age: 53,
        birthPlace: 'Версаль, Франция',
        genres: ['драма', 'комедия', 'биография'],
        filmsCount: 8, filmsPeriod: '2005 — 2026', movies: [4]
    },
    3: {
        id: 3, name: 'Питер Фаррелли', avatar: '🎞️',
        career: ['Режиссер', 'Сценарист', 'Продюсер'],
        height: '1.83 м', birthDate: '17 декабря, 1956', zodiac: 'Стрелец', age: 69,
        birthPlace: 'Финиксвилл, Пенсильвания, США',
        genres: ['драма', 'комедия', 'биография'],
        filmsCount: 15, filmsPeriod: '1993 — 2026', movies: [5]
    },
    4: {
        id: 4, name: 'Тодд Филлипс', avatar: '🎭',
        career: ['Режиссер', 'Сценарист', 'Продюсер'],
        height: '1.80 м', birthDate: '20 декабря, 1970', zodiac: 'Стрелец', age: 55,
        birthPlace: 'Бруклин, Нью-Йорк, США',
        genres: ['триллер', 'драма', 'биография', 'криминал'],
        filmsCount: 18, filmsPeriod: '1993 — 2026', movies: [6]
    },
    5: {
        id: 5, name: 'Фрэнк Дарабонт', avatar: '🎬',
        career: ['Режиссер', 'Сценарист', 'Продюсер'],
        height: '1.85 м', birthDate: '28 января, 1959', zodiac: 'Водолей', age: 67,
        birthPlace: 'Монбельяр, Франция',
        genres: ['драма', 'триллер', 'ужасы'],
        filmsCount: 11, filmsPeriod: '1983 — 2026', movies: [7]
    },
    6: {
        id: 6, name: 'Квентин Тарантино', avatar: '🎥',
        career: ['Режиссер', 'Сценарист', 'Актер', 'Продюсер'],
        height: '1.85 м', birthDate: '27 марта, 1963', zodiac: 'Овен', age: 63,
        birthPlace: 'Ноксвилл, Теннесси, США',
        genres: ['криминал', 'драма', 'боевик', 'триллер'],
        filmsCount: 10, filmsPeriod: '1992 — 2026', movies: [8]
    }
}

function DirectorCardModal({ isOpen, onClose, directorId, allMovies, onMovieClick, isFavorite, onToggleFavorite }) {
    const director = directorsDetails[directorId]
    if (!director) return null

    const directorMovies = allMovies.filter(m => director.movies.includes(m.id))

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
                            className="director-card-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Кнопка закрытия (осталась в углу) */}
                            <button className="modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>

                            {/* Профиль режиссёра */}
                            <div className="director-profile-header">
                                <div className="director-avatar-large">
                                    <span className="avatar-emoji">{director.avatar}</span>
                                </div>
                                <h2 className="director-name">{director.name}</h2>
                                <div className="director-career">
                                    {director.career.map((role, i) => (
                                        <span key={i} className="career-tag">{role}</span>
                                    ))}
                                </div>

                                {/* 🔥 КНОПКА "В ИЗБРАННОЕ" (по центру, под тегами) */}
                                <button
                                    className={`favorite-action-btn ${isFavorite ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(director.id); }}
                                >
                                    <Heart size={18} fill={isFavorite ? "#fff" : "none"} />
                                    <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
                                </button>
                            </div>

                            {/* Биография — 4 карточки в ряд */}
                            <div className="director-bio-grid">
                                <div className="bio-card">
                                    <Ruler size={20} className="bio-icon" />
                                    <span className="bio-label">Рост</span>
                                    <span className="bio-value">{director.height}</span>
                                </div>

                                <div className="bio-card">
                                    <Calendar size={20} className="bio-icon" />
                                    <span className="bio-label">Дата рождения</span>
                                    <span className="bio-value">
                                        {director.birthDate} • {director.zodiac}
                                    </span>
                                </div>

                                <div className="bio-card">
                                    <MapPin size={20} className="bio-icon" />
                                    <span className="bio-label">Место рождения</span>
                                    <span className="bio-value">{director.birthPlace}</span>
                                </div>

                                <div className="bio-card">
                                    <Film size={20} className="bio-icon" />
                                    <span className="bio-label">Всего фильмов</span>
                                    <span className="bio-value">{director.filmsCount}, {director.filmsPeriod}</span>
                                </div>

                                {/* Жанры — отдельной строкой */}
                                <div className="bio-card full">
                                    <Briefcase size={20} className="bio-icon" />
                                    <span className="bio-label">Жанры</span>
                                    <div className="bio-genres">
                                        {director.genres.map((genre, i) => (
                                            <span key={i} className="genre-chip-small">{genre}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Фильмография */}
                            <div className="director-filmography-section">
                                <h3 className="filmography-title">
                                    <Film size={20} />
                                    Фильмы
                                </h3>

                                <div className="filmography-grid">
                                    {directorMovies.length > 0 ? directorMovies.map(movie => (
                                        <motion.div
                                            key={movie.id}
                                            className="filmography-card"
                                            style={{ background: movie.gradient }}
                                            whileHover={{ scale: 1.03 }}
                                            onClick={() => { onMovieClick(movie); onClose(); }}
                                        >
                                            <div className="film-card-content">
                                                <h4>{movie.title}</h4>
                                                <div className="film-card-meta">
                                                    <span>{movie.year}</span>
                                                    <span className="rating">
                                                        <Star size={12} fill="#ffd700" color="#ffd700" />
                                                        {movie.rating}
                                                    </span>
                                                </div>
                                                <span className="film-card-genre">{movie.genre}</span>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <p className="no-films">Нет фильмов этого режиссёра в нашей базе</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default DirectorCardModal