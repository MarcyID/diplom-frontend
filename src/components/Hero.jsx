// Добавь Masks в список:
import { Film, Search, User, Shuffle, Sparkles, ListVideo, UserSearch, Clapperboard, CalendarClock } from 'lucide-react'
import { motion } from 'framer-motion'

function Hero({ onOpenModal }) {
    const features = [
        {
            title: 'Подобрать фильм',
            description: 'Ответь на несколько вопросов и получи идеальную рекомендацию',
            icon: Sparkles,
            color: '#8b5cf6',
            action: 'selection'
        },
        {
            title: 'Случайный фильм',
            description: 'Доверься удаче — мы выберем фильм за тебя',
            icon: Shuffle,
            color: '#ec4899',
            action: 'random'
        },
        {
            title: 'Создать подборку',
            description: 'Создайте свою коллекцию фильмов для вечера с друзьями или для просмотра на выходных',
            icon: ListVideo,
            color: '#10b981',
            action: 'playlist'
        },
        {
            title: 'Поиск по актёру',
            description: 'Найди фильмы с любимыми актёрами',
            icon: UserSearch,
            color: '#f59e0b',
            action: 'actor'
        },
        {
            title: 'Поиск по режиссёру',
            description: 'Найди фильмы твоего любимого режиссёра: Нолан, Тарантино, Скорсезе',
            icon: Clapperboard,
            color: '#06b6d4',
            action: 'director'
        },
        {
            title: 'Скоро в кино', // ✅ НОВОЕ НАЗВАНИЕ
            description: 'Будущие хиты и даты выхода премьер', // ✅ НОВОЕ ОПИСАНИЕ
            icon: CalendarClock, // ✅ НОВАЯ ИКОНКА
            color: '#ef4444', // ✅ КРАСНЫЙ ЦВЕТ
            action: 'upcoming' // ✅ НОВЫЙ КЛЮЧ
        }
    ]

    return (
        <section className="hero-section">
            <div className="hero-bg">
                <div className="hero-gradient"></div>
            </div>

            <div className="hero-content">
                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Найди свой идеальный фильм
                </motion.h1>
                <motion.div
                    className="hero-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <motion.button
                                key={index}
                                className="hero-button"
                                style={{ '--accent-color': feature.color }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onOpenModal(feature.action)}
                            >
                                <div className="button-icon" style={{ background: `${feature.color}20` }}>
                                    <Icon size={32} color={feature.color} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.button>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    )
}

export default Hero