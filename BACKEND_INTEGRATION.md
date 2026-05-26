# Интеграция с Go-бэкендом

## 🚀 Настройка

### 1. Запусти Go-бэкенд

```bash
cd /Users/vi.v.zhuravlev/GolandProjects/diplom-backend
go run cmd/server/main.go
```

Сервер запустится на `http://localhost:5454`

### 2. Проверь .env

Убедись, что в `/Users/vi.v.zhuravlev/GolandProjects/diplom-backend/.env` указан API ключ:

```env
KINOPOISK_API_KEY=твой_ключ
PORT=5454
```

## 📡 API Endpoints

Фронтенд делает запросы к Go-бэкенду, который проксирует их к Kinopoisk API:

```
Фронтенд → Go-бэкенд (localhost:5454) → Kinopoisk API
```

### Фильмы

| Функция | Endpoint | Описание |
|---------|----------|----------|
| `getFilmById(id)` | `GET /api/v1/movies/:id` | Фильм по ID |
| `getPopularFilms(page)` | `GET /api/v1/films/popular` | Популярные фильмы |
| `getUpcomingFilms(page)` | `GET /api/v1/films/upcoming` | Предстоящие премьеры |
| `getSimilarFilms(id)` | `GET /api/v1/movies/:id/similar` | Похожие фильмы |
| `searchFilms(query, page)` | `GET /api/v1/movies/search` | Поиск фильмов |
| `getRandomFilm()` | `GET /api/v1/movies/random` | Случайный фильм |
| `getFilmStaff(id)` | `GET /api/v1/movies/:id/staff` | Актёры и режиссёры |

### Актёры/Режиссёры

| Функция | Endpoint | Описание |
|---------|----------|----------|
| `searchActors(query, page)` | `GET /api/v1/actors/search` | Поиск актёров |
| `getPersonById(id)` | `GET /api/v1/persons/:id` | Данные персоны (включая фильмы) |
| `searchDirectors(query)` | `GET /api/v1/actors/search` | Поиск режиссёров* |

*`searchDirectors` фильтрует результаты `searchActors` по professionKey

### Другое

| Функция | Endpoint | Описание |
|---------|----------|----------|
| `getFilters()` | `GET /api/v1/genres` | Жанры и страны |
| `globalSearch(query)` | Комбинированный | Поиск по всем категориям |

## 🎯 Использование в компонентах

### Через хуки (рекомендуется)

```javascript
import { useFilm, usePopularFilms, useSearch } from './hooks/useKinopoisk.js';

// Популярные фильмы
function MovieCarousel() {
    const { data: films, loading, error } = usePopularFilms(1);
    
    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    
    return (
        <div>
            {films.map(film => (
                <div key={film.kinopoiskId}>
                    <h3>{film.nameRu || film.nameEn}</h3>
                    <p>Рейтинг: {film.ratingKinopoisk}</p>
                </div>
            ))}
        </div>
    );
}

// Фильм по ID
function MovieModal({ filmId }) {
    const { data: film, loading } = useFilm(filmId);
    const { data: similar } = useSimilarFilms(filmId);
    
    if (loading) return <div>Загрузка...</div>;
    if (!film) return null;
    
    return (
        <div>
            <h1>{film.nameRu}</h1>
            <p>{film.description}</p>
            <img src={film.posterUrl} alt={film.nameRu} />
        </div>
    );
}

// Поиск
function SearchDropdown() {
    const [query, setQuery] = useState('');
    const { data: { films, actors, directors }, loading } = useSearch(query);
    
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

### Напрямую через API функции

```javascript
import { getFilmById, getPopularFilms } from './services/api.js';

