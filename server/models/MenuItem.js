import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ['starters', 'biryani', 'mains', 'chinese', 'seafood', 'veg', 'desserts', 'beverages'],
    required: true,
  },
  description: { type: String, required: true },
  image: { type: String },
  badge: { type: String },
  isVeg: { type: Boolean, default: false },
  tags: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('MenuItem', menuItemSchema)
