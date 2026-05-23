import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Film, Star, Calendar, MapPin, Ruler, Briefcase } from 'lucide-react'

// 🎬 Расширенная база актёров с биографией
const actorsDetails = {
    1: {
        id: 1, name: 'Леонардо ДиКаприо', avatar: '🎭',
        career: ['Актер', 'Продюсер', 'Сценарист'],
        height: '1.83 м', birthDate: '11 ноября, 1974', zodiac: 'Скорпион', age: 51,
        birthPlace: 'Лос-Анджелес, Калифорния, США',
        genres: ['драма', 'документальный', 'триллер', 'биография', 'криминал'],
        filmsCount: 285, filmsPeriod: '1984 — 2026', movies: [1, 2, 7]
    },
    2: {
        id: 2, name: 'Кристиан Бэйл', avatar: '🦇',
        career: ['Актер', 'Продюсер'],
        height: '1.83 м', birthDate: '30 января, 1974', zodiac: 'Водолей', age: 52,
        birthPlace: 'Хаверфордвест, Уэльс, Великобритания',
        genres: ['боевик', 'драма', 'триллер', 'биография'],
        filmsCount: 178, filmsPeriod: '1986 — 2026', movies: [3]
    },
    3: {
        id: 3, name: 'Джозеф Гордон-Левитт', avatar: '🎬',
        career: ['Актер', 'Режиссер', 'Сценарист'],
        height: '1.77 м', birthDate: '17 февраля, 1981', zodiac: 'Водолей', age: 45,
        birthPlace: 'Лос-Анджелес, Калифорния, США',
        genres: ['фантастика', 'драма', 'комедия', 'триллер'],
        filmsCount: 142, filmsPeriod: '1988 — 2026', movies: [1, 3]
    },
    4: {
        id: 4, name: 'Том Харди', avatar: '🐯',
        career: ['Актер', 'Продюсер'],
        height: '1.75 м', birthDate: '15 сентября, 1977', zodiac: 'Дева', age: 48,
        birthPlace: 'Хаммерсмит, Лондон, Великобритания',
        genres: ['боевик', 'триллер', 'драма', 'фантастика'],
        filmsCount: 95, filmsPeriod: '2001 — 2026', movies: [3, 5]
    },
    5: {
        id: 5, name: 'Мэттью МакКонахи', avatar: '🤠',
        career: ['Актер', 'Продюсер'],
        height: '1.83 м', birthDate: '4 ноября, 1969', zodiac: 'Скорпион', age: 56,
        birthPlace: 'Ювалде, Техас, США',
        genres: ['драма', 'комедия', 'триллер', 'фантастика'],
        filmsCount: 156, filmsPeriod: '1991 — 2026', movies: [2, 5]
    },
    6: {
        id: 6, name: 'Хоакин Феникс', avatar: '🃏',
        career: ['Актер', 'Продюсер', 'Саундтреки'],
        height: '1.73 м', birthDate: '28 октября, 1974', zodiac: 'Скорпион', age: 51,
        birthPlace: 'Сан-Хуан, Пуэрто-Рико',
        genres: ['триллер', 'драма', 'биография', 'криминал'],
        filmsCount: 112, filmsPeriod: '1982 — 2026', movies: [6]
    },
    7: {
        id: 7, name: 'Тим Роббинс', avatar: '⚖️',
        career: ['Актер', 'Режиссер', 'Сценарист', 'Продюсер'],
        height: '1.96 м', birthDate: '16 октября, 1958', zodiac: 'Весы', age: 67,
        birthPlace: 'Уэст-Ковина, Калифорния, США',
        genres: ['драма', 'триллер', 'криминал', 'комедия'],
        filmsCount: 134, filmsPeriod: '1984 — 2026', movies: [7]
    },
    8: {
        id: 8, name: 'Джон Траволта', avatar: '💃',
        career: ['Актер', 'Продюсер', 'Саундтреки'],
        height: '1.88 м', birthDate: '18 февраля, 1954', zodiac: 'Водолей', age: 72,
        birthPlace: 'Энглвуд, Нью-Джерси, США',
        genres: ['криминал', 'драма', 'комедия', 'боевик'],
        filmsCount: 198, filmsPeriod: '1975 — 2026', movies: [8]
    },
    9: {
        id: 9, name: 'Ума Турман', avatar: '⚔️',
        career: ['Актер', 'Продюсер', 'Модель'],
        height: '1.81 м', birthDate: '29 апреля, 1970', zodiac: 'Телец', age: 56,
        birthPlace: 'Бостон, Массачусетс, США',
        genres: ['криминал', 'боевик', 'драма', 'комедия'],
        filmsCount: 89, filmsPeriod: '1987 — 2026', movies: [8]
    },
    10: {
        id: 10, name: 'Фрэнсис МакДорманд', avatar: '🎭',
        career: ['Актер', 'Продюсер'],
        height: '1.68 м', birthDate: '23 июня, 1957', zodiac: 'Рак', age: 68,
        birthPlace: 'Чикаго, Иллинойс, США',
        genres: ['драма', 'криминал', 'комедия', 'триллер'],
        filmsCount: 124, filmsPeriod: '1984 — 2026', movies: [5, 7]
    }
}

