import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    User, Edit3, Plus, Film, Pencil, Trash2,
    BarChart3, Heart, Bookmark, Clock, Share2, Settings,
    TrendingUp, Calendar, MapPin, Camera, Image
} from 'lucide-react'
import CreateCollectionModal from './CreateCollectionModal'
import CollectionsViewerModal from './CollectionsViewerModal'
import FavoritesViewerModal from './FavoritesViewerModal'
import SingleCollectionModal from './SingleCollectionModal'

export default function ProfilePage({ user, setUser, allMovies, onMovieClick }) {
    const avatarInputRef = useRef(null)
    const bannerInputRef = useRef(null)
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempName, setTempName] = useState(user.name)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isCollectionsViewerOpen, setIsCollectionsViewerOpen] = useState(false)
    const [isFavoritesViewerOpen, setIsFavoritesViewerOpen] = useState(false)
    const [shouldStartEditing, setShouldStartEditing] = useState(false)

    // ← НОВОЕ: состояние для модалки отдельной подборки
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [isSingleCollectionOpen, setIsSingleCollectionOpen] = useState(false)

    const allGenres = ['Драма', 'Фантастика', 'Триллер', 'Комедия', 'Боевик', 'Ужасы', 'Мелодрама', 'Детектив', 'Анимация', 'Документальный']

    // Сохранение имени
    const saveName = () => {
        if (tempName.trim()) setUser(prev => ({ ...prev, name: tempName }))
        setIsEditingName(false)
    }

    // Переключение жанра
    const toggleGenre = (genre) => {
        setUser(prev => {
            const current = prev.genres || []
            const updated = current.includes(genre)
                ? current.filter(g => g !== genre)
                : [...current, genre]
            return { ...prev, genres: updated }
        })
    }

    // Загрузка аватара
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => setUser(prev => ({ ...prev, avatar: reader.result }))
        reader.readAsDataURL(file)
    }

    // Загрузка баннера
    const handleBannerChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => setUser(prev => ({ ...prev, banner: reader.result }))
        reader.readAsDataURL(file)
    }

    const addCollection = (newCol) => {
        setUser(prev => ({
            ...prev,
            collections: [...prev.collections, { ...newCol, id: Date.now(), films: 0, movieIds: [] }]
        }))
        setIsCreateModalOpen(false)
    }

    // ← НОВОЕ: Открытие отдельной подборки
    const openCollection = (collection) => {
        setSelectedCollection(collection)
        setShouldStartEditing(false) // Сбрасываем флаг
        setIsSingleCollectionOpen(true)
    }

    // ← НОВОЕ: Удаление подборки
    const deleteCollection = (collectionId) => {
        if (window.confirm('Удалить эту подборку?')) {
            setUser(prev => ({
                ...prev,
                collections: prev.collections.filter(c => c.id !== collectionId)
            }))
            setIsSingleCollectionOpen(false)
        }
    }

    const updateCollection = (collectionId, updates) => {
        setUser(prev => {
            const updatedCollections = prev.collections.map(c => {
                if (c.id === collectionId) {
                    // Если обновляем movieIds — берём новое значение, иначе оставляем старое
                    const newMovieIds = updates.movieIds !== undefined ? updates.movieIds : c.movieIds
                    return {
                        ...c,
                        ...updates,
                        movieIds: newMovieIds,
                        films: newMovieIds?.length || c.films
                    }
                }
                return c
            })
            return { ...prev, collections: updatedCollections }
        })
    }

    const editCollection = (collection) => {
        setSelectedCollection(collection)
        setShouldStartEditing(true) // Устанавливаем флаг
        setIsSingleCollectionOpen(true)
    }
    const totalFilms = user.collections.reduce((a, c) => a + (c.films || 0), 0)

    return (
        <div className="profile-page">
            {/* Скрытые инпуты для файлов */}
            <input type="file" ref={avatarInputRef} className="hidden-input" accept="image/*" onChange={handleAvatarChange} />
            <input type="file" ref={bannerInputRef} className="hidden-input" accept="image/*" onChange={handleBannerChange} />

            {/* Баннер */}
            <div
                className="profile-banner"
                style={{ backgroundImage: user.banner ? `url(${user.banner})` : 'url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop)' }}
            >
                <div className="banner-overlay"></div>
                <button className="banner-edit-btn" onClick={() => bannerInputRef.current.click()}>
                    <Image size={16} /> Изменить фон
                </button>
            </div>

            <div className="profile-container">
                {/* Шапка */}
                <div className="profile-header">
                    <div className="avatar-section">
                        <div className="profile-avatar" onClick={() => avatarInputRef.current.click()}>
                            {user.avatar ? <img src={user.avatar} alt="avatar" /> : <User size={36} />}
                        </div>
                        <button className="avatar-edit-btn" onClick={() => avatarInputRef.current.click()}>
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="profile-main-info">
                        <div className="name-row">
                            {isEditingName ? (
                                <div className="name-edit-input">
                                    <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="name-input" autoFocus onBlur={saveName} onKeyDown={(e) => e.key === 'Enter' && saveName()} />
                                    <button className="save-name-btn" onClick={saveName}>✓</button>
                                </div>
                            ) : (
                                <h1 className="profile-name" onClick={() => setIsEditingName(true)}>
                                    {user.name} <Edit3 size={18} className="edit-icon" />
                                </h1>
                            )}
                        </div>
                        <div className="profile-meta">
                            <span><Calendar size={14} /> Киноман с 2026</span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="action-btn secondary"><Share2 size={16} /> Поделиться</button>
                        <button className="action-btn primary"><Settings size={16} /> Настройки</button>
                    </div>
                </div>

                {/* Статистика - кликабельная */}
                <div className="stats-row">
                    <div className="stat-card clickable" onClick={() => setIsCollectionsViewerOpen(true)}>
                        <div className="stat-icon blue"><Film size={20} /></div>
                        <div className="stat-value">{totalFilms}</div>
                        <div className="stat-label">Фильмов в подборках</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><Film size={20} /></div>
                        <div className="stat-value">{user.collections.length}</div>
                        <div className="stat-label">Подборок создано</div>
                    </div>
                    <div className="stat-card clickable" onClick={() => setIsFavoritesViewerOpen(true)}>
                        <div className="stat-icon pink"><Heart size={20} /></div>
                        <div className="stat-value">{user.favorites?.length || 0}</div>
                        <div className="stat-label">В избранном</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><Clock size={20} /></div>
                        <div className="stat-value">186ч</div>
                        <div className="stat-label">Время просмотра</div>
                    </div>
                </div>

                {/* Сетка */}
                <div className="profile-grid">
                    <div className="profile-sidebar">
                        {/* Жанровые предпочтения */}
                        <div className="sidebar-card">
                            <h3 className="sidebar-title"><TrendingUp size={18} /> Жанровые предпочтения</h3>
                            <p className="sidebar-hint">Нажмите, чтобы добавить или убрать</p>
                            <div className="genre-cloud">
                                {allGenres.map(g => (
                                    <span
                                        key={g}
                                        className={`genre-tag ${user.genres?.includes(g) ? 'active' : ''}`}
                                        onClick={() => toggleGenre(g)}
                                    >
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Активность */}
                        <div className="sidebar-card">
                            <h3 className="sidebar-title"><TrendingUp size={18} /> Активность</h3>
                            <div className="activity-list">
                                <div className="activity-item"><span className="activity-dot blue"></span><div><p className="activity-text">Обновлена подборка <b>Вечерний релакс</b></p><span className="activity-time">2 часа назад</span></div></div>
                                <div className="activity-item"><span className="activity-dot purple"></span><div><p className="activity-text">Добавлен <b>Интерстеллар</b> в избранное</p><span className="activity-time">Вчера</span></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Подборки */}
                    <div className="profile-main">
                        <div className="collections-header">
                            <h2>Мои подборки</h2>
                            <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}><Plus size={18} /> Создать подборку</button>
                        </div>

                        {user.collections.length > 0 ? (
                            <div className="collections-grid">
                                {user.collections.map(col => (
                                    <motion.div
                                        key={col.id}
                                        className="collection-card clickable"
                                        style={{ background: col.gradient }}
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        onClick={() => openCollection(col)}
                                    >
                                        <div className="collection-overlay"></div>
                                        <div className="collection-content">
                                            <h3>{col.title}</h3>
                                            <p>{col.description || 'Без описания'}</p>
                                            <div className="collection-footer">
                                                <span className="film-count"><Film size={14} /> {col.films || 0} фильмов</span>
                                                <div className="collection-actions" onClick={(e) => e.stopPropagation()}>
                                                    <button title="Редактировать" onClick={() => editCollection(col)}><Pencil size={14} /></button>
                                                    <button title="Удалить" onClick={(e) => { e.stopPropagation(); deleteCollection(col.id); }}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-collections">
                                <Film size={48} opacity={0.3} />
                                <h3>Пока пусто</h3>
                                <p>Создайте первую подборку</p>
                                <button className="create-btn-empty" onClick={() => setIsCreateModalOpen(true)}><Plus size={16} /> Создать подборку</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Модалки */}
            <CreateCollectionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={addCollection} />

            <CollectionsViewerModal
                isOpen={isCollectionsViewerOpen}
                onClose={() => setIsCollectionsViewerOpen(false)}
                collections={user.collections}
                allMovies={allMovies}
                onMovieClick={onMovieClick}
            />

            <FavoritesViewerModal
                isOpen={isFavoritesViewerOpen}
                onClose={() => setIsFavoritesViewerOpen(false)}
                favorites={user.favorites || []}
                allMovies={allMovies}
                onMovieClick={onMovieClick}
            />

            <SingleCollectionModal
                isOpen={isSingleCollectionOpen}
                onClose={() => setIsSingleCollectionOpen(false)}
                // 🔥 Берём актуальные данные из user, а не из快照 selectedCollection
                collection={user.collections.find(c => c.id === selectedCollection?.id) || selectedCollection}
                allMovies={allMovies}
                onMovieClick={onMovieClick}
                onDelete={deleteCollection}
                onEdit={editCollection}
                onUpdate={updateCollection}
                startInEditMode={shouldStartEditing}
            />
        </div>
    )
}