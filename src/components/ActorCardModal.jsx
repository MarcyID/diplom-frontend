import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Briefcase, VenusAndMars, Calendar, MapPin, Ruler } from 'lucide-react'
import { usePerson } from '../hooks/useKinopoisk.js'

// Форматирование даты: "1969-11-04" → "4 ноября, 1969"
function formatDate(dateStr) {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
}

// Подсчёт количества по профессиям
function countProfessions(filmography) {
    if (!filmography || filmography.length === 0) return []
    const professionCount = {}
    filmography.forEach(film => {
        if (film.professionKey) {
            const prof = film.professionKey
            professionCount[prof] = (professionCount[prof] || 0) + 1
        }
    })
    return Object.entries(professionCount)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => ({ key, count }))
}

// Форматирование профессии для отображения
function formatProfession(key) {
    const map = {
        'ACTOR': 'Актёр',
        'PRODUCER': 'Продюсер',
        'DIRECTOR': 'Режиссёр',
        'WRITER': 'Сценарист',
        'HIMSELF': 'Камео',
        'HERSELF': 'Камео',
        'HRONO_TITR_MALE': 'Хроника',
        'HRONO_TITR_FEMALE': 'Хроника'
    }
    return map[key] || key
}

function ActorCardModal({ isOpen, onClose, actorId, onMovieClick, isFavorite, onToggleFavorite }) {
    const { data: person, loading: personLoading } = usePerson(actorId)

    const filmography = person?.films || []

    if (!actorId || !isOpen) return null

    if (personLoading) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                        <div className="modal-container">
                            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                <div style={{
                                    display: 'inline-block',
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid #333',
                                    borderTop: '4px solid #8b5cf6',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                <p style={{ marginTop: '20px' }}>Загрузка персоны...</p>
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        )
    }

    if (!person) return null

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
                                    {person.posterUrl ? (
                                        <img src={person.posterUrl} alt={person.nameRu || person.nameEn} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    ) : (
                                        <span className="avatar-emoji">{(person.nameRu || person.nameEn || '?').charAt(0)}</span>
                                    )}
                                </div>
                                <h2 className="actor-name">{person.nameRu || person.nameEn}</h2>
                                <div className="actor-career">
                                    {person.profession && (
                                        <span className="career-tag">{person.profession}</span>
                                    )}
                                </div>

                                {/* 🔥 КНОПКА "В ИЗБРАННОЕ" (по центру, под тегами) */}
                                <button
                                    className={`favorite-action-btn ${isFavorite ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(person.personId); }}
                                >
                                    <Heart size={18} fill={isFavorite ? "#fff" : "none"} />
                                    <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
                                </button>
                            </div>

                            {/* Биография — 4 карточки в ряд */}
                            <div className="actor-bio-grid">
                                {person.sex && (
                                    <div className="bio-card">
                                        <VenusAndMars size={20} className="bio-icon" />
                                        <span className="bio-label">Пол</span>
                                        <span className="bio-value">{person.sex === 'MALE' ? 'Мужской' : 'Женский'}</span>
                                    </div>
                                )}

                                {person.growth != null && person.growth > 0 && (
                                    <div className="bio-card">
                                        <Ruler size={20} className="bio-icon" />
                                        <span className="bio-label">Рост</span>
                                        <span className="bio-value">{person.growth} см</span>
                                    </div>
                                )}

                                {person.birthday && (
                                    <div className="bio-card">
                                        <Calendar size={20} className="bio-icon" />
                                        <span className="bio-label">Дата рождения</span>
                                        <span className="bio-value">{formatDate(person.birthday)}</span>
                                    </div>
                                )}

                                {person.birthplace && (
                                    <div className="bio-card">
                                        <MapPin size={20} className="bio-icon" />
                                        <span className="bio-label">Место рождения</span>
                                        <span className="bio-value">{person.birthplace}</span>
                                    </div>
                                )}

                                {filmography && filmography.length > 0 && (
                                    <div className="bio-card full">
                                        <Briefcase size={20} className="bio-icon" />
                                        <span className="bio-label">Фильмография</span>
                                        <div className="bio-genres">
                                            <span className="genre-chip-small">{filmography.length} работ</span>
                                            {countProfessions(filmography).map(({ key, count }) => (
                                                <span key={key} className="genre-chip-small">
                                                    {formatProfession(key)}: {count}
                                                </span>
                                            ))}
                                        </div>
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

export default ActorCardModal