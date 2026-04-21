import express from 'express'
import Order from '../models/Order.js'
import Reservation from '../models/Reservation.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET /api/orders - Get all orders (admin)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query
    const filter = {}
    if (status) filter.status = status

    const orders = await Order.find(filter)
      .populate('reservation', 'name phone email date time guests tableNumber')
      .sort({ createdAt: -1 })

    res.json({ success: true, count: orders.length, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/orders/:reservationId - Get order for specific reservation
router.get('/reservation/:reservationId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findOne({ reservation: req.params.reservationId })
      .populate('reservation')

    if (!order) {
      return res.status(404).json({ success: false, message: 'No pre-order found for this reservation' })
    }

    res.json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/orders/:id/status - Update order status (admin)
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('reservation', 'name phone email date time guests tableNumber')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // Send email notification if status is ready or served
    if (status === 'ready' || status === 'served') {
      import('../services/email.js').then(({ sendOrderStatusEmail }) => {
        sendOrderStatusEmail(order.reservation, status).catch(console.error)
      }).catch(console.error)
    }

    res.json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
