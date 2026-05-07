require('dotenv').config(); // must be first — loads .env into process.env

const express            = require('express');
const { initDatabase }   = require('./config/database');
const authRoutes         = require('./routes/authRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Prescription Management System is running.' });
});

app.use('/api/auth',          authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// initDatabase is async (sql.js needs to load WASM), so we await it before listening
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Database initialized`);
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start:', err);
    process.exit(1);
  });

module.exports = app;
