/**
 * assessmentController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles POST /api/assessment
 *
 * Flow:
 *   1. Validate input (done by Zod middleware in the route)
 *   2. Run determineProcurementModel() — pure rule-based logic, always reliable
 *   3. Call generateCopilotJustification() — live AI or heuristic fallback
 *   4. Persist the full result to PostgreSQL
 *   5. Return the result to the frontend
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const pool = require('../config/db');
const { generateCopilotJustification } = require('../services/copilotService');

// ── Rule-based model selection ────────────────────────────────────────────────
// This logic is deterministic and never touches the AI.
// The AI only generates the human-readable justification for whichever
// model this function selects.
function determineProcurementModel(data) {
  const { supplierDensity, allocationTimeline, materialClassification } = data;

  if (supplierDensity === 'Single Vendor') {
    return {
      recommendedModel : 'DIRECT SOLE-SOURCE PROCUREMENT NEGOTIATION',
      modelType        : 'SOLE-SOURCE',
      allocationFit    : 98,
    };
  }

  if (allocationTimeline === 'Urgent / Emergency Needs') {
    return {
      recommendedModel : 'DUTCH REVERSE AUCTION (ACCELERATED SETTLEMENT)',
      modelType        : 'DUTCH',
      allocationFit    : 89,
    };
  }

  if (materialClassification === 'Highly Specialized / Proprietary Equipment') {
    return {
      recommendedModel : 'JAPANESE REVERSE AUCTION (SEALED MULTI-STAGE COHORT)',
      modelType        : 'JAPANESE',
      allocationFit    : 85,
    };
  }

  // Default — broadest market, standard conditions
  return {
    recommendedModel : 'ENGLISH REVERSE AUCTION (WITH RANK-BASED VISIBILITY)',
    modelType        : 'ENGLISH',
    allocationFit    : 94,
  };
}

// ── Controller ────────────────────────────────────────────────────────────────
const createAssessment = async (req, res) => {
  try {
    const inputData = req.body;

    // Step 1: Determine the procurement model via rules
    const { recommendedModel, modelType, allocationFit } = determineProcurementModel(inputData);

    // Step 2: Generate AI justification (falls back to heuristic if AI unavailable)
    const justification = await generateCopilotJustification(
      inputData,
      recommendedModel,
      allocationFit
    );

    // Step 3: Persist to PostgreSQL (best-effort — does not fail the request)
    let assessmentId   = null;
    let assessmentDate = new Date().toISOString();
    try {
      const queryText = `
        INSERT INTO assessments (
          supplier_density,
          allocation_timeline,
          material_classification,
          project_capital_allocation,
          pricing_matrix_status,
          recommended_model,
          allocation_fit_percentage,
          ai_justification
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, created_at;
      `;
      const values = [
        inputData.supplierDensity,
        inputData.allocationTimeline,
        inputData.materialClassification,
        inputData.projectCapitalAllocation,
        inputData.pricingMatrixStatus,
        recommendedModel,
        allocationFit,
        justification,
      ];
      const result   = await pool.query(queryText, values);
      assessmentId   = result.rows[0].id;
      assessmentDate = result.rows[0].created_at;
    } catch (dbErr) {
      // DB offline — log and continue (frontend will still receive the result)
      console.warn('[Assessment] DB insert skipped (PostgreSQL offline):', dbErr.message);
    }

    // Step 4: Return full result to frontend
    return res.status(201).json({
      success      : true,
      assessmentId : assessmentId,
      data: {
        recommendedModel,
        modelType,
        allocationFit,
        justification,
        supplierDensity          : inputData.supplierDensity,
        allocationTimeline       : inputData.allocationTimeline,
        materialClassification   : inputData.materialClassification,
        projectCapitalAllocation : inputData.projectCapitalAllocation,
        pricingMatrixStatus      : inputData.pricingMatrixStatus,
        created_at               : assessmentDate,
      },
    });

  } catch (error) {
    console.error('[Assessment] Controller error:', error);
    return res.status(500).json({
      success : false,
      message : 'An error occurred while processing the procurement assessment.',
    });
  }
};

module.exports = { createAssessment };