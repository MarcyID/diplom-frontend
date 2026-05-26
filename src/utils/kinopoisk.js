/**
 * Утилиты для работы с данными Kinopoisk API
 * Помощники для форматирования и извлечения полей
 */

/**
 * Форматирует длительность из минут в "Xч Yм"
 * Если длительости нет, возвращает '—'
 */
export function formatDuration(minutes) {
    if (!minutes || minutes <= 0) return '—';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
}

/**
 * Генерирует градиент на основе ID (детерминировано)
 */
export function generateGradient(id) {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    return gradients[(id || 0) % gradients.length];
}

/**
 * Получает эмодзи-аватар на основе имени
 */
export function getEmojiAvatar(name) {
    const emojis = ['🎭', '🎬', '🎥', '🎞️', '⭐', '🌟', '🎪', '🎨'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
}

/**
 * Получает основной жанр из списка
 */
export function getMainGenre(genres) {
    return genres?.[0]?.genre || '—';
}

/**
 * Получает основную страну из списка
 */
export function getMainCountry(countries) {
    return countries?.[0]?.country || '—';
}

/**
 * Получает рейтинг (приоритет: Кинопоиск → IMDB → 0)
 */
export function getRating(film) {
    const rating = film.ratingKinopoisk || film.ratingImbd;
    return rating !== null && rating !== undefined ? rating : 0;
}

/**
 * Получает название (приоритет: русский → английский → оригинальное)
 */
export function getTitle(film) {
    return film.nameRu || film.nameEn || film.nameOriginal || 'Без названия';
}

/**
 * Форматирует дату в "DD месяц, YYYY"
 */
export function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
}

/**
 * Вычисляет возраст по дате рождения
 */
export function calculateAge(birthdayString) {
    if (!birthdayString) return null;
    const birthDate = new Date(birthdayString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * Определяет знак зодиака по дате рождения
 */
export function getZodiacSign(birthdayString) {
    if (!birthdayString) return '—';
    const date = new Date(birthdayString);
    const day = date.getDate() + 1;
    const month = date.getMonth() + 1;

    const zodiacSigns = [
        { name: 'Козерог', endDay: 20 },
        { name: 'Водолей', endDay: 19 },
        { name: 'Рыбы', endDay: 20 },
        { name: 'Овен', endDay: 20 },
        { name: 'Телец', endDay: 20 },
        { name: 'Близнецы', endDay: 21 },
        { name: 'Рак', endDay: 22 },
        { name: 'Лев', endDay: 22 },
        { name: 'Дева', endDay: 22 },
        { name: 'Весы', endDay: 22 },
        { name: 'Скорпион', endDay: 21 },
        { name: 'Стрелец', endDay: 21 },
        { name: 'Козерог', endDay: 31 }
    ];

    const index = month - 1;
    if (day > zodiacSigns[index].endDay) {
        return zodiacSigns[index + 1].name;
    }
    return zodiacSigns[index].name;
}

/**
 * Определяет период фильмографии
 */
export function getFilmsPeriod(films) {
    if (!films || !Array.isArray(films) || films.length === 0) return '—';
    
    const years = films
        .map(f => f.releaseYear)
        .filter(y => y && !isNaN(y))
        .sort((a, b) => a - b);
    
    if (years.length === 0) return '—';
    
    const minYear = years[0];
    const maxYear = years[years.length - 1];
    
    return minYear === maxYear ? `${minYear}` : `${minYear} — ${maxYear}`;
}

/**
 * Извлекает уникальные жанры из фильмографии
 */
export function extractGenresFromFilmography(films) {
    if (!films || !Array.isArray(films)) return [];
    const genreSet = new Set();
    films.forEach(film => {
        if (film.genres && Array.isArray(film.genres)) {
            film.genres.forEach(g => {
                if (g.genre) genreSet.add(g.genre.toLowerCase());
            });
        }
    });
    return Array.from(genreSet).slice(0, 5);
}
