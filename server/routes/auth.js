import express from 'express'
import User from '../models/User.js'
import { generateToken, requireAuth } from '../middleware/auth.js'

const router = express.Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' })
    }

    const token = generateToken(user)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/auth/me - Get current user
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      fullName: req.user.fullName,
    },
  })
})

// POST /api/auth/seed - Seed default admin accounts
router.post('/seed', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ username: 'admin' })
    if (existingAdmin) {
      return res.json({ success: true, message: 'Admin accounts already exist.' })
    }

    await User.create([
      {
        username: 'admin',
        email: 'admin@badris.com',
        password: 'admin123',
        role: 'admin',
        fullName: 'Restaurant Admin',
      },
      {
        username: 'superadmin',
        email: 'superadmin@badris.com',
        password: 'super123',
        role: 'superadmin',
        fullName: 'Super Administrator',
      },
    ])

    console.log('✅ Default admin accounts created')
    res.status(201).json({
      success: true,
      message: 'Default accounts created: admin/admin123 and superadmin/super123',
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
