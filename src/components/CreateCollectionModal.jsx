import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'

export default function CreateCollectionModal({ isOpen, onClose, onCreate }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!title.trim()) return
        onCreate({ title, description })
        setTitle('')
        setDescription('')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <div className="modal-container">
                        <motion.div
                            className="create-collection-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <button className="modal-close" onClick={onClose}><X size={20} /></button>
                            <h2>Новая подборка</h2>
                            <form onSubmit={handleSubmit}>
                                <input
                                    placeholder="Название подборки"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="modal-input"
                                    required
                                />
                                <textarea
                                    placeholder="Описание (необязательно)"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="modal-textarea"
                                />
                                <button type="submit" className="modal-submit-btn">
                                    <Sparkles size={18} /> Создать
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}