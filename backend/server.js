const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const assessmentRoutes = require('./routes/assessmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const historyRoutes = require('./routes/historyRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/assessment', assessmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/history', historyRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Uncaught operational systemic architecture exception.' });
});

app.listen(PORT, () => {
  console.log(`ProcureSmart Micro-Engine operating smoothly on port ${PORT}`);
});