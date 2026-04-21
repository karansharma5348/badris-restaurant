import express from 'express'
import Reservation from '../models/Reservation.js'
import Order from '../models/Order.js'
import MenuItem from '../models/MenuItem.js'
import Ticket from '../models/Ticket.js'
import Contact from '../models/Contact.js'
import User from '../models/User.js'
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET /api/admin/overview - Dashboard overview stats
router.get('/overview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const [
      totalReservations,
      todayReservations,
      pendingReservations,
      confirmedReservations,
      totalOrders,
      pendingOrders,
      totalMenuItems,
      activeMenuItems,
      totalTickets,
      openTickets,
      unreadMessages,
      totalContacts,
    ] = await Promise.all([
      Reservation.countDocuments(),
      Reservation.countDocuments({ date: today }),
      Reservation.countDocuments({ status: 'pending' }),
      Reservation.countDocuments({ status: 'confirmed' }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
      MenuItem.countDocuments({ isActive: true }),
      MenuItem.countDocuments({ isActive: true, isAvailable: true }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
      Contact.countDocuments({ isRead: false }),
      Contact.countDocuments(),
    ])

    // Revenue from orders
    const orders = await Order.find({ status: { $ne: 'cancelled' } })
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)

    // Recent reservations
    const recentReservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(5)

    // Popular dishes
    const allOrders = await Order.find({ status: { $ne: 'cancelled' } })
    const dishCount = {}
    allOrders.forEach(order => {
      order.items.forEach(item => {
        dishCount[item.name] = (dishCount[item.name] || 0) + item.quantity
      })
    })
    const popularDishes = Object.entries(dishCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // Reservations per day (last 7 days)
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const count = await Reservation.countDocuments({ date: dateStr })
      last7Days.push({ date: dateStr, count })
    }

    res.json({
      success: true,
      data: {
        totalReservations,
        todayReservations,
        pendingReservations,
        confirmedReservations,
        totalOrders,
        pendingOrders,
        totalMenuItems,
        activeMenuItems,
        totalTickets,
        openTickets,
        unreadMessages,
        totalContacts,
        totalRevenue,
        recentReservations,
        popularDishes,
        last7Days,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/users - List admin users (superadmin only)
router.get('/users', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/admin/users - Create new admin user (superadmin only)
router.post('/users', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'All fields are required.' })
    }

    // Check if user exists
    const existing = await User.findOne({ $or: [{ username }, { email }] })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' })
    }

    const user = await User.create({
      username,
      email,
      password,
      fullName,
      role: role || 'admin',
    })

    console.log(`✅ New admin created: ${username} (${role || 'admin'})`)

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully.',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PUT /api/admin/users/:id - Update admin user (superadmin only)
router.put('/users/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    // Check uniqueness for username/email (exclude current user)
    if (username && username !== user.username) {
      const existing = await User.findOne({ username })
      if (existing) return res.status(400).json({ success: false, message: 'Username already exists.' })
      user.username = username
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email })
      if (existing) return res.status(400).json({ success: false, message: 'Email already exists.' })
      user.email = email
    }

    if (fullName) user.fullName = fullName
    if (role) user.role = role
    if (password) user.password = password  // will be hashed by pre-save hook

    await user.save()

    res.json({
      success: true,
      message: 'Admin user updated successfully.',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/admin/users/:id/toggle - Toggle user active status (superadmin only)
router.patch('/users/:id/toggle', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { isActive } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
