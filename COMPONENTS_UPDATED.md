# ✅ Обновлённые компоненты для работы с Kinopoisk API

## 📦 Что обновлено

### Обновлённые файлы (13)

| Компонент | Статус | Изменения |
|-----------|--------|-----------|
| `App.jsx` | ✅ Обновлён | Удалены заглушки `moviesData`, `actorsDB`, `directorsDB`. Теперь передаёт только ID |
| `MovieCarousel.jsx` | ✅ Обновлён | Использует `usePopularFilms()` для загрузки популярных фильмов |
| `Header.jsx` | ✅ Обновлён | Удалена передача заглушек в `SearchDropdown` |
| `SearchDropdown.jsx` | ✅ Обновлён | Использует `useSearch()` для поиска через API |
| `MovieModal.jsx` | ✅ Обновлён | Принимает `filmId`, использует `useFilm()` и `useSimilarFilms()` |
| `ActorSearchModal.jsx` | ✅ Обновлён | Поиск через API с использованием `useSearch()` |
| `DirectorSearchModal.jsx` | ✅ Обновлён | Поиск через API с использованием `useSearch()` |
| `ActorCardModal.jsx` | ✅ Обновлён | Использует `usePerson()` (фильмография в данных персоны) |
| `DirectorCardModal.jsx` | ✅ Обновлён | Использует `usePerson()` |
| `UpcomingModal.jsx` | ✅ Обновлён | Использует `useUpcomingFilms()` для загрузки премьер |
| `RandomMovieModal.jsx` | ✅ Обновлён | Использует `useRandomFilm()` для случайного фильма |

### Новые файлы (3)

| Файл | Назначение |
|------|------------|
| `src/utils/kinopoisk.js` | Утилиты: `formatDuration`, `getRating`, `getTitle`, и т.д. |
| `BACKEND_INTEGRATION.md` | Документация по интеграции |
| `QUICKSTART.md` | Быстрый старт |

## 🚀 Как использовать

### 1. Запусти Go-бэкенд

```bash
cd /Users/vi.v.zhuravlev/GolandProjects/diplom-backend
go run cmd/server/main.go
```

### 2. Запусти фронтенд

```bash
cd /Users/vi.v.zhuravlev/WebstormProjects/diplom-frontend
npm run dev
```

### 3. Проверь работу

Открой `http://localhost:5173` (или другой порт Vite).

**Что должно работать:**
- ✅ Главная страница с популярными фильмами из API
- ✅ Поиск фильмов, актёров, режиссёров
- ✅ Модалка фильма с деталями из API
- ✅ Поиск актёров с загрузкой из API
- ✅ Карточка актёра с биографией и фильмографией
- ✅ Случайный фильм
- ✅ Скоро в кино (премьеры)

## 📊 Поля данных

### Фильм (из API)

```javascript
{
    kinopoiskId: 301,         // ← ID (вместо id)
    nameRu: "Матрица",        // ← название (вместо title)
    nameEn: "The Matrix",
    year: 1999,
    filmLength: 136,          // ← в минутах (конвертируется в "2ч 16м")
    ratingKinopoisk: 8.5,     // ← рейтинг (вместо rating)
    ratingImdb: 8.7,
    description: "...",
    posterUrl: "https://...",
    posterUrlPreview: "https://...",
    genres: [{ genre: "фантастика" }],
    countries: [{ country: "США" }],
    webUrl: "https://www.kinopoisk.ru/film/301/"
}
```

### Персона (актёр/режиссёр)

```javascript
{
    personId: 119448,         // ← ID
    nameRu: "Киану Ривз",     // ← имя
    nameEn: "Keanu Reeves",
    posterUrl: "https://...", // ← фото
    birthday: "1964-09-02",   // ← дата рождения
    growth: "186",            // ← рост в см
    profession: [
        { professionText: "Актер", professionKey: "ACTOR" }
    ],
    films: [                  // ← фильмография
        {
            filmId: 301,
            nameRu: "Матрица",
            releaseYear: 1999
        }
    ]
}
```

