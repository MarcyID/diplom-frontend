import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, X, Film, Star, Calendar, Clock, ChevronRight, Trash2, Pencil, Check, Search, Plus } from 'lucide-react'

export default function SingleCollectionModal({
                                                  isOpen, onClose, collection, allMovies, onMovieClick,
                                                  onUpdate, onDelete, startInEditMode // 🔥 Добавлено
                                              }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(collection?.title || '')
    const [editDescription, setEditDescription] = useState(collection?.description || '')
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddSearch, setShowAddSearch] = useState(false)

    // Сброс формы при открытии новой подборки
    useEffect(() => {
        if (collection) {
            setEditTitle(collection.title)
            setEditDescription(collection.description || '')
            setSearchQuery('')
            setShowAddSearch(false)
            // 🔥 Если передан флаг → сразу включаем режим редактирования
            setIsEditing(!!startInEditMode)
        }
    }, [collection?.id, startInEditMode]) // 🔥 Добавлена зависимость
    if (!collection) return null

    const movieIds = collection.movieIds || []
    const collectionFilms = movieIds.map(id => allMovies.find(m => m.id === id)).filter(Boolean)

    const availableFilms = allMovies.filter(movie =>
        !movieIds.includes(movie.id) &&
        (movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.genre.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 8)

    const saveChanges = () => {
        if (!editTitle.trim()) return
        onUpdate(collection.id, {
            title: editTitle.trim(),
            description: editDescription.trim()
        })
        setIsEditing(false)
    }

    const removeFilm = (movieId) => {
        const newMovieIds = movieIds.filter(id => id !== movieId)
        onUpdate(collection.id, { movieIds: newMovieIds })
    }

    const addFilm = (movieId) => {
        const newMovieIds = [...movieIds, movieId]
        onUpdate(collection.id, { movieIds: newMovieIds })
        setSearchQuery('')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <div className="modal-container">
                        <motion.div
                            className="single-collection-modal"
                            key={collection.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <button className="modal-close" onClick={onClose}><X size={20} /></button>

                            <div className="collection-modal-header" style={{ background: collection.gradient }}>
                                <div className="header-overlay"></div>
                                <div className="header-content">
                                    {isEditing ? (
                                        <input className="edit-title-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Название подборки" />
                                    ) : (
                                        <h2>{collection.title}</h2>
                                    )}

                                    {isEditing ? (
                                        <textarea className="edit-description-input" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Описание подборки" />
                                    ) : (
                                        <p className="collection-description">{collection.description || 'Без описания'}</p>
                                    )}

                                    <div className="collection-stats">
                                        <span><Film size={14} /> {collectionFilms.length} фильмов</span>
                                        <span>Создана {new Date(collection.id).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                    <button
                                        className="share-collection-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const shareUrl = `${window.location.origin}/profile?collection=${collection.id}`;
                                            navigator.clipboard.writeText(shareUrl).then(() => {
                                                // Анимация подтверждения
                                                const btn = e.currentTarget;
                                                const originalText = btn.innerHTML;
                                                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Скопировано!';
                                                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                                                setTimeout(() => {
                                                    btn.innerHTML = originalText;
                                                    btn.style.background = '';
                                                }, 2000);
                                            });
                                        }}
                                    >
                                        <Share2 size={16} /> Поделиться
                                    </button>
                                </div>
                            </div>

                            <div className="collection-actions-bar">
                                {isEditing ? (
                                    <>
                                        <button className="action-btn-save" onClick={saveChanges}><Check size={14} /> Сохранить</button>
                                        <button className="action-btn-cancel" onClick={() => { setIsEditing(false); setEditTitle(collection.title); setEditDescription(collection.description || ''); }}>Отмена</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="action-btn-edit" onClick={() => setIsEditing(true)}><Pencil size={14} /> Редактировать</button>
                                        <button className="action-btn-delete" onClick={() => onDelete(collection.id)}><Trash2 size={14} /> Удалить подборку</button>
                                    </>
                                )}
                            </div>

                            {isEditing && (
                                <div className="add-films-section">
                                    <button className="add-search-toggle" onClick={() => setShowAddSearch(!showAddSearch)}>
                                        <Plus size={16} /> {showAddSearch ? 'Скрыть поиск' : 'Добавить фильмы'}
                                    </button>

                                    <AnimatePresence>
                                        {showAddSearch && (
                                            <motion.div className="add-search-box" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                <div className="search-input-wrapper">
                                                    <Search size={16} className="search-icon" />
                                                    <input type="text" placeholder="Поиск фильмов..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="add-film-search" />
                                                </div>

                                                {searchQuery && availableFilms.length > 0 && (
                                                    <div className="search-results">
                                                        {availableFilms.map(movie => (
                                                            <div key={movie.id} className="search-result-item">
                                                                <div className="result-film-info">
                                                                    <span className="result-title">{movie.title}</span>
                                                                    <span className="result-meta">{movie.year} • {movie.genre}</span>
                                                                </div>
                                                                <button className="add-film-btn" onClick={() => addFilm(movie.id)}><Plus size={14} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {searchQuery && availableFilms.length === 0 && (
                                                    <p className="search-empty">Ничего не найдено</p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <div className="films-section-title">
                                <h3>Фильмы в подборке</h3>
                                {isEditing && collectionFilms.length > 0 && <span className="films-hint">Нажмите ✕ чтобы убрать</span>}
                            </div>

                            {collectionFilms.length > 0 ? (
                                <div className="viewer-films-list">
                                    {/* 🔥 AnimatePresence для плавного удаления */}
                                    <AnimatePresence initial={false}>
                                        {collectionFilms.map((movie) => (
                                            <motion.div
                                                key={movie.id}
                                                className={`viewer-film-item ${isEditing ? 'editable' : ''}`}
                                                layout // 🔥 Плавная перестройка списка
                                                exit={{ opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25 }}
                                                onClick={() => !isEditing && onMovieClick && onMovieClick(movie)}
                                            >
                                                <div className="film-preview" style={{ background: movie.gradient }}>
                                                    <Film size={32} opacity={0.4} />
                                                    <div className="film-rating"><Star size={10} fill="#ffd700" color="#ffd700" /> {movie.rating}</div>
                                                </div>
                                                <div className="film-info">
                                                    <h3>{movie.title}</h3>
                                                    <div className="film-meta">
                                                        <span><Calendar size={12} /> {movie.year}</span>
                                                        <span><Clock size={12} /> {movie.duration}</span>
                                                    </div>
                                                    <span className="film-genre">{movie.genre}</span>
                                                </div>

                                                {isEditing ? (
                                                    <button className="remove-film-btn" onClick={(e) => { e.stopPropagation(); removeFilm(movie.id); }} title="Убрать из подборки">
                                                        <X size={18} />
                                                    </button>
                                                ) : (
                                                    <ChevronRight size={16} className="film-arrow" />
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="viewer-empty">
                                    <Film size={48} opacity={0.3} />
                                    <p>В этой подборке пока нет фильмов</p>
                                    {isEditing && <span>Воспользуйтесь поиском выше, чтобы добавить фильмы</span>}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}