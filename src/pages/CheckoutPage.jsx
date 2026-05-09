import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/currency'
import PaymentModal from '../components/PaymentModal'

export default function CheckoutPage() {
  const { cart, cartTotal, currency, removeFromCart, updateCartQty } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <h2>Votre panier est vide</h2>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Retour à la boutique
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Retour</button>
        <h1 className="page-title">Ma commande</h1>
      </div>

      <div className="checkout-items">
        {cart.map(item => (
          <div key={item.id} className="checkout-item">
            <div className="checkout-item-img">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.name} />
              ) : (
                <span>📦</span>
              )}
            </div>
            <div className="checkout-item-info">
              <p className="checkout-item-name">{item.name}</p>
              <p className="checkout-item-price">{formatPrice(item.price, currency)}</p>
              <div className="cart-item-qty">
                <button onClick={() => updateCartQty(item.id, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => updateCartQty(item.id, item.qty + 1)}>+</button>
              </div>
            </div>
            <div className="checkout-item-right">
              <p className="checkout-item-subtotal">{formatPrice(item.price * item.qty, currency)}</p>
              <button
                className="checkout-remove"
                onClick={() => removeFromCart(item.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-summary-box">
        <div className="summary-row">
          <span>Sous-total</span>
          <span>{formatPrice(cartTotal, currency)}</span>
        </div>
        <div className="summary-row">
          <span>Livraison</span>
          <span className="delivery-free">À confirmer</span>
        </div>
        <div className="summary-total">
          <strong>Total à payer</strong>
          <strong className="total-amount">{formatPrice(cartTotal, currency)}</strong>
        </div>
      </div>

      <button className="btn-primary btn-full btn-large" onClick={() => setModalOpen(true)}>
        🟠 Payer maintenant
      </button>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => navigate('/')}
      />
    </div>
  )
}
