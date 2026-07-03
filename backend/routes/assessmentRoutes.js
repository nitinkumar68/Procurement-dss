const express = require('express');
const router = express.Router();
const { createAssessment } = require('../controllers/assessmentController');
const { assessmentSchema } = require('../schemas/assessmentSchema');

// Middleware validation injector inline
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, errors: err.errors });
  }
};

router.post('/', validate(assessmentSchema), createAssessment);

module.exports = router;