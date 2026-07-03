const pool = require('../config/db');

// GET /api/history — fetch all past assessments with any linked feedback
const getHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         a.id,
         a.supplier_density,
         a.allocation_timeline,
         a.material_classification,
         a.project_capital_allocation,
         a.pricing_matrix_status,
         a.recommended_model,
         a.allocation_fit_percentage,
         a.ai_justification,
         a.created_at
       FROM assessments a
       ORDER BY a.created_at DESC
       LIMIT 50;`
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('History fetch error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching history.' });
  }
};

module.exports = { getHistory };
