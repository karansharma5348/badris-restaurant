import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import menuRoutes, { seedMenu } from './routes/menu.js'
import reservationRoutes from './routes/reservations.js'
import contactRoutes from './routes/contact.js'
import authRoutes from './routes/auth.js'
import orderRoutes from './routes/orders.js'
import ticketRoutes from './routes/tickets.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(cookieParser())

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('✅ MongoDB connected successfully')

      // Seed menu data on first run
      await seedMenu()
    } else {
      console.log('⚠️  MongoDB URI not set, running without database')
    }
  } catch (error) {
    console.log('⚠️  MongoDB connection failed:', error.message)
  }
}

connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    restaurant: "Badri's Restaurant",
    location: 'Chembur, Mumbai',
    timestamp: new Date().toISOString(),
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
  🍽️  Badri's Restaurant API Server
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌐 Server:  http://localhost:${PORT}
  📋 Menu:    http://localhost:${PORT}/api/menu
  🔐 Auth:    http://localhost:${PORT}/api/auth
  📊 Admin:   http://localhost:${PORT}/api/admin
  📞 Health:  http://localhost:${PORT}/api/health
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
})

export default app
