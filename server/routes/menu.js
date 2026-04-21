import express from 'express'
import MenuItem from '../models/MenuItem.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Default menu data for seeding
const defaultMenuData = [
  { name: 'Chicken 65', price: 250, category: 'starters', description: 'Crispy deep-fried chicken bites tossed with curry leaves, green chilies, and aromatic spices.', image: '/chicken65.png', badge: 'Bestseller', isVeg: false, tags: ['Spicy', 'Crispy'], displayOrder: 1 },
  { name: 'Chicken Tandoori', price: 320, category: 'starters', description: 'Half chicken marinated overnight in yogurt-spice blend, roasted in clay tandoor until smoky perfection.', image: '/tandoori.png', badge: 'Popular', isVeg: false, tags: ['Smoky', 'Tandoor'], displayOrder: 2 },
  { name: 'Chicken Lollipop', price: 230, category: 'starters', description: 'Frenched drumettes with a crispy spiced coating, served with tangy schezwan sauce.', image: '/chicken65.png', isVeg: false, tags: ['Crunchy', 'Party Snack'], displayOrder: 3 },
  { name: 'Chicken Biryani', price: 280, category: 'biryani', description: 'Fragrant basmati rice layered with spiced chicken, saffron threads, and fried onions. Served with raita.', image: '/biryani.png', badge: 'Signature', isVeg: false, tags: ['Aromatic', 'Royal'], displayOrder: 4 },
  { name: 'Mutton Biryani', price: 350, category: 'biryani', description: 'Slow-cooked tender mutton pieces with aromatic basmati rice, infused with whole spices and herbs.', image: '/biryani.png', isVeg: false, tags: ['Premium', 'Slow Cooked'], displayOrder: 5 },
  { name: 'Veg Biryani', price: 200, category: 'biryani', description: 'Mixed seasonal vegetables with fragrant rice, garnished with fried onions and fresh herbs.', image: '/biryani.png', isVeg: true, tags: ['Vegetarian', 'Aromatic'], displayOrder: 6 },
  { name: 'Butter Chicken', price: 300, category: 'mains', description: 'Tender tandoori chicken in a velvety tomato-butter gravy with a touch of cream and kasuri methi.', image: '/butterchicken.png', badge: 'Must Try', isVeg: false, tags: ['Creamy', 'Rich'], displayOrder: 7 },
  { name: 'Chicken Tikka Masala', price: 290, category: 'mains', description: 'Grilled chicken tikka pieces simmered in a thick, spiced onion-tomato gravy.', image: '/butterchicken.png', isVeg: false, tags: ['Spiced', 'Gravy'], displayOrder: 8 },
  { name: 'Mutton Rogan Josh', price: 380, category: 'mains', description: 'Kashmiri-style slow-cooked mutton in a rich, aromatic red gravy with warm spices.', image: '/butterchicken.png', isVeg: false, tags: ['Kashmiri', 'Premium'], displayOrder: 9 },
  { name: 'Chicken Fried Rice', price: 200, category: 'chinese', description: 'Wok-tossed basmati rice with chicken, fresh vegetables, soy sauce, and aromatic spices.', image: '/biryani.png', isVeg: false, tags: ['Indo-Chinese', 'Quick'], displayOrder: 10 },
  { name: 'Chicken Hakka Noodles', price: 220, category: 'chinese', description: 'Stir-fried noodles with tender chicken strips, crunchy vegetables, and flavorful sauces.', image: '/chicken65.png', isVeg: false, tags: ['Stir-Fried', 'Popular'], displayOrder: 11 },
  { name: 'Chilli Chicken', price: 260, category: 'chinese', description: 'Crispy chicken tossed in a spicy, tangy sauce with bell peppers, onions, and green chilies.', image: '/chicken65.png', badge: 'Hot Seller', isVeg: false, tags: ['Spicy', 'Indo-Chinese'], displayOrder: 12 },
  { name: 'Fish Fry', price: 300, category: 'seafood', description: 'Fresh Bombay Duck or Surmai fillets marinated in local spices and shallow fried until golden crispy.', image: '/tandoori.png', isVeg: false, tags: ['Fresh Catch', 'Crispy'], displayOrder: 13 },
  { name: 'Prawn Curry', price: 350, category: 'seafood', description: 'Juicy prawns cooked in a rich coconut-based curry with Malvani spices and fresh green herbs.', image: '/butterchicken.png', isVeg: false, tags: ['Coastal', 'Coconut'], displayOrder: 14 },
  { name: 'Paneer Butter Masala', price: 240, category: 'veg', description: 'Soft paneer cubes in a rich, creamy tomato gravy with aromatic spices and a hint of sweetness.', image: '/butterchicken.png', badge: 'Veg Favourite', isVeg: true, tags: ['Creamy', 'Rich'], displayOrder: 15 },
  { name: 'Dal Tadka', price: 160, category: 'veg', description: 'Yellow lentils tempered with ghee, cumin, garlic, and dried red chilies. Comfort food at its best.', image: '/butterchicken.png', isVeg: true, tags: ['Comfort', 'Healthy'], displayOrder: 16 },
]

// Seed menu data if empty
export const seedMenu = async () => {
  try {
    const count = await MenuItem.countDocuments()
    if (count === 0) {
      await MenuItem.insertMany(defaultMenuData)
      console.log('✅ Menu seeded with', defaultMenuData.length, 'items')
    }
  } catch (error) {
    console.log('Menu seed error:', error.message)
  }
}

// GET /api/menu - Get all menu items (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    const filter = { isActive: true, isAvailable: true }

    if (category && category !== 'all') {
      filter.category = category
    }

    const items = await MenuItem.find(filter).sort({ displayOrder: 1 })

    res.json({
      success: true,
      count: items.length,
      data: items,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/menu/all - Get ALL items including inactive (admin)
router.get('/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ displayOrder: 1 })
    res.json({ success: true, count: items.length, data: items })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/menu/:id - Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' })
    }
    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/menu - Add new dish (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, price, category, description, image, badge, isVeg, tags } = req.body

    if (!name || !price || !category || !description) {
      return res.status(400).json({ success: false, message: 'Name, price, category, and description are required.' })
    }

    // Get max display order
    const maxOrder = await MenuItem.findOne().sort({ displayOrder: -1 })
    const displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 1

    const item = await MenuItem.create({
      name, price, category, description,
      image: image || '/chicken65.png',
      badge: badge || '',
      isVeg: isVeg || false,
      tags: tags || [],
      displayOrder,
    })

    console.log(`🍽️ New menu item added: ${name} — ₹${price}`)
    res.status(201).json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PUT /api/menu/:id - Update dish (admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' })
    }

    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/menu/:id - Soft-delete dish (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' })
    }

    res.json({ success: true, message: 'Menu item removed', data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/menu/:id/availability - Toggle availability (admin)
router.patch('/:id/availability', requireAuth, requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' })
    }

    item.isAvailable = !item.isAvailable
    await item.save()

    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
