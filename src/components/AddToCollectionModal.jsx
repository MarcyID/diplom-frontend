import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Check, Film, Sparkles } from 'lucide-react'

export default function AddToCollectionModal({ isOpen, onClose, movie, collections, onAddToCollection, onCreateCollection }) {
    const [selectedIds, setSelectedIds] = useState([])
    const [isCreating, setIsCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDescription, setNewDescription] = useState('')

    // Сброс при открытии
    const handleOpen = () => {
        setSelectedIds([])
        setIsCreating(false)
        setNewTitle('')
        setNewDescription('')
    }

    const toggleCollection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        )
    }

    const handleAdd = () => {
        if (selectedIds.length > 0 && movie) {
            onAddToCollection(selectedIds, movie.id)
            onClose()
        }
    }

    const handleCreate = () => {
        if (newTitle.trim() && movie) {
            const newCol = onCreateCollection({
                title: newTitle.trim(),
                description: newDescription.trim(),
                movieIds: [movie.id],
                gradient: `linear-gradient(135deg, hsl(${Math.random() * 360}, 70%, 50%), hsl(${Math.random() * 360}, 70%, 40%))`
            })
            if (newCol) {
                setSelectedIds([newCol.id])
                setIsCreating(false)
            }
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} onOpen={handleOpen} />
                    <div className="modal-container">
                        <motion.div
                            className="add-to-collection-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <button className="modal-close" onClick={onClose}><X size={20} /></button>

                            <div className="modal-header">
                                <h2>Добавить в подборку</h2>
                                {movie && (
                                    <p className="modal-movie-title">
                                        <Film size={16} /> {movie.title}
                                    </p>
                                )}
                            </div>

                            {/* Режим создания новой подборки */}
                            {isCreating ? (
                                <div className="create-collection-form">
                                    <input
                                        type="text"
                                        placeholder="Название новой подборки *"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="modal-input"
                                        maxLength={50}
                                    />
                                    <textarea
                                        placeholder="Описание (необязательно)"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        className="modal-textarea"
                                        rows={3}
                                        maxLength={200}
                                    />
                                    <div className="create-actions">
                                        <button className="btn-cancel" onClick={() => setIsCreating(false)}>Отмена</button>
                                        <button
                                            className="btn-create"
                                            onClick={handleCreate}
                                            disabled={!newTitle.trim()}
                                        >
                                            <Sparkles size={16} /> Создать и добавить
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Список существующих подборок */
                                <div className="collections-list">
                                    {collections.length > 0 ? (
                                        collections.map(col => (
                                            <label key={col.id} className="collection-item">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(col.id)}
                                                    onChange={() => toggleCollection(col.id)}
                                                    className="collection-checkbox"
                                                />
                                                <div className="collection-preview" style={{ background: col.gradient }}>
                                                    <div className="collection-preview-overlay"></div>
                                                    <Film size={20} opacity={0.5} />
                                                </div>
                                                <div className="collection-details">
                                                    <span className="collection-name">{col.title}</span>
                                                    <span className="collection-count">{col.films || 0} фильмов</span>
                                                </div>
                                                {selectedIds.includes(col.id) && (
                                                    <div className="collection-check">
                                                        <Check size={18} />
                                                    </div>
                                                )}
                                            </label>
                                        ))
                                    ) : (
                                        <p className="no-collections">У вас пока нет подборок</p>
                                    )}

                                    {/* Кнопка создания новой */}
                                    <button className="create-new-btn" onClick={() => setIsCreating(true)}>
                                        <Plus size={18} /> Создать новую подборку
                                    </button>
                                </div>
                            )}

                            {/* Кнопки действий */}
                            {!isCreating && collections.length > 0 && (
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={onClose}>Отмена</button>
                                    <button
                                        className="btn-add"
                                        onClick={handleAdd}
                                        disabled={selectedIds.length === 0}
                                    >
                                        <Check size={18} /> Добавить в {selectedIds.length} {selectedIds.length === 1 ? 'подборку' : 'подборки'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}