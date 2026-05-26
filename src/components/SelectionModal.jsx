import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Star, Globe, Calendar, ChevronRight, ChevronLeft, Search, Film, MapPin } from 'lucide-react'
import { useFilmSearch } from '../hooks/useKinopoisk.js'
import { generateGradient, getTitle, getRating, getMainCountry } from '../utils/kinopoisk.js'

// Жанры с ID для API (из /api/v1/genres)
const genres = [
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

// Страны с ID для API (из /api/v1/genres)
const countries = [
    { id: 1, label: 'США' },
    { id: 5, label: 'Великобритания' },
    { id: 3, label: 'Франция' },
    { id: 9, label: 'Германия' },
    { id: 34, label: 'Россия' },
    { id: 49, label: 'Южная Корея' },
    { id: 16, label: 'Япония' },
    { id: 10, label: 'Италия' },
    { id: 8, label: 'Испания' },
    { id: 14, label: 'Канада' },
    { id: 13, label: 'Австралия' },
    { id: 7, label: 'Индия' },
    { id: 21, label: 'Китай' },
    { id: 30, label: 'Бразилия' },
    { id: 15, label: 'Мексика' }
]

const ratingOptions = [
    { value: 'high', label: 'Высокий рейтинг', desc: '7.0 и выше', icon: '✨' },
    { value: 'medium', label: 'Средний рейтинг', desc: '5.0 — 7.0', icon: '🌟' },
    { value: 'low', label: 'Низкий рейтинг', desc: 'Ниже 5.0', icon: '⭐' },
    { value: 'any', label: 'Не важно', desc: 'Любой рейтинг', icon: '🎲' }
]

function SelectionModal({ isOpen, onClose, onMovieClick }) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        genres: [],
        rating: ['any'],
        countries: [],
        yearFrom: 1900,
        yearTo: 2026
    })
    const [countrySearch, setCountrySearch] = useState('')
    const [showResults, setShowResults] = useState(false)
    
    const { data: searchResults, loading: searchLoading, error: searchError, refetch } = useFilmSearch()

    const totalSteps = 4

    const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))
    const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps))
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

    const toggleRating = (value) => {
        setFormData(prev => {
            const current = prev.rating || []
            if (value === 'any') return { ...prev, rating: ['any'] }
            let newRating = current.filter(v => v !== 'any')
            
            // Если снимаем выбор
            if (newRating.includes(value)) {
                newRating = newRating.filter(v => v !== value)
                
                // Если снимаем средний и остаются высокий + низкий — оставляем только высокий
                if (value === 'medium' && newRating.includes('high') && newRating.includes('low')) {
                    newRating = ['high']
                }
            } else {
                newRating.push(value)
                // Если выбраны высокий и низкий — добавляем средний
                if (newRating.includes('high') && newRating.includes('low') && !newRating.includes('medium')) {
                    newRating.push('medium')
                }
            }
            return { ...prev, rating: newRating }
        })
    }

    const toggleGenre = (id) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(id) ? [] : [id]
        }))
    }

    const toggleCountry = (id) => {
        setFormData(prev => ({
            ...prev,
            countries: prev.countries.includes(id) ? [] : [id]
        }))
    }

    const filteredCountries = countries
        .filter(c => c.label.toLowerCase().includes(countrySearch.toLowerCase()))
        .slice(0, 15)

    const handlePick = () => {
        // Собираем фильтры для API
        const apiFilters = {}
        
        if (formData.genres.length > 0) {
            apiFilters.genres = formData.genres.slice(0, 1) // API поддерживает только один жанр
        }
        
        if (formData.countries.length > 0) {
            apiFilters.countries = formData.countries.slice(0, 1) // API поддерживает только одну страну
        }
        
        apiFilters.yearFrom = formData.yearFrom
        apiFilters.yearTo = formData.yearTo
        
        // Обработка рейтинга
        if (!formData.rating.includes('any') && formData.rating.length > 0) {
            const high = formData.rating.includes('high')
            const medium = formData.rating.includes('medium')
            const low = formData.rating.includes('low')

            if (high && medium && low) {
                // Все три выбраны: рейтинг от 0 до 10.0
                apiFilters.ratingMin = 0
            } else if (high && medium) {
                // Высокий и средний: рейтинг от 5.0 до 10.0
                apiFilters.ratingMin = 5.0
            } else if (medium && low) {
                // Средний и низкий: рейтинг от 0 до 7.0
                apiFilters.ratingMax = 7.0
            } else if (high) {
                // Только высокий: рейтинг от 7.0
                apiFilters.ratingMin = 7.0
            } else if (medium) {
                // Только средний: рейтинг от 5.0 до 7.0
                apiFilters.ratingMin = 5.0
                apiFilters.ratingMax = 7.0
            } else if (low) {
                // Только низкий: рейтинг до 5.0
                apiFilters.ratingMax = 5.0
            }
        }

        refetch(apiFilters)
        setShowResults(true)
    }

    const resetAndClose = () => {
        setShowResults(false)
        setStep(1)
        setFormData({
            genres: [],
            rating: ['any'],
            countries: [],
            yearFrom: 1900,
            yearTo: 2026
        })
        onClose()
    }

    const variants = { enter: { x: 100, opacity: 0 }, center: { x: 0, opacity: 1 }, exit: { x: -100, opacity: 0 } }

    // Получаем фильмы из результатов поиска
    const films = searchResults?.films || searchResults?.items || []

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetAndClose} />
                    <div className="modal-container">
                        <motion.div className="selection-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>

                            {!showResults ? (
                                <>
                                    <div className="selection-header">
                                        <button className="modal-close" onClick={resetAndClose}><X size={20} /></button>
                                        <h2 className="selection-title">Подбор фильма</h2>
                                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} /></div>
                                        <p className="step-indicator">Шаг {step} из {totalSteps}</p>
                                    </div>

                                    <div className="selection-body">
                                        <AnimatePresence mode="wait">
                                            {step === 1 && (
                                                <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                                                    <div className="step-icon"><Sparkles size={32} color="#8b5cf6" /></div>
                                                    <h3>Выберите жанр</h3>
                                                    <p className="step-description">Какой фильм хотите посмотреть?</p>
                                                    <div className="genre-grid">
                                                        {genres.map(g => (
                                                            <button
                                                                key={g.id}
                                                                className={`genre-chip ${formData.genres.includes(g.id) ? 'active' : ''}`}
                                                                onClick={() => toggleGenre(g.id)}
                                                            >
                                                                {g.label}
                                                            </button>
                                                        ))}
                                                        <button
                                                            className={`genre-chip any ${formData.genres.length === 0 ? 'active' : ''}`}
                                                            onClick={() => updateForm('genres', [])}
                                                        >
                                                            ✨ Не важно
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {step === 2 && (
                                                <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                                                    <h3>Учитывать рейтинг?</h3>
                                                    <p className="step-description">Можно выбрать несколько вариантов</p>
                                                    <div className="rating-options">
                                                        {ratingOptions.map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                className={`rating-card ${formData.rating.includes(opt.value) ? 'active' : ''}`}
                                                                onClick={() => toggleRating(opt.value)}
                                                            >
                                                                <span className="rating-icon">{opt.icon}</span>
                                                                <div className="rating-text">
                                                                    <span className="rating-label">{opt.label}</span>
                                                                    <span className="rating-desc">{opt.desc}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                            {step === 3 && (
                                                <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                                                    <div className="step-icon"><Globe size={32} color="#06b6d4" /></div>
                                                    <h3>Страна производства</h3>
                                                    <p className="step-description">Выберите страну</p>
                                                    <div className="country-search">
                                                        <Search size={18} className="search-icon" />
                                                        <input
                                                            type="text"
                                                            placeholder="Поиск страны..."
                                                            value={countrySearch}
                                                            onChange={(e) => setCountrySearch(e.target.value)}
                                                            className="country-input"
                                                        />
                                                    </div>
                                                    <div className="country-tags">
                                                        {countrySearch === '' && (
                                                            <>
                                                                {countries.slice(0, 10).map(c => (
                                                                    <button
                                                                        key={c.id}
                                                                        className={`country-tag ${formData.countries.includes(c.id) ? 'active' : ''}`}
                                                                        onClick={() => toggleCountry(c.id)}
                                                                    >
                                                                        {c.label}
                                                                    </button>
                                                                ))}
                                                            </>
                                                        )}
                                                        {countrySearch !== '' && (
                                                            <>
                                                                {filteredCountries.map(c => (
                                                                    <button
                                                                        key={c.id}
                                                                        className={`country-tag ${formData.countries.includes(c.id) ? 'active' : ''}`}
                                                                        onClick={() => toggleCountry(c.id)}
                                                                    >
                                                                        {c.label}
                                                                    </button>
                                                                ))}
                                                            </>
                                                        )}
                                                        <button
                                                            className={`country-tag any ${formData.countries.length === 0 ? 'active' : ''}`}
                                                            onClick={() => updateForm('countries', [])}
                                                        >
                                                            Не важно
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {step === 4 && (
                                                <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                                                    <div className="step-icon"><Calendar size={32} color="#10b981" /></div>
                                                    <h3>Примерный год</h3>
                                                    <p className="step-description">Укажите период выпуска фильма</p>
                                                    <div className="year-inputs-row">
                                                        <div className="input-block">
                                                            <span className="input-label">От</span>
                                                            <input
                                                                type="number"
                                                                min="1900"
                                                                max="2026"
                                                                value={formData.yearFrom}
                                                                onChange={(e) => updateForm('yearFrom', parseInt(e.target.value) || 1900)}
                                                                className="year-input"
                                                                placeholder="1980"
                                                            />
                                                        </div>
                                                        <span className="year-separator">—</span>
                                                        <div className="input-block">
                                                            <span className="input-label">До</span>
                                                            <input
                                                                type="number"
                                                                min="1900"
                                                                max="2026"
                                                                value={formData.yearTo}
                                                                onChange={(e) => updateForm('yearTo', parseInt(e.target.value) || 2026)}
                                                                className="year-input"
                                                                placeholder="2024"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="year-presets">
                                                        <button onClick={() => { updateForm('yearFrom', 2020); updateForm('yearTo', 2026) }}>2020-е</button>
                                                        <button onClick={() => { updateForm('yearFrom', 2010); updateForm('yearTo', 2019) }}>2010-е</button>
                                                        <button onClick={() => { updateForm('yearFrom', 2000); updateForm('yearTo', 2009) }}>2000-е</button>
                                                        <button onClick={() => { updateForm('yearFrom', 1990); updateForm('yearTo', 1999) }}>90-е</button>
                                                        <button onClick={() => { updateForm('yearFrom', 1900); updateForm('yearTo', 2026) }}>Все годы</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="selection-footer">
                                        {step > 1 && (
                                            <button className="btn-back" onClick={prevStep}>
                                                <ChevronLeft size={20} /> Назад
                                            </button>
                                        )}
                                        {step < totalSteps ? (
                                            <button className="btn-next" onClick={nextStep}>
                                                Далее <ChevronRight size={20} />
                                            </button>
                                        ) : (
                                            <button className="btn-submit" onClick={handlePick}>
                                                <Sparkles size={20} /> Подобрать фильм <Sparkles size={20} />
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="selection-header">
                                        <button className="modal-close" onClick={resetAndClose}><X size={20} /></button>
                                        <h2 className="selection-title">Результаты подбора</h2>
                                    </div>
                                    <div className="selection-results-list">
                                        {searchLoading ? (
                                            <div className="loading-results">
                                                <div className="spinner" />
                                                <p>Подбираем фильмы...</p>
                                            </div>
                                        ) : searchError ? (
                                            <div className="empty-state">
                                                <Film size={48} opacity={0.3} />
                                                <p>Ошибка загрузки фильмов.<br/>Попробуйте повторить попытку.</p>
                                            </div>
                                        ) : films.length > 0 ? (
                                            films.slice(0, 10).map((film, i) => (
                                                <motion.div
                                                    key={film.kinopoiskId}
                                                    className="upcoming-item"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => {
                                                        onMovieClick({ kinopoiskId: film.kinopoiskId })
                                                        resetAndClose()
                                                    }}
                                                >
                                                    <div
                                                        className="upcoming-preview"
                                                        style={{
                                                            background: film.posterUrl && film.posterUrl !== 'https://kinopoiskapiunofficial.tech/images/posters/kp/no-poster.png'
                                                                ? `url(${film.posterUrl}) center/cover`
                                                                : generateGradient(film.kinopoiskId)
                                                        }}
                                                    >
                                                        {(!film.posterUrl || film.posterUrl === 'https://kinopoiskapiunofficial.tech/images/posters/kp/no-poster.png') && (
                                                            <div className="preview-placeholder">
                                                                <Film size={40} opacity={0.4} />
                                                            </div>
                                                        )}
                                                        <div className="preview-badge">
                                                            <Star size={12} fill="#ffd700" color="#ffd700" />
                                                            {getRating(film)}
                                                        </div>
                                                    </div>
                                                    <div className="upcoming-info">
                                                        <h3 className="upcoming-movie-title">{getTitle(film)}</h3>
                                                        <div className="upcoming-meta">
                                                            <div className="meta-row">
                                                                <Calendar size={14} className="meta-icon" />
                                                                <span>{film.year || '—'}</span>
                                                            </div>
                                                            {film.countries && film.countries.length > 0 && (
                                                                <div className="meta-row">
                                                                    <MapPin size={14} className="meta-icon" />
                                                                    <span>{getMainCountry(film.countries)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="upcoming-genre">
                                                            <Film size={12} />
                                                            {film.genres && film.genres.length > 0
                                                                ? film.genres[0].genre.charAt(0).toUpperCase() + film.genres[0].genre.slice(1)
                                                                : '—'}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="empty-state">
                                                <Sparkles size={48} opacity={0.3} />
                                                <p>Ничего не найдено по вашим критериям.<br/>Попробуйте смягчить фильтры.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="selection-footer">
                                        <button
                                            className="btn-back"
                                            onClick={() => setShowResults(false)}
                                            style={{ margin: '0 auto' }}
                                        >
                                            ← Изменить фильтры
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default SelectionModal
