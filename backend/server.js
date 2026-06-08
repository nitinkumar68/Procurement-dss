const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const assessmentRoutes = require('./routes/assessmentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Domain Segregation
app.use('/api/assessment', assessmentRoutes);

// Global Error Interceptor Boundary
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Uncaught operational systemic failure encountered.' });
});

app.listen(PORT, () => {
  console.log(`ProcureSmart Micro-Engine operating smoothly on port ${PORT}`);
});