import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/currency'

export default function ProductCard({ product }) {
  const { addToCart, currency } = useApp()
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleAdd = () => {
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const mainImage = product.images?.[0]

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        {mainImage && !imgError ? (
          <img
            src={mainImage}
            alt={product.name}
            className="product-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="product-img-placeholder">📦</div>
        )}
        {product.stock === 0 && (
          <div className="product-out-of-stock">Rupture de stock</div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="product-low-stock">Plus que {product.stock} !</div>
        )}
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price, currency)}</span>
          <button
            className={`add-btn ${added ? 'add-btn--added' : ''}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {added ? '✓ Ajouté' : '+ Panier'}
          </button>
        </div>
      </div>
    </div>
  )
}
