import { useState } from 'react';
import { usePopularFilms, useFilm, useSearch, usePerson } from '../hooks/useKinopoisk.js';
import { formatDuration, getRating, getTitle, generateGradient } from '../utils/kinopoisk.js';

/**
 * Тестовый компонент для проверки интеграции с Go-бэкендом
 * Используй его для отладки перед интеграцией в основные компоненты
 */
export default function ApiTest() {
    const [selectedFilmId, setSelectedFilmId] = useState(301); // Матрица
    const [searchQuery, setSearchQuery] = useState('');
    
    // Тестируем разные хуки
    const { data: popularFilms, loading: popularLoading, error: popularError } = usePopularFilms(1);
    const { data: selectedFilm, loading: filmLoading } = useFilm(selectedFilmId);
    const { data: searchResults, loading: searchLoading } = useSearch(searchQuery);
    const { data: person } = usePerson(119448); // Киану Ривз

    return (
        <div style={{ padding: '20px', color: '#fff' }}>
            <h1>🧪 Тест API интеграции</h1>
            
            {/* Популярные фильмы */}
            <section style={{ marginBottom: '40px' }}>
                <h2>Популярные фильмы</h2>
                {popularLoading && <p>Загрузка...</p>}
                {popularError && <p style={{ color: 'red' }}>Ошибка: {popularError.message}</p>}
                {popularFilms?.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {popularFilms.slice(0, 6).map(film => (
                            <div 
                                key={film.kinopoiskId} 
                                onClick={() => setSelectedFilmId(film.kinopoiskId)}
                                style={{ 
                                    background: generateGradient(film.kinopoiskId),
                                    padding: '15px',
                                    borderRadius: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                <h3 style={{ margin: '0 0 10px 0' }}>{getTitle(film)}</h3>
                                <p style={{ margin: '5px 0' }}>{film.year}</p>
                                <p style={{ margin: '5px 0' }}>⭐ {getRating(film)}</p>
                                <p style={{ margin: '5px 0' }}>{formatDuration(film.filmLength)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            
            {/* Выбранный фильм */}
            {selectedFilm && (
                <section style={{ marginBottom: '40px' }}>
                    <h2>Выбранный фильм (ID: {selectedFilmId})</h2>
                    {filmLoading && <p>Загрузка...</p>}
                    {selectedFilm && (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            <img 
                                src={selectedFilm.posterUrlPreview} 
                                alt={getTitle(selectedFilm)}
                                style={{ width: '200px', borderRadius: '10px' }}
                            />
                            <div>
                                <h3>{getTitle(selectedFilm)}</h3>
                                <p><strong>Оригинальное:</strong> {selectedFilm.nameEn}</p>
                                <p><strong>Год:</strong> {selectedFilm.year}</p>
                                <p><strong>Длительность:</strong> {formatDuration(selectedFilm.filmLength)}</p>
                                <p><strong>Рейтинг КП:</strong> {selectedFilm.ratingKinopoisk}</p>
                                <p><strong>Рейтинг IMDB:</strong> {selectedFilm.ratingImdb}</p>
                                <p><strong>Жанры:</strong> {selectedFilm.genres?.map(g => g.genre).join(', ')}</p>
                                <p><strong>Страны:</strong> {selectedFilm.countries?.map(c => c.country).join(', ')}</p>
                                <p><strong>Описание:</strong> {selectedFilm.description?.slice(0, 200)}...</p>
                            </div>
                        </div>
                    )}
                </section>
            )}
            
            {/* Поиск */}
            <section style={{ marginBottom: '40px' }}>
                <h2>Поиск</h2>
                <input
                    type="text"
                    placeholder="Введите название фильма..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                        padding: '10px', 
                        fontSize: '16px', 
                        width: '100%',
                        maxWidth: '400px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                        borderRadius: '5px'
                    }}
                />
                {searchLoading && <p>Поиск...</p>}
                {searchResults?.films?.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Фильмы ({searchResults.films.length})</h3>
                        <ul>
                            {searchResults.films.slice(0, 5).map(film => (
                                <li key={film.kinopoiskId}>
                                    {getTitle(film)} ({film.year}) - {getRating(film)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {searchResults?.actors?.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Актёры ({searchResults.actors.length})</h3>
                        <ul>
                            {searchResults.actors.slice(0, 5).map(actor => (
                                <li key={actor.kinopoiskId}>
                                    {actor.nameRu || actor.nameEn}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
            
            {/* Персона */}
            <section style={{ marginBottom: '40px' }}>
                <h2>Персона (Киану Ривз, ID: 119448)</h2>
                {person && (
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <img 
                            src={person.posterUrl} 
                            alt={person.nameRu || person.nameEn}
                            style={{ width: '200px', borderRadius: '10px' }}
                        />
                        <div>
                            <h3>{person.nameRu || person.nameEn}</h3>
                            <p><strong>Дата рождения:</strong> {person.birthday}</p>
                            <p><strong>Рост:</strong> {person.growth} см</p>
                            <p><strong>Профессии:</strong> {person.profession?.map(p => p.professionText).join(', ')}</p>
                            <p><strong>Фильмов в фильмографии:</strong> {person.films?.length}</p>
                            <p><strong>Награды:</strong> {person.hasAwards ? 'Да' : 'Нет'}</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
