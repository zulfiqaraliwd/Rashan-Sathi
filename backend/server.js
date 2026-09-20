const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
//zulf
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const chatSocket = require('./sockets/chatSocket');

connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// ============================================
// STEP 1: GLOBAL MIDDLEWARE (SABSE PEHLE)
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

// ============================================
// STEP 2: ROOT + HEALTH ROUTES
// ============================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Rashan Sathi API is running ✅',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      trips: '/api/trips',
      requests: '/api/requests',
      payments: '/api/payments',
      reviews: '/api/reviews',
      upload: '/api/upload',
      admin: '/api/admin',
      health: '/api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', message: 'API is working' });
});

// ============================================
// STEP 3: API ROUTES
// ============================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ============================================
// STEP 4: ERROR HANDLERS (SABSE AAKHIR)
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// STEP 5: SOCKET
// ============================================
chatSocket(io);

// ============================================
// STEP 6: LISTEN (local only, Vercel handles prod)
// ============================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;