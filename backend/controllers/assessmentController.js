const pool = require('../config/db');

// Mock handler representing production Azure OpenAI/Copilot integration
async function processCopilotHeuristics(data) {
  // Format to standard Indian Currency Format for clean AI context parsing
  const formattedBudget = new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(data.projectCapitalAllocation);

  // Core business intelligence mapping matching wireframe logic
  return {
    recommendedModel: "ENGLISH REVERSE AUCTION (WITH RANK-BASED VISIBILITY)",
    allocationFit: 94,
    justification: `Given the ${formattedBudget} allocation budget and standard 1-month timeline, the system validates an English Reverse Auction. By enforcing strict Rank-Only visibility on your suppliers, you actively prevent market bid-shadowing. Vendors must bid aggressively against their own internal cost floor to achieve Rank #1 status.`
  };
}

const createAssessment = async (req, res) => {
  try {
    const inputData = req.body;
    
    // Process input data against analytical rule parameters
    const evaluation = await processCopilotHeuristics(inputData);

    const queryText = `
      INSERT INTO assessments (
        supplier_density, allocation_timeline, material_classification, 
        project_capital_allocation, pricing_matrix_status, recommended_model, 
        allocation_fit_percentage, ai_justification
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;
    `;

    const values = [
      inputData.supplierDensity,
      inputData.allocationTimeline,
      inputData.materialClassification,
      inputData.projectCapitalAllocation,
      inputData.pricingMatrixStatus,
      evaluation.recommendedModel,
      evaluation.allocationFit,
      evaluation.justification
    ];

    const result = await pool.query(queryText, values);

    return res.status(201).json({
      success: true,
      assessmentId: result.rows[0].id,
      data: evaluation
    });

  } catch (error) {
    console.error('Controller Error execution bottleneck:', error);
    return res.status(500).json({
      success: false,
      message: 'Critical error isolated within backend runtime operations.'
    });
  }
};

module.exports = { createAssessment };