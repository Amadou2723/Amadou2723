import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { storage } from '../utils/storage'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [currency, setCurrencyState] = useState('GNF')
  const [isAdmin, setIsAdmin] = useState(false)
  const [settings, setSettingsState] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      await storage.initAdminPassword()
      setProducts(storage.getProducts())
      const s = storage.getSettings()
      setSettingsState(s)
      setCurrencyState(s.currency || 'GNF')
      setLoading(false)
    }
    init()
  }, [])

  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { ...product, qty }]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => i.id !== productId))
  }, [])

  const updateCartQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== productId))
      return
    }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, qty } : i))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const saveProducts = useCallback((newProducts) => {
    setProducts(newProducts)
    storage.saveProducts(newProducts)
  }, [])

  const setCurrency = useCallback((c) => {
    setCurrencyState(c)
    const s = storage.getSettings()
    storage.saveSettings({ ...s, currency: c })
  }, [])

  const saveSettings = useCallback((newSettings) => {
    setSettingsState(newSettings)
    storage.saveSettings(newSettings)
    setCurrencyState(newSettings.currency || 'GNF')
  }, [])

  const login = useCallback(async (password) => {
    const ok = await storage.checkAdminPassword(password)
    if (ok) setIsAdmin(true)
    return ok
  }, [])

  const logout = useCallback(() => setIsAdmin(false), [])

  return (
    <AppContext.Provider value={{
      products, saveProducts,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      cartTotal, cartCount,
      currency, setCurrency,
      isAdmin, login, logout,
      settings, saveSettings,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  )
}
