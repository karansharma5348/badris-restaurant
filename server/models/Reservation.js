import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: String, required: true },
  tableNumber: { type: Number, default: null },
  message: { type: String },
  specialInstructions: { type: String, default: '' },
  hasPreOrder: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
}, { timestamps: true })

export default mongoose.model('Reservation', reservationSchema)
