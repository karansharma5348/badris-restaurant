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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      // In production, also allow the origin if it matches common patterns
      if (process.env.NODE_ENV === 'production') {
        callback(null, true) // Allow all origins in production for now
      } else {
        callback(null, true)
      }
    }
  },
  credentials: true,
}))
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

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "Badri's Restaurant API",
    version: '1.0.0',
    health: '/api/health',
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
