# Руководство по миграции на Kinopoisk API

## Что уже готово

✅ **API сервис** (`src/services/api.js`)
- Все функции для работы с Kinopoisk API
- Автоматическая обработка ошибок
- Адаптация данных в формат приложения

✅ **Адаптеры** (`src/api/adapters.js`)
- Преобразование данных из формата Kinopoisk в формат приложения
- Вспомогательные функции (форматирование дат, градиенты, эмодзи)

✅ **Хуки** (`src/hooks/useKinopoisk.js`)
- `useFilm()` - загрузка фильма по ID
- `usePopularFilms()` - популярные фильмы
- `useSearch()` - поиск с debounce
- `useActor()` - загрузка актёра
- `useDirector()` - загрузка режиссёра
- `useSimilarFilms()` - похожие фильмы
- `usePremieres()` - премьеры

✅ **Конфигурация**
- `.env.example` - шаблон для API ключа
- `.gitignore` - добавлен .env

## Что нужно сделать

### 1. Настроить API ключ

```bash
# В корне проекта
cp .env.example .env
```

Открыть `.env` и вставить API ключ:
```env
VITE_KINOPOISK_API_KEY=ваш_ключ_с_kinopoiskapiunofficial.tech
```

### 2. Обновить компоненты

#### MovieCarousel (Главная страница)

**Было:**
```javascript
import { moviesData } from '../App.jsx';

function MovieCarousel({ movies = moviesData }) {
    // ...
}
```

**Стало:**
```javascript
import { usePopularFilms } from '../hooks/useKinopoisk.js';

function MovieCarousel() {
    const { data: movies, loading, error } = usePopularFilms(1);
    
    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    if (!movies?.length) return null;
    
    // ... остальной код
}
```

#### MovieModal (Модалка фильма)

**Было:**
```javascript
function MovieModal({ movie, isOpen, onClose, allMovies }) {
    // movie - объект из заглушек
}
```

**Стало:**
```javascript
import { useFilm, useSimilarFilms } from '../hooks/useKinopoisk.js';

function MovieModal({ filmId, isOpen, onClose }) {
    const { data: film, loading } = useFilm(filmId);
    const { data: similar } = useSimilarFilms(filmId);
    
    if (!isOpen || !filmId) return null;
    if (loading) return <LoadingModal />;
    if (!film) return null;
    
    // Используем film вместо movie
    return (
        <div>
            <h2>{film.title}</h2>
            <p>{film.description}</p>
            {/* ... */}
        </div>
    );
}
```

#### Header (Поиск)

**Было:**
```javascript
import { actorsDB, directorsDB } from '../App.jsx';

function Header({ allMovies, onMovieClick, onActorClick, onDirectorClick }) {
    // ...
}
```

**Стало:**
```javascript
import { useSearch } from '../hooks/useKinopoisk.js';

function Header({ onMovieClick, onActorClick, onDirectorClick }) {
    const [query, setQuery] = useState('');
    const { data: results, loading } = useSearch(query);
    
    // results.films, results.actors, results.directors
    // ...
}
```

#### ActorSearchModal

**Было:**
```javascript
const actorsDB = [
    { id: 1, name: 'Леонардо ДиКаприо', movies: [1, 2, 7] },
    // ...
];
```

**Стало:**
```javascript
import { useSearch } from '../hooks/useKinopoisk.js';

function ActorSearchModal({ isOpen, onClose, onActorClick }) {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: { actors }, loading } = useSearch(searchQuery);
    
    // actors - массив из API
    // ...
}
```

#### DirectorSearchModal

Аналогично ActorSearchModal, но используем `results.directors`.

#### ActorCardModal

**Было:**
```javascript
const actorsDetails = {
    1: { id: 1, name: 'Леонардо ДиКаприо', /* ... */ },
    // ...
};
```

**Стало:**
```javascript
import { useActor } from '../hooks/useKinopoisk.js';

function ActorCardModal({ isOpen, onClose, actorId }) {
    const { data: actor, loading } = useActor(actorId);
    
    if (!isOpen || !actorId) return null;
    if (loading) return <LoadingModal />;
    if (!actor) return null;
    
    // Используем actor из API
    // actor.name, actor.birthDate, actor.filmsCount, etc.
}
```

#### DirectorCardModal

Аналогично ActorCardModal, но используем `useDirector()`.

#### UpcomingModal

**Было:**
```javascript
const upcomingMovies = allMovies.slice(0, 10).map(movie => ({
    ...movie,
    premiereDate: new Date(2026, 5 + index, 10 + index * 3)
}));
```

**Стало:**
```javascript
import { usePremieres } from '../hooks/useKinopoisk.js';

function UpcomingModal({ isOpen, onClose }) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11
    
    // Преобразуем месяц в формат API
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    
    const { data: premieres, loading } = usePremieres(currentYear, months[currentMonth]);
    
    if (loading) return <LoadingModal />;
    if (!premieres?.length) return <EmptyModal />;
    
    // Используем premieres из API
}
```

