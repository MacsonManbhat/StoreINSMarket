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

  useEffect(() => {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours() + now.getMinutes()/60
    const isWeekend = day === 0 || day === 6
    const hours = isWeekend ? storeInfo.hours.weekend : storeInfo.hours.weekday
    setIsOpen(hour >= hours.open && hour < (hours.close - 0.25))
  }, [])

  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id)
      if (found) return prev.map(item => item.id === product.id ? {...item, quantity: item.quantity + 1} : item)
      return [...prev, {...product, quantity: 1}]
    })
  }

  const updateQuantity = (id, qty) => {
    if (qty === 0) setCart(prev => prev.filter(item => item.id !== id))
    else setCart(prev => prev.map(item => item.id === id ? {...item, quantity: qty} : item))
  }

  const totals = () => {
    let subtotal = 0, deposit = 0
    cart.forEach(item => {
      subtotal += item.price * item.quantity
      if (item.deposit) deposit += DEPOSIT * item.quantity
    })
    const gst = (subtotal + deposit) * GST
    return {
      subtotal: subtotal.toFixed(2),
      deposit: deposit.toFixed(2), 
      gst: gst.toFixed(2),
      total: (subtotal + deposit + gst).toFixed(2)
    }
  }

  const t = totals()

  const checkout = (e) => {
    e.preventDefault()
    if (!customerName || !customerPhone || !pickupTime) return alert('Fill all fields')
    const order = `New Order - INS MARKET\nName: ${customerName}\nPhone: ${customerPhone}\nPickup: ${pickupTime}\n\n${cart.map(i => `${i.name} x${i.quantity} - $${(i.price*i.quantity).toFixed(2)}${i.deposit ? ` + $${(DEPOSIT*i.quantity).toFixed(2)} dep` : ''}`).join('\n')}\n\nSubtotal: $${t.subtotal}\nDeposit: $${t.deposit}\nGST: $${t.gst}\nTOTAL: $${t.total}\nPay in-store`
    window.location.href = `mailto:${storeInfo.email}?subject=Order ${customerName}&body=${encodeURIComponent(order)}`
    setOrderPlaced(true)
    setCart([])
  }

  if (orderPlaced) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Order Sent!</h1>
        <p className="mb-6">Pay at counter when you pick up.</p>
        <button onClick={() => setOrderPlaced(false)} className="bg-blue-600 text-white px-6 py-2 rounded">New Order</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto bg-gray-50">
      <header className="text-center mb-6 bg-white p-6 rounded shadow">
        <h1 className="text-3xl font-bold">{storeInfo.name}</h1>
        <p className="text-gray-600">{storeInfo.location}</p>
        <p className="text-sm mt-2 font-medium">Mon-Fri 7am-9pm | Weekends 11am-5pm</p>
        {!isOpen && <p className="text-red-600 mt-2 font-bold">Currently Closed</p>}
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.size}</div>
                  <div className="text-lg font-bold">${p.price.toFixed(2)} {p.deposit && <span className="text-xs text-gray-500">+ ${DEPOSIT.toFixed(2)} dep</span>}</div>
                </div>
                <button onClick={() => addToCart(p)} disabled={!isOpen} className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300">Add</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-4">Cart</h2>
          {cart.length === 0 ? <p className="text-gray-500">Empty</p> : <>
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
              <div className="flex justify-between"><span>Subtotal</span><span>${t.subtotal}</span></div>
              <div className="flex justify-between"><span>Deposit</span><span>${t.deposit}</span></div>
              <div className="flex justify-between"><span>GST 5%</span><span>${t.gst}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>${t.total}</span></div>
            </div>
            <form onSubmit={checkout} className="mt-6 space-y-3">
              <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded" required />
              <input type="tel" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2 border rounded" required />
              <select value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full p-2 border rounded" required>
                <option value="">Pickup Time</option>
                <option value="ASAP - 15 min">ASAP - 15 min</option>
                <option value="30 min">30 min</option>
                <option value="1 hour">1 hour</option>
              </select>
              <button type="submit" disabled={!isOpen || cart.length === 0} className="w-full bg-green-600 text-white py-3 rounded font-bold disabled:bg-gray-300">Place Order</button>
            </form>
          </>}
        </div>
      </div>
    </div>
  )
}
