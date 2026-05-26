# Интеграция Kinopoisk Unofficial API

## 📋 Что сделано

### 1. Структура файлов

```
src/
├── api/
│   ├── openapi/
│   │   └── openapi.json          # Спецификация API
│   ├── adapters.js               # Адаптеры данных
│   └── README.md                 # Документация API
├── hooks/
│   ├── index.js                  # Экспорт хуков
│   └── useKinopoisk.js           # React хуки для API
├── services/
│   └── api.js                    # API сервис (обновлён)
└── constants/
    └── api.js                    # Константы API

.env.example                       # Шаблон для API ключа
MIGRATION.md                       # Руководство по миграции
```

### 2. API Функции (`src/services/api.js`)

#### Фильмы
- `getFilmById(id)` - фильм по ID
- `getPopularFilms(page)` - популярные фильмы
- `getTop250Films(page)` - топ 250
- `getPremieres(year, month)` - премьеры
- `getSimilarFilms(id)` - похожие фильмы
- `searchFilms(query, page)` - поиск фильмов
- `getFilmsByFilters(params)` - фильтр по параметрам
- `getFilmFacts(id)` - факты о фильме
- `getFilmVideos(id)` - трейлеры
- `getFilmReviews(id, page)` - рецензии

#### Актёры/Режиссёры
- `searchActors(query)` - поиск актёров
- `getActorById(id)` - информация об актёре
- `getActorFilmography(id)` - фильмография актёра
- `searchDirectors(query)` - поиск режиссёров
- `getDirectorById(id)` - информация о режиссёре
- `getDirectorFilmography(id)` - фильмография режиссёра

#### Другое
- `getFilters()` - жанры и страны для фильтров
- `globalSearch(query)` - глобальный поиск

### 3. React Хуки (`src/hooks/useKinopoisk.js`)

- `useFilm(filmId)` - загрузка фильма
- `usePopularFilms(page)` - популярные фильмы
- `useSearch(query, debounceMs)` - поиск с debounce
- `useActor(actorId)` - загрузка актёра
- `useDirector(directorId)` - загрузка режиссёра
- `useSimilarFilms(filmId)` - похожие фильмы
- `usePremieres(year, month)` - премьеры

### 4. Адаптеры (`src/api/adapters.js`)

Преобразуют данные из формата Kinopoisk API в формат приложения:

- `adaptFilm(kpFilm)` → Film
- `adaptFilms(films)` → Film[]
- `adaptActor(kpPerson)` → ActorDetails
- `adaptDirector(kpPerson)` → ActorDetails
- `adaptActorsSearch(kpResult)` → Actor[]
- `adaptDirectorsSearch(kpResult)` → Director[]
- `adaptPremiere(kpPremiere)` → Film

**Вспомогательные функции:**
- `formatDuration(minutes)` - "2ч 28м"
- `formatDate(dateString)` - "11 ноября, 1974"
- `calculateAge(birthday)` - возраст
- `getZodiacSign(birthday)` - знак зодиака
- `generateGradient(id)` - CSS градиент
- `getEmojiAvatar(name)` - эмодзи-аватар

## 🚀 Быстрый старт

### 1. Получить API ключ

1. Зарегистрироваться на https://kinopoiskapiunofficial.tech
2. Получить ключ в личном кабинете

### 2. Настроить проект

```bash
# В корне проекта
cp .env.example .env
```

Открыть `.env` и добавить ключ:
```env
VITE_KINOPOISK_API_KEY=ваш_ключ
```

### 3. Использовать в компонентах

```javascript
import { usePopularFilms } from './hooks/useKinopoisk.js';

function MovieCarousel() {
    const { data: movies, loading, error } = usePopularFilms(1);
    
    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    
    return (
        <div>
            {movies.map(movie => (
                <div key={movie.id}>{movie.title}</div>
            ))}
        </div>
    );
}
```

## 📊 Формат данных

### Film
```javascript
{
    id: 301,
    title: 'Матрица',
    year: 1999,
    rating: 8.5,
    duration: '2ч 16м',
    genre: 'фантастика',
    country: 'США',
    description: '...',
    gradient: 'linear-gradient(...)',
    posterUrl: 'https://...',
    posterUrlPreview: 'https://...',
    nameEn: 'The Matrix',
    type: 'FILM',
    genres: ['фантастика', 'боевик'],
    countries: ['США']
}
```

### Actor/ Director
```javascript
{
    id: 66539,
    name: 'Киану Ривз',
    avatar: '🎭',
    career: ['Актер', 'Продюсер'],
    height: '186 см',
    birthDate: '2 сентября, 1964',
    zodiac: 'Дева',
    age: 61,
    birthPlace: 'Бейрут, Ливан',
    genres: ['фантастика', 'боевик'],
    filmsCount: 120,
    filmsPeriod: '1985 — 2026',
    movies: [301, 302, ...]
}
```

## ⚠️ Ограничения API

- **20 запросов в секунду** - общий лимит
- **5 запросов в секунду** - для премьер и коллекций
- Дневные лимиты зависят от тарифа

## 📚 Документация

- `src/api/README.md` - полная документация API
- `MIGRATION.md` - руководство по миграции компонентов
- https://kinopoiskapiunofficial.tech/documentation/api - официальная документация

## 🔧 Следующие шаги

1. **Обновить компоненты** согласно `MIGRATION.md`
2. **Протестировать** каждый компонент с реальными данными
3. **Добавить кэширование** (React Query / SWR)
4. **Реализовать свой бэкенд** для пользовательских данных (подборки, избранное)

## 💡 Примеры использования

### Поиск с debounce
```javascript
import { useSearch } from './hooks/useKinopoisk.js';

function SearchDropdown() {
    const [query, setQuery] = useState('');
    const { data: { films, actors, directors }, loading } = useSearch(query);
    
    // ...
}
```

### Модалка фильма
```javascript
import { useFilm, useSimilarFilms } from './hooks/useKinopoisk.js';

function MovieModal({ filmId, isOpen }) {
    const { data: film, loading } = useFilm(filmId);
    const { data: similar } = useSimilarFilms(filmId);
    
    // ...
}
```

### Карточка актёра
```javascript
import { useActor } from './hooks/useKinopoisk.js';

function ActorCardModal({ actorId }) {
    const { data: actor, loading } = useActor(actorId);
    
    // actor.name, actor.birthDate, actor.filmsCount, ...
}
```
