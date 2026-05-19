import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Star, Globe, Calendar, ChevronRight, ChevronLeft, Search, Film, Clock } from 'lucide-react'

const genres = ['Боевик', 'Комедия', 'Драма', 'Фантастика', 'Триллер', 'Ужасы', 'Мелодрама', 'Детектив', 'Анимация', 'Документальный', 'Биография', 'Приключения']
const popularCountries = ['США', 'Великобритания', 'Франция', 'Германия', 'Россия', 'Южная Корея', 'Япония']
const allCountries = ['США', 'Великобритания', 'Франция', 'Германия', 'Россия', 'Южная Корея', 'Япония', 'Италия', 'Испания', 'Канада', 'Австралия', 'Индия', 'Китай', 'Бразилия', 'Мексика', 'Аргентина', 'Швеция', 'Норвегия', 'Дания', 'Нидерланды', 'Бельгия', 'Швейцария', 'Австрия', 'Польша', 'Чехия', 'Венгрия', 'Румыния', 'Болгария', 'Сербия', 'Хорватия', 'Словения', 'Словакия', 'Литва', 'Латвия', 'Эстония', 'Финляндия', 'Исландия', 'Ирландия', 'Португалия', 'Греция', 'Турция', 'Египет', 'Марокко', 'Тунис', 'ЮАР', 'Нигерия', 'Кения', 'Эфиопия', 'Иран', 'Ирак', 'Израиль', 'Ливан', 'Иордания', 'Саудовская Аравия', 'ОАЭ', 'Катар', 'Кувейт', 'Оман', 'Йемен', 'Пакистан', 'Индонезия', 'Малайзия', 'Таиланд', 'Вьетнам', 'Филиппины', 'Сингапур', 'Новая Зеландия']

const ratingOptions = [
    { value: 'high', label: 'Высокий рейтинг', desc: '7.0 и выше', icon: '⭐' },
    { value: 'medium', label: 'Средний рейтинг', desc: '5.0 — 7.0', icon: '✨' },
    { value: 'any', label: 'Не важно', desc: 'Любой рейтинг', icon: '🎲' }
]

