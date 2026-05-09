const KEYS = {
  PRODUCTS: 'boutique_products',
  ORDERS: 'boutique_orders',
  ADMIN_HASH: 'boutique_admin_hash',
  SETTINGS: 'boutique_settings',
}

const hashPassword = async (password) => {
  const data = new TextEncoder().encode(password)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const DEMO_PRODUCTS = [
  {
    id: '1',
    name: 'Tissu Wax Africain',
    description: 'Tissu wax traditionnel africain de haute qualité, motifs colorés et modernes. 6 yards.',
    price: 120000,
    category: 'Tissu',
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80'],
    stock: 50,
    active: true,
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: 'Sac en cuir artisanal',
    description: 'Sac en cuir véritable fait main par des artisans locaux guinéens.',
    price: 450000,
    category: 'Accessoires',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
    stock: 15,
    active: true,
    createdAt: Date.now(),
  },
  {
    id: '3',
    name: 'Bijoux dorés traditionnels',
    description: 'Collier et boucles d\'oreilles plaqués or, style africain authentique.',
    price: 280000,
    category: 'Bijoux',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'],
    stock: 30,
    active: true,
    createdAt: Date.now(),
  },
  {
    id: '4',
    name: 'Téléphone reconditionné',
    description: 'Smartphone en excellent état, débloqué tous opérateurs. Batterie neuve.',
    price: 1800000,
    category: 'Électronique',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'],
    stock: 8,
    active: true,
    createdAt: Date.now(),
  },
]

export const storage = {
  getProducts: () => {
    const data = localStorage.getItem(KEYS.PRODUCTS)
    if (!data) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(DEMO_PRODUCTS))
      return DEMO_PRODUCTS
    }
    return JSON.parse(data)
  },

  saveProducts: (products) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products))
  },

  getOrders: () => {
    const data = localStorage.getItem(KEYS.ORDERS)
    return data ? JSON.parse(data) : []
  },

  saveOrder: (order) => {
    const orders = storage.getOrders()
    orders.unshift(order)
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders))
    return order
  },

  updateOrderStatus: (orderId, status) => {
    const orders = storage.getOrders()
    const idx = orders.findIndex(o => o.id === orderId)
    if (idx !== -1) {
      orders[idx].status = status
      orders[idx].updatedAt = Date.now()
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders))
    }
  },

  initAdminPassword: async () => {
    if (!localStorage.getItem(KEYS.ADMIN_HASH)) {
      const hash = await hashPassword('admin123')
      localStorage.setItem(KEYS.ADMIN_HASH, hash)
    }
  },

  checkAdminPassword: async (password) => {
    let stored = localStorage.getItem(KEYS.ADMIN_HASH)
    if (!stored) {
      stored = await hashPassword('admin123')
      localStorage.setItem(KEYS.ADMIN_HASH, stored)
    }
    const inputHash = await hashPassword(password)
    return inputHash === stored
  },

  changeAdminPassword: async (newPassword) => {
    const hash = await hashPassword(newPassword)
    localStorage.setItem(KEYS.ADMIN_HASH, hash)
  },

  getSettings: () => {
    const data = localStorage.getItem(KEYS.SETTINGS)
    return data ? JSON.parse(data) : {
      shopName: 'Boutique Amadou',
      currency: 'GNF',
      orangeMoneyNumber: '+224 622 000 000',
      whatsappNumber: '+224 622 000 000',
      deliveryNote: 'Livraison disponible à Conakry et environs.',
    }
  },

  saveSettings: (settings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
  },
}