useEffect(() => {
    async function load() {
        const film = await getFilmById(301);
        console.log(film.nameRu); // Матрица
    }
    load();
}, []);
```

## 📊 Формат данных

### Фильм (KinopoiskFilm)

```javascript
{
    kinopoiskId: 301,              // ID фильма
    nameRu: "Матрица",             // Название на русском
    nameEn: "The Matrix",          // Название на английском
    nameOriginal: "The Matrix",    // Оригинальное название
    year: 1999,                    // Год выпуска
    filmLength: 136,               // Длительность в минутах
    ratingKinopoisk: 8.5,          // Рейтинг Кинопоиск
    ratingImdb: 8.7,               // Рейтинг IMDB
    description: "Жизнь Томаса...", // Описание
    posterUrl: "https://...",      // URL постера
    posterUrlPreview: "https://...", // URL превью
    countries: [{ country: "США" }], // Страны
    genres: [{ genre: "фантастика" }, { genre: "боевик" }], // Жанры
    type: "FILM",                  // Тип: FILM, TV_SERIES, etc.
    // ... остальные поля
}
```

### Персона (KinopoiskPersonResponse)

```javascript
{
    personId: 119448,              // ID персоны
    nameRu: "Киану Ривз",          // Имя на русском
    nameEn: "Keanu Reeves",        // Имя на английском
    sex: "MALE",                   // Пол
    growth: "186",                 // Рост в см
    birthday: "1964-09-02",        // Дата рождения
    birthplace: "Бейрут, Ливан",   // Место рождения
    profession: [                  // Профессии
        { professionText: "Актер", professionKey: "ACTOR" }
    ],
    films: [                       // Фильмография
        {
            filmId: 301,
            nameRu: "Матрица",
            professionKey: "ACTOR",
            releaseYear: 1999
        }
    ],
    facts: ["..."],                // Факты
    hasAwards: true,               // Есть ли награды
    // ... остальные поля
}
```

## 🛠 Утилиты

Используй хелперы из `src/utils/kinopoisk.js`:

```javascript
import { 
    formatDuration, 
    generateGradient, 
    getMainGenre, 
    getRating,
    getTitle,
    formatDate,
    getEmojiAvatar 
} from './utils/kinopoisk.js';

// Пример
const film = { filmLength: 136, kinopoiskId: 301, genres: [...] };

formatDuration(film.filmLength);  // "2ч 16м"
generateGradient(film.kinopoiskId); // CSS gradient
getMainGenre(film.genres);         // "фантастика"
getRating(film);                   // 8.5
getTitle(film);                    // "Матрица"
```

## 🔧 Обновление существующих компонентов

### MovieCarousel

**Было (заглушки):**
```javascript
function MovieCarousel({ movies = moviesData }) {
    // moviesData — массив заглушек
}
```

**Стало (API):**
```javascript
import { usePopularFilms } from './hooks/useKinopoisk.js';

function MovieCarousel() {
    const { data: movies, loading, error } = usePopularFilms(1);
    
    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    if (!movies?.length) return null;
    
    return movies.map(film => (
        <div key={film.kinopoiskId}>
            <h3>{film.nameRu || film.nameEn}</h3>
            <p>Рейтинг: {film.ratingKinopoisk}</p>
        </div>
    ));
}
```

### MovieModal

**Было:**
```javascript
function MovieModal({ movie }) {
    // movie.title, movie.year, movie.rating
}
```

**Стало:**
```javascript
function MovieModal({ filmId }) {
    const { data: film } = useFilm(filmId);
    
    if (!film) return null;
    
    return (
        <div>
            <h2>{film.nameRu}</h2>
            <p>{film.year} • {formatDuration(film.filmLength)}</p>
            <p>Рейтинг: {film.ratingKinopoisk}</p>
            <p>{film.description}</p>
        </div>
    );
}
```

## ⚠️ Важные замечания

### 1. Поля могут быть null

Kinopoisk API возвращает много nullable полей. Всегда проверяй:

```javascript
// ❌ Плохо
const title = film.nameRu;

// ✅ Хорошо
const title = film.nameRu || film.nameEn || 'Без названия';
```

### 2. ID называется kinopoiskId

```javascript
// ❌ Плохо
<div key={film.id}>

// ✅ Хорошо
<div key={film.kinopoiskId}>
```

### 3. Рейтинг в ratingKinopoisk

```javascript
// ❌ Плохо
const rating = film.rating;

// ✅ Хорошо
const rating = film.ratingKinopoisk || film.ratingImdb || 0;
```

### 4. Длительность в минутах

```javascript
import { formatDuration } from './utils/kinopoisk.js';

const duration = formatDuration(film.filmLength); // "2ч 16м"
```

## 🐛 Отладка

### Проверка соединения

```javascript
import { getPopularFilms } from './services/api.js';

useEffect(() => {
    getPopularFilms(1)
        .then(data => console.log('API работает:', data))
        .catch(err => console.error('Ошибка API:', err));
}, []);
```

### Логирование запросов

В `src/services/api.js` добавь:

```javascript
async function fetchApi(endpoint, options = {}) {
    console.log('API Request:', endpoint);
    // ... остальной код
}
```

## 📚 Ссылки

- Бэкенд: `/Users/vi.v.zhuravlev/GolandProjects/diplom-backend/README.md`
- Kinopoisk API: https://kinopoiskapiunofficial.tech/documentation/api
