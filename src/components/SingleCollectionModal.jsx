import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, X, Film, Pencil, Check, Trash2 } from 'lucide-react'

export default function SingleCollectionModal({
                                                  isOpen, onClose, collection,
                                                  onUpdate, onDelete, startInEditMode
                                              }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(collection?.title || '')
    const [editDescription, setEditDescription] = useState(collection?.description || '')

    // Сброс формы при открытии новой подборки
    useEffect(() => {
        if (collection) {
            setEditTitle(collection.title)
            setEditDescription(collection.description || '')
            setIsEditing(!!startInEditMode)
        }
    }, [collection?.id, startInEditMode])

    if (!collection) return null

    const movieIds = collection.movieIds || []

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
                                        <span><Film size={14} /> {movieIds.length} фильмов</span>
                                        <span>Создана {new Date(collection.createdDate || Date.now()).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                    <button
                                        className="share-collection-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const shareUrl = `${window.location.origin}/profile?collection=${collection.id}`;
                                            navigator.clipboard.writeText(shareUrl).then(() => {
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

                            <div className="films-section-title">
                                <h3>Фильмы в подборке</h3>
                                {isEditing && movieIds.length > 0 && <span className="films-hint">Нажмите ✕ чтобы убрать</span>}
                            </div>

                            {movieIds.length > 0 ? (
                                <div className="viewer-films-list">
                                    <AnimatePresence initial={false}>
                                        {movieIds.map((movieId) => (
                                            <motion.div
                                                key={movieId}
                                                className={`viewer-film-item ${isEditing ? 'editable' : ''}`}
                                                layout
                                                exit={{ opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <div className="film-preview" style={{ background: collection.gradient }}>
                                                    <Film size={32} opacity={0.4} />
                                                </div>
                                                <div className="film-info">
                                                    <h3>Фильм #{movieId}</h3>
                                                    <span className="film-genre">ID: {movieId}</span>
                                                </div>

                                                {isEditing ? (
                                                    <button className="remove-film-btn" onClick={(e) => { e.stopPropagation(); removeFilm(movieId); }} title="Убрать из подборки">
                                                        <X size={18} />
                                                    </button>
                                                ) : (
                                                    <Film size={16} className="film-arrow" />
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="viewer-empty">
                                    <Film size={48} opacity={0.3} />
                                    <p>В этой подборке пока нет фильмов</p>
                                    {isEditing && <span>Добавление фильмов будет доступно после интеграции с API</span>}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
