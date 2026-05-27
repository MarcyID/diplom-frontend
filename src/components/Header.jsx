import { Film, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import SearchDropdown from './SearchDropdown'

function Header({ onMovieClick, onActorClick, onProfileClick, isLoggedIn }) {
    const navigate = useNavigate()

    const handleProfileClick = () => {
        if (isLoggedIn) {
            navigate('/profile')
        } else {
            onProfileClick()
        }
    }

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
                    <button onClick={handleProfileClick} className="icon-btn">
                        <User size={20} />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header