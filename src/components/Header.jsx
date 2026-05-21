import { Film, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import SearchDropdown from './SearchDropdown'

// Временные данные
const actorsDB = [
    { id: 1, name: 'Леонардо ДиКаприо', movies: [1, 2, 7] },
    { id: 2, name: 'Кристиан Бэйл', movies: [3] },
    { id: 3, name: 'Джозеф Гордон-Левитт', movies: [1, 3] },
    { id: 4, name: 'Том Харди', movies: [3, 5] },
    { id: 5, name: 'Мэттью МакКонахи', movies: [2, 5] },
    { id: 6, name: 'Хоакин Феникс', movies: [6] },
    { id: 7, name: 'Тим Роббинс', movies: [7] },
    { id: 8, name: 'Джон Траволта', movies: [8] },
    { id: 9, name: 'Ума Турман', movies: [8] },
    { id: 10, name: 'Фрэнсис МакДорманд', movies: [5, 7] }
]

const directorsDB = [
    { id: 1, name: 'Кристофер Нолан', movies: [1, 2, 3] },
    { id: 2, name: 'Оливье Накаш', movies: [4] },
    { id: 3, name: 'Питер Фаррелли', movies: [5] },
    { id: 4, name: 'Тодд Филлипс', movies: [6] },
    { id: 5, name: 'Фрэнк Дарабонт', movies: [7] },
    { id: 6, name: 'Квентин Тарантино', movies: [8] }
]

function Header({ allMovies, onMovieClick, onActorClick, onDirectorClick }) {
    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <Film className="logo-icon" />
                    <span>CineMatch</span>
                </Link>

                <SearchDropdown
                    allMovies={allMovies}
                    onMovieClick={onMovieClick}
                    onActorClick={onActorClick}
                    onDirectorClick={onDirectorClick}
                    actors={actorsDB}
                    directors={directorsDB}
                />

                <div className="header-actions">
                    <Link to="/profile" className="icon-btn">
                        <User size={20} />
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Header