function SelectionModal({ isOpen, onClose, allMovies, onMovieClick }) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({ genre: null, rating: [], country: null, yearRange: [1990, 2026] })
    const [countrySearch, setCountrySearch] = useState('')
    const [showResults, setShowResults] = useState(false)
    const [filteredMovies, setFilteredMovies] = useState([])

    const totalSteps = 4

    const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))
    const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps))
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

    const toggleRating = (value) => {
        setFormData(prev => {
            const current = prev.rating || []
            if (value === 'any') return { ...prev, rating: ['any'] }
            let newRating = current.filter(v => v !== 'any')
            if (newRating.includes(value)) newRating = newRating.filter(v => v !== value)
            else newRating.push(value)
            return { ...prev, rating: newRating }
        })
    }

    const filteredCountries = allCountries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).slice(0, 10)

    const handlePick = () => {
        const results = allMovies.filter(movie => {
            if (formData.genre && movie.genre !== formData.genre) return false
            if (formData.country && movie.country !== formData.country) return false
            if (movie.year < formData.yearRange[0] || movie.year > formData.yearRange[1]) return false

            if (!formData.rating.includes('any') && formData.rating.length > 0) {
                const r = movie.rating
                const high = formData.rating.includes('high')
                const med = formData.rating.includes('medium')
                if (high && !med && r < 7) return false
                if (!high && med && (r < 5 || r > 7)) return false
                if (high && med && r < 5) return false
            }
            return true
        })
        setFilteredMovies(results.slice(0, 5))
        setShowResults(true)
    }

    const resetAndClose = () => {
        setShowResults(false)
        setStep(1)
        setFormData({ genre: null, rating: [], country: null, yearRange: [1990, 2026] })
        onClose()
    }

    const variants = { enter: { x: 100, opacity: 0 }, center: { x: 0, opacity: 1 }, exit: { x: -100, opacity: 0 } }

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
                                                    <p className="step-description">Какой фильм хотите посмотреть сегодня?</p>
                                                    <div className="genre-grid">
                                                        {genres.map(g => <button key={g} className={`genre-chip ${formData.genre === g ? 'active' : ''}`} onClick={() => updateForm('genre', g)}>{g}</button>)}
                                                        <button className={`genre-chip any ${formData.genre === null ? 'active' : ''}`} onClick={() => updateForm('genre', null)}>✨ Не важно</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {step === 2 && (
                                                <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                                                    <div className="step-icon"><Star size={32} color="#ffd700" /></div>
                                                    <h3>Учитывать рейтинг?</h3>
                                                    <p className="step-description">Можно выбрать несколько вариантов</p>
                                                    <div className="rating-options">
                                                        {ratingOptions.map(opt => (
                                                            <button key={opt.value} className={`rating-card ${formData.rating.includes(opt.value) ? 'active' : ''}`} onClick={() => toggleRating(opt.value)}>
                                                                <span className="rating-icon">{opt.icon}</span>
                                                                <div className="rating-text"><span className="rating-label">{opt.label}</span><span className="rating-desc">{opt.desc}</span></div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                            {step === 3 && (
                                                <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                                                    <div className="step-icon"><Globe size={32} color="#06b6d4" /></div>
                                                    <h3>Страна производства</h3>
                                                    <p className="step-description">Какие страны предпочитаете?</p>
                                                    <div className="country-search">
                                                        <Search size={18} className="search-icon" />
                                                        <input type="text" placeholder="Поиск страны..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="country-input" />
                                                    </div>
                                                    <div className="country-tags">
                                                        {countrySearch === '' && popularCountries.map(c => <button key={c} className={`country-tag ${formData.country === c ? 'active' : ''}`} onClick={() => updateForm('country', c)}>{c}</button>)}
                                                        {countrySearch !== '' && filteredCountries.map(c => <button key={c} className={`country-tag ${formData.country === c ? 'active' : ''}`} onClick={() => updateForm('country', c)}>{c}</button>)}
                                                        <button className={`country-tag any ${formData.country === null ? 'active' : ''}`} onClick={() => updateForm('country', null)}>Любая страна</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {step === 4 && (
                                                <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                                                    <div className="step-icon"><Calendar size={32} color="#10b981" /></div>
                                                    <h3>Примерный год</h3>
                                                    <p className="step-description">Укажите период выпуска фильма</p>
                                                    <div className="year-inputs-row">
                                                        <div className="input-block"><span className="input-label">От</span><input type="number" min="1900" max="2026" value={formData.yearRange[0]} onChange={(e) => updateForm('yearRange', [parseInt(e.target.value) || 1900, formData.yearRange[1]])} className="year-input" placeholder="1980" /></div>
                                                        <span className="year-separator">—</span>
                                                        <div className="input-block"><span className="input-label">До</span><input type="number" min="1900" max="2026" value={formData.yearRange[1]} onChange={(e) => updateForm('yearRange', [formData.yearRange[0], parseInt(e.target.value) || 2026])} className="year-input" placeholder="2024" /></div>
                                                    </div>
                                                    <div className="year-presets">
                                                        <button onClick={() => updateForm('yearRange', [2020, 2026])}>2020-е</button>
                                                        <button onClick={() => updateForm('yearRange', [2010, 2019])}>2010-е</button>
                                                        <button onClick={() => updateForm('yearRange', [2000, 2009])}>2000-е</button>
                                                        <button onClick={() => updateForm('yearRange', [1990, 1999])}>90-е</button>
                                                        <button onClick={() => updateForm('yearRange', [1950, 2026])}>Все годы</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="selection-footer">
                                        {step > 1 && <button className="btn-back" onClick={prevStep}><ChevronLeft size={20} /> Назад</button>}
                                        {step < totalSteps ? (
                                            <button className="btn-next" onClick={nextStep}>Далее <ChevronRight size={20} /></button>
                                        ) : (
                                            <button className="btn-submit" onClick={handlePick}><Sparkles size={20} /> Подобрать фильм <Sparkles size={20} /></button>
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
                                        {filteredMovies.length > 0 ? filteredMovies.map((movie, i) => (
                                            <motion.div key={movie.id} className="upcoming-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} onClick={() => { onMovieClick(movie); resetAndClose(); }}>
                                                <div className="upcoming-preview" style={{ background: movie.gradient }}>
                                                    <div className="preview-placeholder"><Film size={40} opacity={0.4} /></div>
                                                    <div className="preview-badge"><Star size={12} fill="#ffd700" color="#ffd700" /> {movie.rating}</div>
                                                </div>
                                                <div className="upcoming-info">
                                                    <h3 className="upcoming-movie-title">{movie.title}</h3>
                                                    <div className="upcoming-meta">
                                                        <div className="meta-row"><Calendar size={14} className="meta-icon" /><span>{movie.year}</span></div>
                                                        <div className="meta-row"><Clock size={14} className="meta-icon" /><span>{movie.duration}</span></div>
                                                    </div>
                                                    <div className="upcoming-genre"><Film size={12} /> {movie.genre}</div>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="empty-state">
                                                <Sparkles size={48} opacity={0.3} />
                                                <p>Ничего не найдено по вашим критериям.<br/>Попробуйте смягчить фильтры.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="selection-footer">
                                        <button className="btn-back" onClick={() => setShowResults(false)} style={{ margin: '0 auto' }}>← Изменить фильтры</button>
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