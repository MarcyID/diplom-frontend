# 🔧 Исправление проблем после обновления

## Проблема 1: Пустая страница профиля

**Причина:** ProfilePage использовал удалённые заглушки `allMovies`, `actorsDB`, `directorsDB`

**Решение:** Обновлены компоненты:
- ✅ `ProfilePage.jsx` - убрана зависимость от заглушек
- ✅ `CollectionsViewerModal.jsx` - упрощён до заглушки
- ✅ `FavoritesViewerModal.jsx` - упрощён до заглушки  
- ✅ `SingleCollectionModal.jsx` - упрощён до заглушки

Избранное и подборки пока показывают количество, но не содержимое (будет обновлено позже).

## Проблема 2: Не работает поиск в авторизации

**Причина:** SearchDropdown использует хук `useSearch()`, который делает запросы к API

**Проверка:**
1. Убедись, что Go-бэкенд запущен: `http://localhost:5454`
2. Проверь API в браузере: `http://localhost:5454/api/v1/movies/search?q=матрица`

**Возможные проблемы:**

### CORS

Если видишь ошибку CORS в консоли, добавь в Go-бэкенд (router.go):

```go
router.Use(func(c *gin.Context) {
    c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
    c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-KEY")
    if c.Request.Method == "OPTIONS" {
        c.AbortWithStatus(204)
        return
    }
    c.Next()
})
```

### API не отвечает

Проверь, что бэкенд запущен:

```bash
curl http://localhost:5454/api/v1/films/popular?page=1
```

Если не работает - перезапусти бэкенд:

```bash
cd /Users/vi.v.zhuravlev/GolandProjects/diplom-backend
go run cmd/server/main.go
```

## Проблема 3: Ошибки в консоли браузера

Открой DevTools → Console и проверь ошибки.

**Частые ошибки:**

### "Cannot read property 'kinopoiskId' of undefined"

Где-то используется `film.id` вместо `film.kinopoiskId`.

### "Network Error" или "Failed to fetch"

Бэкенд не доступен на `localhost:5454`.

### "X-API-KEY header required"

Бэкенд требует API ключ для Kinopoisk. Проверь `.env` в бэкенде.

## ✅ Чеклист проверки

- [ ] Go-бэкенд запущен на `localhost:5454`
- [ ] API отвечает: `http://localhost:5454/api/v1/films/popular?page=1`
- [ ] Фронтенд запущен на `localhost:5173`
- [ ] В консоли браузера нет ошибок CORS
- [ ] Поиск работает (введи "матрица" в поиске)
- [ ] Главная страница загружает фильмы
- [ ] Модалка фильма открывается

## 🐛 Отладка SearchDropdown

Добавь логирование в `src/components/SearchDropdown.jsx`:

```javascript
useEffect(() => {
    console.log('Search query:', query);
    console.log('Search results:', results);
    console.log('Loading:', loading);
    console.log('Error:', error);
}, [query, results, loading, error]);
```

## 📝 Временные ограничения

Пока не работают (требуют доработки):
- ❌ Просмотр фильмов в подборках
- ❌ Просмотр избранного (фильмы, актёры, режиссёры)
- ❌ Добавление фильмов в подборки (нужен поиск по API)

Эти функции будут обновлены после настройки API для подборок.

## 🚀 Быстрая проверка

Открой консоль браузера и выполни:

```javascript
// Проверка API
fetch('http://localhost:5454/api/v1/films/popular?page=1')
    .then(r => r.json())
    .then(d => console.log('✅ API работает:', d))
    .catch(e => console.error('❌ API не работает:', e));
```

Если видишь `✅ API работает` - всё ок, проблема в компонентах.
Если `❌ API не работает` - проблема в бэкенде.
