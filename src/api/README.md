# Kinopoisk API Integration

## Настройка

### 1. Получение API ключа

1. Зарегистрируйся на https://kinopoiskapiunofficial.tech
2. Получи API ключ в личном кабинете
3. Создай файл `.env` в корне проекта:

```bash
cp .env.example .env
```

4. Вставь свой ключ в `.env`:

```env
VITE_KINOPOISK_API_KEY=your_api_key_here
```

### 2. Ограничения API

- **20 запросов в секунду** - общий лимит
- **5 запросов в секунду** - для некоторых эндпоинтов (премьеры, коллекции)
- Лимиты на дневное/общее количество запросов зависят от тарифа

## API Endpoints

### Фильмы

```javascript
import { 
    getFilmById, 
    getPopularFilms, 
    getTop250Films,
    getPremieres,
    getSimilarFilms,
    searchFilms,
    getFilmsByFilters,
    getFilmFacts,
    getFilmVideos,
    getFilmReviews
} from './services/api.js';

// Получить фильм по ID
const film = await getFilmById(301); // Матрица

// Получить популярные фильмы
const popular = await getPopularFilms(1); // page = 1

// Получить топ 250 фильмов
const top250 = await getTop250Films(1);

// Получить премьеры (июнь 2026)
const premieres = await getPremieres(2026, 'JUNE');

// Похожие фильмы
const similar = await getSimilarFilms(301);

// Поиск фильмов
const { films, totalPages } = await searchFilms('Мстители', 1);

// Фильмы по фильтрам
const { films, total } = await getFilmsByFilters({
    genres: '1', // ID жанра
    countries: '1', // ID страны
    yearFrom: 2020,
    yearTo: 2026,
    rating: 7,
    page: 1
});

// Факты о фильме
const facts = await getFilmFacts(301);

// Трейлеры и видео
const videos = await getFilmVideos(301);

// Рецензии
const reviews = await getFilmReviews(301, 1);
```

### Актёры

```javascript
import { 
    searchActors, 
    getActorById, 
    getActorFilmography 
} from './services/api.js';

// Поиск актёров
const actors = await searchActors('ДиКаприо');

// Информация об актёре
const actor = await getActorById(66539);

// Фильмография актёра
const filmography = await getActorFilmography(66539);
```

### Режиссёры

```javascript
import { 
    searchDirectors, 
    getDirectorById, 
    getDirectorFilmography 
} from './services/api.js';

// Поиск режиссёров
const directors = await searchDirectors('Нолан');

// Информация о режиссёре
const director = await getDirectorById(66539);

// Фильмография режиссёра
const filmography = await getDirectorFilmography(66539);
```

### Глобальный поиск

```javascript
import { globalSearch } from './services/api.js';

// Поиск по всем категориям
const results = await globalSearch('Мстители');
// results = { films: [...], actors: [...], directors: [...] }
```

### Фильтры (жанры, страны)

```javascript
import { getFilters } from './services/api.js';

const { genres, countries } = await getFilters();
// genres: [{id: 1, genre: 'боевик'}, ...]
// countries: [{id: 1, country: 'США'}, ...]
```

## Формат данных

### Фильм (Film)

```javascript
{
    id: 301,                    // Kinopoisk ID
    title: 'Матрица',           // Название на русском
    year: 1999,                 // Год выпуска
    rating: 8.5,                // Рейтинг Кинопоиск
    duration: '2ч 16м',         // Длительность
    genre: 'фантастика',        // Основной жанр
    country: 'США',             // Страна
    description: '...',         // Описание
    gradient: '...',            // CSS градиент (для UI)
    posterUrl: '...',           // URL постера
    posterUrlPreview: '...',    // URL превью постера
    nameEn: 'The Matrix',       // Название на английском
    type: 'FILM',               // Тип: FILM, TV_SERIES, etc.
    genres: ['фантастика', 'боевик'], // Все жанры
    countries: ['США'],         // Все страны
}
```

### Актёр/Режиссёр (ActorDetails)

