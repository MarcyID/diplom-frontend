import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Shuffle, ListVideo, UserSearch, Clapperboard, CalendarClock } from 'lucide-react'

function FeatureModal({ type, isOpen, onClose }) {
    const features = {
        selection: {
            title: 'Подобрать фильм',
            icon: Sparkles,
            color: '#8b5cf6',
            content: 'Ответьте на несколько вопросов о вашем настроении и предпочтениях, и мы подберём идеальный фильм для просмотра!'
        },
        random: {
            title: 'Случайный фильм',
            icon: Shuffle,
            color: '#ec4899',
            content: 'Доверьтесь удаче! Мы случайным образом выберем для вас фильм из нашей коллекции шедевров.'
        },
        playlist: {
            title: 'Создать подборку',
            icon: ListVideo,
            color: '#10b981',
            content: 'Создайте свою коллекцию фильмов для вечера с друзьями или для просмотра на выходных.'
        },
        actor: {
            title: 'Поиск по актёру',
            icon: UserSearch,
            color: '#f59e0b',
            content: 'Введите имя актёра или режиссёра, и мы покажем все фильмы с его участием. Откройте для себя фильмографии любимых звёзд!'
        },
        director: {  // ← НОВАЯ МОДАЛКА
            title: 'Поиск по режиссёру',
            icon: Clapperboard,
            color: '#06b6d4',
            content: 'Введите имя режиссёра, и мы покажем все его фильмы. Откройте для себя фильмографии Кристофера Нолана, Квентина Тарантино, Мартина Скорсезе и других мастеров кино!'
        },
        upcoming: { // ✅ ЗАМЕНИ БЛОК GENRE НА ЭТОТ
            title: 'Скоро в кино',
            icon: CalendarClock,
            color: '#ef4444',
            content: 'Здесь появятся трейлеры будущих хитов и даты выхода премьер. Следи за обновлениями, чтобы не пропустить главное событие года!'
        }
    }
    const feature = features[type]
    if (!feature) return null

    const Icon = feature.icon

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
                            className="feature-modal"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ '--modal-color': feature.color }}
                        >
                            <button className="modal-close" onClick={onClose}>
                                <X size={24} />
                            </button>

                            <div className="feature-icon" style={{ background: `${feature.color}20` }}>
                                <Icon size={48} color={feature.color} />
                            </div>

                            <h2>{feature.title}</h2>
                            <p className="feature-description">{feature.content}</p>

                            <button
                                className="feature-button"
                                style={{ background: feature.color }}
                                onClick={onClose}
                            >
                                Начать
                            </button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default FeatureModal