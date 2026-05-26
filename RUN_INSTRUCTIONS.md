# 🚀 Запуск проекта

## Вариант 1: Фронтенд на заглушках (без бэкенда)

**Работает всегда, не требует Go!**

```bash
cd /Users/vi.v.zhuravlev/WebstormProjects/diplom-frontend
npm run dev
```

Открой: http://localhost:5173

**Что работает:**
- ✅ Главная страница с фильмами (заглушки)
- ✅ Поиск (заглушки)
- ✅ Все модалки
- ✅ Профиль
- ✅ Авторизация (локально)

---

## Вариант 2: Фронтенд + Go-бэкенд (реальные данные)

**Требует установленный Go!**

### 1. Установи Go (если нет)

```bash
# Через Homebrew
brew install go

# Или скачай с https://go.dev/dl/
```

### 2. Запусти бэкенд

```bash
cd /Users/vi.v.zhuravlev/GolandProjects/diplom-backend
go run cmd/server/main.go
```

Бэкенд запустится на: http://localhost:5454

### 3. Запусти фронтенд

```bash
cd /Users/vi.v.zhuravlev/WebstormProjects/diplom-frontend
npm run dev
```

Фронтенд: http://localhost:5173

**Что работает:**
- ✅ Главная страница с реальными фильмами из Kinopoisk
- ✅ Поиск через API
- ✅ Модалки с реальными данными
- ⚠️ Профиль и избранное - локально (без БД)

---

## 🔧 Если бэкенд не запускается

### Ошибка: "json: cannot unmarshal number into Go struct field..."

Нужно исправить типы в моделях. Выполнить:

```bash
cd /Users/vi.v.zhuravlev/GolandProjects/diplom-backend
sed -i '' 's/Year            \*string/Year            *int/' internal/model/kinopoisk/film.go
go run cmd/server/main.go
```

### Ошибка: "port already in use"

Порт 5454 занят. Найди и убей процесс:

```bash
lsof -ti:5454 | xargs kill -9
```

### Ошибка: "KINOPOISK_API_KEY not set"

Проверь `.env`:

```bash
cat .env
```

Должен быть ключ:
```env
KINOPOISK_API_KEY=твой_ключ
```

---

## 📊 Проверка работы API

```bash
# Проверка бэкенда
curl http://localhost:5454/api/v1/films/popular?page=1

# Проверка поиска
curl "http://localhost:5454/api/v1/movies/search?q=матрица"
```

Если видишь JSON с данными - всё работает! ✅

---

## 🐛 Отладка

### Фронтенд

Открой консоль браузера (F12) и смотри ошибки.

### Бэкенд

Смотри логи в терминале, где запущен `go run`.

### Сетевые запросы

В браузере: F12 → Network → смотри запросы к `localhost:5454`