function ActorCardModal({ isOpen, onClose, actorId, allMovies, onMovieClick, isFavorite, onToggleFavorite }) {
    const actor = actorsDetails[actorId]
    if (!actor) return null

    const actorMovies = allMovies.filter(m => actor.movies.includes(m.id))

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
                            className="actor-card-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Кнопка закрытия */}
                            <button className="modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>

                            {/* Профиль актёра */}
                            <div className="actor-profile-header">
                                <div className="actor-avatar-large">
                                    <span className="avatar-emoji">{actor.avatar}</span>
                                </div>
                                <h2 className="actor-name">{actor.name}</h2>
                                <div className="actor-career">
                                    {actor.career.map((role, i) => (
                                        <span key={i} className="career-tag">{role}</span>
                                    ))}
                                </div>

                                {/* 🔥 КНОПКА "В ИЗБРАННОЕ" (по центру, под тегами) */}
                                <button
                                    className={`favorite-action-btn ${isFavorite ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(actor.id); }}
                                >
                                    <Heart size={18} fill={isFavorite ? "#fff" : "none"} />
                                    <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
                                </button>
                            </div>

                            {/* Биография — 4 карточки в ряд */}
                            <div className="actor-bio-grid">
                                <div className="bio-card">
                                    <Ruler size={20} className="bio-icon" />
                                    <span className="bio-label">Рост</span>
                                    <span className="bio-value">{actor.height}</span>
                                </div>

                                <div className="bio-card">
                                    <Calendar size={20} className="bio-icon" />
                                    <span className="bio-label">Дата рождения</span>
                                    <span className="bio-value">
                    {actor.birthDate} • {actor.zodiac}
                  </span>
                                </div>

                                <div className="bio-card">
                                    <MapPin size={20} className="bio-icon" />
                                    <span className="bio-label">Место рождения</span>
                                    <span className="bio-value">{actor.birthPlace}</span>
                                </div>

                                <div className="bio-card">
                                    <Film size={20} className="bio-icon" />
                                    <span className="bio-label">Всего фильмов</span>
                                    <span className="bio-value">{actor.filmsCount}, {actor.filmsPeriod}</span>
                                </div>

                                {/* Жанры — отдельной строкой */}
                                <div className="bio-card full">
                                    <Briefcase size={20} className="bio-icon" />
                                    <span className="bio-label">Жанры</span>
                                    <div className="bio-genres">
                                        {actor.genres.map((genre, i) => (
                                            <span key={i} className="genre-chip-small">{genre}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Фильмография */}
                            <div className="actor-filmography-section">
                                <h3 className="filmography-title">
                                    <Film size={20} />
                                    Фильмы в нашей базе
                                </h3>

                                <div className="filmography-grid">
                                    {actorMovies.length > 0 ? actorMovies.map(movie => (
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
                                        <p className="no-films">Нет фильмов этого актёра в нашей базе</p>
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

export default ActorCardModal