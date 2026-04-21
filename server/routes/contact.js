import express from 'express'
import Contact from '../models/Contact.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// POST /api/contact - Submit a contact message (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message',
      })
    }

    const contact = await Contact.create({
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
    })

    console.log(`📨 New contact message from: ${name} (${email})`)

    res.status(201).json({
      success: true,
      message: 'Message received! We will get back to you soon.',
      data: contact,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/contact - Get all messages (admin)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 })
    res.json({
      success: true,
      count: messages.length,
      data: messages,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/contact/:id/read - Mark as read (admin)
router.patch('/:id/read', requireAuth, requireAdmin, async (req, res) => {
  try {
    const msg = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    )
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' })
    }
    res.json({ success: true, data: msg })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
