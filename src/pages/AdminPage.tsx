import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Bell, Package, CreditCard, Users, Eye, X } from 'lucide-react'
import AdminRoute from '../components/AdminRoute'
import { fetchProducts, ApiProduct } from '../lib/api'
import { getToken } from '../lib/auth'

type Product = ApiProduct & {
  category?: string | null
  is_active?: boolean | null
}

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  email?: string
  full_name?: string
  phone_number?: string
  delivery_address?: string
  delivery_region?: string
  delivery_notes?: string
  payment_method?: string
}

interface OrderItem {
  product_id: number
  quantity: number
  unit_price: number
}

interface Notification {
  id: string
  order_id: string
  read: boolean
  created_at: string
  total_amount: number
  full_name: string
  email: string
  type?: 'order' | 'payment'
  message?: string
  timestamp?: string
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'notifications'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_slug: 'men-wear' as 'apples' | 'oraimo' | 'men-wear',
    brand: '',
    image_url: '',
    colors: '',
    sizes: '',
    is_new: false,
    discount: ''
  })

  useEffect(() => {
    fetchData()
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const productsData = await fetchProducts()
      setProducts(productsData as Product[])

      const token = getToken()
      if (!token) {
        setOrders([])
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          const ordersData: Order[] = await res.json()
          setOrders(ordersData)
        } else {
          setOrders([])
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = getToken()
      if (!token) return

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const notificationsData: Notification[] = await res.json()
        setNotifications(notificationsData.map(n => ({
          ...n,
          type: 'order' as const,
          message: `New order #${n.order_id.slice(0, 8)} from ${n.full_name} - ₵${n.total_amount.toFixed(2)}`,
          timestamp: n.created_at,
        })))
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchOrderItems = async (orderId: string) => {
    console.warn('Order item details not implemented with Neon API yet', orderId)
    setOrderItems([])
  }

  const handleAddProduct = async () => {
    try {
      const token = getToken()
      if (!token) {
        alert('You must be logged in to add products')
        return
      }

      const productData = {
        name: newProduct.name,
        description: newProduct.description || undefined,
        price: parseFloat(newProduct.price),
        original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : undefined,
        category_slug: newProduct.category_slug,
        brand: newProduct.brand || undefined,
        image_url: newProduct.image_url || undefined,
        colors: newProduct.colors ? newProduct.colors.split(',').map(c => c.trim()) : undefined,
        sizes: newProduct.sizes ? newProduct.sizes.split(',').map(s => s.trim()) : undefined,
        discount: newProduct.discount ? parseInt(newProduct.discount) : 0,
        is_new: newProduct.is_new,
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to add product' }))
        throw new Error(error.error || 'Failed to add product')
      }

      setShowAddProduct(false)
      setNewProduct({
        name: '',
        description: '',
        price: '',
        original_price: '',
        category_slug: 'men-wear',
        brand: '',
        image_url: '',
        colors: '',
        sizes: '',
        is_new: false,
        discount: ''
      })
      fetchData()
      alert('Product added successfully!')
    } catch (error) {
      console.error('Error adding product:', error)
      alert(error instanceof Error ? error.message : 'Error adding product')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const token = getToken()
      if (!token) {
        alert('You must be logged in to delete products')
        return
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to delete product' }))
        throw new Error(error.error || 'Failed to delete product')
      }

      fetchData()
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(error instanceof Error ? error.message : 'Error deleting product')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    alert(`Updating order ${orderId} to ${newStatus} is not yet wired to Neon API.`)
  }

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order)
    await fetchOrderItems(order.id)
  }

  const markNotificationAsRead = async (id: string) => {
    try {
      const token = getToken()
      if (!token) return

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatPrice = (price: number | null) => {
    return `₵${(price ?? 0).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>
        
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Seed Categories Button */}
          <div className="mb-4">
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/seed-categories`, {
                    method: 'POST',
                  })
                  if (res.ok) {
                    alert('Categories seeded successfully!')
                  } else {
                    alert('Failed to seed categories')
                  }
                } catch (error) {
                  console.error('Error seeding categories:', error)
                  alert('Error seeding categories')
                }
              }}
              className="btn-secondary text-sm"
            >
              Seed Categories (Run Once)
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Bell className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{unreadNotifications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(orders.reduce((sum, order) => sum + (order.total_amount || 0), 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                activeTab === 'notifications'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Notifications
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="btn-primary flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.image_url || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=100'}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{order.full_name || 'N/A'}</div>
                            <div className="text-gray-500">{order.email}</div>
                            <div className="text-xs text-gray-400 mt-1">{order.phone_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.created_at && formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleViewOrder(order)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            notification.type === 'order' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newProduct.category_slug}
                      onChange={(e) => setNewProduct({...newProduct, category_slug: e.target.value as 'apples' | 'oraimo' | 'men-wear'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="apples">Apples</option>
                      <option value="oraimo">Oraimo Accessories</option>
                      <option value="men-wear">Men Wear</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₵)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price (₵)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.original_price}
                      onChange={(e) => setNewProduct({...newProduct, original_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={newProduct.discount}
                      onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Colors (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newProduct.colors}
                      onChange={(e) => setNewProduct({...newProduct, colors: e.target.value})}
                      placeholder="Red, Blue, Black"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sizes (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newProduct.sizes}
                      onChange={(e) => setNewProduct({...newProduct, sizes: e.target.value})}
                      placeholder="S, M, L, XL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.is_new}
                      onChange={(e) => setNewProduct({...newProduct, is_new: e.target.checked})}
                      className="mr-2"
                    />
                    New Product
                  </label>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="btn-primary"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{selectedOrder.id.slice(0, 8)}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information & Delivery Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedOrder.full_name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.email || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> <a href={`tel:${selectedOrder.phone_number}`} className="text-primary-600 hover:underline">{selectedOrder.phone_number || 'N/A'}</a></p>
                    <p><span className="font-medium">Delivery Address:</span> {selectedOrder.delivery_address || 'N/A'}</p>
                    <p><span className="font-medium">Delivery Region:</span> {selectedOrder.delivery_region || 'N/A'}</p>
                    {selectedOrder.delivery_notes && (
                      <p><span className="font-medium">Delivery Notes:</span> {selectedOrder.delivery_notes}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.products?.image_url || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={item.products?.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <h5 className="font-medium text-gray-900">{item.products?.name}</h5>
                            <div className="text-sm text-gray-500">
                              {item.selected_color && <span>Color: {item.selected_color}</span>}
                              {item.selected_size && <span className="ml-2">Size: {item.selected_size}</span>}
                              <span className="ml-2">Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatPrice((item.price || 0) * (item.quantity || 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Payment Method: {selectedOrder.payment_method}</p>
                    <p>Status: {selectedOrder.status}</p>
                    <p>Order Date: {selectedOrder.created_at && formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  )
}

export default AdminPage