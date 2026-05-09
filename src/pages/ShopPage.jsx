import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

const ALL = 'Tous'

export default function ShopPage() {
  const { products, settings } = useApp()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(ALL)

  const activeProducts = products.filter(p => p.active)

  const categories = useMemo(() => {
    const cats = [...new Set(activeProducts.map(p => p.category).filter(Boolean))]
    return [ALL, ...cats]
  }, [activeProducts])

  const filtered = useMemo(() => {
    return activeProducts.filter(p => {
      const matchCat = activeCategory === ALL || p.category === activeCategory
      const matchSearch = !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeProducts, activeCategory, search])

  return (
    <div className="page">
      <div className="shop-hero">
        <h1 className="shop-hero-title">{settings?.shopName || 'Boutique'}</h1>
        <p className="shop-hero-sub">{settings?.deliveryNote || 'Livraison disponible'}</p>
      </div>

      <div className="shop-controls">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? 'category-tab--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p>Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
