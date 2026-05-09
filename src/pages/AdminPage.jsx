import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { formatPrice, CURRENCIES } from '../utils/currency'
import { storage } from '../utils/storage'

const TABS = ['Produits', 'Commandes', 'Paramètres']

const EMPTY_PRODUCT = {
  name: '', description: '', price: '', category: '',
  images: [], stock: '', active: true,
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const ok = await onLogin(password)
    setLoading(false)
    if (!ok) setError('Mot de passe incorrect')
  }

  return (
    <div className="page page--center">
      <div className="login-card">
        <div className="login-icon">🔐</div>
        <h2>Administration</h2>
        <p className="login-sub">Accès réservé à l'administrateur</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Vérification...' : 'Connexion'}
          </button>
        </form>
        <p className="login-hint">Mot de passe par défaut : admin123</p>
      </div>
    </div>
  )
}

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product)
  const [imgUrl, setImgUrl] = useState('')
  const fileRef = useRef()

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const addImageUrl = () => {
    if (imgUrl.trim()) {
      set('images', [...(form.images || []), imgUrl.trim()])
      setImgUrl('')
    }
  }

  const addImageFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      set('images', [...(form.images || []), ev.target.result])
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (idx) => {
    set('images', form.images.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.price) return
    onSave({
      ...form,
      price: parseInt(form.price, 10),
      stock: parseInt(form.stock, 10) || 0,
      id: form.id || Date.now().toString(),
      createdAt: form.createdAt || Date.now(),
    })
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h3 className="form-section-title">{form.id ? 'Modifier le produit' : 'Nouveau produit'}</h3>

      <div className="form-row">
        <div className="form-group">
          <label>Nom du produit *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex: Tissu Wax"
            required
          />
        </div>
        <div className="form-group">
          <label>Catégorie</label>
          <input
            type="text"
            value={form.category}
            onChange={e => set('category', e.target.value)}
            placeholder="Ex: Tissu, Bijoux..."
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Description du produit..."
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Prix (en Francs Guinéens — GNF) *</label>
          <input
            type="number"
            value={form.price}
            onChange={e => set('price', e.target.value)}
            placeholder="Ex: 150000"
            min="0"
            required
          />
          {form.price && (
            <small className="price-preview">
              ≈ {formatPrice(parseInt(form.price) || 0, 'XOF')} | {formatPrice(parseInt(form.price) || 0, 'EUR')} | {formatPrice(parseInt(form.price) || 0, 'USD')}
            </small>
          )}
        </div>
        <div className="form-group">
          <label>Stock disponible</label>
          <input
            type="number"
            value={form.stock}
            onChange={e => set('stock', e.target.value)}
            placeholder="Ex: 10"
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Images du produit</label>
        <div className="image-inputs">
          <input
            type="url"
            value={imgUrl}
            onChange={e => setImgUrl(e.target.value)}
            placeholder="https://... (URL de l'image)"
          />
          <button type="button" className="btn-secondary btn-sm" onClick={addImageUrl}>
            + URL
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
            📷 Fichier
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={addImageFile} />
        </div>
        {form.images?.length > 0 && (
          <div className="image-previews">
            {form.images.map((img, idx) => (
              <div key={idx} className="image-preview-wrap">
                <img src={img} alt="" className="image-preview" />
                <button type="button" className="image-remove" onClick={() => removeImage(idx)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="toggle-label">
          <span>Produit visible dans la boutique</span>
          <div
            className={`toggle ${form.active ? 'toggle--on' : ''}`}
            onClick={() => set('active', !form.active)}
          >
            <div className="toggle-thumb" />
          </div>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn-primary">
          {form.id ? '💾 Enregistrer' : '➕ Ajouter le produit'}
        </button>
      </div>
    </form>
  )
}

function ProductsTab() {
  const { products, saveProducts } = useApp()
  const [editing, setEditing] = useState(null) // null | 'new' | product

  const handleSave = (product) => {
    if (product.id && products.find(p => p.id === product.id)) {
      saveProducts(products.map(p => p.id === product.id ? product : p))
    } else {
      saveProducts([product, ...products])
    }
    setEditing(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce produit ?')) {
      saveProducts(products.filter(p => p.id !== id))
    }
  }

  const toggleActive = (id) => {
    saveProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  if (editing) {
    return (
      <ProductForm
        product={editing === 'new' ? { ...EMPTY_PRODUCT } : editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div>
      <div className="tab-toolbar">
        <span className="tab-count">{products.length} produit(s)</span>
        <button className="btn-primary btn-sm" onClick={() => setEditing('new')}>
          ➕ Nouveau produit
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <p>Aucun produit. Ajoutez-en un !</p>
        </div>
      ) : (
        <div className="admin-product-list">
          {products.map(product => (
            <div key={product.id} className={`admin-product-item ${!product.active ? 'admin-product-item--inactive' : ''}`}>
              <div className="admin-product-img">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} />
                ) : (
                  <span>📦</span>
                )}
              </div>
              <div className="admin-product-info">
                <p className="admin-product-name">{product.name}</p>
                <p className="admin-product-cat">{product.category}</p>
                <p className="admin-product-price">{formatPrice(product.price, 'GNF')}</p>
                <p className="admin-product-stock">
                  Stock: <strong>{product.stock ?? '—'}</strong>
                  {!product.active && <span className="badge-inactive"> · Masqué</span>}
                </p>
              </div>
              <div className="admin-product-actions">
                <button
                  className={`toggle-mini ${product.active ? 'toggle-mini--on' : ''}`}
                  onClick={() => toggleActive(product.id)}
                  title={product.active ? 'Masquer' : 'Afficher'}
                >
                  {product.active ? '👁️' : '🙈'}
                </button>
                <button className="btn-icon" onClick={() => setEditing(product)} title="Modifier">✏️</button>
                <button className="btn-icon btn-icon--danger" onClick={() => handleDelete(product.id)} title="Supprimer">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState(() => storage.getOrders())

  const STATUS_LABELS = {
    en_attente: { label: 'En attente', color: '#FF9500' },
    confirme: { label: 'Confirmé', color: '#30D158' },
    livre: { label: 'Livré', color: '#007AFF' },
    annule: { label: 'Annulé', color: '#FF3B30' },
  }

  const updateStatus = (orderId, status) => {
    storage.updateOrderStatus(orderId, status)
    setOrders(storage.getOrders())
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📋</span>
        <p>Aucune commande pour le moment</p>
      </div>
    )
  }

  return (
    <div className="orders-list">
      {orders.map(order => {
        const st = STATUS_LABELS[order.status] || STATUS_LABELS.en_attente
        return (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <span className="order-id">{order.id}</span>
              <span className="order-status" style={{ background: st.color }}>{st.label}</span>
            </div>
            <div className="order-card-body">
              <p><strong>{order.customerName}</strong> — {order.address}</p>
              {order.phone && <p>📱 {order.phone}</p>}
              <p>💳 {order.paymentMethod === 'orange_money' ? 'Orange Money' : order.paymentMethod === 'wave' ? 'Wave' : 'Espèces'}</p>
              <div className="order-items">
                {order.items.map((it, i) => (
                  <span key={i} className="order-item-chip">{it.name} ×{it.qty}</span>
                ))}
              </div>
              <p className="order-total">{formatPrice(order.total, order.currency || 'GNF')}</p>
              <p className="order-date">{new Date(order.createdAt).toLocaleString('fr-FR')}</p>
            </div>
            <div className="order-status-actions">
              {Object.entries(STATUS_LABELS).map(([key, val]) => (
                <button
                  key={key}
                  className={`status-btn ${order.status === key ? 'status-btn--active' : ''}`}
                  style={{ '--sb-color': val.color }}
                  onClick={() => updateStatus(order.id, key)}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SettingsTab() {
  const { settings, saveSettings } = useApp()
  const [form, setForm] = useState(settings)
  const [newPwd, setNewPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [saved, setSaved] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = (e) => {
    e.preventDefault()
    saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePwd = async (e) => {
    e.preventDefault()
    if (newPwd.length < 6) { setPwdMsg('6 caractères minimum'); return }
    await storage.changeAdminPassword(newPwd)
    setNewPwd('')
    setPwdMsg('Mot de passe modifié ✓')
    setTimeout(() => setPwdMsg(''), 3000)
  }

  return (
    <div>
      <form onSubmit={handleSave} className="settings-form">
        <h3 className="form-section-title">Informations de la boutique</h3>

        <div className="form-group">
          <label>Nom de la boutique</label>
          <input type="text" value={form.shopName || ''} onChange={e => set('shopName', e.target.value)} />
        </div>

        <div className="form-group">
          <label>Devise par défaut</label>
          <select value={form.currency || 'GNF'} onChange={e => set('currency', e.target.value)}>
            {Object.values(CURRENCIES).map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Numéro Orange Money (pour recevoir les paiements)</label>
          <input
            type="tel"
            value={form.orangeMoneyNumber || ''}
            onChange={e => set('orangeMoneyNumber', e.target.value)}
            placeholder="+224 6XX XXX XXX"
          />
        </div>

        <div className="form-group">
          <label>Note de livraison (affichée en boutique)</label>
          <textarea
            value={form.deliveryNote || ''}
            onChange={e => set('deliveryNote', e.target.value)}
            rows={2}
            placeholder="Ex: Livraison disponible à Conakry..."
          />
        </div>

        <button type="submit" className="btn-primary">
          {saved ? '✓ Enregistré !' : '💾 Sauvegarder'}
        </button>
      </form>

      <div className="settings-divider" />

      <form onSubmit={handleChangePwd} className="settings-form">
        <h3 className="form-section-title">Changer le mot de passe admin</h3>
        <div className="form-group">
          <label>Nouveau mot de passe (6 caractères min.)</label>
          <input
            type="password"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {pwdMsg && <p className={pwdMsg.includes('✓') ? 'form-success' : 'form-error'}>{pwdMsg}</p>}
        <button type="submit" className="btn-secondary">🔑 Changer le mot de passe</button>
      </form>
    </div>
  )
}

export default function AdminPage() {
  const { isAdmin, login, logout } = useApp()
  const [tab, setTab] = useState(0)

  if (!isAdmin) {
    return <LoginScreen onLogin={login} />
  }

  return (
    <div className="page">
      <div className="admin-header">
        <h1 className="page-title">⚙️ Administration</h1>
        <button className="btn-secondary btn-sm" onClick={logout}>Déconnexion</button>
      </div>

      <div className="admin-tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`admin-tab ${tab === i ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === 0 && <ProductsTab />}
        {tab === 1 && <OrdersTab />}
        {tab === 2 && <SettingsTab />}
      </div>
    </div>
  )
}
