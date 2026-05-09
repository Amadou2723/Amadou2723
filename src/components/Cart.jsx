import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/currency'

export default function Cart({ open, onClose }) {
  const { cart, cartTotal, removeFromCart, updateCartQty, currency } = useApp()
  const navigate = useNavigate()

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}
      <div className={`cart-drawer ${open ? 'cart-drawer--open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">Mon Panier</h2>
          <button className="cart-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🛒</span>
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">{formatPrice(item.price, currency)}</p>
                    <div className="cart-item-qty">
                      <button onClick={() => updateCartQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <strong>{formatPrice(cartTotal, currency)}</strong>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Passer la commande →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
