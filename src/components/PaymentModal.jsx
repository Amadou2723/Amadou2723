import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/currency'
import { storage } from '../utils/storage'

const PAYMENT_METHODS = [
  { id: 'orange_money', label: 'Orange Money', icon: '🟠', color: '#FF6B00' },
  { id: 'wave', label: 'Wave', icon: '🔵', color: '#1E90FF' },
  { id: 'cash', label: 'Paiement à la livraison', icon: '💵', color: '#30D158' },
]

export default function PaymentModal({ open, onClose, onSuccess }) {
  const { cart, cartTotal, currency, clearCart, settings } = useApp()
  const [method, setMethod] = useState('orange_money')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [step, setStep] = useState('form') // form | confirm | success
  const [orderId, setOrderId] = useState('')

  const orangeNumber = settings?.orangeMoneyNumber || '+224 622 000 000'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !address.trim()) return
    if (method !== 'cash' && !phone.trim()) return
    setStep('confirm')
  }

  const handleConfirm = () => {
    const id = 'CMD-' + Date.now().toString(36).toUpperCase()
    const order = {
      id,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: cartTotal,
      currency,
      customerName: name,
      address,
      phone,
      paymentMethod: method,
      status: 'en_attente',
      createdAt: Date.now(),
    }
    storage.saveOrder(order)
    clearCart()
    setOrderId(id)
    setStep('success')
  }

  const handleClose = () => {
    setStep('form')
    setPhone('')
    setName('')
    setAddress('')
    setMethod('orange_money')
    onClose()
    if (onSuccess) onSuccess()
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={step === 'success' ? handleClose : undefined}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {step === 'form' && (
          <>
            <div className="modal-header">
              <h2>Finaliser la commande</h2>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <div className="modal-body">
              <div className="order-summary">
                <p className="order-summary-label">Récapitulatif</p>
                {cart.map(item => (
                  <div key={item.id} className="summary-row">
                    <span>{item.name} × {item.qty}</span>
                    <span>{formatPrice(item.price * item.qty, currency)}</span>
                  </div>
                ))}
                <div className="summary-total">
                  <strong>Total</strong>
                  <strong>{formatPrice(cartTotal, currency)}</strong>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Votre nom complet *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Amadou Diallo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Adresse de livraison *</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Quartier, commune, ville..."
                    rows={2}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mode de paiement *</label>
                  <div className="payment-methods">
                    {PAYMENT_METHODS.map(pm => (
                      <label
                        key={pm.id}
                        className={`payment-method ${method === pm.id ? 'payment-method--active' : ''}`}
                        style={{ '--pm-color': pm.color }}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={pm.id}
                          checked={method === pm.id}
                          onChange={() => setMethod(pm.id)}
                        />
                        <span className="pm-icon">{pm.icon}</span>
                        <span className="pm-label">{pm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {method !== 'cash' && (
                  <div className="form-group">
                    <label>Numéro {method === 'orange_money' ? 'Orange Money' : 'Wave'} *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+224 6XX XXX XXX"
                      required={method !== 'cash'}
                    />
                  </div>
                )}

                <button type="submit" className="btn-primary btn-full">
                  Confirmer la commande →
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="modal-header">
              <h2>Confirmation du paiement</h2>
            </div>
            <div className="modal-body">
              {method === 'orange_money' && (
                <div className="payment-instructions">
                  <div className="payment-icon-big">🟠</div>
                  <h3>Orange Money</h3>
                  <p>Envoyez <strong>{formatPrice(cartTotal, currency)}</strong> au :</p>
                  <div className="payment-number">{orangeNumber}</div>
                  <p className="payment-note">
                    Composez <strong>#144#</strong> ou utilisez l'application Orange Money.
                    Indiquez votre nom comme référence.
                  </p>
                </div>
              )}
              {method === 'wave' && (
                <div className="payment-instructions">
                  <div className="payment-icon-big">🔵</div>
                  <h3>Wave</h3>
                  <p>Envoyez <strong>{formatPrice(cartTotal, currency)}</strong> au :</p>
                  <div className="payment-number">{orangeNumber}</div>
                  <p className="payment-note">Utilisez l'application Wave pour effectuer le paiement.</p>
                </div>
              )}
              {method === 'cash' && (
                <div className="payment-instructions">
                  <div className="payment-icon-big">💵</div>
                  <h3>Paiement à la livraison</h3>
                  <p>Préparez <strong>{formatPrice(cartTotal, currency)}</strong> en espèces.</p>
                  <p className="payment-note">Notre livreur vous contactera pour organiser la livraison.</p>
                </div>
              )}

              <div className="confirm-actions">
                <button className="btn-secondary" onClick={() => setStep('form')}>← Retour</button>
                <button className="btn-primary" onClick={handleConfirm}>
                  ✓ J'ai payé / Confirmer
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="modal-body modal-body--center">
              <div className="success-icon">✅</div>
              <h2>Commande confirmée !</h2>
              <p className="success-order-id">Référence : <strong>{orderId}</strong></p>
              <p>Merci {name} ! Votre commande a été enregistrée. Nous vous contacterons pour la livraison.</p>
              <button className="btn-primary btn-full" onClick={handleClose}>
                Retour à la boutique
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