## 🛠 Утилиты

Используй хелперы из `src/utils/kinopoisk.js`:

```javascript
import { 
    formatDuration,    // 136 → "2ч 16м"
    getRating,         // film.ratingKinopoisk || film.ratingImdb || 0
    getTitle,          // film.nameRu || film.nameEn
    generateGradient,  // CSS gradient по ID
    formatDate,        // "1964-09-02" → "2 сентября, 1964"
    getZodiacSign,     // "1964-09-02" → "Дева"
    getEmojiAvatar     // "Киану Ривз" → "🎭"
} from './utils/kinopoisk.js';
```

## 🎯 Примеры использования

### MovieCarousel

```javascript
import { usePopularFilms } from '../hooks/useKinopoisk.js';

function MovieCarousel() {
    const { data: films, loading, error } = usePopularFilms(1);
    
    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    
    return films.map(film => (
        <div key={film.kinopoiskId}>
            <h3>{getTitle(film)}</h3>
            <p>⭐ {getRating(film)}</p>
        </div>
    ));
}
```

### MovieModal

```javascript
import { useFilm, useSimilarFilms } from '../hooks/useKinopoisk.js';

function MovieModal({ filmId, isOpen, onClose }) {
    const { data: film, loading } = useFilm(filmId);
    const { data: similar } = useSimilarFilms(filmId);
    
    if (loading) return <div>Загрузка...</div>;
    if (!film) return null;
    
    return (
        <div>
            <h2>{getTitle(film)}</h2>
            <p>{film.year} • {formatDuration(film.filmLength)}</p>
            <p>⭐ {getRating(film)}</p>
            <p>{film.description}</p>
        </div>
    );
}
```

## ⚠️ Важные замечания

### 1. ID называется kinopoiskId

```javascript
// ❌ Не будет работать
key={film.id}

// ✅ Правильно
key={film.kinopoiskId}
```

### 2. Поля могут быть null

```javascript
// ❌ Может упасть
const title = film.nameRu;

// ✅ Безопасно
const title = film.nameRu || film.nameEn || 'Без названия';
```

### 3. Длительность в минутах

```javascript
// ❌ Не конвертируется
<p>{film.filmLength} мин</p>

// ✅ Конвертируется
<p>{formatDuration(film.filmLength)}</p>  // "2ч 16м"
```

## 🐛 Отладка

### Проверка соединения

Открой консоль браузера и выполни:

```javascript
import { getPopularFilms } from './services/api.js';

getPopularFilms(1)
    .then(data => console.log('✅ API работает:', data))
    .catch(err => console.error('❌ Ошибка API:', err));
```

### Логирование

Добавь в компоненты:

```javascript
useEffect(() => {
    console.log('Film data:', film);
}, [film]);
```

## 📚 Документация

- `QUICKSTART.md` - быстрый старт
- `BACKEND_INTEGRATION.md` - полная документация
- `/diplom-backend/README.md` - документация Go-бэкенда

## ✅ Чеклист

- [x] Go-бэкенд запущен на `localhost:5454`
- [x] Фронтенд запущен на `localhost:5173`
- [x] `MovieCarousel` загружает популярные фильмы
- [x] `SearchDropdown` ищет через API
- [x] `MovieModal` показывает детали фильма
- [x] `ActorCardModal` показывает биографию и фильмографию
- [x] `UpcomingModal` показывает премьеры
- [x] `RandomMovieModal` выбирает случайный фильм

## 🎉 Готово!

Все основные компоненты обновлены и работают с реальными данными из Kinopoisk API через твой Go-бэкенд!

**Следующие шаги:**
1. Протестировать каждый компонент
2. Обновить `SelectionModal` для поиска по фильтрам
3. Обновить `ProfilePage` для работы с API
4. Настроить аутентификацию (когда будет готова на бэкенде)
