import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Edit3, Plus, Film, Pencil, Trash2,
    Heart, Bookmark, Clock, Share2, Settings,
    TrendingUp, Calendar, MapPin, Camera, Image,
    ChevronRight, X, Star, LogOut
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CreateCollectionModal from './CreateCollectionModal'
import CollectionsViewerModal from './CollectionsViewerModal'
import FavoritesViewerModal from './FavoritesViewerModal'
import SingleCollectionModal from './SingleCollectionModal'
import { logout } from '../services/auth'


export default function ProfilePage({
                                        user, setUser, isLoggedIn, onMovieClick,
                                        onActorClick, onDirectorClick
                                    }) {
    const navigate = useNavigate()
    const avatarInputRef = useRef(null)
    const bannerInputRef = useRef(null)
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempName, setTempName] = useState(user.name)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isCollectionsViewerOpen, setIsCollectionsViewerOpen] = useState(false)
    const [isFavoritesViewerOpen, setIsFavoritesViewerOpen] = useState(false)
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [isSingleCollectionOpen, setIsSingleCollectionOpen] = useState(false)

    // 🔥 Вкладка избранного
    const [favoritesTab, setFavoritesTab] = useState('movies') // 'movies' | 'actors' | 'directors'
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const collectionId = params.get('collection');

        if (collectionId && user.collections.length > 0) {
            const target = user.collections.find(c => c.id === Number(collectionId));
            if (target) {
                setTimeout(() => {
                    openCollection(target);
                    // Очистить параметр из URL
                    window.history.replaceState({}, '', window.location.pathname);
                }, 500);
            }
        }
    }, [user.collections]);

    const allGenres = ['Драма', 'Фантастика', 'Триллер', 'Комедия', 'Боевик', 'Ужасы', 'Мелодрама', 'Детектив', 'Анимация', 'Документальный']

    // Выход из аккаунта
    const handleLogout = async () => {
        try {
            await logout()
            navigate('/')
            window.location.reload()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

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

    const openCollection = (collection) => {
        setSelectedCollection(collection)
        setIsSingleCollectionOpen(false)
        setIsSingleCollectionOpen(true)
    }

    const deleteCollection = (collectionId) => {
        if (window.confirm('Удалить эту подборку?')) {
            setUser(prev => ({
                ...prev,
                collections: prev.collections.filter(c => c.id !== collectionId)
            }))
            setIsSingleCollectionOpen(false)
        }
    }

    const editCollection = (collection) => {
        alert(`Редактирование: ${collection.title}\n(Функция в разработке)`)
    }

    // 🔥 Обновление подборки
    const updateCollection = (collectionId, updates) => {
        setUser(prev => ({
            ...prev,
            collections: prev.collections.map(c =>
                c.id === collectionId ? { ...c, ...updates, films: updates.movieIds?.length || c.films } : c
            )
        }))
    }

    // 🔥 Удаление из избранного
    const removeFromFavorites = (type, id) => {
        if (type === 'movie') {
            setUser(prev => ({
                ...prev,
                favoriteMovies: (prev.favoriteMovies || []).filter(mid => mid !== id)
            }))
        } else if (type === 'actor') {
            setUser(prev => ({
                ...prev,
                favoriteActors: (prev.favoriteActors || []).filter(aid => aid !== id)
            }))
        } else if (type === 'director') {
            setUser(prev => ({
                ...prev,
                favoriteDirectors: (prev.favoriteDirectors || []).filter(did => did !== id)
            }))
        }
    }

    const totalFilms = user.collections.reduce((a, c) => a + (c.films || 0), 0)

    // 🔥 Избранные элементы (показываем только количество, т.к. данные из API)
    const favoriteMoviesCount = (user.favoriteMovies || []).length
    const favoriteActorsCount = (user.favoriteActors || []).length
    const favoriteDirectorsCount = (user.favoriteDirectors || []).length

    return (
        <div className="profile-page">
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
                            <span><Calendar size={14} /> Киноман с 2024</span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="action-btn secondary"><Share2 size={16} /> Поделиться</button>
                        <button className="action-btn primary"><Settings size={16} /> Настройки</button>
                        {isLoggedIn && (
                            <button className="action-btn danger" onClick={handleLogout}>
                                <LogOut size={16} /> Выйти
                            </button>
                        )}
                    </div>
                </div>

                {/* Статистика */}
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
                        <div className="stat-value">{(user.favoriteMovies?.length || 0) + (user.favoriteActors?.length || 0) + (user.favoriteDirectors?.length || 0)}</div>
                        <div className="stat-label">Всего в избранном</div>
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

                    {/* Правая колонка: Подборки + Избранное */}
                    <div className="profile-main">
                        {/* Подборки */}
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
                                                    {/* 🔥 НОВАЯ КНОПКА ПОДЕЛИТЬСЯ */}
                                                    <button
                                                        title="Поделиться подборкой"
                                                        className="action-share-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(`${window.location.origin}/profile?collection=${col.id}`)
                                                                .then(() => {
                                                                    // Визуальная обратная связь
                                                                    const btn = e.currentTarget;
                                                                    const original = btn.innerHTML;
                                                                    btn.innerHTML = '✓';
                                                                    btn.style.background = 'rgba(16, 185, 129, 0.3)';
                                                                    btn.style.color = '#10b981';
                                                                    setTimeout(() => {
                                                                        btn.innerHTML = original;
                                                                        btn.style.background = '';
                                                                        btn.style.color = '';
                                                                    }, 1500);
                                                                });
                                                        }}
                                                    >
                                                        <Share2 size={14} />
                                                    </button>
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

                        {/* 🔥 НОВЫЙ БЛОК: В ИЗБРАННОМ */}
                        <div className="favorites-section">
                            <div className="favorites-header">
                                <h2><Heart size={20} fill="#ec4899" color="#ec4899" /> В избранном</h2>
                                <div className="favorites-tabs">
                                    <button
                                        className={`fav-tab ${favoritesTab === 'movies' ? 'active' : ''}`}
                                        onClick={() => setFavoritesTab('movies')}
                                    >
                                        Фильмы ({favoriteMoviesCount})
                                    </button>
                                    <button
                                        className={`fav-tab ${favoritesTab === 'actors' ? 'active' : ''}`}
                                        onClick={() => setFavoritesTab('actors')}
                                    >
                                        Актёры ({favoriteActorsCount})
                                    </button>
                                    <button
                                        className={`fav-tab ${favoritesTab === 'directors' ? 'active' : ''}`}
                                        onClick={() => setFavoritesTab('directors')}
                                    >
                                        Режиссёры ({favoriteDirectorsCount})
                                    </button>
                                </div>
                            </div>

                            <div className="favorites-content">
                                {/* Фильмы */}
                                {favoritesTab === 'movies' && (
                                    <div className="favorites-grid">
                                        {favoriteMoviesCount > 0 ? (
                                            <button className="view-favorites-btn" onClick={() => setIsFavoritesViewerOpen(true)}>
                                                <Heart size={20} fill="#ec4899" color="#ec4899" />
                                                <span>Посмотреть {favoriteMoviesCount} избранных фильмов</span>
                                            </button>
                                        ) : (
                                            <p className="favorites-empty">Нет избранных фильмов</p>
                                        )}
                                    </div>
                                )}

                                {/* Актёры */}
                                {favoritesTab === 'actors' && (
                                    <div className="favorites-grid">
                                        {favoriteActorsCount > 0 ? (
                                            <button className="view-favorites-btn" onClick={() => setIsFavoritesViewerOpen(true)}>
                                                <User size={20} />
                                                <span>Посмотреть {favoriteActorsCount} избранных актёров</span>
                                            </button>
                                        ) : (
                                            <p className="favorites-empty">Нет избранных актёров</p>
                                        )}
                                    </div>
                                )}

                                {/* Режиссёры */}
                                {favoritesTab === 'directors' && (
                                    <div className="favorites-grid">
                                        {favoriteDirectorsCount > 0 ? (
                                            <button className="view-favorites-btn" onClick={() => setIsFavoritesViewerOpen(true)}>
                                                <Clapperboard size={20} />
                                                <span>Посмотреть {favoriteDirectorsCount} избранных режиссёров</span>
                                            </button>
                                        ) : (
                                            <p className="favorites-empty">Нет избранных режиссёров</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модалки */}
            <CreateCollectionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={addCollection} />

            <CollectionsViewerModal
                isOpen={isCollectionsViewerOpen}
                onClose={() => setIsCollectionsViewerOpen(false)}
                collections={user.collections}
            />

            <FavoritesViewerModal
                isOpen={isFavoritesViewerOpen}
                onClose={() => setIsFavoritesViewerOpen(false)}
                favoriteMovies={user.favoriteMovies || []}
                favoriteActors={user.favoriteActors || []}
                favoriteDirectors={user.favoriteDirectors || []}
                onMovieClick={onMovieClick}
                onActorClick={onActorClick}
                onDirectorClick={onDirectorClick}
            />

            <SingleCollectionModal
                isOpen={isSingleCollectionOpen}
                onClose={() => setIsSingleCollectionOpen(false)}
                collection={user.collections.find(c => c.id === selectedCollection?.id) || selectedCollection}
                allMovies={allMovies}
                onMovieClick={onMovieClick}
                onDelete={deleteCollection}
                onEdit={editCollection}
                onUpdate={updateCollection}
            />
        </div>
    )
}