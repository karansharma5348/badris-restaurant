import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: { type: String, default: '' },
  resolvedAt: { type: Date },
  source: {
    type: String,
    enum: ['contact-form', 'reservation', 'manual'],
    default: 'manual',
  },
  sourceRef: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export default mongoose.model('Ticket', ticketSchema)