#### SelectionModal (Подбор фильма)

**Было:**
```javascript
const filteredMovies = allMovies.filter(movie => {
    if (formData.genre && movie.genre !== formData.genre) return false;
    // ...
});
```

**Стало:**
```javascript
import { getFilmsByFilters, getFilters } from '../services/api.js';

function SelectionModal({ isOpen, onClose }) {
    const [filters, setFilters] = useState(null);
    const [filteredMovies, setFilteredMovies] = useState([]);
    
    // Загружаем список жанров и стран
    useEffect(() => {
        getFilters().then(setFilters).catch(console.error);
    }, []);
    
    const handlePick = async () => {
        const params = {
            genres: formData.genre?.id, // ID жанра из API
            countries: formData.country?.id, // ID страны из API
            yearFrom: formData.yearRange[0],
            yearTo: formData.yearRange[1],
            rating: formData.rating === 'high' ? 7 : undefined,
        };
        
        const { films } = await getFilmsByFilters(params);
        setFilteredMovies(films);
    };
    
    // ...
}
```

#### ProfilePage

**Важно:** ProfilePage использует локальное состояние пользователя (подборки, избранное). 
Эти данные **не хранятся в Kinopoisk API**, поэтому:

1. **Подборки и избранное** - храним локально (localStorage или свой бэкенд)
2. **Фильмы, актёры, режиссёры** - загружаем из Kinopoisk API

```javascript
import { useFilm, useActor, useDirector } from '../hooks/useKinopoisk.js';

// Для отображения фильмов в подборках
const { data: film } = useFilm(movieId);

// Для отображения актёров в избранном
const { data: actor } = useActor(actorId);
```

#### AuthModal

Kinopoisk API **не предоставляет** аутентификацию пользователей. 
AuthModal остаётся без изменений, но данные пользователя храним локально.

### 3. Обновить App.jsx

**Было:**
```javascript
const moviesData = [ /* 8 фильмов */ ];
const actorsDB = [ /* 10 актёров */ ];
const directorsDB = [ /* 6 режиссёров */ ];

function App() {
    // ...
    <MovieCarousel movies={moviesData} />
    // ...
}
```

**Стало:**
```javascript
function App() {
    // Заглушки больше не нужны, данные загружаются из API
    
    return (
        <Router>
            {/* ... */}
            <MovieCarousel /> {/* Данные загружаются внутри компонента */}
            {/* ... */}
        </Router>
    );
}
```

### 4. Проверка типов данных

После миграции проверь, что все компоненты правильно используют новые данные:

**Фильм:**
- ✅ `film.title` (было `movie.title`)
- ✅ `film.year` (было `movie.year`)
- ✅ `film.rating` (было `movie.rating`)
- ✅ `film.duration` (было `movie.duration`)
- ✅ `film.genre` (было `movie.genre`)
- ✅ `film.description` (было `movie.description`)
- ✅ `film.posterUrl` (новое поле)
- ✅ `film.gradient` (генерируется адаптером)

**Актёр:**
- ✅ `actor.name` (было `actor.name`)
- ✅ `actor.birthDate` (новое поле)
- ✅ `actor.age` (новое поле)
- ✅ `actor.filmsCount` (новое поле)
- ✅ `actor.movies` (массив ID фильмов)

## Чеклист миграции

- [ ] Настроить `.env` с API ключом
- [ ] Обновить `MovieCarousel`
- [ ] Обновить `MovieModal`
- [ ] Обновить `Header` (поиск)
- [ ] Обновить `ActorSearchModal`
- [ ] Обновить `DirectorSearchModal`
- [ ] Обновить `ActorCardModal`
- [ ] Обновить `DirectorCardModal`
- [ ] Обновить `UpcomingModal`
- [ ] Обновить `SelectionModal`
- [ ] Обновить `ProfilePage` (частично)
- [ ] Протестировать каждый компонент
- [ ] Проверить обработку ошибок
- [ ] Проверить loading states

## Возможные проблемы

### 1. Слишком много запросов (429)

**Решение:** Добавить кэширование или увеличить задержку между запросами.

```javascript
// В useSearch увеличить debounce
const { data } = useSearch(query, 500); // 500ms вместо 300ms
```

### 2. Нет данных для отображения

**Решение:** Проверить, что API ключ активен и есть лимиты.

```javascript
if (error?.message?.includes('401')) {
    return <div>Ошибка API ключа</div>;
}
```

### 3. Компонент мигает при загрузке

**Решение:** Добавить скелетоны или спиннеры.

```javascript
if (loading) return <SkeletonLoader />;
```

## Следующие шаги

1. **Кэширование:** Добавить React Query или SWR для кэширования запросов
2. **Свой бэкенд:** Для хранения пользовательских данных (подборки, избранное, профиль)
3. **Пагинация:** Добавить бесконечный скролл для списков фильмов
4. **Избранные:** Реализовать хранение избранного в localStorage
