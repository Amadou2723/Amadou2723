import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { CURRENCIES } from '../utils/currency'

export default function Navbar({ onCartOpen }) {
  const { cartCount, currency, setCurrency, isAdmin, settings } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const shopName = settings?.shopName || 'Boutique'

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">🛍️</span>
          <span className="navbar-title">{shopName}</span>
        </Link>

        <div className="navbar-actions">
          <select
            className="currency-select"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            title="Choisir la devise"
          >
            {Object.values(CURRENCIES).map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>

          <button className="cart-btn" onClick={onCartOpen} aria-label="Panier">
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span>{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-dropdown" onClick={() => setMenuOpen(false)}>
          <Link to="/" className="dropdown-item">🏪 Boutique</Link>
          {isAdmin ? (
            <>
              <Link to="/admin" className="dropdown-item">⚙️ Administration</Link>
              <button className="dropdown-item dropdown-btn" onClick={() => navigate('/')}>
                🚪 Se déconnecter
              </button>
            </>
          ) : (
            <Link to="/admin" className="dropdown-item">🔐 Admin</Link>
          )}
        </div>
      )}
    </nav>
  )
}
