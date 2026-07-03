const pool = require('../config/db');

// POST /api/feedback — save a feedback entry
const createFeedback = async (req, res) => {
  try {
    const { rating, comments, recommendedModel } = req.body;

    const queryText = `
      INSERT INTO feedback (rating, comments, recommended_model, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, rating, comments, recommended_model, created_at;
    `;

    const result = await pool.query(queryText, [
      rating,
      comments || '',
      recommendedModel || '',
    ]);

    return res.status(201).json({
      success: true,
      message: 'Feedback saved successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Feedback controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving feedback to database.',
    });
  }
};

// GET /api/feedback — retrieve all feedback entries
const getAllFeedback = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, rating, comments, recommended_model, created_at
       FROM feedback
       ORDER BY created_at DESC
       LIMIT 50;`
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching feedback.' });
  }
};

module.exports = { createFeedback, getAllFeedback };
