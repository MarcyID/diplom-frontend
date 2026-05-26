import { Film, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import SearchDropdown from './SearchDropdown'

function Header({ onMovieClick, onActorClick, onProfileClick }) {
    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <Film className="logo-icon" />
                    <span>CineMatch</span>
                </Link>

                <SearchDropdown
                    onMovieClick={onMovieClick}
                    onActorClick={onActorClick}
                />

                <div className="header-actions">
                    <button onClick={onProfileClick} className="icon-btn">
                        <User size={20} />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header