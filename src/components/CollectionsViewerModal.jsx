import { motion, AnimatePresence } from 'framer-motion'
import { X, Film } from 'lucide-react'

export default function CollectionsViewerModal({ isOpen, onClose, collections }) {
    // Считаем общее количество фильмов во всех подборках
    const totalFilms = collections.reduce((sum, col) => sum + (col.films || col.movieIds?.length || 0), 0)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <div className="modal-container">
                        <motion.div
                            className="collections-viewer-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <button className="modal-close" onClick={onClose}><X size={20} /></button>

                            <div className="viewer-header">
                                <h2>Все подборки</h2>
                                <p className="viewer-subtitle">{totalFilms} фильмов в {collections.length} подборках</p>
                            </div>

                            {collections.length > 0 ? (
                                <div className="viewer-collections-list">
                                    {collections.map((collection, index) => (
                                        <motion.div
                                            key={collection.id}
                                            className="collection-summary-item"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <div className="collection-preview" style={{ background: collection.gradient }}>
                                                <Film size={32} opacity={0.4} />
                                            </div>
                                            <div className="collection-info">
                                                <h3>{collection.title}</h3>
                                                <p className="collection-desc">{collection.description || 'Без описания'}</p>
                                                <span className="collection-films">{collection.films || collection.movieIds?.length || 0} фильмов</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="viewer-empty">
                                    <Film size={48} opacity={0.3} />
                                    <p>Пока нет подборок</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
