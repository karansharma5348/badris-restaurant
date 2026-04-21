import express from 'express'
import Ticket from '../models/Ticket.js'
import Contact from '../models/Contact.js'
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET /api/tickets - Get all tickets (superadmin)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, priority } = req.query
    const filter = {}
    if (status) filter.status = status
    if (priority) filter.priority = priority

    const tickets = await Ticket.find(filter)
      .populate('assignedTo', 'username fullName')
      .sort({ createdAt: -1 })

    res.json({ success: true, count: tickets.length, data: tickets })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/tickets - Create a ticket
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { subject, description, customerName, customerEmail, priority, source, sourceRef } = req.body

    if (!subject || !description || !customerName) {
      return res.status(400).json({
        success: false,
        message: 'Subject, description, and customer name are required.',
      })
    }

    const ticket = await Ticket.create({
      subject,
      description,
      customerName,
      customerEmail: customerEmail || '',
      priority: priority || 'medium',
      source: source || 'manual',
      sourceRef: sourceRef || undefined,
    })

    console.log(`🎫 New ticket: ${subject} — Priority: ${priority || 'medium'}`)
    res.status(201).json({ success: true, data: ticket })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/tickets/from-contact/:contactId - Create ticket from contact message
router.post('/from-contact/:contactId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.contactId)
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found' })
    }

    const ticket = await Ticket.create({
      subject: contact.subject || 'Customer Inquiry',
      description: contact.message,
      customerName: contact.name,
      customerEmail: contact.email,
      priority: req.body.priority || 'medium',
      source: 'contact-form',
      sourceRef: contact._id,
    })

    // Mark contact as read
    contact.isRead = true
    await contact.save()

    res.status(201).json({ success: true, data: ticket })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/tickets/:id - Update ticket
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updates = req.body

    // If resolving, set resolvedAt
    if (updates.status === 'resolved' || updates.status === 'closed') {
      updates.resolvedAt = new Date()
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('assignedTo', 'username fullName')

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' })
    }

    res.json({ success: true, data: ticket })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/tickets/stats - Ticket statistics
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [open, inProgress, resolved, closed, total] = await Promise.all([
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'in-progress' }),
      Ticket.countDocuments({ status: 'resolved' }),
      Ticket.countDocuments({ status: 'closed' }),
      Ticket.countDocuments(),
    ])

    // Avg resolution time for resolved tickets
    const resolvedTickets = await Ticket.find({ status: { $in: ['resolved', 'closed'] }, resolvedAt: { $exists: true } })
    let avgResolutionHours = 0
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, t) => {
        return sum + ((t.resolvedAt - t.createdAt) / (1000 * 60 * 60))
      }, 0)
      avgResolutionHours = Math.round(totalHours / resolvedTickets.length)
    }

    res.json({
      success: true,
      data: { open, inProgress, resolved, closed, total, avgResolutionHours },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