```javascript
{
    id: 66539,                  // Kinopoisk ID
    name: 'Киану Ривз',         // Имя
    avatar: '🎭',               // Эмодзи-аватар
    career: ['Актер', 'Продюсер'], // Профессии
    height: '186 см',           // Рост
    birthDate: '2 сентября, 1964', // Дата рождения
    zodiac: 'Дева',             // Знак зодиака
    age: 61,                    // Возраст
    birthPlace: 'Бейрут, Ливан', // Место рождения
    genres: ['фантастика', 'боевик'], // Жанры фильмов
    filmsCount: 120,            // Количество фильмов
    filmsPeriod: '1985 — 2026', // Период карьеры
    movies: [301, 302, ...],    // ID фильмов в базе
    sex: 'MALE',                // Пол
    facts: ['...'],             // Факты
    hasAwards: 1,               // Есть ли награды
}
```

## Адаптеры

Все данные из Kinopoisk API проходят через адаптеры, которые преобразуют их в удобный для приложения формат:

- `adaptFilm()` - преобразует данные фильма
- `adaptActor()` - преобразует данные актёра
- `adaptDirector()` - преобразует данные режиссёра
- `adaptPremiere()` - преобразует данные премьеры
- `adaptFilms()` - преобразует массив фильмов

Файл адаптеров: `src/api/adapters.js`

## Обработка ошибок

```javascript
try {
    const film = await getFilmById(301);
} catch (error) {
    if (error.message.includes('404')) {
        console.error('Фильм не найден');
    } else if (error.message.includes('429')) {
        console.error('Слишком много запросов, подождите');
    } else if (error.message.includes('401')) {
        console.error('Неверный API ключ');
    } else {
        console.error('Ошибка API:', error.message);
    }
}
```

## Примеры использования в компонентах

### MovieCarousel

```javascript
import { useEffect, useState } from 'react';
import { getPopularFilms } from './services/api.js';
import MovieCarousel from './components/MovieCarousel';

function HomePage() {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        getPopularFilms(1).then(setMovies).catch(console.error);
    }, []);

    return <MovieCarousel movies={movies} />;
}
```

### MovieModal

```javascript
import { useEffect, useState } from 'react';
import { getFilmById, getSimilarFilms } from './services/api.js';

function MovieModal({ filmId, isOpen, onClose }) {
    const [film, setFilm] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!filmId || !isOpen) return;

        async function loadFilm() {
            try {
                const [filmData, similarData] = await Promise.all([
                    getFilmById(filmId),
                    getSimilarFilms(filmId),
                ]);
                setFilm(filmData);
                setSimilar(similarData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadFilm();
    }, [filmId, isOpen]);

    if (loading) return <div>Загрузка...</div>;
    if (!film) return null;

    return (
        <div>
            <h2>{film.title}</h2>
            <p>{film.description}</p>
            {/* ... остальной UI ... */}
        </div>
    );
}
```

### SearchDropdown

```javascript
import { useState, useEffect } from 'react';
import { globalSearch } from './services/api.js';

function SearchDropdown({ onMovieClick, onActorClick, onDirectorClick }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ films: [], actors: [], directors: [] });

    useEffect(() => {
        if (query.length < 2) return;

        const timer = setTimeout(() => {
            globalSearch(query).then(setResults).catch(console.error);
        }, 300); // Debounce 300ms

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div>
            <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск..."
            />
            {/* Результаты поиска */}
        </div>
    );
}
```

## Миграция с заглушек

### До (заглушки):

```javascript
const moviesData = [
    { id: 1, title: 'Начало', year: 2010, rating: 8.8, ... }
];
```

### После (API):

```javascript
import { getPopularFilms } from './services/api.js';

const [movies, setMovies] = useState([]);

useEffect(() => {
    getPopularFilms().then(setMovies);
}, []);
```

## Полезные ссылки

- Документация API: https://kinopoiskapiunofficial.tech/documentation/api
- Swagger UI: https://kinopoiskapiunofficial.tech/swagger-ui/index.html
- Тарифы: https://kinopoiskapiunofficial.tech/rates
