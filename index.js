const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDB } = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: ['http://localhost:5174'] }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/master', require('./routes/master'));
app.use('/api/transaksi', require('./routes/transaksi'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 Helm Sales API is running!', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Init DB then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Gagal inisialisasi database:', err);
  process.exit(1);
});
