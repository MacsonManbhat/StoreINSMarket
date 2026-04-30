'use client'
import { useState, useEffect } from 'react'
import { products, DEPOSIT, GST, storeInfo } from './data/products'

export default function Home() {
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [orderPlaced, setOrderPlaced] = useState(false)

  // Check if store is open
  useEffect(() => {
    const now = new Date()
    const day = now.getDay() // 0 = Sun, 6 = Sat
    const hour = now.getHours()
    const minute = now.getMinutes()
    const currentTime = hour + minute/60
    
    const isWeekend = day === 0 || day === 6
    const hours = isWeekend ? storeInfo.hours.weekend : storeInfo.hours.weekday
    
    setIsOpen(currentTime >= hours.open && currentTime < (hours.close - 0.25))
  }, [])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? {...item, quantity: item.quantity + 1} : item
        )
      }
      return [...prev, {...product, quantity: 1}]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, qty) => {
    if (qty === 0) return removeFromCart(id)
    setCart(prev => prev.map(item => 
      item.id === id ? {...item, quantity: qty} : item
    ))
  }

  const calculateTotal = () => {
    let subtotal = 0
    let depositTotal = 0
    
    cart.forEach(item => {
      subtotal += item.price * item.quantity
      if (item.deposit) depositTotal += DEPOSIT * item.quantity
    })
    
    const gst = (subtotal + depositTotal) * GST
    const total = subtotal + depositTotal + gst
    
    return {
      subtotal: subtotal.toFixed(2),
      deposit: depositTotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2)
    }
  }

  const handleCheckout = (e) => {
    e.preventDefault()
    if (!customerName || !customerPhone || !pickupTime) {
      alert('Please fill in all fields')
      return
    }
    
    const totals = calculateTotal()
    const orderDetails = `
New Pickup Order - INS MARKET
Name: ${customerName}
Phone: ${customerPhone}
Pickup Time: ${pickupTime}

Items:
${cart.map(item => `${item.name} ${item.size} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)} ${item.deposit ? `+ $${(DEPOSIT * item.quantity).toFixed(2)} dep` : ''}`).join('\n')}

Subtotal: $${totals.subtotal}
Deposit: $${totals.deposit}
GST 5%: $${totals.gst}
TOTAL: $${totals.total}
Pay in-store at pickup
    `
    
    // This opens email app with order details
    window.location.href = `mailto:${storeInfo.email}?subject=New Pickup Order - ${customerName}&body=${encodeURIComponent(orderDetails)}`
    
    setOrderPlaced(true)
    setCart([])
  }

  const totals = calculateTotal()
  const today = new Date().getDay()
  const isWeekend = today === 0 || today === 6
  const hoursToday = isWeekend ? storeInfo.hours.weekend : storeInfo.hours.weekday

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Order Sent! 🎉</h1>
          <p className="mb-4">We’ve got your order. Pay at the counter when you pick up.</p>
          <p className="text-sm text-gray-600 mb-6">Check your email app - it should have opened with your order details.</p>
          <button onClick={() => setOrderPlaced(false)} className="bg-blue-600 text-white px-6 py-2 rounded">
            Place Another Order
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <header className="text-center mb-6 bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold">{storeInfo.name}</h1>
        <p className="text-gray-600">{storeInfo.location}</p>
        <p className="text-sm mt-2 font-medium">{hoursToday.label}</p>
        {!isOpen && <p className="text-red-600 mt-2 font-bold">Currently Closed - Orders disabled</p>}
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Beverages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.size}</div>
                  <div className="text-lg font-bold">${product.price.toFixed(2)} 
                    {product.deposit && <span className="text-xs text-gray-500"> + ${DEPOSIT.toFixed(2)} dep</span>}
                  </div>
                <button 
                  onClick={() => addToCart(product)}
                  disabled={!isOpen}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-4">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Cart is empty</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-3 pb-3 border-b">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-600">${item.price.toFixed(2)} {item.deposit && `+ $${DEPOSIT.toFixed(2)} dep`}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 bg-gray-200 rounded">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 bg-gray-200 rounded">+</button>
                  </div>
                </div>
              ))}
              
              <div className="space-y-1 text-sm mt-4 pt-4 border-t">
                <div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal}</span></div>
                <div className="flex justify-between"><span>Deposit</span><span>${totals.deposit}</span></div>
                <div className="flex justify-between"><span>GST 5%</span><span>${totals.gst}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>${totals.total}</span></div>
              </div>

              <form onSubmit={handleCheckout} className="mt-6 space-y-3">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full p-2 border rounded" 
                  required 
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full p-2 border rounded" 
                  required 
                />
                <select 
                  value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Pickup Time</option>
                  <option value="ASAP - 15 min">ASAP - 15 min</option>
                  <option value="30 min">30 min</option>
                  <option value="1 hour">1 hour</option>
                </select>
                <button 
                  type="submit"
                  disabled={!isOpen || cart.length === 0}
                  className="w-full bg-green-600 text-white py-3 rounded font-bold disabled:bg-gray-300"
                >
                  Place Order - Pay In-Store
                </button>
                <p className="text-xs text-center text-gray-500">You’ll pay at the counter when you pick up</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
