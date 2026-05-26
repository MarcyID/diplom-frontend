# 🚀 Быстрый старт - Интеграция с Go-бэкендом

## Шаг 1: Запусти Go-бэкенд

```bash
cd /Users/vi.v.zhuravlev/GolandProjects/diplom-backend
go run cmd/server/main.go
```

✅ Сервер запустится на `http://localhost:5454`

## Шаг 2: Запусти фронтенд

```bash
cd /Users/vi.v.zhuravlev/WebstormProjects/diplom-frontend
npm run dev
```

✅ Фронтенд запустится на `http://localhost:5173` (или другой порт Vite)

## Шаг 3: Проверь интеграцию

### Вариант A: Через ApiTest компонент

Добавь в `App.jsx`:

```javascript
import ApiTest from './components/ApiTest.jsx';

function App() {
    return <ApiTest />;
}
```

Открой браузер → увидишь тестовую страницу с:
- Популярными фильмами
- Деталиями выбранного фильма
- Поиском
- Информацией о персоне (Киану Ривз)

### Вариант B: Через консоль браузера

Открой DevTools → Console и выполни:

```javascript
import { getPopularFilms, getFilmById } from './services/api.js';

// Популярные фильмы
getPopularFilms(1).then(console.log).catch(console.error);

// Фильм по ID
getFilmById(301).then(console.log).catch(console.error);
```

## Шаг 4: Интегрируй в свои компоненты

### MovieCarousel

```javascript
import { usePopularFilms } from './hooks/useKinopoisk.js';

function MovieCarousel() {
    const { data: films, loading, error } = usePopularFilms(1);
    
    if (loading) return <div>Загрузка фильмов...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    
    return (
        <div className="carousel">
            {films.map(film => (
                <div key={film.kinopoiskId} className="movie-card">
                    <h3>{film.nameRu || film.nameEn}</h3>
                    <p>⭐ {film.ratingKinopoisk}</p>
                </div>
            ))}
        </div>
    );
}
```

### MovieModal

```javascript
import { useFilm } from './hooks/useKinopoisk.js';
import { formatDuration, getRating } from './utils/kinopoisk.js';

function MovieModal({ filmId, onClose }) {
    const { data: film, loading } = useFilm(filmId);
    
    if (loading) return <div>Загрузка...</div>;
    if (!film) return null;
    
    return (
        <div className="modal">
            <h2>{film.nameRu}</h2>
            <p>{film.year} • {formatDuration(film.filmLength)}</p>
            <p>Рейтинг: {getRating(film)}</p>
            <p>{film.description}</p>
            <button onClick={onClose}>Закрыть</button>
        </div>
    );
}
```

## 📝 Поля данных

### Фильм
```javascript
film.kinopoiskId      // ID (вместо film.id)
film.nameRu           // Название на русском (вместо film.title)
film.nameEn           // Название на английском
film.year             // Год
film.filmLength       // Длительность в минутах
film.ratingKinopoisk  // Рейтинг КП (вместо film.rating)
film.ratingImdb       // Рейтинг IMDB
film.description      // Описание
film.posterUrl        // URL постера
film.genres           // [{ genre: "фантастика" }, ...]
film.countries        // [{ country: "США" }, ...]
```

### Персона (актёр/режиссёр)
```javascript
person.personId       // ID
person.nameRu         // Имя на русском
person.nameEn         // Имя на английском
person.birthday       // Дата рождения (YYYY-MM-DD)
person.growth         // Рост (см)
person.profession     // [{ professionText, professionKey }, ...]
person.films          // Фильмография
person.posterUrl      // Фото
```

## 🛠 Утилиты

```javascript
import { 
    formatDuration,    // 136 → "2ч 16м"
    getRating,         // film.ratingKinopoisk || film.ratingImdb || 0
    getTitle,          // film.nameRu || film.nameEn
    generateGradient,  // CSS gradient по ID
    formatDate,        // "1964-09-02" → "2 сентября, 1964"
    getEmojiAvatar     // Эмодзи по имени
} from './utils/kinopoisk.js';
```

## 🐛 Отладка

### Бэкенд не отвечает?

1. Проверь, что Go-сервер запущен
2. Проверь `.env` в бэкенде:
   ```env
   KINOPOISK_API_KEY=твой_ключ
   PORT=5454
   ```
3. Открой `http://localhost:5454/api/v1/films/popular?page=1` в браузере

### Ошибка CORS?

Добавь в Go-бэкенд (router.go):

```go
router.Use(func(c *gin.Context) {
    c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
    c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    if c.Request.Method == "OPTIONS" {
        c.AbortWithStatus(204)
        return
    }
    c.Next()
})
```

### Пустые данные?

Проверь, что API ключ действителен:

```bash
curl -H "X-API-KEY: твой_ключ" \
     https://kinopoiskapiunofficial.tech/api/v2.2/films/301
```

## 📚 Документация

- `BACKEND_INTEGRATION.md` - полная документация
- `/diplom-backend/README.md` - документация Go-бэкенда
- https://kinopoiskapiunofficial.tech/documentation/api - Kinopoisk API

## ✅ Чеклист

- [ ] Go-бэкенд запущен на `localhost:5454`
- [ ] Фронтенд запущен на `localhost:5173`
- [ ] `ApiTest.jsx` отображает фильмы
- [ ] Поиск работает
- [ ] Данные о персонах загружаются
- [ ] Интегрировал в основные компоненты
