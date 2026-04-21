import express from 'express'
import Reservation from '../models/Reservation.js'
import Order from '../models/Order.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { sendReservationConfirmation } from '../services/email.js'

const router = express.Router()

// POST /api/reservations - Create a new reservation (public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, date, time, guests, message, tableNumber, specialInstructions, preOrderItems } = req.body

    if (!name || !phone || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone, date, and time',
      })
    }

    // Create reservation
    const reservation = await Reservation.create({
      name,
      phone,
      email: email || '',
      date,
      time,
      guests: guests || '2',
      message: message || '',
      tableNumber: tableNumber || null,
      specialInstructions: specialInstructions || '',
      hasPreOrder: preOrderItems && preOrderItems.length > 0,
      status: 'pending',
    })

    // Create pre-order if items provided
    let order = null
    if (preOrderItems && preOrderItems.length > 0) {
      const totalAmount = preOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      order = await Order.create({
        reservation: reservation._id,
        items: preOrderItems,
        totalAmount,
        specialInstructions: specialInstructions || '',
        status: 'pending',
      })
    }

    // Send confirmation email
    if (email) {
      sendReservationConfirmation(reservation, preOrderItems || []).catch(err => {
        console.log('Email send error (non-blocking):', err.message)
      })
    }

    console.log(`📋 New reservation: ${name} | ${date} at ${time} | ${guests} guests${order ? ' | with pre-order' : ''}`)

    res.status(201).json({
      success: true,
      message: order
        ? 'Reservation and pre-order created! Check your email for confirmation.'
        : 'Reservation created successfully! We will contact you shortly.',
      data: { reservation, order },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/reservations - Get all reservations (admin)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, date } = req.query
    const filter = {}
    if (status) filter.status = status
    if (date) filter.date = date

    const reservations = await Reservation.find(filter).sort({ createdAt: -1 })

    res.json({
      success: true,
      count: reservations.length,
      data: reservations,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/reservations/gantt - Gantt chart data (admin)
router.get('/gantt', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { date } = req.query
    const targetDate = date || new Date().toISOString().split('T')[0]

    const reservations = await Reservation.find({ date: targetDate }).sort({ time: 1 })

    // Format for Gantt chart
    const ganttData = reservations.map(r => ({
      id: r._id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      time: r.time,
      guests: r.guests,
      tableNumber: r.tableNumber,
      status: r.status,
      hasPreOrder: r.hasPreOrder,
      message: r.message,
    }))

    res.json({
      success: true,
      date: targetDate,
      count: ganttData.length,
      data: ganttData,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/reservations/:id/status - Update status (admin)
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' })
    }

    // If confirmed and has email, send confirmation
    if (status === 'confirmed' && reservation.email) {
      const order = await Order.findOne({ reservation: reservation._id })
      const orderItems = order ? order.items : []
      sendReservationConfirmation(reservation, orderItems).catch(err => {
        console.log('Email send error:', err.message)
      })
    }

    res.json({ success: true, data: reservation })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/reservations/:id/table - Assign table (admin)
router.patch('/:id/table', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { tableNumber } = req.body
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { tableNumber },
      { new: true }
    )

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' })
    }

    res.json({ success: true, data: reservation })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/reservations/:id - Get single reservation
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' })
    }

    const order = await Order.findOne({ reservation: reservation._id })

    res.json({ success: true, data: { reservation, order } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
